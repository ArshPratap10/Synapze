'use server'

import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

async function getUserId() {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized: No active session');
  return userId;
}

const GEMINI_KEYS = [
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
  process.env.DEMOKEY
].filter(Boolean);

const GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-3.1-flash-lite-preview"
];

// Simple circuit breaker state: { keyIndex: timestamp_of_next_retry }
const keyCircuitBreakers = {};

// --- Internal Helper for Gemini Key Rotation ---------------------------------
async function callGemini(prompt, isVision = false, base64Image = null) {
  const now = Date.now();

  for (let i = 0; i < GEMINI_KEYS.length; i++) {
    // Skip if key is currently blocked by circuit breaker
    if (keyCircuitBreakers[i] && now < keyCircuitBreakers[i]) {
      continue;
    }

    for (const modelId of GEMINI_MODELS) {
      try {
        const genAI = new GoogleGenerativeAI(GEMINI_KEYS[i]);
        const model = genAI.getGenerativeModel({
          model: modelId,
          tools: isVision ? [] : [{ googleSearch: {} }],
        });

        let result;
        if (isVision && base64Image) {
          result = await model.generateContent([
            prompt,
            { inlineData: { data: base64Image, mimeType: "image/jpeg" } }
          ]);
        } else {
          result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
          });
        }

        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("No JSON found in response");
        
        // Reset circuit breaker on success
        delete keyCircuitBreakers[i];
        
        console.log(`[AI] ${modelId} succeeded (Key Index: ${i}).`);
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        // If it's a 429 (Rate Limit), block this key for 5 minutes to reduce noise
        if (e.message.includes("429") || e.message.includes("quota")) {
          console.warn(`[AI] Key Index ${i} hit rate limit. Blocking for 5 mins.`);
          keyCircuitBreakers[i] = now + 5 * 60 * 1000;
          break; // Stop trying models for this key, move to next key
        }
        
        console.warn(`[AI] ${modelId} with Key Index ${i} failed:`, e.message);
      }
    }
  }
  return null;
}

// --- AI Logic: Strictly Gemini 2.5 Flash (High Usage) -------------------------
async function resilientAI(prompt) {
  try {
    const data = await callGemini(prompt);
    if (data) return data;
  } catch (e) {
    console.warn("[AI] All Gemini keys failed, attempting fallback...");
    
    // Minimal Groq Fallback (Optional, but safe to keep)
    const groqKey = process.env.GROQ_API_KEY;
    if (groqKey) {
      try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${groqKey}` },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" }
          })
        });
        if (res.ok) {
          const data = await res.json();
          const content = data.choices?.[0]?.message?.content || "{}";
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          return JSON.parse(jsonMatch ? jsonMatch[0] : "{}");
        }
        console.warn('[AI] Groq returned non-OK status:', res.status);
      } catch (err) {
        console.warn('[AI] Groq fallback failed:', err.message);
      }
    }
  }
  return null;
}

// --- Vision AI (Specifically for Images) -------------------------------------
export async function logFoodWithImage(base64Image) {
  try {
    const prompt = `You are a world-class nutritional scientist. Identify the food in this image with extreme precision. 
If you see specific quantities or types (e.g., full-fat milk vs skim), adjust macros accordingly.
Full-fat milk is ~150kcal and 8g fat per cup (240ml). Protein powder is ~120kcal and 25g protein per scoop.

Return ONLY JSON: { "description": "...", "calories": 0, "protein": 0, "carbs": 0, "fat": 0, "naturalSugar": 0, "addedSugar": 0 }`;
    
    const data = await callGemini(prompt, true, base64Image);
    if (!data) throw new Error("No data returned from Vision AI");
    
    const newLog = await prisma.foodLog.create({
      data: {
        userId: await getUserId(),
        description: data.description,
        calories: safeInt(data.calories, 400),
        protein: safeFloat(data.protein, 15),
        carbs: safeFloat(data.carbs, 45),
        fat: safeFloat(data.fat, 18),
        naturalSugar: safeFloat(data.naturalSugar, 8),
        addedSugar: safeFloat(data.addedSugar, 3),
      }
    });

    return { success: true, data: JSON.parse(JSON.stringify(newLog)) };
  } catch (error) {
    console.error("[Vision AI] Error:", error);
    return { success: false, error: "Failed to analyze image" };
  }
}

// --- Safely parse int/float from AI, clamp to reasonable range --------------
function safeInt(v, fallback = 0) {
  const n = Math.round(Number(v));
  return isNaN(n) ? fallback : Math.max(0, n);
}
function safeFloat(v, fallback = 0) {
  const n = parseFloat(Number(v).toFixed(1));
  return isNaN(n) ? fallback : Math.max(0, n);
}

// --- getDashboardData --------------------------------------------------------
export async function getDashboardData() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  try {
    const userId = await getUserId();

    let user = await prisma.user.findUnique({ where: { id: userId } });
    
    // Auto-create user if missing (Clerk synced but DB not)
    if (!user) {
      console.log(`[getDashboardData] User ${userId} not found, creating...`);
      user = await prisma.user.create({
        data: {
          id: userId,
          name: 'New User', // Default name, can be updated in profile
          goal: 'Maintenance',
          targetCalories: 2000,
          targetProtein: 120,
          targetCarbs: 200,
          targetFat: 60,
          onboardingDone: false
        }
      });
    }

    const [habits, foodLogs, activityLogs, dailyScore] = await Promise.all([
      prisma.habit.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' },
        include: {
          logs: { where: { completedDate: { gte: today, lt: tomorrow } } },
        },
      }),
      prisma.foodLog.findMany({
        where: { userId, loggedAt: { gte: today, lt: tomorrow } },
        orderBy: { loggedAt: 'desc' },
      }),
      prisma.activityLog.findMany({
        where: { userId, loggedAt: { gte: today, lt: tomorrow } },
        orderBy: { loggedAt: 'desc' },
      }),
      prisma.dailyScore.findFirst({
        where: { userId, date: { gte: today, lt: tomorrow } },
      }),
    ]);

    return {
      success: true,
      data: JSON.parse(JSON.stringify({ user, habits, foodLogs, activityLogs, dailyScore })),
    };
  } catch (error) {
    console.error("[getDashboardData] Error:", error);
    return { success: false, error: error.message || "Failed to fetch data" };
  }
}

// --- clarifyFoodQuery --------------------------------------------------------
export async function clarifyFoodQuery(chatHistory) {
  try {
    const conversation = chatHistory.map(msg => `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.content}`).join('\n');
    const prompt = `You are an expert nutritionist. Review the following conversation to determine if you have enough specific information to accurately calculate calories and macros (quantity, specific type of food, preparation method).

Conversation:
${conversation}

If you have enough information (e.g., "1kg grilled chicken", "500ml milk", "2 slices of bread"), return ONLY this JSON:
{ "status": "success" }

RULES FOR CLARIFICATION:
1. If a quantity is provided with ANY standard unit (kg, g, oz, lbs, ml, etc.), it is SUFFICIENT. DO NOT ask for unit conversions (e.g., don't ask for grams if they gave kg).
2. If the user mentions a common portion (e.g., "a bowl", "a plate", "one whole"), it is SUFFICIENT.
3. ONLY ask a question if the description is truly vague (e.g., just "Rice", "Chicken" with no amount or type).
4. Keep questions extremely short and friendly.

Return ONLY this JSON if clarification is truly needed:
{ "status": "clarification_needed", "question": "Your short question here" }`;

    const data = await resilientAI(prompt);
    if (!data || !data.status) return { success: false, error: "AI failed to respond" };
    return { success: true, data };
  } catch (error) {
    console.error("[clarifyFoodQuery] Error:", error);
    return { success: false, error: error.message };
  }
}

// --- clarifyActivityQuery ----------------------------------------------------
export async function clarifyActivityQuery(chatHistory) {
  try {
    const conversation = chatHistory.map(msg => `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.content}`).join('\n');
    const prompt = `You are an expert fitness coach. Review the following conversation to determine if you have enough specific information to accurately estimate calories burned for a workout (activity type, duration, and intensity/distance).

Conversation:
${conversation}

If you have enough information (e.g., "30 min run", "5km walk", "1 hour gym"), return ONLY this JSON:
{ "status": "success" }

RULES:
1. If duration or distance is provided, it is SUFFICIENT.
2. DO NOT ask for redundant details if the user's intent is clear.
3. ONLY ask if it's impossible to estimate (e.g., just "I worked out").

Return ONLY this JSON if clarification is truly needed:
{ "status": "clarification_needed", "question": "Your short question here" }`;

    const data = await resilientAI(prompt);
    if (!data || !data.status) return { success: false, error: "AI failed to respond" };
    return { success: true, data };
  } catch (error) {
    console.error("[clarifyActivityQuery] Error:", error);
    return { success: false, error: error.message };
  }
}

// --- clarifyDayQuery ---------------------------------------------------------
export async function clarifyDayQuery(chatHistory) {
  try {
    const conversation = chatHistory.map(msg => `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.content}`).join('\n');
    const prompt = `You are an elite personal health coach. Review the user's daily log conversation to determine if you have enough specific information to accurately log their foods and activities.

Conversation:
${conversation}

If you have enough information for all mentioned items, return ONLY this JSON:
{ "status": "success" }

RULES:
1. DO NOT ask for unit conversions. "1kg" is as specific as "1000g".
2. If the user provided a quantity for a food or a duration for an activity, it is SUFFICIENT.
3. ONLY ask if a major piece of info is missing (e.g., what they ate, or how long they exercised).

Return ONLY this JSON if clarification is truly needed:
{ "status": "clarification_needed", "question": "Your short question here" }`;

    const data = await resilientAI(prompt);
    if (!data || !data.status) return { success: false, error: "AI failed to respond" };
    return { success: true, data };
  } catch (error) {
    console.error("[clarifyDayQuery] Error:", error);
    return { success: false, error: error.message };
  }
}

// --- logFoodWithAI: Preview logic (Doesn't save yet) -------------------------
export async function logFoodWithAI(description, dateStr = null) {
  try {
    const today = dateStr ? new Date(dateStr) : new Date();
    const prompt = `You are a nutrition expert. User says: "${description}". Date: ${today.toDateString()}. 
Analyze macros. Return JSON: { "description": "...", "calories": 0, "protein": 0, "carbs": 0, "fat": 0, "naturalSugar": 0, "addedSugar": 0 }`;
    
    let data = await resilientAI(prompt);

    // 2. If Gemini/Groq fail, Try Nutrition Tracker API (Fallback)
    if (!data) {
      try {
        const rapidApiKey = process.env.RAPIDAPI_KEY;
        const response = await fetch("https://nutrition-tracker-api.p.rapidapi.com/v1/calculate/natural", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-rapidapi-key": rapidApiKey,
            "x-rapidapi-host": "nutrition-tracker-api.p.rapidapi.com"
          },
          body: JSON.stringify({ text: description })
        });

        if (response.ok) {
          const rawData = await response.json();
          if (rawData.success && rawData.data && rawData.data.totalNutrients) {
            const nutrients = rawData.data.totalNutrients;
            data = {
              description: rawData.data.query || description,
              calories: nutrients.Energy ? nutrients.Energy.value : 0,
              protein: nutrients.Protein ? nutrients.Protein.value : 0,
              carbs: nutrients.Carbohydrates ? nutrients.Carbohydrates.value : 0,
              fat: nutrients.Fat ? nutrients.Fat.value : 0,
              naturalSugar: nutrients["Total Sugars"] ? nutrients["Total Sugars"].value : 0,
              addedSugar: 0
            };
            console.log("[Nutrition API Fallback] Successfully parsed food:", data);
          }
        }
      } catch (apiError) {
        console.warn("[Nutrition API Fallback] Failed:", apiError.message);
      }
    }

    if (!data) {
      data = {
        description: description,
        calories: 400,
        protein: 15,
        carbs: 45,
        fat: 18,
        naturalSugar: 8,
        addedSugar: 3,
      };
    }

    data.confidenceScore = 0.85;
    data.generationSource = 'ai';
    data.modelId = 'gemini-2.5-flash';
    data.promptHash = description.slice(0, 20);
    data.fiber = data.fiber || 0;
    data.sodium = data.sodium || 0;

    const preview = data;
    return { success: true, preview };
  } catch (error) {
    console.error("[logFoodWithAI] Error:", error);
    return { success: false, error: error.message || "Failed to log food" };
  }
}

// --- confirmFoodLog: Save the previewed food ---------------------------------
export async function confirmFoodLog(preview, dateStr = null) {
  try {
    const userId = await getUserId();
    const loggedAt = dateStr ? new Date(dateStr) : new Date();
    
    const newLog = await prisma.foodLog.create({
      data: {
        userId,
        description: preview.description || "Food",
        calories: safeInt(preview.calories, 400),
        protein: safeFloat(preview.protein, 15),
        carbs: safeFloat(preview.carbs, 45),
        fat: safeFloat(preview.fat, 18),
        naturalSugar: safeFloat(preview.naturalSugar, 8),
        addedSugar: safeFloat(preview.addedSugar, 3),
        loggedAt,
      },
    });

    await regenerateDailyScore(dateStr);
    return { success: true, data: JSON.parse(JSON.stringify(newLog)) };
  } catch (error) {
    console.error("[confirmFoodLog] Error:", error);
    return { success: false, error: error.message };
  }
}

export async function saveOnboardingProfile(form) {
  try {
    const user = await prisma.user.update({
      where: { id: await getUserId() },
      data: {
        weight: parseFloat(form.weight) || 70,
        height: parseFloat(form.height) || 170,
        age: parseInt(form.age) || 25,
        gender: form.gender || 'male',
        activityLevel: form.activityLevel || 'moderate',
        goal: form.goal || 'Maintenance',
        dietType: form.dietType || 'No Preference',
        foodPrefs: JSON.stringify(form.foodPrefs || {}),
        onboardingDone: true,
      }
    });
    return { success: true, data: JSON.parse(JSON.stringify(user)) };
  } catch (error) {
    console.error("[saveOnboardingProfile] Error:", error);
    return { success: false, error: error.message };
  }
}

export async function suggestFoodPreferences({ goal, dietType }) {
  try {
    const prompt = `Suggest 5-10 favorite foods for Breakfast, Lunch, Snacks, Dinner, and General based on a ${dietType} diet and a goal of ${goal}. Return a JSON object with keys: Breakfast, Lunch, Snacks, Dinner, General mapped to arrays of strings. Return ONLY JSON.`;
    const data = await resilientAI(prompt);
    return { success: true, data };
  } catch (error) {
    console.error("[suggestFoodPreferences] Error:", error);
    return { success: false, error: error.message };
  }
}

// --- logActivityWithAI -------------------------------------------------------
export async function logActivityWithAI(description, dateStr = null) {
  try {
    const today = dateStr ? new Date(dateStr) : new Date();
    const user = await prisma.user.findUnique({ where: { id: await getUserId() } });
    const weight = user?.weight || 70;
    const height = user?.height || 175;

    const prompt = `User activity: "${description}". Date: ${today.toDateString()}. 
Estimate duration (min) and calories burned for weight ${weight}kg, height ${height}cm.
JSON: { "name": "...", "duration": 30, "caloriesBurned": 200 }`;

    let data = await resilientAI(prompt);

    if (!data) {
      data = { name: description, duration: 30, caloriesBurned: 200 };
    }

    const newLog = await prisma.activityLog.create({
      data: {
        userId: await getUserId(),
        name: String(data.name || description),
        duration: safeInt(data.duration, 30),
        caloriesBurned: safeInt(data.caloriesBurned, 200),
        loggedAt: today,
      },
    });

    await regenerateDailyScore(dateStr);
    return { success: true, data: JSON.parse(JSON.stringify(newLog)) };
  } catch (error) {
    console.error("[logActivityWithAI] Error:", error);
    return { success: false, error: error.message || "Failed to log activity" };
  }
}

// --- addHabitAction ----------------------------------------------------------
export async function addHabitAction(name, frequency = 'daily') {
  try {
    const newHabit = await prisma.habit.create({
      data: {
        userId: await getUserId(),
        name: String(name).trim(),
        frequency: String(frequency),
      },
    });
    return { success: true, data: JSON.parse(JSON.stringify({ ...newHabit, logs: [] })) };
  } catch (error) {
    console.error("[addHabitAction] Error:", error);
    return { success: false, error: error.message || "Failed to add habit" };
  }
}

// --- logHabitCompletion ------------------------------------------------------
export async function logHabitCompletion(habitId, dateStr = null) {
  try {
    const today = dateStr ? new Date(dateStr) : new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Toggle logic
    const existing = await prisma.habitLog.findFirst({
      where: { habitId, completedDate: { gte: today, lt: tomorrow } },
    });
    
    if (existing) {
      await prisma.habitLog.delete({ where: { id: existing.id } });
      const habit = await prisma.habit.update({
        where: { id: habitId },
        data: { currentStreak: { decrement: 1 } },
      });
      
      let refreshNeeded = false;
      const hNameWords = habit.name.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !['and', 'the', 'for', 'with', 'health', 'fitness'].includes(w));

      if (hNameWords.length > 0) {
        // Try Activity Logs
        const activities = await prisma.activityLog.findMany({
          where: { userId: habit.userId, loggedAt: { gte: today, lt: tomorrow } }
        });
        const actToDelete = activities.find(a => {
          const aName = a.name.toLowerCase();
          return hNameWords.some(w => aName.includes(w));
        });
        if (actToDelete) {
          await prisma.activityLog.delete({ where: { id: actToDelete.id } });
          refreshNeeded = true;
        }

        // Try Food Logs
        const foods = await prisma.foodLog.findMany({
          where: { userId: habit.userId, loggedAt: { gte: today, lt: tomorrow } }
        });
        const foodToDelete = foods.find(f => {
          const fDesc = f.description.toLowerCase();
          return hNameWords.some(w => fDesc.includes(w));
        });
        if (foodToDelete) {
          await prisma.foodLog.delete({ where: { id: foodToDelete.id } });
          refreshNeeded = true;
        }
      }

      await regenerateDailyScore(dateStr);
      return { success: true, removed: true, refreshNeeded: true };
    }

    const log = await prisma.habitLog.create({
      data: { habitId, completedDate: today },
    });

    const habit = await prisma.habit.update({
      where: { id: habitId },
      data: { currentStreak: { increment: 1 } },
    });

    let refreshNeeded = false;
    if (habit.name.startsWith('Health - ')) {
      const taskName = habit.name.replace('Health - ', '').trim();
      const previewRes = await logFoodWithAI(`I just completed my health habit: ${taskName}. Log this as food/drink appropriately.`, dateStr);
      if (previewRes.success) await confirmFoodLog(previewRes.preview, dateStr);
      refreshNeeded = true;
    } else if (habit.name.startsWith('Fitness - ')) {
      const taskName = habit.name.replace('Fitness - ', '').trim();
      await logActivityWithAI(`I just completed my fitness habit: ${taskName}. Log this activity appropriately.`, dateStr);
      refreshNeeded = true;
    }

    await regenerateDailyScore(dateStr);
    return { 
      success: true, 
      removed: false, 
      data: JSON.parse(JSON.stringify(log)),
      refreshNeeded: true 
    };
  } catch (error) {
    console.error("[logHabitCompletion] Error:", error);
    return { success: false, error: error.message || "Habit completion failed" };
  }
}

// --- deleteHabit -------------------------------------------------------------
export async function deleteHabit(habitId, dateStr = null) {
  try {
    const habit = await prisma.habit.findUnique({ where: { id: habitId } });
    if (!habit) return { success: false, error: "Habit not found" };

    const today = dateStr ? new Date(dateStr) : new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const completedToday = await prisma.habitLog.findFirst({
      where: { habitId, completedDate: { gte: today, lt: tomorrow } }
    });

    let refreshNeeded = false;
    if (completedToday) {
      const hNameWords = habit.name.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !['and', 'the', 'for', 'with', 'health', 'fitness'].includes(w));
      
      if (hNameWords.length > 0) {
        // Try Activity Logs
        const activities = await prisma.activityLog.findMany({
          where: { userId: habit.userId, loggedAt: { gte: today, lt: tomorrow } }
        });
        const actToDelete = activities.find(a => hNameWords.some(w => a.name.toLowerCase().includes(w)));
        if (actToDelete) {
          await prisma.activityLog.delete({ where: { id: actToDelete.id } });
          refreshNeeded = true;
        }

        // Try Food Logs
        const foods = await prisma.foodLog.findMany({
          where: { userId: habit.userId, loggedAt: { gte: today, lt: tomorrow } }
        });
        const foodToDelete = foods.find(f => hNameWords.some(w => f.description.toLowerCase().includes(w)));
        if (foodToDelete) {
          await prisma.foodLog.delete({ where: { id: foodToDelete.id } });
          refreshNeeded = true;
        }
      }
    }

    await prisma.habit.delete({ where: { id: habitId } });
    if (refreshNeeded) {
      await regenerateDailyScore(dateStr);
    }
    return { success: true, refreshNeeded };
  } catch (error) {
    console.error("[deleteHabit] Error:", error);
    return { success: false, error: error.message };
  }
}

// --- getAnalyticsData --------------------------------------------------------
export async function getAnalyticsData() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const userId = await getUserId();

    const [foodLogs, activityLogs, habitLogs, habits] = await Promise.all([
      prisma.foodLog.findMany({
        where: { userId, loggedAt: { gte: sevenDaysAgo, lt: tomorrow } },
        select: { calories: true, naturalSugar: true, addedSugar: true, loggedAt: true },
      }),
      prisma.activityLog.findMany({
        where: { userId, loggedAt: { gte: sevenDaysAgo, lt: tomorrow } },
        select: { caloriesBurned: true, loggedAt: true },
      }),
      prisma.habitLog.findMany({
        where: {
          habit: { userId },
          completedDate: { gte: sevenDaysAgo, lt: tomorrow },
        },
        select: { completedDate: true, habitId: true },
      }),
      prisma.habit.findMany({
        where: { userId },
        select: { id: true },
      }),
    ]);

    const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dailyCalories = Array(7).fill(0);
    const dailyBurned = Array(7).fill(0);
    const dailyNaturalSugar = Array(7).fill(0);
    const dailyAddedSugar = Array(7).fill(0);
    const habitDayMap = {}; // dayIndex -> Set<habitId>
    const habitIds = habits.map(h => h.id);

    const getDayIndex = (dateVal) => {
      const d = new Date(dateVal);
      d.setHours(0, 0, 0, 0);
      const diff = Math.round((today.getTime() - d.getTime()) / 86400000);
      return 6 - diff;
    };

    foodLogs.forEach(log => {
      const idx = getDayIndex(log.loggedAt);
      if (idx >= 0 && idx < 7) {
        dailyCalories[idx] += log.calories || 0;
        dailyNaturalSugar[idx] += log.naturalSugar || 0;
        dailyAddedSugar[idx] += log.addedSugar || 0;
      }
    });

    activityLogs.forEach(log => {
      const idx = getDayIndex(log.loggedAt);
      if (idx >= 0 && idx < 7) dailyBurned[idx] += log.caloriesBurned || 0;
    });

    habitLogs.forEach(log => {
      const idx = getDayIndex(log.completedDate);
      if (idx >= 0 && idx < 7) {
        if (!habitDayMap[idx]) habitDayMap[idx] = new Set();
        habitDayMap[idx].add(log.habitId);
      }
    });

    const analyticsData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - i));
      const completedCount = habitDayMap[i] ? habitDayMap[i].size : 0;
      const habitCompletion = habitIds.length > 0
        ? Math.round((completedCount / habitIds.length) * 100)
        : 0;
      return {
        day: DAY_LABELS[date.getDay()],
        date: date.toISOString().split('T')[0],
        calories: dailyCalories[i],
        burned: dailyBurned[i],
        net: dailyCalories[i] - dailyBurned[i],
        naturalSugar: dailyNaturalSugar[i],
        addedSugar: dailyAddedSugar[i],
        habitCompletion,
      };
    });

    return { success: true, data: analyticsData };
  } catch (error) {
    console.error("[getAnalyticsData] Error:", error);
    return { success: false, error: error.message || "Failed to fetch analytics" };
  }
}

// --- regenerateDailyScore: Silently re-run the score logic for a date --------
export async function regenerateDailyScore(dateStr = null) {
  try {
    const userId = await getUserId();
    const today = dateStr ? new Date(dateStr) : new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 1. Optimization: Only update AI score once per hour to save API calls
    const existingScore = await prisma.dailyScore.findUnique({
      where: { userId_date: { userId, date: today } }
    });

    if (existingScore && existingScore.updatedAt) {
      const lastUpdate = new Date(existingScore.updatedAt);
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      if (lastUpdate > oneHourAgo) {
        console.log(`[regenerateDailyScore] Throttled. Last update was ${lastUpdate.toLocaleTimeString()}.`);
        return { success: true, data: JSON.parse(JSON.stringify(existingScore)), throttled: true };
      }
    }

    const [user, userHabits, existingFoodLogs, existingActivityLogs, completedHabitLogsToday] = await Promise.all([
      prisma.user.findUnique({ 
        where: { id: userId }, 
        select: { targetCalories: true, weight: true, height: true, age: true, gender: true } 
      }),
      prisma.habit.findMany({ where: { userId } }),
      prisma.foodLog.findMany({
        where: { userId, loggedAt: { gte: today, lt: tomorrow } },
        select: { calories: true, description: true }
      }),
      prisma.activityLog.findMany({
        where: { userId, loggedAt: { gte: today, lt: tomorrow } },
        select: { caloriesBurned: true, name: true }
      }),
      prisma.habitLog.findMany({
        where: { habit: { userId }, completedDate: { gte: today, lt: tomorrow } },
        select: { habitId: true }
      }),
    ]);

    const age = user?.age || 25;
    const gender = user?.gender || 'male';
    const weight = user?.weight || 70;
    const height = user?.height || 170;
    let bmr = (10 * weight) + (6.25 * height) - (5 * age);
    if (gender === 'male') bmr += 5; else bmr -= 161;

    const caloriesConsumedSoFar = existingFoodLogs.reduce((s, f) => s + (f.calories || 0), 0);
    const activeBurned = existingActivityLogs.reduce((s, a) => s + (a.caloriesBurned || 0), 0);
    const totalBurnedSoFar = Math.round(bmr + activeBurned);

    const DAILY_CAL_GOAL = user?.targetCalories || 2000;
    const calRemaining = Math.max(0, DAILY_CAL_GOAL - caloriesConsumedSoFar + activeBurned);

    const completedHabitIdsToday = new Set(completedHabitLogsToday.map(l => l.habitId));
    const pendingHabits = userHabits.filter(h => !completedHabitIdsToday.has(h.id));

    const pendingHabitsStr = pendingHabits.length
      ? pendingHabits.map(h => h.name).join(', ')
      : "All habits done!";

    const foodsListStr = existingFoodLogs.length > 0 
      ? existingFoodLogs.map(f => `${f.description} (${f.calories} kcal)`).join(', ') 
      : "None";
      
    const activitiesListStr = existingActivityLogs.length > 0
      ? existingActivityLogs.map(a => `${a.name} (${a.caloriesBurned} kcal)`).join(', ')
      : "None";

    const prompt = `You are an elite personal health coach. Re-evaluate the user's progress for today based on their current updated logs.
Pay close attention to the specific types of foods consumed (e.g. junk food vs healthy food, alcohol, etc.) and provide specific guidance or warnings based on the food quality, not just the raw calorie numbers.

Current Context:
- Foods logged today: ${foodsListStr}
- Activities logged today: ${activitiesListStr}
- Consumed: ${caloriesConsumedSoFar} kcal
- Baseline (BMR): ${bmr} kcal
- Active Burned: ${activeBurned} kcal
- Total Burned: ${totalBurnedSoFar} kcal
- Remaining: ${calRemaining} kcal
- Pending habits not yet completed: ${pendingHabitsStr}

Return ONLY valid JSON (no markdown). Act as an elite coach. Provide an updated score (0-100), insight (3-4 sentences), and a percentage breakdown summing to 100% (body, mind, energy):
{
  "score": 75,
  "insight": "Detailed coaching review...",
  "breakdown": { "body": 33, "mind": 33, "energy": 34 }
}`;

    let data = await resilientAI(prompt);

    if (!data) {
      const estScore = Math.min(100, Math.max(0, 50 + (existingActivityLogs.length * 10) - (existingFoodLogs.length * 5)));
      const pendingStr = pendingHabits.length > 0 ? `You still need to complete: ${pendingHabits.map(h=>h.name).join(', ')}.` : 'Great job finishing all your habits for today!';
      data = {
        score: estScore,
        insight: `I've updated your daily summary. You have ${calRemaining} kcal remaining. ${pendingStr} Keep it up!`,
        breakdown: { body: 33, mind: 33, energy: 34 }
      };
    }

    const scoreRecord = await prisma.dailyScore.upsert({
      where: { userId_date: { userId, date: today } },
      update: {
        score: safeInt(data.score, 50),
        insight: String(data.insight || ''),
        bodyPct: safeInt(data.breakdown?.body, 33),
        mindPct: safeInt(data.breakdown?.mind, 33),
        energyPct: safeInt(data.breakdown?.energy, 34)
      },
      create: {
        userId,
        date: today,
        score: safeInt(data.score, 50),
        insight: String(data.insight || ''),
        bodyPct: safeInt(data.breakdown?.body, 33),
        mindPct: safeInt(data.breakdown?.mind, 33),
        energyPct: safeInt(data.breakdown?.energy, 34)
      },
    });

    return { success: true, data: JSON.parse(JSON.stringify(scoreRecord)) };
  } catch (error) {
    console.error("[regenerateDailyScore] Error:", error);
    return { success: false, error: error.message || "Failed to regenerate score" };
  }
}

// --- generateDailyScore ------------------------------------------------------
export async function generateDailyScore(description) {
  try {
    // Fetch habits and today's existing logs to compute quota context for the AI
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const userId = await getUserId();

    const [user, userHabits, existingFoodLogs, existingActivityLogs, completedHabitLogsToday] = await Promise.all([
      prisma.user.findUnique({ 
        where: { id: userId }, 
        select: { targetCalories: true, weight: true, height: true, age: true, gender: true } 
      }),
      prisma.habit.findMany({ where: { userId } }),
      prisma.foodLog.findMany({
        where: { userId, loggedAt: { gte: today, lt: tomorrow } },
        select: { calories: true, description: true }
      }),
      prisma.activityLog.findMany({
        where: { userId, loggedAt: { gte: today, lt: tomorrow } },
        select: { caloriesBurned: true, name: true }
      }),
      prisma.habitLog.findMany({
        where: { habit: { userId }, completedDate: { gte: today, lt: tomorrow } },
        select: { habitId: true }
      }),
    ]);

    const age = user?.age || 25;
    const gender = user?.gender || 'male';
    const weight = user?.weight || 70;
    const height = user?.height || 170;
    let bmr = (10 * weight) + (6.25 * height) - (5 * age);
    if (gender === 'male') bmr += 5; else bmr -= 161;

    const caloriesConsumedSoFar = existingFoodLogs.reduce((s, f) => s + (f.calories || 0), 0);
    const activeBurned = existingActivityLogs.reduce((s, a) => s + (a.caloriesBurned || 0), 0);
    const DAILY_CAL_GOAL = user?.targetCalories || 2000;
    const calRemaining = Math.max(0, DAILY_CAL_GOAL - caloriesConsumedSoFar + activeBurned);

    const completedHabitIdsToday = new Set(completedHabitLogsToday.map(l => l.habitId));
    const pendingHabits = userHabits.filter(h => !completedHabitIdsToday.has(h.id));

    const habitListStr = userHabits.length
      ? userHabits.map(h => `id: "${h.id}", name: "${h.name}"`).join('\n')
      : "No habits tracked.";

    const pendingHabitsStr = pendingHabits.length
      ? pendingHabits.map(h => h.name).join(', ')
      : "All habits done!";

    const foodsListStr = existingFoodLogs.length > 0 
      ? existingFoodLogs.map(f => `${f.description} (${f.calories} kcal)`).join(', ') 
      : "None";
      
    const activitiesListStr = existingActivityLogs.length > 0
      ? existingActivityLogs.map(a => `${a.name} (${a.caloriesBurned} kcal)`).join(', ')
      : "None";

    const prompt = `You are a personal AI health assistant. Analyze what the user did today:
"${description}"

Pay close attention to the specific types of foods consumed (e.g. junk food vs healthy food, alcohol, etc.) and provide specific guidance or warnings based on the food quality, not just the raw calorie numbers.

Context so far today:
- Foods logged today: ${foodsListStr}
- Activities logged today: ${activitiesListStr}
- Consumed: ${caloriesConsumedSoFar} kcal
- Active Burned: ${activeBurned} kcal
- Baseline (BMR): ${bmr} kcal
- Daily calorie goal: ${DAILY_CAL_GOAL} kcal
- Remaining allowance: ${calRemaining} kcal
- Pending habits not yet completed: ${pendingHabitsStr}

User's habit list:
${habitListStr}

Return ONLY valid JSON (no markdown). The "insight" must be a detailed, coaching-style review (3-4 sentences). Act as an elite personal health coach. Provide a percentage breakdown summing to 100% (body, mind, energy).

CRITICAL INSTRUCTION FOR ARRAYS:
For the "foods" and "activities" arrays, ONLY extract the specific foods or activities that the user mentions in their CURRENT input ("${description}").
Do NOT copy or re-list items from the "Context so far today" UNLESS the user explicitly states they ate or did those exact same things again.

{
  "score": 75,
  "insight": "Detailed coaching review...",
  "breakdown": { "body": 33, "mind": 33, "energy": 34 },
  "foods": [
    { "description": "meal name", "calories": 0, "protein": 0, "carbs": 0, "fat": 0, "naturalSugar": 0, "addedSugar": 0 }
  ],
  "activities": [
    { "name": "activity name", "duration": 0, "caloriesBurned": 0 }
  ],
  "completedHabitIds": ["exact_id_from_list"]
}`;

    // Use resilientAI
    let data = await resilientAI(prompt);

    // Heuristic offline fallback
    if (!data) {
      const low = description.toLowerCase();
      const pos = ['gym','run','walk','water','healthy','salad','read','meditate','sleep','yoga','fruit','protein'];
      const neg = ['sugar','cake','candy','soda','lazy','skipped','pizza','burger','chips','fried'];
      const pCount = pos.filter(w => low.includes(w)).length;
      const nCount = neg.filter(w => low.includes(w)).length;
      const estScore = Math.min(100, Math.max(0, 60 + pCount * 10 - nCount * 10));
      const pendingStr = pendingHabits.length > 0 ? `You still need to complete: ${pendingHabits.map(h=>h.name).join(', ')}.` : 'Great job finishing all your habits for today!';
      data = {
        score: estScore,
        insight: `I've analyzed your log. You have ${calRemaining} kcal remaining in your daily allowance. ${pendingStr} Stay focused and keep making healthy choices to finish the day strong!`,
        breakdown: { body: 33, mind: 33, energy: 34 },
        foods: (low.includes('ate') || low.includes('had') || low.includes('food')) ? [
          { 
            description: description.length > 50 ? description.substring(0, 47) + "..." : description, 
            calories: 450, 
            protein: 18, 
            carbs: 50, 
            fat: 15, 
            naturalSugar: 8, 
            addedSugar: 4 
          }
        ] : [],
        activities: (pCount > 0 || low.includes('did') || low.includes('exercise')) ? [
          { 
            name: description.length > 50 ? description.substring(0, 47) + "..." : description, 
            duration: 30, 
            caloriesBurned: 180 
          }
        ] : [],
        completedHabitIds: [],
      };
    }

    // Upsert score
    const scoreRecord = await prisma.dailyScore.upsert({
      where: { userId_date: { userId, date: today } },
      update: {
        score: safeInt(data.score, 50),
        insight: String(data.insight || ''),
        bodyPct: safeInt(data.breakdown?.body, 33),
        mindPct: safeInt(data.breakdown?.mind, 33),
        energyPct: safeInt(data.breakdown?.energy, 34)
      },
      create: {
        userId,
        date: today,
        score: safeInt(data.score, 50),
        insight: String(data.insight || ''),
        bodyPct: safeInt(data.breakdown?.body, 33),
        mindPct: safeInt(data.breakdown?.mind, 33),
        energyPct: safeInt(data.breakdown?.energy, 34)
      },
    });

    // Create food logs
    if (Array.isArray(data.foods) && data.foods.length > 0) {
      await prisma.foodLog.createMany({
        data: data.foods.map(f => ({
          userId,
          description: String(f.description || 'Meal'),
          calories: safeInt(f.calories, 300),
          protein: safeFloat(f.protein, 10),
          carbs: safeFloat(f.carbs, 40),
          fat: safeFloat(f.fat, 15),
          naturalSugar: safeFloat(f.naturalSugar, 5),
          addedSugar: safeFloat(f.addedSugar, 2),
        })),
      });
    }

    // Create activity logs
    if (Array.isArray(data.activities) && data.activities.length > 0) {
      await prisma.activityLog.createMany({
        data: data.activities.map(a => ({
          userId,
          name: String(a.name || 'Activity'),
          duration: safeInt(a.duration, 30),
          caloriesBurned: safeInt(a.caloriesBurned, 150),
        })),
      });
    }

    // Mark habits as completed — batched to avoid N+1
    if (Array.isArray(data.completedHabitIds) && data.completedHabitIds.length > 0) {
      const validIds = data.completedHabitIds.filter(Boolean);
      if (validIds.length > 0) {
        // Fetch all already-logged habits in one query
        const alreadyLogged = await prisma.habitLog.findMany({
          where: { habitId: { in: validIds }, completedDate: { gte: today, lt: tomorrow } },
          select: { habitId: true },
        });
        const alreadyLoggedSet = new Set(alreadyLogged.map(l => l.habitId));
        const newHabitIds = validIds.filter(id => !alreadyLoggedSet.has(id));

        if (newHabitIds.length > 0) {
          // Batch create all new habit logs
          await prisma.habitLog.createMany({
            data: newHabitIds.map(habitId => ({ habitId, completedDate: new Date() })),
          });
          // Batch update streaks in parallel
          await Promise.all(
            newHabitIds.map(id =>
              prisma.habit.update({ where: { id }, data: { currentStreak: { increment: 1 } } })
            )
          );
        }
      }
    }

    // Build names of habits just completed for the UI
    const completedHabitNames = (data.completedHabitIds || [])
      .map(id => userHabits.find(h => h.id === id)?.name)
      .filter(Boolean);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(scoreRecord)),
      extracted: {
        foods: data.foods || [],
        activities: data.activities || [],
        completedHabitNames,
      }
    };
  } catch (error) {
    console.error("[generateDailyScore] Error:", error);
    return { success: false, error: error.message || "Failed to generate score" };
  }
}

// --- deleteFoodLog -----------------------------------------------------------
export async function deleteFoodLog(logId, dateStr = null) {
  try {
    await prisma.foodLog.delete({ where: { id: logId } });
    await regenerateDailyScore(dateStr);
    return { success: true };
  } catch (error) {
    console.error("[deleteFoodLog] Error:", error);
    return { success: false, error: error.message };
  }
}

// --- deleteActivityLog -------------------------------------------------------
export async function deleteActivityLog(logId, dateStr = null) {
  try {
    await prisma.activityLog.delete({ where: { id: logId } });
    await regenerateDailyScore(dateStr);
    return { success: true };
  } catch (error) {
    console.error("[deleteActivityLog] Error:", error);
    return { success: false, error: error.message };
  }
}

// --- updateUserProfile -------------------------------------------------------
export async function updateUserProfile(data) {
  try {
    const updated = await prisma.user.update({
      where: { id: await getUserId() },
      data: {
        name: data.name,
        goal: data.goal,
        height: data.height ? parseFloat(data.height) : undefined,
        weight: data.weight ? parseFloat(data.weight) : undefined,
      },
    });
    return { success: true, data: JSON.parse(JSON.stringify(updated)) };
  } catch (error) {
    console.error("[updateUserProfile] Error:", error);
    return { success: false, error: error.message };
  }
}

// --- getDataForDate ---
export async function getDataForDate(dateStr) {
  try {
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
    const next = new Date(date);
    next.setDate(date.getDate() + 1);

    const userId = await getUserId();

    const [foodLogs, activityLogs, dailyScore, habits] = await Promise.all([
      prisma.foodLog.findMany({
        where: { userId, loggedAt: { gte: date, lt: next } },
        orderBy: { loggedAt: 'desc' },
      }),
      prisma.activityLog.findMany({
        where: { userId, loggedAt: { gte: date, lt: next } },
        orderBy: { loggedAt: 'desc' },
      }),
      prisma.dailyScore.findFirst({
        where: { userId, date: { gte: date, lt: next } },
      }),
      prisma.habit.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' },
        include: { logs: { where: { completedDate: { gte: date, lt: next } } } },
      }),
    ]);

    return { success: true, data: JSON.parse(JSON.stringify({ foodLogs, activityLogs, dailyScore, habits })) };
  } catch (error) {
    console.error('[getDataForDate] Error:', error);
    return { success: false, error: error.message };
  }
}

// --- Journal Actions ---------------------------------------------------------
export async function saveJournalEntry({ content, mood, date }) {
  try {
    const userId = await getUserId();
    if (!content || typeof content !== 'string') return { success: false, error: 'Content is required' };
    const safeContent = content.slice(0, 10000);
    const safeMood = typeof mood === 'string' ? mood.slice(0, 50) : '';
    const entryDate = new Date(date);
    entryDate.setHours(0, 0, 0, 0);
    const entry = await prisma.journalEntry.create({
      data: { userId, content: safeContent, mood: safeMood, entryDate }
    });
    return { success: true, data: JSON.parse(JSON.stringify(entry)) };
  } catch (e) { return { success: false, error: e.message }; }
}

export async function getJournalEntries() {
  try {
    const userId = await getUserId();
    const entries = await prisma.journalEntry.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, data: JSON.parse(JSON.stringify(entries)) };
  } catch (e) { return { success: false, error: e.message }; }
}

export async function deleteJournalEntry(id) {
  try {
    await prisma.journalEntry.delete({ where: { id, userId: await getUserId() } });
    return { success: true };
  } catch (e) { return { success: false, error: e.message }; }
}

// --- Profile & Weight Actions ------------------------------------------------
export async function updateProfile(updates) {
  try {
    const userId = await getUserId();
    const currentUser = await prisma.user.findUnique({ where: { id: userId } });
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: updates.name,
        goal: updates.goal,
        height: updates.height ? parseFloat(updates.height) : currentUser.height,
        weight: updates.weight ? parseFloat(updates.weight) : currentUser.weight,
        age: updates.age ? parseInt(updates.age) : currentUser.age,
        gender: updates.gender || currentUser.gender,
        dietType: updates.dietType,
        foodPrefs: updates.foodPrefs ? JSON.stringify(updates.foodPrefs) : currentUser.foodPrefs,
        targetCalories: updates.targetCalories ? parseInt(updates.targetCalories) : currentUser.targetCalories,
        targetProtein: updates.targetProtein ? parseInt(updates.targetProtein) : currentUser.targetProtein,
        targetCarbs: updates.targetCarbs ? parseInt(updates.targetCarbs) : currentUser.targetCarbs,
        targetFat: updates.targetFat ? parseInt(updates.targetFat) : currentUser.targetFat,
      }
    });

    if (updates.weight && (!currentUser.weight || Math.abs(currentUser.weight - parseFloat(updates.weight)) > 0.1)) {
      await prisma.weightLog.create({
        data: { userId, weight: parseFloat(updates.weight), loggedAt: new Date() }
      });
    }

    return { success: true, data: JSON.parse(JSON.stringify(updatedUser)) };
  } catch (e) { return { success: false, error: e.message }; }
}

export async function getWeightLogs() {
  try {
    const userId = await getUserId();
    const logs = await prisma.weightLog.findMany({
      where: { userId },
      orderBy: { loggedAt: 'asc' },
    });
    
    if (logs.length === 0) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user && user.weight) {
        return { success: true, data: [{ weight: user.weight, loggedAt: user.createdAt }] };
      }
      return { success: true, data: [] };
    }
    
    return { success: true, data: JSON.parse(JSON.stringify(logs)) };
  } catch (e) { return { success: false, error: e.message }; }
}

// --- Weekly Insight & Preferences -------------------------------------------
export async function generateWeeklyInsight() {
  try {
    const userId = await getUserId();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [foodLogs, activityLogs, scores, habits, habitLogs] = await Promise.all([
      prisma.foodLog.findMany({
        where: { userId, loggedAt: { gte: sevenDaysAgo, lt: tomorrow } },
        select: { calories: true, loggedAt: true },
      }),
      prisma.activityLog.findMany({
        where: { userId, loggedAt: { gte: sevenDaysAgo, lt: tomorrow } },
        select: { caloriesBurned: true, name: true },
      }),
      prisma.dailyScore.findMany({
        where: { userId, date: { gte: sevenDaysAgo, lt: tomorrow } },
        select: { score: true },
      }),
      prisma.habit.findMany({ where: { userId }, select: { id: true } }),
      prisma.habitLog.findMany({
        where: { habit: { userId }, completedDate: { gte: sevenDaysAgo, lt: tomorrow } },
        select: { habitId: true },
      }),
    ]);

    const totalCals = foodLogs.reduce((s, f) => s + (f.calories || 0), 0);
    const totalBurned = activityLogs.reduce((s, a) => s + (a.caloriesBurned || 0), 0);
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((s, d) => s + d.score, 0) / scores.length) : 0;
    const habitPct = habits.length > 0 ? Math.round((habitLogs.length / (habits.length * 7)) * 100) : 0;

    const prompt = `You are an elite personal health coach. Analyze this user's 7-day summary.

Stats: ${totalCals} kcal eaten (avg ${Math.round(totalCals/7)}/day), ${totalBurned} kcal burned, avg score ${avgScore}/100, habit completion ${habitPct}%, top activities: ${[...new Set(activityLogs.map(a=>a.name))].slice(0,5).join(', ')||'None'}.

Return ONLY JSON:
{ "report": "3-4 sentence analysis with advice", "topWin": "best achievement", "topImprovement": "focus area", "weeklyScore": ${avgScore}, "trend": "improving|stable|declining" }`;

    let data = await resilientAI(prompt);
    if (!data) {
      data = {
        report: `This week: ${totalCals.toLocaleString()} kcal consumed, ${totalBurned.toLocaleString()} kcal burned, ${habitPct}% habits completed. Keep it up!`,
        topWin: habitPct >= 70 ? 'Habit consistency' : 'Showing up',
        topImprovement: habitPct < 50 ? 'Habit completion' : 'Calorie balance',
        weeklyScore: avgScore, trend: 'stable',
      };
    }
    return { success: true, data };
  } catch (error) {
    console.error("[generateWeeklyInsight] Error:", error);
    return { success: false, error: error.message };
  }
}

// --- Water Tracking ---------------------------------------------------------
export async function logWater(amountMl) {
  try {
    const userId = await getUserId();
    const amount = Math.max(0, Math.min(5000, safeInt(amountMl, 250)));
    const log = await prisma.waterLog.create({ data: { userId, amountMl: amount } });
    return { success: true, data: JSON.parse(JSON.stringify(log)) };
  } catch (e) { return { success: false, error: e.message }; }
}

export async function getTodayWater() {
  try {
    const userId = await getUserId();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const logs = await prisma.waterLog.findMany({
      where: { userId, loggedAt: { gte: today, lt: tomorrow } },
      orderBy: { loggedAt: 'desc' },
    });
    const totalMl = logs.reduce((s, l) => s + l.amountMl, 0);
    return { success: true, data: { totalMl, logs: JSON.parse(JSON.stringify(logs)) } };
  } catch (e) { return { success: false, error: e.message }; }
}

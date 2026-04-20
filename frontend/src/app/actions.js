'use server'

import prisma from '@/lib/prisma';
import { DUMMY_USER_ID } from '@/lib/constants';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ─── Resilient AI with full model cascade + offline fallback ─────────────────
async function resilientAI(prompt) {
  const models = [
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-2.0-flash-exp",
  ];
  for (const m of models) {
    try {
      const model = genAI.getGenerativeModel({
        model: m,
        generationConfig: { responseMimeType: "application/json" },
      });
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });
      let text = result.response.text().trim();
      // Strip markdown fences if present
      text = text.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
      return JSON.parse(text);
    } catch (e) {
      console.warn(`[AI] Model ${m} failed:`, e.message);
    }
  }

  // Groq Fallback
  console.log("[AI] All Gemini models failed. Attempting Groq fallback...");
  try {
    const groqKey = process.env.GROQ_API_KEY;
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${groqKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `You are an elite personal health coach. Respond ONLY with valid JSON (no markdown blocks, no thinking blocks, just raw JSON).
The "insight" must be a detailed, coaching-style review (3-4 sentences). Act as an elite personal health coach. Acknowledge what they did well based on their input, gently correct any missteps, give an actionable step for what to do next, and explicitly state their remaining daily calorie quota and which specific habits they still need to complete.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.1
      })
    });

    if (response.ok) {
      const data = await response.json();
      let text = data.choices?.[0]?.message?.content || "";
      text = text.trim().replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
      console.log("[AI] Groq fallback succeeded.");
      return JSON.parse(text);
    } else {
      const errText = await response.text();
      console.warn(`[AI] Groq fallback failed with status ${response.status}:`, errText);
    }
  } catch (e) {
    console.warn(`[AI] Groq fallback network error:`, e.message);
  }

  return null;
}

// ─── Safely parse int/float from AI, clamp to reasonable range ───────────────
function safeInt(v, fallback = 0) {
  const n = Math.round(Number(v));
  return isNaN(n) ? fallback : Math.max(0, n);
}
function safeFloat(v, fallback = 0) {
  const n = parseFloat(Number(v).toFixed(1));
  return isNaN(n) ? fallback : Math.max(0, n);
}

// ─── getDashboardData ─────────────────────────────────────────────────────────
export async function getDashboardData() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  try {
    const user = await prisma.user.findUnique({ where: { id: DUMMY_USER_ID } });

    const habits = await prisma.habit.findMany({
      where: { userId: DUMMY_USER_ID },
      orderBy: { createdAt: 'asc' },
      include: {
        logs: {
          where: { completedDate: { gte: today, lt: tomorrow } },
        },
      },
    });

    const foodLogs = await prisma.foodLog.findMany({
      where: { userId: DUMMY_USER_ID, loggedAt: { gte: today, lt: tomorrow } },
      orderBy: { loggedAt: 'desc' },
    });

    const activityLogs = await prisma.activityLog.findMany({
      where: { userId: DUMMY_USER_ID, loggedAt: { gte: today, lt: tomorrow } },
      orderBy: { loggedAt: 'desc' },
    });

    const dailyScore = await prisma.dailyScore.findFirst({
      where: { userId: DUMMY_USER_ID, date: { gte: today, lt: tomorrow } },
    });

    return {
      success: true,
      data: JSON.parse(JSON.stringify({ user, habits, foodLogs, activityLogs, dailyScore })),
    };
  } catch (error) {
    console.error("[getDashboardData] Error:", error);
    return { success: false, error: error.message || "Failed to fetch data" };
  }
}

// ─── clarifyFoodQuery ─────────────────────────────────────────────────────────
export async function clarifyFoodQuery(chatHistory) {
  try {
    const conversation = chatHistory.map(msg => `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.content}`).join('\n');
    const prompt = `You are an expert nutritionist. Review the following conversation to determine if you have enough specific information to accurately calculate calories and macros (quantity, specific type of food, preparation method).

Conversation:
${conversation}

If you have enough information, return ONLY this JSON:
{ "status": "success" }

If the food description is too vague (e.g., just "Rice", "Chicken"), ask a single, short clarifying question to get the missing details (e.g., "How much rice, and was it white or brown?").
Return ONLY this JSON in that case:
{ "status": "clarification_needed", "question": "Your short question here" }`;

    const data = await resilientAI(prompt);
    if (!data || !data.status) return { success: false, error: "AI failed to respond" };
    return { success: true, data };
  } catch (error) {
    console.error("[clarifyFoodQuery] Error:", error);
    return { success: false, error: error.message };
  }
}

// ─── clarifyActivityQuery ─────────────────────────────────────────────────────
export async function clarifyActivityQuery(chatHistory) {
  try {
    const conversation = chatHistory.map(msg => `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.content}`).join('\n');
    const prompt = `You are an expert fitness coach. Review the following conversation to determine if you have enough specific information to accurately estimate calories burned for a workout (activity type, duration, and intensity/distance).

Conversation:
${conversation}

If you have enough information, return ONLY this JSON:
{ "status": "success" }

If the activity description is too vague (e.g., just "ran", "worked out", "lifted weights"), ask a single, short clarifying question to get the missing details (e.g., "How long did you run and at what pace?").
Return ONLY this JSON in that case:
{ "status": "clarification_needed", "question": "Your short question here" }`;

    const data = await resilientAI(prompt);
    if (!data || !data.status) return { success: false, error: "AI failed to respond" };
    return { success: true, data };
  } catch (error) {
    console.error("[clarifyActivityQuery] Error:", error);
    return { success: false, error: error.message };
  }
}

// ─── clarifyDayQuery ──────────────────────────────────────────────────────────
export async function clarifyDayQuery(chatHistory) {
  try {
    const conversation = chatHistory.map(msg => `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.content}`).join('\n');
    const prompt = `You are an elite personal health coach. Review the user's daily log conversation to determine if you have enough specific information to accurately log their foods and activities.

Conversation:
${conversation}

If you have enough information for all foods and activities mentioned (e.g. quantities and types of food, duration and intensity of activities), or if they didn't mention any foods or activities that need clarification, return ONLY this JSON:
{ "status": "success" }

If any food or activity description is too vague (e.g., "I had a cold drink", "I ran", "I ate chicken"), ask a single, short clarifying question to get the missing details (e.g., "What kind of cold drink and how many ml?", "How long did you run?").
Return ONLY this JSON in that case:
{ "status": "clarification_needed", "question": "Your short question here" }`;

    const data = await resilientAI(prompt);
    if (!data || !data.status) return { success: false, error: "AI failed to respond" };
    return { success: true, data };
  } catch (error) {
    console.error("[clarifyDayQuery] Error:", error);
    return { success: false, error: error.message };
  }
}

// ─── logFoodWithAI ────────────────────────────────────────────────────────────
export async function logFoodWithAI(description) {
  try {
    let data = null;

    // 1. Try Nutrition Tracker API
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
          console.log("[Nutrition API] Successfully parsed food:", data);
        } else {
          throw new Error("Invalid response format from Nutrition Tracker API");
        }
      } else {
        throw new Error(`API returned ${response.status}`);
      }
    } catch (apiError) {
      console.warn("[Nutrition API] Failed, falling back to Groq/Gemini:", apiError.message);
    }

    // 2. Fallback to Groq/Gemini if API failed
    if (!data) {
      const prompt = `You are an expert nutritionist. Analyze this food/meal and return accurate nutritional data.

Food: "${description}"

Return ONLY valid JSON matching this exact schema (no explanation, no markdown):
{
  "description": "clean meal name",
  "calories": 0,
  "protein": 0.0,
  "carbs": 0.0,
  "fat": 0.0,
  "naturalSugar": 0.0,
  "addedSugar": 0.0
}`;

      data = await resilientAI(prompt);
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

    const newLog = await prisma.foodLog.create({
      data: {
        userId: DUMMY_USER_ID,
        description: String(data.description || description),
        calories: safeInt(data.calories, 400),
        protein: safeFloat(data.protein, 15),
        carbs: safeFloat(data.carbs, 45),
        fat: safeFloat(data.fat, 18),
        naturalSugar: safeFloat(data.naturalSugar, 8),
        addedSugar: safeFloat(data.addedSugar, 3),
      },
    });

    return { success: true, data: JSON.parse(JSON.stringify(newLog)) };
  } catch (error) {
    console.error("[logFoodWithAI] Error:", error);
    return { success: false, error: error.message || "Failed to log food" };
  }
}

// ─── logActivityWithAI ────────────────────────────────────────────────────────
export async function logActivityWithAI(description) {
  try {
    const user = await prisma.user.findUnique({ where: { id: DUMMY_USER_ID } });
    const weight = user?.weight || 70;
    const height = user?.height || 175;

    const prompt = `You are an expert fitness coach. Analyze this workout and estimate calories burned.
User: weight ${weight}kg, height ${height}cm.
Activity: "${description}"

Return ONLY valid JSON (no markdown, no explanation):
{
  "name": "short clean activity name",
  "duration": 30,
  "caloriesBurned": 200
}`;

    let data = await resilientAI(prompt);

    if (!data) {
      data = { name: description, duration: 30, caloriesBurned: 200 };
    }

    const newLog = await prisma.activityLog.create({
      data: {
        userId: DUMMY_USER_ID,
        name: String(data.name || description),
        duration: safeInt(data.duration, 30),
        caloriesBurned: safeInt(data.caloriesBurned, 200),
      },
    });

    return { success: true, data: JSON.parse(JSON.stringify(newLog)) };
  } catch (error) {
    console.error("[logActivityWithAI] Error:", error);
    return { success: false, error: error.message || "Failed to log activity" };
  }
}

// ─── addHabitAction ───────────────────────────────────────────────────────────
export async function addHabitAction(name, frequency = 'daily') {
  try {
    const newHabit = await prisma.habit.create({
      data: {
        userId: DUMMY_USER_ID,
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

// ─── logHabitCompletion ───────────────────────────────────────────────────────
export async function logHabitCompletion(habitId) {
  try {
    const today = new Date();
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

      if (refreshNeeded) {
        await regenerateDailyScore();
      }

      return { success: true, removed: true, refreshNeeded };
    }

    const log = await prisma.habitLog.create({
      data: { habitId, completedDate: new Date() },
    });

    const habit = await prisma.habit.update({
      where: { id: habitId },
      data: { currentStreak: { increment: 1 } },
    });

    let refreshNeeded = false;
    if (habit.name.startsWith('Health — ')) {
      const taskName = habit.name.replace('Health — ', '').trim();
      await logFoodWithAI(`I just completed my health habit: ${taskName}. Log this as food/drink appropriately.`);
      refreshNeeded = true;
    } else if (habit.name.startsWith('Fitness — ')) {
      const taskName = habit.name.replace('Fitness — ', '').trim();
      await logActivityWithAI(`I just completed my fitness habit: ${taskName}. Log this activity appropriately.`);
      refreshNeeded = true;
    }

    if (refreshNeeded) {
      await regenerateDailyScore();
    }

    return { 
      success: true, 
      removed: false, 
      data: JSON.parse(JSON.stringify(log)),
      refreshNeeded 
    };
  } catch (error) {
    console.error("[logHabitCompletion] Error:", error);
    return { success: false, error: error.message || "Habit completion failed" };
  }
}

// ─── deleteHabit ──────────────────────────────────────────────────────────────
export async function deleteHabit(habitId) {
  try {
    const habit = await prisma.habit.findUnique({ where: { id: habitId } });
    if (!habit) return { success: false, error: "Habit not found" };

    const today = new Date();
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
      await regenerateDailyScore();
    }
    return { success: true, refreshNeeded };
  } catch (error) {
    console.error("[deleteHabit] Error:", error);
    return { success: false, error: error.message };
  }
}

// ─── getAnalyticsData ─────────────────────────────────────────────────────────
export async function getAnalyticsData() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [foodLogs, activityLogs, habitLogs, habits] = await Promise.all([
      prisma.foodLog.findMany({
        where: { userId: DUMMY_USER_ID, loggedAt: { gte: sevenDaysAgo, lt: tomorrow } },
        select: { calories: true, naturalSugar: true, addedSugar: true, loggedAt: true },
      }),
      prisma.activityLog.findMany({
        where: { userId: DUMMY_USER_ID, loggedAt: { gte: sevenDaysAgo, lt: tomorrow } },
        select: { caloriesBurned: true, loggedAt: true },
      }),
      prisma.habitLog.findMany({
        where: {
          habit: { userId: DUMMY_USER_ID },
          completedDate: { gte: sevenDaysAgo, lt: tomorrow },
        },
        select: { completedDate: true, habitId: true },
      }),
      prisma.habit.findMany({
        where: { userId: DUMMY_USER_ID },
        select: { id: true },
      }),
    ]);

    const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dailyCalories = Array(7).fill(0);
    const dailyBurned = Array(7).fill(0);
    const dailyNaturalSugar = Array(7).fill(0);
    const dailyAddedSugar = Array(7).fill(0);
    const habitDayMap = {}; // dayIndex → Set<habitId>
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

// ─── regenerateDailyScore ─────────────────────────────────────────────────────
export async function regenerateDailyScore() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const userHabits = await prisma.habit.findMany({ where: { userId: DUMMY_USER_ID } });
    const existingFoodLogs = await prisma.foodLog.findMany({
      where: { userId: DUMMY_USER_ID, loggedAt: { gte: today, lt: tomorrow } },
      select: { calories: true, description: true }
    });
    const existingActivityLogs = await prisma.activityLog.findMany({
      where: { userId: DUMMY_USER_ID, loggedAt: { gte: today, lt: tomorrow } },
      select: { caloriesBurned: true, name: true }
    });
    const completedHabitLogsToday = await prisma.habitLog.findMany({
      where: { habit: { userId: DUMMY_USER_ID }, completedDate: { gte: today, lt: tomorrow } },
      select: { habitId: true }
    });

    const caloriesConsumedSoFar = existingFoodLogs.reduce((s, f) => s + (f.calories || 0), 0);
    const caloriesBurnedSoFar   = existingActivityLogs.reduce((s, a) => s + (a.caloriesBurned || 0), 0);
    const DAILY_CAL_GOAL = 2000;
    const calRemaining = Math.max(0, DAILY_CAL_GOAL - caloriesConsumedSoFar + caloriesBurnedSoFar);

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
- Calories consumed: ${caloriesConsumedSoFar} kcal
- Calories burned: ${caloriesBurnedSoFar} kcal
- Remaining calorie allowance: ${calRemaining} kcal
- Pending habits not yet completed: ${pendingHabitsStr}

Return ONLY valid JSON (no markdown). Act as an elite coach. Provide an updated score (0-100) and insight (3-4 sentences):
{
  "score": 75,
  "insight": "Detailed coaching review and action plan based on the current stats..."
}`;

    let data = await resilientAI(prompt);

    if (!data) {
      const estScore = Math.min(100, Math.max(0, 50 + (existingActivityLogs.length * 10) - (existingFoodLogs.length * 5)));
      const pendingStr = pendingHabits.length > 0 ? `You still need to complete: ${pendingHabits.map(h=>h.name).join(', ')}.` : 'Great job finishing all your habits for today!';
      data = {
        score: estScore,
        insight: `I've updated your daily summary. You have ${calRemaining} kcal remaining. ${pendingStr} Keep it up!`,
      };
    }

    const scoreRecord = await prisma.dailyScore.upsert({
      where: { userId_date: { userId: DUMMY_USER_ID, date: today } },
      update: { score: safeInt(data.score, 50), insight: String(data.insight || '') },
      create: {
        userId: DUMMY_USER_ID,
        date: today,
        score: safeInt(data.score, 50),
        insight: String(data.insight || ''),
      },
    });

    return { success: true, data: JSON.parse(JSON.stringify(scoreRecord)) };
  } catch (error) {
    console.error("[regenerateDailyScore] Error:", error);
    return { success: false, error: error.message || "Failed to regenerate score" };
  }
}

// ─── generateDailyScore ───────────────────────────────────────────────────────
export async function generateDailyScore(description) {
  try {
    // Fetch habits and today's existing logs to compute quota context for the AI
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const userHabits = await prisma.habit.findMany({ where: { userId: DUMMY_USER_ID } });
    const existingFoodLogs = await prisma.foodLog.findMany({
      where: { userId: DUMMY_USER_ID, loggedAt: { gte: today, lt: tomorrow } },
      select: { calories: true, description: true }
    });
    const existingActivityLogs = await prisma.activityLog.findMany({
      where: { userId: DUMMY_USER_ID, loggedAt: { gte: today, lt: tomorrow } },
      select: { caloriesBurned: true, name: true }
    });
    const completedHabitLogsToday = await prisma.habitLog.findMany({
      where: { habit: { userId: DUMMY_USER_ID }, completedDate: { gte: today, lt: tomorrow } },
      select: { habitId: true }
    });

    const caloriesConsumedSoFar = existingFoodLogs.reduce((s, f) => s + (f.calories || 0), 0);
    const caloriesBurnedSoFar   = existingActivityLogs.reduce((s, a) => s + (a.caloriesBurned || 0), 0);
    const DAILY_CAL_GOAL = 2000;
    const calRemaining = Math.max(0, DAILY_CAL_GOAL - caloriesConsumedSoFar + caloriesBurnedSoFar);

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
- Calories consumed: ${caloriesConsumedSoFar} kcal
- Calories burned: ${caloriesBurnedSoFar} kcal
- Daily calorie goal: ${DAILY_CAL_GOAL} kcal
- Remaining calorie allowance: ${calRemaining} kcal
- Pending habits not yet completed: ${pendingHabitsStr}

User's habit list:
${habitListStr}

Return ONLY valid JSON (no markdown). The "insight" must be a detailed, coaching-style review (3-4 sentences). Act as an elite personal health coach. Acknowledge what they did well based on their input, gently correct any missteps, give an actionable step for what to do next, and explicitly state their remaining daily calorie quota and which specific habits they still need to complete.

CRITICAL INSTRUCTION FOR ARRAYS:
For the "foods" and "activities" arrays, ONLY extract the specific foods or activities that the user mentions in their CURRENT input ("${description}").
Do NOT copy or re-list items from the "Context so far today" UNLESS the user explicitly states they ate or did those exact same things again.

{
  "score": 75,
  "insight": "Detailed coaching review and action plan...",
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
        foods: low.includes('ate') || low.includes('drank') || low.includes('food') ? [
          { description: "Estimated Meal", calories: 450, protein: 18, carbs: 50, fat: 15, naturalSugar: 8, addedSugar: 4 }
        ] : [],
        activities: pCount > 0 ? [
          { name: "Physical Activity (Estimated)", duration: 30, caloriesBurned: 180 }
        ] : [],
        completedHabitIds: [],
      };
    }

    // Upsert score
    const scoreRecord = await prisma.dailyScore.upsert({
      where: { userId_date: { userId: DUMMY_USER_ID, date: today } },
      update: { score: safeInt(data.score, 50), insight: String(data.insight || '') },
      create: {
        userId: DUMMY_USER_ID,
        date: today,
        score: safeInt(data.score, 50),
        insight: String(data.insight || ''),
      },
    });

    // Create food logs
    if (Array.isArray(data.foods) && data.foods.length > 0) {
      await prisma.foodLog.createMany({
        data: data.foods.map(f => ({
          userId: DUMMY_USER_ID,
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
          userId: DUMMY_USER_ID,
          name: String(a.name || 'Activity'),
          duration: safeInt(a.duration, 30),
          caloriesBurned: safeInt(a.caloriesBurned, 150),
        })),
      });
    }

    // Mark habits as completed
    if (Array.isArray(data.completedHabitIds)) {
      for (const hid of data.completedHabitIds) {
        if (!hid) continue;
        const alreadyLogged = await prisma.habitLog.findFirst({
          where: { habitId: hid, completedDate: { gte: today, lt: tomorrow } },
        });
        if (!alreadyLogged) {
          await prisma.habitLog.create({ data: { habitId: hid, completedDate: new Date() } });
          await prisma.habit.update({
            where: { id: hid },
            data: { currentStreak: { increment: 1 } },
          });
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

// ─── deleteFoodLog ────────────────────────────────────────────────────────────
export async function deleteFoodLog(logId) {
  try {
    await prisma.foodLog.delete({ where: { id: logId } });
    await regenerateDailyScore();
    return { success: true };
  } catch (error) {
    console.error("[deleteFoodLog] Error:", error);
    return { success: false, error: error.message };
  }
}

// ─── deleteActivityLog ────────────────────────────────────────────────────────
export async function deleteActivityLog(logId) {
  try {
    await prisma.activityLog.delete({ where: { id: logId } });
    await regenerateDailyScore();
    return { success: true };
  } catch (error) {
    console.error("[deleteActivityLog] Error:", error);
    return { success: false, error: error.message };
  }
}

// ─── updateUserProfile ────────────────────────────────────────────────────────
export async function updateUserProfile(data) {
  try {
    const updated = await prisma.user.update({
      where: { id: DUMMY_USER_ID },
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
    next.setDate(next.getDate() + 1);

    const [foodLogs, activityLogs, dailyScore, habits] = await Promise.all([
      prisma.foodLog.findMany({
        where: { userId: DUMMY_USER_ID, loggedAt: { gte: date, lt: next } },
        orderBy: { loggedAt: 'desc' },
      }),
      prisma.activityLog.findMany({
        where: { userId: DUMMY_USER_ID, loggedAt: { gte: date, lt: next } },
        orderBy: { loggedAt: 'desc' },
      }),
      prisma.dailyScore.findFirst({
        where: { userId: DUMMY_USER_ID, date: { gte: date, lt: next } },
      }),
      prisma.habit.findMany({
        where: { userId: DUMMY_USER_ID },
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

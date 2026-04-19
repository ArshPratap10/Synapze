'use server'

import prisma from '@/lib/prisma';
import { DUMMY_USER_ID } from '@/lib/constants';
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// We use gemini-1.5-flash because it is the fastest, cheapest, and perfectly capable of JSON extraction
const aiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function getDashboardData() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const user = await prisma.user.findUnique({
      where: { id: DUMMY_USER_ID }
    });

    const habits = await prisma.habit.findMany({
      where: { userId: DUMMY_USER_ID },
      include: {
        logs: {
          where: {
            completedDate: {
              gte: today
            }
          }
        }
      }
    });

    const foodLogs = await prisma.foodLog.findMany({
      where: {
        userId: DUMMY_USER_ID,
        loggedAt: {
          gte: today
        }
      },
      orderBy: { loggedAt: 'desc' }
    });

    const activityLogs = await prisma.activityLog.findMany({
      where: {
        userId: DUMMY_USER_ID,
        loggedAt: {
          gte: today
        }
      },
      orderBy: { loggedAt: 'desc' }
    });

    const dailyScore = await prisma.dailyScore.findFirst({
      where: {
        userId: DUMMY_USER_ID,
        date: today
      }
    });

    return {
      success: true,
      data: JSON.parse(JSON.stringify({
        user,
        habits,
        foodLogs,
        activityLogs,
        dailyScore
      }))
    };
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);
    return { success: false, error: error.message || "Failed to fetch data" };
  }
}

export async function logFoodWithAI(description) {
  try {
    const prompt = `
      You are an expert nutritionist. Analyze the following food/meal description and extract nutritional values.
      Provide the estimation. Even if unsure, provide the best logical estimation.
      
      Description: "${description}"

      Return JSON EXACTLY matching this schema:
      {
        "description": "Cleaned up name of the meal",
        "calories": number (total kcal),
        "protein": number (grams),
        "carbs": number (grams),
        "fat": number (grams),
        "naturalSugar": number (grams of natural sugar, e.g. from fruit),
        "addedSugar": number (grams of added sugar)
      }
    `;

    const result = await aiModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const responseText = result.response.text();
    const nutritionalData = JSON.parse(responseText);

    // Save to Database
    const newLog = await prisma.foodLog.create({
      data: {
        userId: DUMMY_USER_ID,
        description: nutritionalData.description,
        calories: nutritionalData.calories,
        protein: nutritionalData.protein,
        carbs: nutritionalData.carbs,
        fat: nutritionalData.fat,
        naturalSugar: nutritionalData.naturalSugar,
        addedSugar: nutritionalData.addedSugar,
      }
    });

    return { success: true, data: JSON.parse(JSON.stringify(newLog)) };
  } catch (error) {
    console.error("Food logging failed:", error);
    return { success: false, error: error.message || "Failed to log food" };
  }
}

export async function logActivityWithAI(description) {
  try {
    // Fetch user details for accurate calorie calculation
    const user = await prisma.user.findUnique({
      where: { id: DUMMY_USER_ID }
    });

    const prompt = `
      You are an expert fitness coach. Analyze this workout description and estimate the calories burned.
      The user weighs ${user.weight}kg and is ${user.height}cm tall.
      
      Description: "${description}"

      Return JSON EXACTLY matching this schema:
      {
        "name": "Short, clean name of the activity (e.g. 'Morning Run', 'Yoga')",
        "duration": number (duration in minutes),
        "caloriesBurned": number (estimated kcal burned)
      }
    `;

    const result = await aiModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const responseText = result.response.text();
    const activityData = JSON.parse(responseText);

    // Save to Database
    const newLog = await prisma.activityLog.create({
      data: {
        userId: DUMMY_USER_ID,
        name: activityData.name,
        duration: activityData.duration,
        caloriesBurned: activityData.caloriesBurned,
      }
    });

    return { success: true, data: JSON.parse(JSON.stringify(newLog)) };
  } catch (error) {
    console.error("Activity logging failed:", error);
    return { success: false, error: error.message || "Failed to log activity" };
  }
}

export async function addHabitAction(name, frequency) {
  try {
    const newHabit = await prisma.habit.create({
      data: {
        userId: DUMMY_USER_ID,
        name,
        frequency,
      }
    });
    // Add an empty logs array so the frontend format matches the getDashboard payload
    return { success: true, data: JSON.parse(JSON.stringify({ ...newHabit, logs: [] })) };
  } catch (error) {
    console.error("Failed to add habit", error);
    return { success: false, error: error.message || "Adding habit failed" };
  }
}

export async function logHabitCompletion(habitId) {
  try {
    // For simplicity, completing for today. 
    // In reality, we'd need to ensure idempotency.
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already logged today
    const existing = await prisma.habitLog.findFirst({
      where: {
        habitId,
        completedDate: { gte: today }
      }
    });

    if (existing) {
      return { success: false, error: "Already completed today" };
    }

    const log = await prisma.habitLog.create({
      data: {
        habitId,
      }
    });

    // We should also increment the streak
    await prisma.habit.update({
      where: { id: habitId },
      data: {
        currentStreak: { increment: 1 }
      }
    });

    return { success: true, data: JSON.parse(JSON.stringify(log)) };
  } catch(error) {
    console.error("Failed to complete habit", error);
    return { success: false, error: error.message || "Habit completion failed" };
  }
}

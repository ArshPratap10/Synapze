import { GoogleGenerativeAI } from "@google/generative-ai";
import 'dotenv/config';

const keys = [
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
  process.env.DEMOKEY
].filter(Boolean);

async function testKey(key, index) {
  const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
  const errors = [];
  
  for (const modelName of modelsToTry) {
    try {
      const genAI = new GoogleGenerativeAI(key);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Hello");
      const text = (await result.response).text();
      return `✅ Key ${index + 1}: WORKING with ${modelName}`;
    } catch (error) {
      errors.push(`${modelName}: ${error.message.substring(0, 50)}`);
    }
  }
  return `❌ Key ${index + 1}: FAILED - ${errors.join(" | ")}`;
}

async function run() {
  console.log("Testing keys with multiple models...\n");
  for (let i = 0; i < keys.length; i++) {
    const res = await testKey(keys[i], i);
    console.log(res);
  }
}

run();

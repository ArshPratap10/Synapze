import { GoogleGenerativeAI } from "@google/generative-ai";
import 'dotenv/config';

const geminiKeys = [
  { name: 'GEMINI_API_KEY', key: process.env.GEMINI_API_KEY },
  { name: 'GEMINI_API_KEY_2', key: process.env.GEMINI_API_KEY_2 },
  { name: 'GEMINI_API_KEY_3', key: process.env.GEMINI_API_KEY_3 },
  { name: 'GEMINI_API_KEY_4', key: process.env.GEMINI_API_KEY_4 },
  { name: 'GEMINI_API_KEY_5', key: process.env.GEMINI_API_KEY_5 },
].filter(k => k.key);

const modelsToTry = ["gemini-1.5-flash", "gemini-2.5-flash", "gemini-3.1-flash-lite-preview", "gemini-1.5-flash-8b"];

async function testGemini(keyObj) {
  console.log(`\n--- Testing ${keyObj.name} ---`);
  for (const modelName of modelsToTry) {
    try {
      const genAI = new GoogleGenerativeAI(keyObj.key);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Say 'Hello'");
      const text = (await result.response).text();
      console.log(`✅ [${modelName}] WORKING: ${text.trim()}`);
    } catch (error) {
      console.log(`❌ [${modelName}] FAILED: ${error.message.split('\\n')[0]}`);
    }
  }
}

async function testOpenRouter() {
  console.log(`\n--- Testing OPENROUTER_API_KEY ---`);
  const orKey = process.env.OPENROUTER_API_KEY;
  if (!orKey) {
    console.log("❌ OpenRouter key not found in .env");
    return;
  }

  const models = ["nvidia/nemotron-3-super-120b-a12b:free", "google/gemini-2.0-flash-lite-preview:free"];
  for (const modelName of models) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${orKey}`,
          "HTTP-Referer": "https://synapze.app",
          "X-Title": "Synapze"
        },
        body: JSON.stringify({
          model: modelName,
          messages: [{ role: "user", content: "Say 'Hello'" }]
        })
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content || "";
        console.log(`✅ [${modelName}] WORKING: ${text.trim()}`);
      } else {
        const text = await res.text();
        console.log(`❌ [${modelName}] FAILED: Status ${res.status} - ${text.substring(0, 100)}`);
      }
    } catch (err) {
      console.log(`❌ [${modelName}] FAILED: ${err.message}`);
    }
  }
}

async function run() {
  console.log("Starting API Diagnostics...\n");
  for (const keyObj of geminiKeys) {
    await testGemini(keyObj);
  }
  await testOpenRouter();
  console.log("\nDiagnostics Complete.");
}

run();

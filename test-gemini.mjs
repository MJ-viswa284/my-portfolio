import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('AIzaSyB50CM0Frb2KOz4fx-BxQwHFfmahGqAtmA');

async function testGemini() {
  try {
    console.log("Testing gemini-pro...");
    const model1 = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result1 = await model1.generateContent("Hi");
    console.log("gemini-pro Success:", result1.response.text().substring(0, 20));
  } catch (error) {
    console.error("gemini-pro Error:", error.message);
  }

  try {
    console.log("\nTesting gemini-1.5-flash...");
    const model2 = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result2 = await model2.generateContent("Hi");
    console.log("gemini-1.5-flash Success:", result2.response.text().substring(0, 20));
  } catch (error) {
    console.error("gemini-1.5-flash Error:", error.message);
  }
}

testGemini();

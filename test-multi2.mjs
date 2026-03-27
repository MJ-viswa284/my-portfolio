import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';

const API_KEY = 'AIzaSyB50CM0Frb2KOz4fx-BxQwHFfmahGqAtmA';
const genAI = new GoogleGenerativeAI(API_KEY);

const sendEmailTool = {
  functionDeclarations: [
    {
      name: "sendEmail",
      description: "Sends an email to Viswa using his contact form. Use this tool ONLY when the user explicitly asks to send an email, hire him, or contact him.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "The name of the user." },
          email: { type: "string", description: "The contact email address of the user." },
          message: { type: "string", description: "The message body to send." }
        },
        required: ["name", "email", "message"]
      }
    }
  ]
};

async function test() {
  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-flash-latest',
      tools: [sendEmailTool],
      systemInstruction: `You are Marshell...`
    });

    console.log("Starting chat with gemini-flash-latest...");
    const chatSession = model.startChat({ history: [] });

    console.log("Sending: hii marshell");
    let result = await chatSession.sendMessage("hii marshell");
    console.log("Response 1:", result.response.text());

  } catch (e) {
    fs.writeFileSync('f:/MY_PORTFOLIO/error2.json', JSON.stringify(e, Object.getOwnPropertyNames(e), 2), 'utf-8');
    console.log("Error written to error2.json");
  }
}

test();

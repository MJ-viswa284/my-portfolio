import fs from 'fs';
const key = "AIzaSyB50CM0Frb2KOz4fx-BxQwHFfmahGqAtmA";
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;

async function testFetch() {
  try {
    console.log("Fetching API...");
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Hello" }] }]
      })
    });
    
    const text = await res.text();
    fs.writeFileSync('f:/MY_PORTFOLIO/out.json', JSON.stringify({
      status: res.status,
      body: text
    }), 'utf-8');
    
    console.log("Fetch complete, status:", res.status);
  } catch (err) {
    console.error("Fetch error:", err);
  }
}
testFetch();

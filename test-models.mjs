import fs from 'fs';

const key = "AIzaSyB50CM0Frb2KOz4fx-BxQwHFfmahGqAtmA";
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

async function getModels() {
  try {
    console.log("Fetching models...");
    const res = await fetch(url);
    const text = await res.text();
    fs.writeFileSync('f:/MY_PORTFOLIO/models.json', text, 'utf-8');
    console.log("Models fetched gracefully.");
  } catch(e) { console.error(e); }
}
getModels();

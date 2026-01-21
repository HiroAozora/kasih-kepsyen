const https = require("https");
const fs = require("fs");
const path = require("path");

// Read .env.local manually to avoid installing dotenv if it's acting up
const envPath = path.join(__dirname, "..", ".env.local");
let apiKey = "";

try {
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");
    const match = envContent.match(/(?:GEMINI|GOOGLE)_API_KEY=(.*)/);
    if (match && match[1]) {
      apiKey = match[1].trim();
    }
  }
} catch (err) {
  console.error("Error reading .env.local:", err);
}

if (!apiKey) {
  console.error("❌ API Key not found in .env.local");
  process.exit(1);
}

console.log(`Using Key: ${apiKey.slice(0, 5)}...${apiKey.slice(-5)}`);

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https
  .get(url, (res) => {
    let data = "";
    res.on("data", (chunk) => (data += chunk));
    res.on("end", () => {
      try {
        const json = JSON.parse(data);
        if (json.error) {
          console.error("❌ API Error:", json.error.message);
        } else if (json.models) {
          console.log("✅ Available Models:");
          json.models.forEach((m) =>
            console.log(`- ${m.name.replace("models/", "")}`),
          );
        } else {
          console.log("⚠️ No models found. Response:", json);
        }
      } catch (e) {
        console.error("Error parsing response:", e);
        console.log("Raw response:", data);
      }
    });
  })
  .on("error", (err) => {
    console.error("Request error:", err);
  });

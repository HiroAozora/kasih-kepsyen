const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: ".env.local" });

async function testConnection() {
  const apiKey = (
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    ""
  ).trim();

  if (!apiKey) {
    console.error("❌ No API Key found in .env.local");
    return;
  }

  console.log(`Using Key: ${apiKey.slice(0, 5)}...${apiKey.slice(-5)}`);

  const genAI = new GoogleGenerativeAI(apiKey);

  const modelsToTry = [
    "gemini-1.5-flash",
    "gemini-1.5-flash-001",
    "gemini-1.0-pro",
    "gemini-pro",
  ];

  for (const modelName of modelsToTry) {
    console.log(`\nTesting model: ${modelName}...`);
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Test connection. Say 'OK'.");
      const response = await result.response;
      console.log(`✅ Success with ${modelName}: ${response.text()}`);
      return; // Stop if success
    } catch (error) {
      console.log(
        `❌ Failed with ${modelName}: ${error.message.split(":")[0]}`,
      );
      if (error.message.includes("404")) {
        console.log(
          "   (Model not found or not supported/enabled for this key)",
        );
      }
    }
  }
}

testConnection();

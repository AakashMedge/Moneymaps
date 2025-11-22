// No imports needed for fetch in Node 18+
// Running with node --env-file=.env
const fs = await import('fs');

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("GEMINI_API_KEY not found in env");
        return;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        console.log(`Fetching models from ${url.replace(apiKey, "HIDDEN")}...`);
        const response = await fetch(url);

        if (!response.ok) {
            console.error(`Error: ${response.status} ${response.statusText}`);
            const text = await response.text();
            console.error(text);
            return;
        }

        const data = await response.json();
        if (data.models) {
            const modelNames = data.models
                .filter(m => m.name.includes("gemini") && m.supportedGenerationMethods.includes("generateContent"))
                .map(m => m.name)
                .join("\n");

            fs.writeFileSync("models.txt", modelNames);
            console.log("Wrote models to models.txt");
        } else {
            console.log("No models found in response:", data);
        }

    } catch (error) {
        console.error("Fetch error:", error);
    }
}

listModels();

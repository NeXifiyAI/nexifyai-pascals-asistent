const fs = require('fs');
const path = require('path');

// Manually parse .env since we are in zero-dependency mode for this script
function loadEnv() {
    try {
        const envPath = path.resolve(__dirname, '../.env');
        if (!fs.existsSync(envPath)) return;
        
        const content = fs.readFileSync(envPath, 'utf8');
        content.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                process.env[key.trim()] = value.trim();
            }
        });
    } catch (e) {
        console.error("Could not load .env", e);
    }
}

loadEnv();

const API_KEY = process.env.SUPERMEMORY_API_KEY;
const API_URL = 'https://api.supermemory.ai/v3/search'; 

async function askBrain(query) {
    if (!API_KEY) {
        return "ERROR: API Key not found.";
    }

    try {
        console.log(`[Brain] Sending request to ${API_URL}...`);
        
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                q: query,
                top_k: 5
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errText}`);
        }

        const data = await response.json();
        return JSON.stringify(data, null, 2);

    } catch (error) {
        return `CONNECTION ERROR: ${error.message}`;
    }
}

// Execute if run directly
if (require.main === module) {
    (async () => {
        console.log("--- Initializing Brain Connection (Zero-Dependency Mode) ---");
        const instructions = await askBrain("Was ist mein neues Aufgabengebiet? Fasse die Instruktionen zusammen.");
        console.log("\n================ MISSION ===================");
        console.log(instructions);
        console.log("============================================");
    })();
}

module.exports = { askBrain };

// Importing the required modules
const express = require('express');
const cors = require('cors');

// Dynamic import for node-fetch
let fetch;
import('node-fetch').then(module => {
  fetch = module.default;
});

// Initialize the Express app
const app = express();

// Enable CORS for all routes
app.use(cors());

// Middleware to parse JSON requests
app.use(express.json());

// Serve static files from the "public" directory
app.use(express.static('public'));

// Basic route for the homepage
app.get('/', (req, res) => {
  res.send('Hello, world!');
});

// Function to convert generated text to card data
function convertToCardData(generatedText) {
  try {
    console.log("Generated Text:", generatedText);
    const cardData = JSON.parse(generatedText);
    console.log("Parsed Card Data:", cardData);
    cardData["Card Text"] = Array.isArray(cardData["Card Text"]) ? cardData["Card Text"] : [cardData["Card Text"]];
    return cardData;
  } catch (error) {
    console.error("Error parsing generated text:", error);
    return {
      "Card Color": "Red",
      "Card Name": "Cybernetic Dragon",
      "Card Energy Cost": "{2}{R}{R}",
      "Card Type": "Entity — Dragon Mech",
      "Card Grade": "Rare",
      "Card Text": ["Flight (This entity can’t be defended except by entities with flight or intercept.)", "Rapid (This entity can attack and tap the turn it comes under your control.)", "Deploy — Mecha Dragon deal 2 damage to any target. (This triggers whenever this card enters the battlezone.)"],
      "Card Stats": "4/4",
      "Card Art": "Concept art, digital art, sci-fi, fantasy. A dragon mech with a cybernetic body and wings.",
      "Flavor Text": "It soars through the sky, with metal wings."
    };
  }
}

// API route for card generation
app.post('/generate-card', async (req, res) => {
  const userPrompt = req.body.prompt;
  const predefinedPrompt = `
Role: You're an expert TCG game designer.
Objective: Generate an original Nexus: Voidwarpers card that strictly aligns with the game's existing rules and mechanics.
Game rules: https://www.play.nexus/rules.html
Inspiration/reference: Existing Nexus: Voidwarper cards: https://www.play.nexus/cards.html
Avoid: Do NOT use game mechanics, keyword abilities, or anything else from Magic: the Gathering, or Hearthstone. Do NOT invent new keywords or mechanics NOT found in Nexus: Voidwarpers game rules. Do NOT include an explanation.
Do: When including keywords, also include its oracle text in parentheses. Example: "Steadfast (This entity can attack without tapping.)""
Format: Return a JSON object with the following keys:

      "Card Color": "[Color]",
      "Card Name": "[Name]",
      "Card Energy Cost": "[Cost]",
      "Card Type": "[Type — Subtype]",
      "Card Grade": "[Grade]",
      "Card Text": ["[Ability/effect]", "[Ability/effect]", "[Ability/effect]"],
      "Card Stats": "[Stats]",
      "Card Art": "Concept art, digital art, sci-fi, fantasy. [Art description / DALL-E prompt]",
      "Flavor Text": "[Flavor text]"

      Example:
      "Card Color": "Blue",
      "Card Name": "Cybernetic Dragon",
      "Card Energy Cost": "{2}{Y}",
      "Card Type": "Entity — Dragon Mech",
      "Card Grade": "Rare",
      "Card Text": ["Deploy — Do something", "Flight"],
      "Card Stats": "4/4",
      "Card Art": "Concept art, digital art, sci-fi, fantasy. A dragon mech with a cybernetic body and wings.",
      "Flavor Text": "It soars through the sky, with metal wings."
  `;

  const finalPrompt = `${predefinedPrompt}\nUser Input: ${userPrompt}`;

  const apiKey = process.env['OPENAI_API'];

  try {
    // Fetch card data from ChatGPT
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant."
          },
          {
            role: "user",
            content: finalPrompt
          }
        ]
      })
    });

    const data = await response.json();
    console.log("OpenAI API Response:", JSON.stringify(data, null, 2));
    const generatedText = data.choices[0].message.content.trim();
    const cardData = convertToCardData(generatedText);

    // Assuming cardData["Card Art"] contains the art description
    console.log(cardData);
    const artDescription = cardData["Card Art"];

    // Your custom instructions
    const customInstructions = "Concept art, digital art, illustration, sci-fi, fantasy. Rule of thirds, dramatic mood, dynamic pose. ";

    // Fetch image from DALL-E
    const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        prompt: `${artDescription}. ${customInstructions}`,
        n: 1  // Number of images you want to generate
      })
    });

    const imageData = await imageResponse.json();
    console.log(imageData);
    const imageUrl = imageData.data[0].url;  // Assuming the URL of the image is stored here

    // Add the image URL to cardData
    cardData["Card Art"] = imageUrl;

    res.json(cardData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Define a port to listen to
const port = 3000;

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
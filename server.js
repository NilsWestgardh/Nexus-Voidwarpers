// Importing the required modules
const express = require('express');
const { createClient } = require('@supabase/supabase-js');

// Dynamic import for node-fetch
let fetch;
import('node-fetch').then(module => {
  fetch = module.default;
});

console.log("Debugging OpenAI API initialization:");
console.log("API Key:", process.env['OPENAI_API']);

// Initialize the Supabase client
const supabase = createClient("https://ysrdbmhovvypyaqxylqj.supabase.co", process.env['SUPABASE_API']);

// Initialize the Express app
const app = express();

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
    const cardData = JSON.parse(generatedText);
    cardData["Card Text"] = Array.isArray(cardData["Card Text"]) ? cardData["Card Text"] : [cardData["Card Text"]];
    return cardData;
  } catch (error) {
    console.error("Error parsing generated text:", error);
    // Fallback to a sample cardData object if parsing fails
    return {
      "Card Color": "Blue",
      "Card Name": "Cybernetic Dragon",
      "Card Energy Cost": "{2}{Y}",
      "Card Type": "Entity",
      "Card Grade": "Rare",
      "Card Text": ["Deploy — Do something", "Flight"],
      "Card Stats": "4/4"
    };
  }
}

// API route for card generation
app.post('/generate-card', async (req, res) => {
  const userPrompt = req.body.prompt;
  const predefinedPrompt = `
Role: You're an expert TCG game designer.
Objective: Generate an original Nexus: Voidwarpers card that strictly aligns with the game's existing rules and mechanics.
Inspiration/reference: Existing Nexus: Voidwarper cards.
Game rules: https://nexus-voidwarpers-1.nilswestgardh.repl.co/rules.html
Existing Nexus cards: https://nexus-voidwarpers-1.nilswestgardh.repl.co/cards.html
Avoid: Borrowing mechanics or syntax from other TCGs like MTG and Hearthstone. Do not invent new keywords or mechanics not found in Nexus: Voidwarpers.

Return the card details as a JSON object with the following keys:

"Card Color": Based on game rules and existing Nexus cards. (e.g., "Blue", "Red")
"Card Name": Dynamic, inspired by the game's lore. (e.g., "Cybernetic Dragon")
"Card Energy Cost": Scaled to the card's power level. (e.g., "{2}{Y}")
"Card Type": Based on game rules and user input. Include subtype(s) for Entities. (e.g., "Entity — Entity Type(s)")
"Card Grade": Based on the card's power level. (Common > Uncommon > Rare > Prime)
"Card Text": [Ability/Effect 1], [Ability/Effect 2], [Ability/Effect 3], etc. Typically 1-3 abilities or effects, though up to 5-6 allowed. Typically higher grade = more abilities/effects. Stick to existing game rules and mechanics. (e.g., "Deploy — Return up to one target machine card from your cache to your hand. (This triggers whenever this card enters the battlezone.)")
"Card Stats": Include only for Entity or Voidwarper types. (e.g., "4/4" for Entity, "5" for Voidwarper)
"Card Art": Write a DALL-E prompt for the artwork with this formatting: "Artstation style, concept art, digital painting, trading card game style, sci-fi, fantasy. [Short, explicit instruction for subject matter]. Dramatic mood, [Short, explicit instruction for composition]."
Prioritize in order if tokens are limited: "Card Text", "Card Type", "Card Name"
  `;

  const finalPrompt = `${predefinedPrompt}\nUser Input: ${userPrompt}`;

  const apiKey = process.env['OPENAI_API'];

  try {
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
    console.log("OpenAI API Response:", data);

    const generatedText = data.choices[0].message.content.trim();
    console.log(generatedText);
    const cardData = convertToCardData(generatedText);  // Convert the generated text to card data

    // Construct a DALL-E prompt based on cardData
    const dallEPrompt = `Concept art, digital painting, sci-fi, fantasy. ${cardData["Card Name"]}. ${cardData["Card Type"]}`;
    
    try {
      // Make an API call to DALL-E
      const dallEResponse = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'image-alpha-001',
          prompt: dallEPrompt,
          n: 1  // Number of images to generate
        })
      });
    
      const dallEData = await dallEResponse.json();
      console.log("DALL-E API Response:", dallEData);
    
      // Attach the generated artwork URL to cardData
      cardData["Card Art"] = dallEData.data[0].url;
    
    } catch (error) {
      console.error("DALL-E API Error:", error);
    }
    
    res.json(cardData);  // Send the card data back
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
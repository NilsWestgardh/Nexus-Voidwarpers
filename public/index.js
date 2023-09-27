// Initialize Supabase
const supabaseUrl = 'https://ysrdbmhovvypyaqxylqj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzcmRibWhvdnZ5cHlhcXh5bHFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODc3ODM4MTQsImV4cCI6MjAwMzM1OTgxNH0.ZDgPFs-T8SwuCih5d_7hRdG7wqDvHzUYqx5DGLNhHT8';
const supabase = window.createClient(supabaseUrl, supabaseKey);

// Google Sign-In
async function signInWithGoogle() {
  const { user, error } = await supabase.auth.signIn({
    provider: 'google'
  });
  // Handle user and error accordingly
}

// Create Card in Supabase
async function createCardInSupabase(cardName, cardData) {
  console.log("createCardInSupabase function is running");
  const { data, error } = await supabase
    .from('Cards')
    .insert([
      { card_name: cardName, card_data: cardData },
    ]);

  if (data) {
    console.log("Card successfully inserted:", data);
  } else if (error) {
    console.error("Error inserting card:", error);
  }
}

// Function to map shorthand energy to actual file name
function mapEnergyToFile(energy) {
  const energyMap = {
    'Y': 'Yellow',
    'B': 'Blue',
    'P': 'Purple',
    'R': 'Red',
    'G': 'Green',
    '0': 'Number=Zero',
    '1': 'Number=1',
    '2': 'Number=2',
    '3': 'Number=3',
    '4': 'Number=4',
    '5': 'Number=5',
    '6': 'Number=6',
    'U': 'Blue'
  };
  return energyMap[energy] || energy;
}

// Function to update the card
function updateCard(cardData) {
  console.log("updateCard function is running");
  // Update card color background
  const cardBackground = document.querySelector('.card-background');
  cardBackground.className = `card-background card-bg-${cardData["Card Color"].toLowerCase()}`;

  // Update card name
  const cardName = document.querySelector('.card-name');
  cardName.textContent = cardData["Card Name"];

  // Update card energy cost
  const cardCost = document.querySelector('.card-cost');
  cardCost.innerHTML = '';  // Clear existing cost icons
  const energyCost = cardData["Card Energy Cost"];
  energyCost.match(/\{[0-9A-Z]+\}/g).forEach(icon => {
    const img = document.createElement('img');
    img.className = 'img-fluid card-cost-icon';
    const mappedEnergy = mapEnergyToFile(icon.replace(/[{}]/g, ''));
    img.src = `images/icons/Energy=${mappedEnergy}.png`;
    console.log("Image src set to:", img.src);
    cardCost.appendChild(img);
  });

  // Update card type
  const cardType = document.querySelector('.card-type');
  cardType.textContent = cardData["Card Type"];

  // Update card grade
  const cardGrade = document.querySelector('.card-set-icon');
  cardGrade.src = `images/icons/Style=Medal, Quality=${cardData["Card Grade"]}.png`;

  // Update card text
const cardTextArray = cardData["Card Text"];
const cardTextBox = document.querySelector('.frame-text-box');
cardTextBox.innerHTML = ''; // Clear existing text

  // Loop through the generated text array and append to the card
  cardTextArray.forEach((text, index) => {
    const newParagraph = document.createElement('p');
    newParagraph.className = 'description';
    if (index === 0) {
      newParagraph.className += ' ftb-inner-margin'; // Add margin to the first paragraph
    }
    newParagraph.innerText = text;
    cardTextBox.appendChild(newParagraph);
  });
  
  // If less than 4 paragraphs, add flavor text
  if (cardTextArray.length < 4) {
    const flavorTextParagraph = document.createElement('p');
    flavorTextParagraph.className = 'flavor-text';
    flavorTextParagraph.innerText = 'Flavor text here'; // Replace with actual flavor text
    cardTextBox.appendChild(flavorTextParagraph);
  }

  console.log(cardData);
  // Update card stats
  const cardStats = document.querySelector('.frame-stats p');
  if (cardData["Card Type"] === "Entity" || cardData["Card Type"] === "Voidwarper") {
    cardStats.textContent = cardData["Card Stats"];
    cardStats.parentElement.style.display = "block";  // Make sure the stats box is visible
  } else {
    cardStats.textContent = "";  // Clear the stats
    cardStats.parentElement.style.display = "none";  // Hide the stats box
  }

  // Update card art
  const cardArt = document.querySelector('.frame-art img');
  cardArt.src = cardData["Card Art"] ? cardData["Card Art"] : 'images/nexus-card-default-art.png';
}

// Function to generate a card
async function generateCard() {
  console.log("generateCard function is running");
  // Get the prompt from the input field
  const prompt = document.getElementById("openai-prompt").value;

  // Send a POST request to the server with the prompt
  const response = await fetch('/generate-card', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  });

  // Parse the JSON response
  const data = await response.json();
  console.log(data);

  // Update the card on the webpage
  updateCard(data);
}

// Attach the function to the button
document.querySelector("button").addEventListener("click", async () => {
  console.log("Button clicked!");
  await generateCard();

  // Populate cardData from DOM elements
  const cardName = document.querySelector('.card-name').textContent;
  const cardType = document.querySelector('.card-type').textContent;
  const cardGrade = document.querySelector('.card-set-icon').src.split("=").pop().split(".")[0];
  const cardStats = document.querySelector('.frame-stats p').textContent;
  const cardArt = document.querySelector('.frame-art img').src;

  // Create an object to hold the card data
  const cardData = {
    cardName,
    cardType,
    cardGrade,
    cardStats,
    cardArt
  };

  // Save it to Supabase
  await createCardInSupabase(cardName, cardData);
});
console.log("Script loaded");

document.addEventListener("DOMContentLoaded", async function() {
  console.log("DOM fully loaded and parsed");
});

function mapToNexus(term) {
  const termMap = {
    // Colors
    'White': 'Yellow',
    'Black': 'Purple',

    // Card Types
    'Sorcery': 'Sequence',
    'Instant': 'Interrupt',
    'Enchantment': 'Enhancement',
    'Aura': 'Augmentation',
    'Artifact': 'Machine',
    'Vehicle': 'Craft',
    'Equipment': 'Rig',
    'Creature': 'Entity',
    'Minion': 'Entity',
    'Planeswalker': 'Voidwarper',
    'Legendary': 'Mythical',
    'Land': 'Source',
    'Energy Crystal': 'Source',
    'Basic': 'Base',

    // Card Parts
    'Rarity': 'Grade',
    'Mythic': 'Prime',
    'Power': 'Attack',
    'Toughness': 'Defense',
    'Loyalty': 'Allegiance',

    // Keyword Abilities
    'Trample': 'Overpower',
    'Flying': 'Flight',
    'Haste': 'Rapid',
    'Charge': 'Rapid',
    'Vigilance': 'Steadfast',
    'First strike': 'Quick strike',
    'Deathtouch': 'Virus',
    'Lifelink': 'Leech',
    'Hexproof': 'Firewall',
    'Menace': 'Threat',
    'Double strike': 'Dual strike',
    'Reach': 'Intercept',
    'Prowess': 'Amplify',
    'Convoke': 'Network',
    'Scry': 'Scan',
    'Defender': '',
    'Intimidate': '',
    'Shroud': '',
    'Protection': '',

    // Game Zones
    'Battlefield': 'Battlezone',
    'Graveyard': 'Cache',
    'Exile': 'Archive',
    'Library': 'Deck',
    'Hand': 'Hand',
    'Stack': 'Stack',

    // Steps and phases
    'Upkeep': 'Maintainance',
    'Main phase': 'Primary phase',
    'End step': 'Clear step',

    // Entities
    'Merfolk': 'Nymph',

    // Mechanics
    'Mechanic': 'Mechanic',

    // Terms
    'Spell': 'Script',
    'Cast': 'Play',
    'Mana': 'Energy',
    'Blocking': 'Defending',
    'Blockers': 'Defenders',
    'Block': 'Defend',
    'Unblockable': 'Undefendable',
    'Blocked': 'Defended',
    'Creatures': 'Entities',
    'Create': 'Spawn',
    'Life': 'Health',
    'Counter target': 'Cancel target',
    'Equip': 'Rig',
    'Enchant': 'Augment',
    'Gain control': 'Take control',
    'Fight': 'Brawl',
    'Exile target': 'Expel target',
    'Mill': 'Null'
  };

  return termMap[term] || term;
}


// Function to map shorthand energy to actual file name
function mapEnergyToFile(energy) {
  const energyMap = {
    'Y': 'Yellow',
    'B': 'Blue',
    'P': 'Purple',
    'R': 'Red',
    'G': 'Green',
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

// Function to clear the card
function clearCard() {
  document.querySelector('.card-name').textContent = '';
  document.querySelector('.card-cost').innerHTML = '';
  document.querySelector('.card-type').textContent = '';
  document.querySelector('.card-set-icon').src = '';
  document.querySelector('.frame-text-box').innerHTML = '';
  document.querySelector('.frame-stats p').textContent = '';
  document.querySelector('.frame-art img').src = '';
}

// Function to update the card
function updateCard(cardData) {
  console.log(cardData)

  // Clear card
  clearCard();
  
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
  if (energyCost && energyCost.match(/\{[0-9A-Z]+\}/g)) {
    energyCost.match(/\{[0-9A-Z]+\}/g).forEach(icon => {
      const mappedEnergy = mapEnergyToFile(icon.replace(/[{}]/g, ''));

      // Skip adding the Number=0.png image
      if (mappedEnergy !== 'Number=0') {
        const img = document.createElement('img');
        img.className = 'img-fluid card-cost-icon';
        img.src = `images/icons/Energy=${mappedEnergy}.png`;
        cardCost.appendChild(img);
      }
    });
  }

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
    // Convert MTG terms to Nexus terms
    const convertedText = text.split(' ').map(word => mapToNexus(word)).join(' ');

    newParagraph.innerText = convertedText;
    cardTextBox.appendChild(newParagraph);
  });

  // If less than 4 paragraphs, add flavor text
  if (cardTextArray.length < 4) {
    const flavorTextParagraph = document.createElement('p');
    flavorTextParagraph.className = 'flavor-text';
    flavorTextParagraph.innerText = 'Flavor text here'; // Replace with actual flavor text
    cardTextBox.appendChild(flavorTextParagraph);
  }

  // Update card stats
  const cardStats = document.querySelector('.frame-stats p');
  console.log("Card Type:", cardData["Card Type"]);
  if (cardData["Card Type"].startsWith("Entity") || cardData["Card Type"].startsWith("Voidwarper")) {
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
  // Get spinner element and button element
  const spinner = document.querySelector(".spinner");
  const button = document.getElementById("generateCardButton");

  // Disable the button and show spinner
  button.disabled = true;
  spinner.style.display = "inline-block";

  console.log("Generating card...");
  // Get the prompt from the input field
  const prompt = document.getElementById("openai-prompt").value;

  try {
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

    // Update the card on the webpage
    updateCard(data);
    console.log("Card generated and updated.");
  } catch (error) {
    console.error("An error occurred while generating the card:", error);
  } finally {
    // Hide spinner and re-enable button regardless of the outcome
    spinner.style.display = "none";
    button.disabled = false;
  }
}

// Attach the function to the button
document.querySelector("#generateCardButton").addEventListener("click", async () => {
  await generateCard();
});
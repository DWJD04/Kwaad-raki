// ==========================================
// GAME STATE
// ==========================================
let activePlayer = 1; // Tracks whose turn it is (1 or 2)
let drawPile = [];

// The Player Filing Cabinet
let players = {
    1: { hand: [], stockpile: [], bank: { bank1: [], bank2: [], bank3: [], bank4: [] } },
    2: { hand: [], stockpile: [], bank: { bank1: [], bank2: [], bank3: [], bank4: [] } }
};

// The Shared Building Area
let pocketPiles = {
    pocket1: [], pocket2: [], pocket3: [],
    pocket4: [], pocket5: [], pocket6: []
};

// DOM Elements
const statusMsg = document.getElementById("status-msg");
const turnIndicator = document.getElementById("turn-indicator");
const stockpileEl = document.getElementById("stockpile-card");
const cardsEl1 = document.getElementById("card1");
const cardsEl2 = document.getElementById("card2");
const cardsEl3 = document.getElementById("card3");
const cardsEl4 = document.getElementById("card4");
const cardsEl5 = document.getElementById("card5");

const ranks = [
    '2♠', '3♠', '4♠', '5♠', '6♠', '7♠', '8♠', '9♠', '10♠', 'J♠', 'Q♠', 'K♠', 'A♠',
    '2♥', '3♥', '4♥', '5♥', '6♥', '7♥', '8♥', '9♥', '10♥', 'J♥', 'Q♥', 'K♥', 'A♥',
    '2♣', '3♣', '4♣', '5♣', '6♣', '7♣', '8♣', '9♣', '10♣', 'J♣', 'Q♣', 'K♣', 'A♣',
    '2♦', '3♦', '4♦', '5♦', '6♦', '7♦', '8♦', '9♦', '10♦', 'J♦', 'Q♦', 'K♦', 'A♦'
];

function getCardValue(cardString) {
    if (!cardString) return 0;
    let rank = cardString.slice(0, -1); 
    if (rank === 'A') return 1;
    if (rank === 'J') return 11;
    if (rank === 'Q') return 12;
    if (rank === 'K') return 13;
    return parseInt(rank, 10);
}

function shuffleDeck() {
    drawPile = [...ranks];
    for (let i = drawPile.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = drawPile[i];
        drawPile[i] = drawPile[j];
        drawPile[j] = temp;
    }
}

// ==========================================
// GAME TURN LOGIC
// ==========================================
function startGame() {
    activePlayer = 1;
    pocketPiles = { pocket1: [], pocket2: [], pocket3: [], pocket4: [], pocket5: [], pocket6: [] };
    
    // Reset Player Cabinets
    players[1] = { hand: [], stockpile: [], bank: { bank1: [], bank2: [], bank3: [], bank4: [] } };
    players[2] = { hand: [], stockpile: [], bank: { bank1: [], bank2: [], bank3: [], bank4: [] } };
    
    shuffleDeck();
    
    // Deal Stockpiles (7 to each)
    for (let i = 0; i < 7; i++) {
        players[1].stockpile.push(drawPile.pop());
        players[2].stockpile.push(drawPile.pop());
    }
    
    // Deal Hands (5 to each)
    for (let i = 0; i < 5; i++) {
        players[1].hand.push(drawPile.pop());
        players[2].hand.push(drawPile.pop());
    }
    
    // Clear Building Pockets
    for (let k in pocketPiles) {
        const el = document.getElementById(k);
        if (el) { el.textContent = "Empty"; el.style.borderStyle = "dashed"; }
    }
    
    turnIndicator.textContent = "Player 1's Turn";
    statusMsg.textContent = "Game Status: Playing! Empty your Stockpile to win.";
    renderBoard();
}

function endTurn() {
    // 1. Swap active player
    activePlayer = activePlayer === 1 ? 2 : 1;
    
    // 2. Auto-draw missing cards for the new player up to 5
    let currentHand = players[activePlayer].hand;
    let missingCards = 5 - currentHand.filter(c => c !== "").length;
    
    for(let i = 0; i < missingCards; i++) {
        if(drawPile.length > 0) {
            let openIndex = currentHand.indexOf("");
            if (openIndex !== -1) currentHand[openIndex] = drawPile.pop();
            else currentHand.push(drawPile.pop());
        }
    }
    
    // 3. Update the UI
    turnIndicator.textContent = `Player ${activePlayer}'s Turn`;
    statusMsg.textContent = `Game Status: Player ${activePlayer}, it is your turn!`;
    renderBoard();
}

function renderBoard() {
    let p = players[activePlayer];

    cardsEl1.textContent = p.hand[0] || "";
    cardsEl2.textContent = p.hand[1] || "";
    cardsEl3.textContent = p.hand[2] || "";
    cardsEl4.textContent = p.hand[3] || "";
    cardsEl5.textContent = p.hand[4] || "";
    
    if (p.stockpile.length > 0) {
        stockpileEl.textContent = p.stockpile[p.stockpile.length - 1] + ` (${p.stockpile.length})`;
    } else {
        stockpileEl.textContent = "WIN!";
        statusMsg.textContent = `Game Status: VICTORY! Player ${activePlayer} clears their Stockpile!`;
    }

    for (let i = 1; i <= 4; i++) {
        let slot = document.getElementById("bank" + i);
        let pile = p.bank["bank" + i];
        if (pile && pile.length > 0) {
            slot.textContent = pile[pile.length - 1] + ` (${pile.length})`;
            slot.style.borderStyle = "solid";
        } else if (slot) {
            slot.textContent = "Empty";
            slot.style.borderStyle = "dashed";
        }
    }
}

function drawCard() {
    if (drawPile.length === 0) {
        statusMsg.textContent = "Game Status: Out of cards! Reshuffle the deck.";
        return;
    }
    
    let p = players[activePlayer];
    if (p.hand.filter(c => c !== "").length >= 5) {
        statusMsg.textContent = "Game Status: Hand full! Play a card before drawing.";
        return;
    }
    
    let openIndex = p.hand.indexOf("");
    let drawnCard = drawPile.pop();
    
    if (openIndex !== -1) {
        p.hand[openIndex] = drawnCard;
    } else {
        p.hand.push(drawnCard);
    }
    renderBoard();
}

// ==========================================
// DRAG AND DROP ENGINE
// ==========================================
function dragStart(event) {
    event.dataTransfer.setData("text/plain", event.target.id);
}

function allowDrop(event) {
    event.preventDefault();
}

function dropCard(event) {
    event.preventDefault();

    const draggedId = event.dataTransfer.getData("text/plain");
    if (!draggedId) return;

    let p = players[activePlayer];
    let cardPlayed = "";
    let sourceArray = null;
    let handIndex = -1;
    let sourceBankId = null;

    // Identify where the card came from using the active player's filing cabinet
    if (draggedId.startsWith("card")) {
        handIndex = parseInt(draggedId.replace("card", "")) - 1;
        cardPlayed = p.hand[handIndex];
        sourceArray = p.hand;
    } else if (draggedId.startsWith("bank")) {
        sourceBankId = draggedId;
        if (p.bank[sourceBankId].length === 0) return;
        cardPlayed = p.bank[sourceBankId][p.bank[sourceBankId].length - 1];
        sourceArray = p.bank[sourceBankId];
    } else if (draggedId === "stockpile-card") {
        if (p.stockpile.length === 0) return;
        cardPlayed = p.stockpile[p.stockpile.length - 1];
        sourceArray = p.stockpile;
    }

    if (!cardPlayed) return;

    let targetElement = event.target;

    // SCENARIO A: DROPPING IN THE BANK
    if (targetElement.closest(".bank-wrapper")) {
        let targetBank = targetElement.classList.contains("bank-slot") ? targetElement : targetElement.closest(".bank-slot");

        if (!targetBank) {
            for (let i = 1; i <= 4; i++) {
                if (p.bank["bank" + i].length === 0) {
                    targetBank = document.getElementById("bank" + i);
                    break;
                }
            }
            if (!targetBank) {
                let smallestPile = "bank1";
                let minSize = p.bank["bank1"].length;
                for (let i = 2; i <= 4; i++) {
                    if (p.bank["bank" + i].length < minSize) {
                        minSize = p.bank["bank" + i].length;
                        smallestPile = "bank" + i;
                    }
                }
                targetBank = document.getElementById(smallestPile);
            }
        }

        if (sourceArray === p.hand) {
            p.bank[targetBank.id].push(cardPlayed);
            p.hand[handIndex] = ""; 
            renderBoard();
            statusMsg.textContent = "Game Status: Card securely stacked in Bank!";
        } else {
            statusMsg.textContent = "Game Status: You can only bank cards from your hand!";
        }
        return; 
    }

    // SCENARIO B: DROPPING IN SHARED BUILDING POCKETS
    let targetPocket = targetElement.classList.contains("building-pocket") ? targetElement : targetElement.closest(".building-pocket");

    if (targetPocket) {
        const playedValue = getCardValue(cardPlayed);
        const pocketId = targetPocket.id;
        let currentPile = pocketPiles[pocketId];
        let isValidMove = false;
        
        let requiredValue = currentPile.length + 1;

        if (playedValue === 13) {
            isValidMove = true; 
        } else if (playedValue === requiredValue) {
            isValidMove = true;
        } else {
            statusMsg.textContent = `Game Status: Invalid Move! Pile needs a ${requiredValue} (or a King).`;
        }

        if (isValidMove) {
            currentPile.push(cardPlayed);

            if (sourceArray === p.hand) {
                p.hand[handIndex] = "";
            } else if (sourceBankId) {
                p.bank[sourceBankId].pop();
            } else if (sourceArray === p.stockpile) {
                p.stockpile.pop();
            }

            targetPocket.textContent = cardPlayed;
            targetPocket.style.borderStyle = "solid";
            renderBoard();
            
            if (p.stockpile.length > 0) {
                statusMsg.textContent = "Game Status: Nice Move!";
            }
        }
    }
}
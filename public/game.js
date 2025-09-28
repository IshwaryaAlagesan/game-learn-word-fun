const socket = io();

let myId = null;
let myHand = [];
let myFound = [];
let myName = null;
let gameStarted = false;
let justChecked = false; // Flag to prevent immediate re-checking
let latestState = null; // To keep track of the latest game state

// Join game UI
document.getElementById('joinBtn').onclick = () => {
    const nameInput = document.getElementById('playerNameInput');
    const name = nameInput.value.trim();
    if (!name) {
        showPopupMsg('Please enter your name.', 'error');
        return;
    }
    myName = name;
    socket.emit('joinGame', { playerName: myName });
    document.getElementById('joinArea').style.display = 'none';
    document.getElementById('mainGame').style.display = 'block';
    document.getElementById('bottomBar').style.display = 'flex';
};

socket.on('joined', (id) => {
    myId = id;
});

socket.on('gameState', (state) => {
    latestState = state;
    const player = state.players.find(p => p.id === myId);
    myHand = player && player.hand ? player.hand : [];
    myFound = player ? player.found : [];
    gameStarted = state.started;
    renderGame(state);
    updateStartRestartButton();

    // Show winner message only after a check action
    if (
        justChecked &&
        gameStarted &&
        state.deckCount === 0 &&
        myHand.length === 0
    ) {
        showPopupMsg('Congratulations! You found all the words!', 'success');
        justChecked = false; // Reset flag
    }
});

function updateStartRestartButton() {
    const startBtn = document.getElementById('startBtn');
    const restartArea = document.getElementById('restartArea');
    if (gameStarted) {
        startBtn.textContent = 'Restart Game';
        restartArea.style.display = 'flex';
    } else {
        startBtn.textContent = 'Start Game';
        restartArea.style.display = 'flex'; // Show for initial start too
    }
}

document.getElementById('startBtn').onclick = () => {
    socket.emit('startGame');
};

function renderGame(state) {
    document.getElementById('deckCount').textContent = `Deck Count: ${state.deckCount}`;

    const handDiv = document.getElementById('hand');
    if (handDiv) {
        handDiv.innerHTML = myHand.map(card => `
            <button class="card-btn" data-id="${card.id}">${card.part}</button>
        `).join('');
    }

    const foundDiv = document.getElementById('foundWords');
    foundDiv.innerHTML = `
        <h3>Your Found Words:</h3>
        <ul>${myFound.map(w => `<li>${w}</li>`).join('')}</ul>
    `;

    // Card selection logic (limit to 2)
    let selectedCards = [];

    function checkForCompound() {
        if (selectedCards.length === 2) {
            socket.emit('playTurn', { cardsToForm: selectedCards });
            selectedCards = [];
            document.querySelectorAll('.card-btn.selected').forEach(btn => btn.classList.remove('selected'));
        }
    }

    document.querySelectorAll('.card-btn').forEach(btn => {
        btn.onclick = () => {
            const cardId = btn.getAttribute('data-id');
            if (btn.classList.contains('selected')) {
                btn.classList.remove('selected');
                selectedCards = selectedCards.filter(id => id !== cardId);
            } else {
                if (selectedCards.length === 2) {
                    const firstBtn = document.querySelector(`.card-btn.selected[data-id="${selectedCards[0]}"]`);
                    if (firstBtn) firstBtn.classList.remove('selected');
                    selectedCards.shift();
                }
                btn.classList.add('selected');
                selectedCards.push(cardId);
            }
            // Automatically check when two cards are selected
            if (selectedCards.length === 2) {
                checkForCompound();
            }
        };
    });

    document.getElementById('checkBtn').onclick = () => {
        if (selectedCards.length === 2) {
            socket.emit('playTurn', { cardsToForm: selectedCards });
            selectedCards = [];
            document.querySelectorAll('.card-btn.selected').forEach(btn => btn.classList.remove('selected'));
            justChecked = true; // Set flag
        } else {
            showPopupMsg('Select exactly 2 cards to check for a compound word.', 'error');
        }
    };

    document.getElementById('drawBtn').onclick = () => {
        socket.emit('drawCard');
    };
}

socket.on('turnResult', (result) => {
    if (result.error) showPopupMsg(result.error, 'error');
    if (result.success) showPopupMsg(`You formed: ${result.compound}`, 'success');

    // Check for winner after forming a word
    // Use the latest state variables
    if (gameStarted && latestState.deckCount === 0 && myHand.length === 0) {
        showPopupMsg('Congratulations! You found all the words!', 'success');
    }
});

socket.on('drawResult', (result) => {
    if (result.error) showPopupMsg(result.error, 'error');
});

function showPopupMsg(msg, type = 'info') {
    const popup = document.getElementById('popupMsg');
    popup.textContent = msg;
    popup.style.display = 'block';
    popup.style.fontSize = type === 'success' ? '2.5em' : '1.3em';
    popup.style.padding = type === 'success' ? '40px' : '20px';
    popup.style.minWidth = type === 'success' ? '400px' : '200px';
    popup.style.borderRadius = '24px';
    popup.style.fontWeight = 'bold';
    popup.style.textAlign = 'center';
    popup.style.zIndex = '1000';

    if (type === 'success') {
        popup.style.background = 'linear-gradient(135deg, #b8e994 0%, #38ada9 100%)';
        popup.style.color = '#fff';
        popup.style.border = '4px solid #38ada9';
        popup.style.boxShadow = '0 0 32px #38ada9';
    } else if (type === 'error') {
        popup.style.background = 'linear-gradient(135deg, #ff7675 0%, #fd79a8 100%)';
        popup.style.color = '#fff';
        popup.style.border = '2px solid #fd79a8';
        popup.style.boxShadow = '0 0 16px #fd79a8';
    } else {
        popup.style.background = 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)';
        popup.style.color = '#333';
        popup.style.border = '2px solid #f0932b';
        popup.style.boxShadow = '2px 2px 8px #fda08588';
    }

    // Show longer for winner message
    const timeout = type === 'success' ? 6000 : 2000;
    setTimeout(() => {
        popup.style.display = 'none';
    }, timeout);
}
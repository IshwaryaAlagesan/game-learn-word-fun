const compoundWords = require('./compound_words.json');

class Game {
    constructor() {
        this.players = {};
        this.deck = [];
        this.turnOrder = [];
        this.currentTurn = 0;
        this.started = false;
    }

    addPlayer(id, name) {
        if (!this.started) {
            this.players[id] = { name, hand: [], found: [] };
            this.turnOrder.push(id);
        }
    }

    removePlayer(id) {
        delete this.players[id];
        this.turnOrder = this.turnOrder.filter(pid => pid !== id);
        if (this.currentTurn >= this.turnOrder.length) this.currentTurn = 0;
    }

    start() {
        // Shuffle and deal cards to each player
        // Example:
        this.deck = [];
        compoundWords.forEach(({ first, second }) => {
            this.deck.push({ part: first, id: first + Math.random() });
            this.deck.push({ part: second, id: second + Math.random() });
        });
        this.shuffle(this.deck);

        Object.keys(this.players).forEach(id => {
            this.players[id].hand = [];
            this.players[id].found = [];
        });

        for (let i = 0; i < 5; i++) {
            Object.keys(this.players).forEach(id => {
                if (this.deck.length) {
                    this.players[id].hand.push(this.deck.pop());
                }
            });
        }

        this.started = true;
        this.currentTurn = 0;
    }

    playTurn(playerId, cardsToForm) {
        if (this.turnOrder[this.currentTurn] !== playerId) return { error: 'Not your turn' };
        let player = this.players[playerId];

        // Check if cardsToForm make a compound word
        let compound = this.checkCompound(cardsToForm);
        if (compound) {
            // Remove those cards from hand
            cardsToForm.forEach(cardId => {
                player.hand = player.hand.filter(card => card.id !== cardId);
            });
            player.found.push(compound);
            // Draw 2 cards from deck
            for (let i = 0; i < 2; i++) {
                if (this.deck.length > 0) player.hand.push(this.deck.pop());
            }
            this.endTurn();
            return { success: true, compound };
        } else {
            return { error: 'No compound word found' };
        }
    }

    drawCard(playerId) {
        if (this.turnOrder[this.currentTurn] !== playerId) return { error: 'Not your turn' };
        let player = this.players[playerId];
        if (this.deck.length > 0) {
            let card = this.deck.pop();
            player.hand.push(card);
            this.endTurn();
            return { card };
        }
        this.endTurn();
        return { error: 'Deck is empty' };
    }

    endTurn() {
        this.currentTurn = (this.currentTurn + 1) % this.turnOrder.length;
    }

    checkCompound(cardIds) {
        // Find the selected cards in hand
        let parts = cardIds.map(cardId => {
            for (let pid in this.players) {
                let card = this.players[pid].hand.find(c => c.id === cardId);
                if (card) return card.part;
            }
            return null;
        });
        let word = parts.join('');
        for (let { first, second, compound } of compoundWords) {
            if ((first === parts[0] && second === parts[1]) || (second === parts[0] && first === parts[1])) {
                return compound;
            }
        }
        return null;
    }

    getPublicState(requestingId) {
        return {
            players: Object.keys(this.players).map(id => ({
                id,
                name: this.players[id].name,
                handCount: this.players[id].hand.length,
                found: this.players[id].found,
                hand: id === requestingId ? this.players[id].hand : undefined
            })),
            deckCount: this.deck.length,
            started: this.started,
            totalWords: require('./compound_words.json').length
        };
    }

    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}

module.exports = Game;

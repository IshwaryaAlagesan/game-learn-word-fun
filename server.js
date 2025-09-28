const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const Game = require('./game');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

const games = {}; // key: socket.id, value: Game instance

io.on('connection', (socket) => {
    console.log('A player connected:', socket.id);

    socket.on('joinGame', ({ playerName }) => {
        games[socket.id] = new Game();
        games[socket.id].addPlayer(socket.id, playerName);
        socket.emit('joined', socket.id);
        socket.emit('gameState', games[socket.id].getPublicState(socket.id));
    });

    socket.on('startGame', () => {
        if (games[socket.id]) {
            games[socket.id].start();
            socket.emit('gameState', games[socket.id].getPublicState(socket.id));
        }
    });

    socket.on('playTurn', ({ cardsToForm }) => {
        if (games[socket.id]) {
            let result = games[socket.id].playTurn(socket.id, cardsToForm);
            socket.emit('gameState', games[socket.id].getPublicState(socket.id));
            socket.emit('turnResult', result);
        }
    });

    socket.on('drawCard', () => {
        if (games[socket.id]) {
            let result = games[socket.id].drawCard(socket.id);
            socket.emit('gameState', games[socket.id].getPublicState(socket.id));
            socket.emit('drawResult', result);
        }
    });

    socket.on('disconnect', () => {
        delete games[socket.id];
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
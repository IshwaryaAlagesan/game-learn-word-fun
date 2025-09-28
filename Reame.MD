# Compound Word Game - NodeJS Multiplayer

## Description

This is a Node.js implementation of Compound Word Game 1 from your sheet. Players join online, get dealt cards, and compete to form compound words. Hosted easily on AWS.

## Features

- Multiplayer: Real-time play using Socket.IO
- Compound word logic, card deck, and turns
- AWS-friendly: Works on EC2, Elastic Beanstalk, containers

## Setup

1. Clone this repo.
2. Run `npm install express socket.io`
3. Start server: `node server.js`
4. Customize `compound_words.json` with your own word list!

## Playing

- Players join and enter names.
- Game starts, each player gets cards.
- On your turn, select cards to form compound word.
- If correct, gain points and draw new cards.
- Most compound words wins!

## Hosting on AWS

- Run as Node.js app on EC2 or Elastic Beanstalk
- For production, use process managers (PM2) and enable HTTPS.

## Frontend

Build a simple frontend in `public/` using Socket.IO client to interact with the game.

---

**Based on your sheet:**  
- Game 2 is ignored.
- Card logic uses split compound words as per instructions.

---

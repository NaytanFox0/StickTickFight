// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(express.static('public'));

const PORT = process.env.PORT || 3000;
const players = {};

io.on('connection', socket => {
  console.log('connected', socket.id);

  socket.on('newPlayer', (name) => {
    players[socket.id] = {
      id: socket.id,
      name: name || 'Player',
      x: Math.floor(Math.random() * 700) + 50,
      y: Math.floor(Math.random() * 500) + 50
    };
    socket.emit('currentPlayers', players);
    socket.broadcast.emit('playerJoined', players[socket.id]);
  });

  socket.on('move', pos => {
    if (!players[socket.id]) return;
    players[socket.id].x = pos.x;
    players[socket.id].y = pos.y;
    socket.broadcast.emit('playerMoved', { id: socket.id, x: pos.x, y: pos.y });
  });

  socket.on('disconnect', () => {
    console.log('disconnect', socket.id);
    delete players[socket.id];
    socket.broadcast.emit('playerLeft', socket.id);
  });
});

server.listen(PORT, () => console.log('listening on localhost:', PORT));

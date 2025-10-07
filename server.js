// === SERVIDOR NODE.JS PARA JOGO.IO ===
//

// 1. Importação de módulos
//
const express = require('express');      // Framework web para servir arquivos estáticos e rotas
const http = require('http');            // Cria o servidor HTTP base
const { Server } = require('socket.io'); // Biblioteca para comunicação em tempo real (WebSockets)

// 2. Configuração básica do servidor
//
const app = express();                   // Instância do Express
const server = http.createServer(app);   // Servidor HTTP baseado no Express
const io = new Server(server, { cors: { origin: '*' } }); // Socket.io com CORS liberado (permitir qualquer origem)

// 3. Servindo os arquivos do cliente
// 
// Todos os arquivos dentro da pasta "public" (HTML, CSS, JS) serão servidos automaticamente
app.use(express.static('public'));

// 4. Variáveis globais e configurações
//
const PORT = process.env.PORT || 3000;   // Porta padrão (Render define automaticamente)
const players = {};                      // Armazena todos os jogadores conectados e suas posições

// 5. Eventos principais do Socket.io
//
io.on('connection', socket => {
  console.log('Novo jogador conectado:', socket.id);

  // --- Evento: novo jogador entra ---
  //
  socket.on('newPlayer', (name) => {
    // Cria novo jogador com posição aleatória
    players[socket.id] = {
      id: socket.id,
      name: name || 'Player',
      x: Math.floor(Math.random() * 700) + 50,
      y: Math.floor(Math.random() * 500) + 50
    };

    // Envia lista de todos os jogadores existentes para o novo
    socket.emit('currentPlayers', players);

    // Informa a todos os outros sobre o novo jogador
    socket.broadcast.emit('playerJoined', players[socket.id]);
  });

  // --- Evento: movimento do jogador ---
  //
  socket.on('move', pos => {
    if (!players[socket.id]) return; // Se o jogador não existir (erro), ignora

    // Atualiza posição no servidor
    players[socket.id].x = pos.x;
    players[socket.id].y = pos.y;

    // Envia a posição atualizada para todos os outros jogadores
    socket.broadcast.emit('playerMoved', {
      id: socket.id,
      x: pos.x,
      y: pos.y
    });
  });

  // --- Evento: jogador desconecta ---
  //
  socket.on('disconnect', () => {
    console.log('Jogador desconectado:', socket.id);

    // Remove jogador da lista
    delete players[socket.id];

    // Informa os outros clientes que ele saiu
    socket.broadcast.emit('playerLeft', socket.id);
  });
});

// ------------------------------
// 6. Inicialização do servidor
// ------------------------------
server.listen(PORT, () => {
  console.log('Servidor ativo em http://localhost:' + PORT);
});

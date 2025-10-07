// === BLOCO 1: INICIALIZAÇÃO ===

// Imports
import { Player, Segment } from './stickman.js';

// 1. Conexão com o servidor
const SERVER_URL = '';
const socket = SERVER_URL ? io(SERVER_URL) : io();

// 2. Configuração do Canvas
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

// 3. Variáveis principais do jogo
const speed = 4;
const keys = {};
const stickmen = {};
let players = {};
let me = {
    id: null,
    x: canvas.width / 2,
    y: canvas.height / 2,
    name: 'Você'
};
const ground = {
    y: canvas.height - 50,  // 50px do fundo
    height: 50
};


// 4. Captura de entrada do teclado
window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

// 5. Eventos do servidor (Socket.io)
socket.on('connect', () => {
    me.id = socket.id;
    socket.emit('newPlayer', 'Jogador');
});

socket.on('currentPlayers', data => { players = data; });
socket.on('playerJoined', p => { players[p.id] = p; });
socket.on('playerMoved', p => {
    if (players[p.id]) {
        players[p.id].x = p.x;
        players[p.id].y = p.y;
    }
});
socket.on('playerLeft', id => { delete players[id]; });


// === BLOCO 2: LOOP DE EXECUÇÃO ===
//

// Variáveis de controle de FPS
let lastFrameTime = performance.now();
let fps = 0;

const GRAVITY = .4;  // gravidade global
const JUMP_FORCE = -14; // força do pulo
let velocityY = 0; // velocidade vertical do jogador

function update() {
    // Movimento horizontal
    if (keys['arrowleft'] || keys['a']) me.x -= speed;
    if (keys['arrowright'] || keys['d']) me.x += speed;

    // Pulo
    if ((keys['arrowup'] || keys['w'] || keys[' ']) && me.y >= canvas.height - 12) {
        velocityY = JUMP_FORCE;
    }

    // Aplica gravidade
    velocityY += GRAVITY;
    me.y += velocityY;

    // Limita jogador dentro do canvas (chão)
    me.x = Math.max(12, Math.min(canvas.width - 12, me.x));
    if (me.y > canvas.height - 12) {
        me.y = canvas.height - 12;
        velocityY = 0;
    }

    // Atualiza ou cria stickman
    for (let id in players) {
        const p = players[id];
        if (!stickmen[p.id]) {
            stickmen[p.id] = new Player(p.x, p.y, (p.id === me.id) ? '#0077ff' : '#ff3333');
        } else {
            stickmen[p.id].spine0.start.x = p.x;
            stickmen[p.id].spine0.start.y = p.y;
        }
    }

    // Envia posição ao servidor
    if (socket.connected) {
        socket.emit('move', { x: me.x, y: me.y });
        players[me.id] = Object.assign(players[me.id] || {}, {
            id: me.id, x: me.x, y: me.y, name: me.name
        });
    }

    draw();
    requestAnimationFrame(update);
}

function draw() {
    const now = performance.now();
    const delta = now - lastFrameTime;
    lastFrameTime = now;
    fps = 1000 / delta;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let id in players) {
        const p = players[id];
        if (!stickmen[p.id]) {
            stickmen[p.id] = new Player(p.x, p.y, (p.id === me.id) ? '#0077ff' : '#ff3333');
        } else {
            // atualiza posição da cabeça local
            if (p.id === me.id) {
                stickmen[p.id].spine0.start.x = p.x;
                stickmen[p.id].spine0.start.y = p.y;
            }
        }

        stickmen[p.id].update();
        stickmen[p.id].draw(ctx);
    }

    // HUD
    const info = [
        `FPS: ${fps.toFixed(0)} Ping: ${socket.connected ? socket.io.engine.transport?.latency || 0 : 0}ms`,
        `Jogador: ${me.name} - ${me.id ? me.id.slice(0, 6) : '---'}`,
        `Posição: (${me.x.toFixed(0)}, ${me.y.toFixed(0)})`,
        `Total players: ${Object.keys(players).length}`
    ];
    ctx.font = '14px monospace';
    ctx.fillStyle = '#000';
    info.forEach((text, i) => ctx.fillText(text, 10, 20 + i * 18));
}

// Inicia loop do jogo
update();

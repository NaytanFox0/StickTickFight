// Se o cliente for servido pelo mesmo host do servidor deixe ''.
// Se o cliente estiver separado (ex: GitHub Pages) substitua por 'https://seu-servidor'
const SERVER_URL = ''; // ou 'https://seu-servidor.exemplo'

const socket = SERVER_URL ? io(SERVER_URL) : io();
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

const speed = 4;
const keys = {};
let players = {};
let me = { id: null, x: canvas.width/2, y: canvas.height/2, name: 'Você' };

window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

socket.on('connect', () => {
  me.id = socket.id;
  socket.emit('newPlayer', 'Jogador');
});

socket.on('currentPlayers', data => { players = data; });
socket.on('playerJoined', p => { players[p.id] = p; });
socket.on('playerMoved', p => { if (players[p.id]) { players[p.id].x = p.x; players[p.id].y = p.y; } });
socket.on('playerLeft', id => { delete players[id]; });

function update() {
  if (keys['arrowup'] || keys['w']) me.y -= speed;
  if (keys['arrowdown'] || keys['s']) me.y += speed;
  if (keys['arrowleft'] || keys['a']) me.x -= speed;
  if (keys['arrowright'] || keys['d']) me.x += speed;

  me.x = Math.max(12, Math.min(canvas.width - 12, me.x));
  me.y = Math.max(12, Math.min(canvas.height - 12, me.y));

  if (socket.connected) {
    socket.emit('move', { x: me.x, y: me.y });
    players[me.id] = Object.assign(players[me.id] || {}, { id: me.id, x: me.x, y: me.y, name: me.name });
  }

  draw();
  requestAnimationFrame(update);
}

function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  Object.values(players).forEach(p => {
    ctx.beginPath();
    ctx.fillStyle = (p.id === me.id) ? '#0077ff' : '#ff3333';
    ctx.arc(p.x, p.y, 12, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.fillText(p.name || p.id.slice(0,4), p.x + 16, p.y + 4);
  });
}

update();

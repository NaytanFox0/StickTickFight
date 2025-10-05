import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.static("client"));

io.on("connection", socket => {
  console.log("Novo jogador");
  socket.on("move", data => io.emit("move", data));
});

server.listen(3000);

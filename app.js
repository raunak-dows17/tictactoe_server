require("dotenv").config();
const express = require("express");
const http = require("http");
require("./config/db");
const Room = require("./model/room");

const app = express();
const port = process.env.PORT || 9696;

const server = http.Server(app);
app.use(express.json());

// Web Socket Connection
const io = require("socket.io")(server);
io.on("connection", function (socket) {
  console.log(`Socket connection established ${socket.id}`);

  socket.on("createRoom", async ({ nickname }) => {
    try {
      let room = await Room();
      const player = {
        nickname,
        socketId: socket.id,
        playerType: "X",
      };

      room.players.push(player);
      room.turn = player;

      room = await room.save();

      const roomId = room._id.toString();
      socket.join(roomId);

      io.to(roomId).emit("createRoomSuccess", room);
    } catch (error) {
      console.error(error);
    }
  });

  socket.on("joinRoom", async ({ nickname, roomId }) => {
    try {
      let room = await Room.findById(roomId);
      if (!room) {
        socket.emit("errorOccurred", "Please enter a valid Room Id");
        return;
      }
      if (room.isJoin) {
        let player = {
          nickname,
          socketId: socket.id,
          playerType: "O",
        };

        socket.join(roomId);

        room.players.push(player);
        room.isJoin = false;

        await room.save();

        io.to(roomId).emit("joinRoomSuccess", room);
        io.to(roomId).emit("updatePlayers", room.players);
        io.to(roomId).emit("updateRoom", room);
      } else {
        socket.emit("errorOccurred", "Game is in progress try again later");
      }
    } catch (error) {
      console.error(error);
    }
  });

  socket.on("tap", async ({ index, roomId }) => {
    try {
      let room = await Room.findById(roomId);

      let choice = room.turn.playerType;

      if (room.turnIndex === 0) {
        room.turn = room.players[1];
        room.turnIndex = 1;
      } else {
        room.turn = room.players[0];
        room.turnIndex = 0;
      }

      room = await room.save();

      io.to(roomId).emit("tapped", {
        index,
        choice,
        room,
      });
    } catch (error) {
      console.error(error);
    }
  });

  socket.on("winner", async ({ winnerSocketId, roomId }) => {
    try {
      let room = await Room.findById(roomId);
      let player = room.players.find(
        (player) => player.socketId === winnerSocketId
      );
      player.points = player.points + 1;

      room = await room.save();

      if (player.points === room.maxRounds) {
        io.to(roomId).emit("endGame", player);
        room.findByIdAndDelete(roomId);
      } else {
        io.to(roomId).emit("pointIncrease", player);
      }
    } catch (error) {
      console.error(error);
    }
  });
});

app.get("/", async (req, res) => {
  res.status(200).send("Welcome to the server of the tictactoe game!");
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Server is Up and Running on http://localhost:${port}`);
});

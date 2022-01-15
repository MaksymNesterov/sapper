// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Server } from "socket.io";

const ioHandler = (_, res) => {
  if (!res.socket.server.io) {
    console.log("*First use, starting socket.io");

    const io = new Server(res.socket.server);

    io.on("connection", (socket) => {
      const { token } = socket.handshake.query;

      socket.roomId = token;
      socket.join(token);

      socket.on("connect to player", (secondPlayerToken) => {
        socket.broadcast.in(secondPlayerToken).emit("invite", socket.roomId);
      });

      socket.on("accept invite", (inviterToken, callback) => {
        socket.leave(socket.roomId);
        socket.join(inviterToken);

        socket.to(inviterToken).emit("gameStart", inviterToken);
        callback({
          status: true,
          token: inviterToken
        });
      });

      socket.on("first turn", ({gameToken, cells}) => {
        socket.to(gameToken).emit("first turn", {cells, gameToken});
      })

      socket.on('game turn', ({cells, score, flags, gameToken, isGameOver}) => {
        socket.to(gameToken).emit("game turn", {cells, score, flags, isGameOver});
      })

      socket.on('finish game', ({gameToken}) => {
        if (gameToken !== socket.roomId) {
          socket.leave(gameToken);
        }
      })
    });

    res.socket.server.io = io;
  } else {
    console.log("socket.io already running");
  }
  res.end();
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default ioHandler;

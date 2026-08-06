import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        const allowedOrigins = ["https://airbnb-colness-frontend.onrender.com"];

        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("CORS not allowed"));
        }
      },
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket Connected");

    console.log(socket.id);

    socket.on("joinRoom", ({ userId }) => {
      console.log("Joining Room");

      console.log(userId);

      socket.join(userId);

      console.log(socket.rooms);
    });

    socket.on("disconnect", () => {
      console.log("Socket Disconnected");
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }

  return io;
};

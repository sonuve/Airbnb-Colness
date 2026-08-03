import { io } from "socket.io-client";

const SOCKET_URL = "https://airbnb-colness.onrender.com"

export const socket = io(SOCKET_URL, {
    withCredentials: true,
    autoConnect: false,
    transports: ["websocket", "polling"],
    reconnection: true,
});

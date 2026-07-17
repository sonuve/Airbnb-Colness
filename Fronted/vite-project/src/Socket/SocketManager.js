import { useEffect } from "react";
import { socket } from "./Socket";
import { setSocketConnected } from "../../Redux/SocketSlic";
import { useDispatch } from "react-redux";

export const useSocket = (userId) => {
    const dispatch = useDispatch();

    useEffect(() => {
        if (!userId) return;

        socket.connect();

        const onConnect = () => {
            console.log("🟢 Socket connected:", socket.id);
            socket.emit("joinRoom", { userId });
            dispatch(setSocketConnected(true));
        };

        const onConnectError = (err) => {
            console.error("🔴 Socket connection error:", err.message);
        };
        const onDisconnect = () => {
            dispatch(setSocketConnected(false));
        };

        socket.on("connect", onConnect);
        socket.on("connect_error", onConnectError);
        socket.on("disconnect", onDisconnect);


        return () => {
            socket.off("connect", onConnect);
            socket.off("connect_error", onConnectError);
            socket.off("disconnect", onDisconnect);
            socket.disconnect();
            console.log("🔴 Socket disconnected");
        };
    }, [userId]);
};
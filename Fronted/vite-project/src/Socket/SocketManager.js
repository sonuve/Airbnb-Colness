import { useEffect } from "react";
import { socket } from "./Socket";
import { useDispatch } from "react-redux";
import { setSocketConnected } from "../../Redux/SocketSlic";

export const useSocket = (userId) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!userId) return;

    socket.connect();

    const onConnect = () => {
      console.log("🟢 Connected");
      console.log(socket.id);

      console.log("Joining room:", userId);

      socket.emit("joinRoom", {
        userId,
      });

      dispatch(setSocketConnected(true));
    };

    const onDisconnect = () => {
      console.log("Disconnected");

      dispatch(setSocketConnected(false));
    };

    const onError = (err) => {
      console.log(err);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onError);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onError);

      socket.disconnect();
    };
  }, [userId]);
};

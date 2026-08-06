import { useEffect } from "react";
import { socket } from "../Socket/Socket";
import { useDispatch } from "react-redux";
import { addNotification } from "../../Redux/SocketSlic";

function NotificationListener() {
  const dispatch = useDispatch();

  useEffect(() => {
    const receiveNotification = (data) => {
      console.log("Notification Received");

      console.log(data);

      dispatch(addNotification(data));
    };

    socket.on("booking-notification", receiveNotification);

    return () => {
      socket.off("booking-notification", receiveNotification);
    };
  }, []);

  return null;
}

export default NotificationListener;

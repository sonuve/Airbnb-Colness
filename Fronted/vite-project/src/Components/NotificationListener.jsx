import { useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { socket } from "../Socket/Socket.js";
import { addNotification } from "../../Redux/SocketSlic.js";

const NotificationListener = () => {
  const dispatch = useDispatch();

  // stable handler
  const handleBookingNotification = useCallback((data) => {
    console.log("📩 New booking:", data);
    dispatch(addNotification(data));
  }, [dispatch]);

  useEffect(() => {
    if (!socket) return;

    // remove old listener to prevent duplicates
    socket.off("booking-notification", handleBookingNotification);

    // add listener
    socket.on("booking-notification", handleBookingNotification);

    return () => {
      socket.off("booking-notification", handleBookingNotification);
    };
  }, [handleBookingNotification]);

  return null;
};

export default NotificationListener;
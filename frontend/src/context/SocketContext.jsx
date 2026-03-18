import { createContext, useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { token: userToken, user } = useSelector((state) => state.auth);
    const { token: recruiterToken, recruiter } = useSelector((state) => state.recruiterAuth);

    const activeToken = userToken || recruiterToken;
    const activeUser = user || recruiter;

    useEffect(() => {
        if (activeToken && activeUser) {
            const newSocket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
                query: {
                    userId: activeUser._id,
                    userType: user ? "User" : "Recruiter",
                }
            });

            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
            };
        } else {
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
        }
    }, [activeToken, activeUser]);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};

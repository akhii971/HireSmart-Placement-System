import { Server } from "socket.io";
import http from "http";

export const initSocket = (app) => {
    // Wrap the express app with a native HTTP server
    const server = http.createServer(app);

    // Initialize Socket.io
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:5173", // URL of the React frontend
            methods: ["GET", "POST"]
        }
    });

    // Handle WebSocket Connections
    io.on("connection", (socket) => {
        console.log("User connected to socket:", socket.id);

        // Client will join a room named after their conversationId
        socket.on("join_conversation", (conversationId) => {
            socket.join(conversationId);
            console.log(`Socket ${socket.id} joined conversation: ${conversationId}`);
        });

        // Broadcast messages to everyone in that conversation
        socket.on("send_message", (data) => {
            // data should contain { conversationId, text, senderId, etc. }
            io.to(data.conversationId).emit("receive_message", data);
        });

        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });
    });

    return { server, io };
};

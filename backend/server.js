import "dotenv/config";  // Must be first — loads .env before other imports execute
import express from "express";
import cors from "cors";
import connectDb from "./db/connectDb.js";
import router from "./routes/index.js";
import { initSocket } from "./socket.js";

connectDb();

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());

// Routes
app.use("/api", router);

// Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Initialize Socket.io and get the wrapped server
const { server } = initSocket(app);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} with WebSockets enabled`);
});

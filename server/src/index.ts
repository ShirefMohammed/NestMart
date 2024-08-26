import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, { Express, Request, Response } from "express";
import http from "node:http";
import path from "node:path";
import { Server } from "socket.io";

import { allowedOrigins } from "./config/allowedOrigins";
import { corsOptions } from "./config/corsOptions";
import { socketController } from "./controllers/socketController";
import { initDb } from "./database";
import { handleErrors } from "./middleware/errorHandler";
import { handleCors } from "./middleware/handleCors";
import authRouter from "./routes/authRouter";
import cartRouter from "./routes/cartRouter";
import categoriesRouter from "./routes/categoriesRouter";
import chatsRouter from "./routes/chatsRouter";
import notificationsRouter from "./routes/notificationsRouter";
import ordersRouter from "./routes/ordersRouter";
import productsRouter from "./routes/productsRouter";
import usersRouter from "./routes/usersRouter";
import { handleUnverifiedAccounts } from "./utils/handleUnverifiedAccounts";

dotenv.config();

(async function () {
  // Create server
  const app: Express = express();
  const server = http.createServer(app);
  const _PORT = process.env.PORT || 3000;

  // Connect to database
  await initDb(
    path.join(__dirname, "database", "sql", process.env.DATABASE_NAME!),
  );

  // Cross Origin Resource Sharing
  app.use(handleCors, cors(corsOptions));

  // Built-in middleware to handle urlencoded form data
  app.use(express.urlencoded({ extended: false }));

  // Built-in middleware for json
  app.use(express.json());

  // Middleware for cookies
  app.use(cookieParser());

  // Serve static files
  app.use(
    "/api/database/uploads",
    express.static(path.join(__dirname, "database", "uploads")),
  );

  // Routes - HealthZ
  app.get("/", (_, res: Response) => {
    res.sendFile(path.join(__dirname, "views", "index.html"));
  });

  // V1 API Routes
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/users", usersRouter);
  app.use("/api/v1/categories", categoriesRouter);
  app.use("/api/v1/products", productsRouter);
  app.use("/api/v1/cart", cartRouter);
  app.use("/api/v1/orders", ordersRouter);
  app.use("/api/v1/chats", chatsRouter);
  app.use("/api/v1/notifications", notificationsRouter);

  // Handle not found routes
  app.all("*", (req: Request, res: Response) => {
    res.status(404);
    if (req.accepts("html")) {
      res.sendFile(path.join(__dirname, "views", "404.html"));
    } else if (req.accepts("json")) {
      res.json({ message: "404 Not Found" });
    } else {
      res.type("txt").send("404 Not Found");
    }
  });

  // Handle unverified accounts every 1 hour
  handleUnverifiedAccounts();

  // Socket.IO
  const io = new Server(server, {
    pingTimeout: 60000,
    cors: { origin: allowedOrigins },
  });
  io.on("connection", (socket) => socketController(io, socket));

  // Handle error middleware
  app.use(handleErrors);

  // Listen for requests
  server.listen(_PORT, () => {
    console.log(`Server running on ${process.env.SERVER_URL}`);
  });
})();

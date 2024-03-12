import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();

export { app };

// front-end can make requests for resources to an external back-end server
app.use(
  cors({
    origin: process.env.CORS_ORGIN,
    credentials: true,
  })
);

// parsing all data into the json format
app.use(express.json({ limit: "50kb" }));

// for encoding url
app.use(express.urlencoded());

// set static as a public folder
app.use(express.static("public"));

// middleware for cookies
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Welcome");
});

// Importing Routers

import userRouter from "./routes/user.route.js";

// Flow of Diagram:
// register controller -> user router -> app.use

app.use("/users", userRouter);

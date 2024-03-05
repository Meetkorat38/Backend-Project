import dotenv from "dotenv";
import mongoose_connect from "./db/db.js";

dotenv.config({
  path: "./env",
});

mongoose_connect();

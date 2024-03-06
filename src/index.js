import dotenv from "dotenv";
import mongoose_connect from "./db/db.js";
import { app } from "./app.js";

dotenv.config({
  path: "./env",
});

const port = process.env.PORT || 3000;

mongoose_connect()
  .then(() => {
    // If connected then listen to express server

    app.on("error", (err) => {
      // If express server cant listen then give error
      console.log(`express listning error: ${err}`);
    });

    app.listen(port, () => {
      console.log(`listening on ${port}`);
    });
  })
  .catch((error) => {
    // IF databased not successfully connected
    console.log(`Database connection failed: ${error.message}`);
  });

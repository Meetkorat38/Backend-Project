import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const mongoose_connect = async () => {
  try {
    const db_instance = await mongoose.connect(
      `${process.env.MONGODB_URL}/${DB_NAME}`
    );
    console.log(`Connected to ${db_instance.connection.host}`);
  } catch (error) {
    console.log(`MONGODB CONNECTION FAILED : ${error}`);
    process.exit(1);
  }
};

export default mongoose_connect;

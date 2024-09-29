import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


const db_uri = process.env.MONGODB_URI;
const connectMongo = async () => {
    try {
        const instance = await mongoose.connect(`${db_uri}/${DB_NAME}`);
        console.log("Connected to the database at host", instance.connection.host);
    } catch (error) {
        console.log("Error in Connecting the database", error.message);
        process.exit(1);
    }
}

export default connectMongo;
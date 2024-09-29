import connectMongo from "./database/ConnectMongo.js";
import { app } from "./app.js";
import dotevn from "dotenv";

dotevn.config({
    path: ".env"
});

const PORT = process.env.PORT || 4000;

connectMongo().then(() => {
    app.on("error", (error) => {
        console.log("Error in starting the server", error.message);
    });
    
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
}).catch((error) => {
    console.log("Error in connecting to the database", error.message);
})
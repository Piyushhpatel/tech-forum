import express from "express";
import cors from "cors";
const app = express();

app.use(
    cors({
      origin: "*",
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    })
  );
  

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Welcome to the Cracked Nerds Forum");
});

//Routes
import postRoutes from "./routes/Post.routes.js";
import commentRoutes from "./routes/Comment.routes.js";
import categoryRoutes from "./routes/Category.routes.js";

app.use("/api/v1/posts", postRoutes);
app.use("/api/v1/comments", commentRoutes);
app.use("/api/v1/categories", categoryRoutes);

export {app};
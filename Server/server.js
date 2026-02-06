import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import bookRoutes from "./routes/books.js";
import memberRoutes from "./routes/members.js";
import reportRoutes from "./routes/reports.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/books", bookRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/reports", reportRoutes);

app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(cors({ origin: true }));
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());

//morgan logger
app.use(morgan("tiny"));

export default app;

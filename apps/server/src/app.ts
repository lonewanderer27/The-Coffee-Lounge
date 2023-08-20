import "express-async-errors";

import { cert, initializeApp } from "firebase-admin/app";

import { ExpressErrorHandler } from "./utils/ExpressErrorHandler";
import { NotFoundError } from "./utils/notFoundError";
import { apiRoutes } from "./api";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

const app = express();
export const firebaseApp = initializeApp({
  credential: cert({
    projectId: process.env.project_id,
    clientEmail: process.env.client_email,
    privateKey: process.env.private_key,
  }),
});

app.use(morgan("dev"));
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/api", apiRoutes);

app.use("/", (_req, res) => {
  res.json({
    msg: "🦄🌈✨👋🌎🌍🌏✨🌈🦄",
  });
});

//! Not found page error
app.all("*", NotFoundError);

// ! Error Handlers
app.use(ExpressErrorHandler);

export { app };

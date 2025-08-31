import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import fs from "fs";
import { CONFIG } from "./config";
import { auth } from "./routes/auth";
import { users } from "./routes/users";
import { complaints } from "./routes/complaints";
import { files } from "./routes/files";
import { errorHandler } from "./middlewares/errors";

const app = express();

if (!fs.existsSync(CONFIG.fileDir)) fs.mkdirSync(CONFIG.fileDir, { recursive: true });

app.use(helmet());
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());
app.use(cors({ origin: CONFIG.allowedOrigins, credentials: true }));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/auth", auth);
app.use("/users", users);
app.use("/complaints", complaints);
app.use("/files", files);

app.use(errorHandler);

app.listen(CONFIG.port, () => console.log(`API on :${CONFIG.port}`));
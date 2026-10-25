import "dotenv/config";
import cors from "cors";
import express, {
  type ErrorRequestHandler,
  type RequestHandler,
} from "express";
import { openDatabase } from "./db.js";
import { createInvoicesRepository } from "./invoices.js";
import { apiError, createInvoicesRouter } from "./routes/invoices.js";

const port = Number(process.env.API_PORT ?? 4000);
const webOrigin = process.env.WEB_ORIGIN ?? "http://localhost:5173";
const databasePath = process.env.DATABASE_PATH ?? "./data/payraast.db";

const db = openDatabase(databasePath);
const invoices = createInvoicesRepository(db);

const app = express();

app.use(cors({ origin: webOrigin }));
app.use(express.json({ limit: "100kb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", network: "testnet" });
});

app.use("/api/invoices", createInvoicesRouter(invoices));

const notFound: RequestHandler = (_req, res) => {
  res.status(404).json(apiError("NOT_FOUND", "Route not found"));
};
app.use(notFound);

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof SyntaxError && "body" in err) {
    res.status(400).json(apiError("INVALID_JSON", "Request body is not valid JSON"));
    return;
  }
  console.error(err);
  res.status(500).json(apiError("INTERNAL_ERROR", "Something went wrong"));
};
app.use(errorHandler);

app.listen(port, () => {
  console.log(`PayRaast API listening on http://localhost:${port}`);
  console.log(`SQLite database: ${databasePath}`);
});

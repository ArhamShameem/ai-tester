import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { startWorkers } from "./workers";

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);

  if (process.env.START_WORKER !== "false") {
    startWorkers().catch((err) => {
      console.error("[WorkerEngine] Error starting in-process workers:", err);
    });
  }
});

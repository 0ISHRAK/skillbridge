import fs from "fs";
import path from "path";

export function logError(error: Error | string | unknown) {
  try {
    const logsDir = path.join(process.cwd(), "logs");
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    const logFilePath = path.join(logsDir, "error.log");
    const timestamp = new Date().toISOString();
    
    let errorMessage = "";
    if (error instanceof Error) {
      errorMessage = `${error.message}\nStack:\n${error.stack}`;
    } else if (typeof error === "string") {
      errorMessage = error;
    } else {
      errorMessage = JSON.stringify(error);
    }

    const logEntry = `[${timestamp}] ERROR: ${errorMessage}\n--------------------------------------------------------\n`;
    
    // Append entry to error.log on disk
    fs.appendFileSync(logFilePath, logEntry, "utf-8");
    
    // Fallback console log for terminal output
    console.error(`[SYSTEM ERROR] ${errorMessage}`);
  } catch (err) {
    console.error("Logger failed to append error log:", err);
  }
}

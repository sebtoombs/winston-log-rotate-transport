import {
  vi,
  describe,
  test,
  expect,
  afterEach,
  beforeAll,
  afterAll,
  beforeEach,
} from "vitest";
import winston from "winston";
import { LogRotateTransport } from "./winston-log-rotate-transport";
import fs from "node:fs";
import path from "node:path";

const jsonFormatter = winston.format.json();

function jsonFormat(level, message) {
  const info = { level, message };
  return jsonFormatter.transform(info, jsonFormatter.options);
}

function log(transport, level, message) {
  return new Promise<void>((resolve) => {
    transport.once("log", () => {
      resolve();
    });
    transport.log(jsonFormat(level, message));
    vi.runAllTimers();
  });
}

// Unused
// function close(transport) {
//   return new Promise<void>((resolve) => {
//     transport.once("close", () => {
//       resolve();
//     });
//     transport.close();
//     vi.runAllTimers();
//   });
// }

function rotate(transport, force = false) {
  return new Promise<void>((resolve) => {
    transport.once("rotate", () => {
      resolve();
    });
    transport.rotate(force);
    vi.runAllTimers();
  });
}

let cleanupFiles = [];

describe("Winson Log Rotate Transport", () => {
  beforeAll(() => {
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  afterEach(() => {
    fs.unlinkSync(path.join(process.cwd(), "audit.json"));
    for (const file of cleanupFiles) {
      try {
        fs.unlinkSync(file);
      } catch {
        // noop
      }
    }
    cleanupFiles = [];
  });

  let transport;
  let logFileName;

  beforeEach(() => {
    transport = new LogRotateTransport();
    logFileName = transport.getCurrentLogFileName();
    cleanupFiles.push(logFileName);
    expect(fs.existsSync(logFileName)).toBe(false);
  });

  test("should log to default file", async () => {
    await log(transport, "info", "info message");

    // Should have logged
    await vi.waitFor(() => {
      expect(fs.existsSync(logFileName)).toBe(true);
      expect(fs.readFileSync(logFileName, "utf8")).toContain(
        JSON.stringify(jsonFormat("info", "info message")),
      );
    });

    // Should not have rotated
    expect(transport.getCurrentLogFileName()).toBe(logFileName);

    // Should match default file name pattern
    expect(logFileName).toMatch(/winston-\d{4}-\d{2}-\d{2}\.log/);
  });

  test("should rotate log file", async () => {
    await log(transport, "info", "info message");

    // Should have logged
    await vi.waitFor(() => {
      expect(fs.existsSync(logFileName)).toBe(true);
      expect(fs.readFileSync(logFileName, "utf8")).toContain(
        JSON.stringify(jsonFormat("info", "info message")),
      );
    });

    vi.setSystemTime(Date.now() + 24 * 60 * 60 * 1000);

    await log(transport, "info", "info 2 message");

    const logFileName2 = transport.getCurrentLogFileName();
    cleanupFiles.push(logFileName2);

    expect(logFileName2).not.toBe(logFileName);

    await vi.waitFor(() => {
      expect(fs.existsSync(logFileName2)).toBe(true);
      expect(fs.readFileSync(logFileName2, "utf8")).toContain(
        JSON.stringify(jsonFormat("info", "info 2 message")),
      );
    });
  });

  test("should manually rotate log file", async () => {
    await log(transport, "info", "info message");

    // Should have logged
    await vi.waitFor(() => {
      expect(fs.existsSync(logFileName)).toBe(true);
      expect(fs.readFileSync(logFileName, "utf8")).toContain(
        JSON.stringify(jsonFormat("info", "info message")),
      );
    });

    await rotate(transport, true);

    const logFileName2 = transport.getCurrentLogFileName();
    cleanupFiles.push(logFileName2);

    expect(logFileName2).not.toBe(logFileName);
    expect(logFileName2).toMatch(/winston-\d{4}-\d{2}-\d{2}\.1.log/);

    await log(transport, "info", "info 2 message");

    await vi.waitFor(() => {
      expect(fs.existsSync(logFileName2)).toBe(true);
      expect(fs.readFileSync(logFileName2, "utf8")).toContain(
        JSON.stringify(jsonFormat("info", "info 2 message")),
      );
    });
  });
});

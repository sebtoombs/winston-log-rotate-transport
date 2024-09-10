import Transport from "winston-transport";
import * as FileStreamRotator from "file-stream-rotator";
import { MESSAGE } from "triple-beam";
import os from "node:os";
import { FileStreamRotatorOptions } from "file-stream-rotator/lib/types";

const noop = () => {};

export interface LogRotateTransportOptions
  extends Partial<Transport.TransportStreamOptions>,
    Partial<FileStreamRotatorOptions> {
  eol?: string;
}

export const logRotateDefaults: LogRotateTransportOptions = {
  eol: os.EOL,
  filename: "winston-%DATE%",
  extension: ".log",
  frequency: "daily",
  date_format: "YYYY-MM-DD",
};

export class LogRotateTransport extends Transport {
  logStream: ReturnType<typeof FileStreamRotator.getStream>;

  options: LogRotateTransportOptions;

  constructor(options: LogRotateTransportOptions = {}) {
    options = { ...logRotateDefaults, ...options };

    const fileStreamRotatorOptions: FileStreamRotatorOptions = {
      filename: options.filename,
      frequency: options.frequency,
      verbose: options.verbose,
      date_format: options.date_format,
      size: options.size,
      max_logs: options.max_logs,
      audit_file: options.audit_file,
      end_stream: options.end_stream,
      file_options: options.file_options,
      utc: options.utc,
      extension: options.extension,
      create_symlink: options.create_symlink,
      symlink_name: options.symlink_name,
      audit_hash_type: options.audit_hash_type,
    };

    const transportOptions: Transport.TransportStreamOptions = {
      format: options.format,
      level: options.level,
      handleExceptions: options.handleExceptions,
      handleRejections: options.handleRejections,
      silent: options.silent,
      log: options.log,
      logv: options.logv,
      close: options.close,
    };

    super(transportOptions);

    this.options = options;

    this.logStream = FileStreamRotator.getStream(fileStreamRotatorOptions);

    // Forward custom logStream events to this Transport
    // Don't forward stream events as this will brick the Transport
    this.logStream.on("error", this.emit.bind(this, "error"));
    this.logStream.on("open", this.emit.bind(this, "open"));
    this.logStream.on("close", this.emit.bind(this, "close"));
    this.logStream.on("finish", this.emit.bind(this, "finish"));
    this.logStream.on("rotate", this.emit.bind(this, "rotate"));
    this.logStream.on("new", this.emit.bind(this, "new"));
  }

  // this.logStream is publicly available, but this is just a convenience
  rotate(force: boolean = false) {
    if (this.logStream) {
      this.logStream.rotate(force);
    }
  }

  getCurrentLogFileName() {
    // 'currentFile' is a "private" property on the logStream
    return this.logStream["currentFile"];
  }

  // Implement the Transport interface
  log: Transport["log"] = function (info, callback = noop) {
    setImmediate(() => {
      this.emit("log", info);
    });

    const output = `${info[MESSAGE]}${this.options.eol}`;

    this.logStream.write(output);

    callback();
  };

  logv: Transport["logv"] = function (info, callback = noop) {
    setImmediate(() => {
      this.emit("log", info);
    });

    const output = `${info[MESSAGE]}${this.options.eol}`;

    this.logStream.write(output);

    callback();
  };

  close: Transport["close"] = function () {
    if (this.logStream) {
      this.logStream.end("");
    }
  };
}

# winston-log-rotate-transport

A Winston transport for rotating log files. By default, the transport will rotate logs daily, however log rotation can be configured based on date, time, file size, etc.

winston-log-rotate-transport uses [file-stream-rotator](https://github.com/rogerc/file-stream-rotator/), and all options can be passed through.

## Usage

Install

```bash
npm install winston-log-rotate
```

Add to your winston logger

```js
import winston from "winston";
import { LogRotateTransport } from "winston-log-rotate-transport";

const logger = winston.createLogger({
  transports: [
    new LogRotateTransport({
      filename: "app-%DATE%",
      frequency: "daily", // Default
      datePattern: "YYYY-MM-DD", // Default
    }),
  ],
});
```

## Options

All options from [file-stream-rotator](https://github.com/rogerc/file-stream-rotator/?tab=readme-ov-file#options) are accepted, as well as all options from winston's `TransportStream` class.

The `filename`, `extension`, `frequency`, and `date_format` option defaults are specific to this transport. (Not set by `file-stream-rotator`).

| Option      | Description                                                                                                                                                                                                                     | Default            |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| filename    | The base filename to log to. Full path can be included. If the path is omitted it will default to cwd. Accepts _'%DATE'%_ placeholder.                                                                                          | _'winston-%DATE%'_ |
| extension   | File extension to be appended to the filename. This is separate from the filename. This is useful when using size restrictions or manual log rotation as the library will add a count (e.g. _'.1'_ to the end of the filename.) | _'.log'_           |
| frequency   | How often to rotate the log file. Options are _'daily'_ for daily rotation, _'date'_ based on `date_format`, _'[1-12]h'_ to rotate every 1-12 hours, _'[1-30m]'_ to rotate every 1-30 minutes.                                  | _'daily'_          |
| date_format | The date format to use when rotating logs based on the date. When the string representation of changes, the log file will be rotated. This is also substituted into the _'%DATE%'_ placeholder in the filename.                 | _'YYYY-MM-DD'_     |
|             |                                                                                                                                                                                                                                 |                    |
|             | All options from file-stream-rotator are accepted <br/> https://github.com/rogerc/file-stream-rotator/?tab=readme-ov-file#options                                                                                               |                    |
|             | All options from winston's `TransportStream` class are accepted. <br/> https://github.com/winstonjs/winston-transport/blob/master/index.d.ts#L25                                                                                |                    |

## FAQ

#### Why this plugin?

Use this plugin if you use Winston and you want to rotate your logs.

#### winston-log-rotate-transport vs winston-daily-rotate-file

`winston-daily-rotate-file` is a popular choice for rotating logs with Winston. `winston-log-rotate-transport` is a similar transport, which also uses `file-stream-rotator` under the hood. The main difference is that `winston-log-rotate-transport` allows for more flexibility in log rotation, and is less opinionated. Additionally, `winston-log-rotate-transport` is a newer package, and uses `v1` of `file-stream-rotator`. This is especially useful if you'd like to rotate log files manually at any point.

#### Can I manually rotate log files?

Yes! `file-stream-rotator` v1 offers this method and it is also available via a convenience method on the transport.

```js
import { LogRotateTransport } from "winston-log-rotate-transport";

const transport = new LogRotateTransport({
  filename: "app-%DATE%",
  frequency: "daily",
  datePattern: "YYYY-MM-DD",
});

// Rotate the log file
transport.rotate();
```

## Prior art

This plugin was inspired by [winston-daily-rotate-file](https://github.com/winstonjs/winston-daily-rotate-file).

## Contributing

Contributions are super welcome.

### Developing

Clone the repo

```bash
git clone https://github.com/sebtoombs/vite-resolve-tsconfig-paths.git
```

Install dependencies

```bash
npm install
```

Write some code!

Build

```bash
npm run build
```

Don't forget, to pass CI, your code will need to pass `npm run lint`, `npm run format:check` `npm test` & `npm run build`

### Share your contribution

To make a contribution;

- Fork this repo
- Create a branch for your change, branch naming is not important
- Open a Pull Request against the `main` branch of this repo
  - PR title, labels etc are (at this stage) not important
- Wait for a review
- If approved, squash and merge
- Your change will be included in the next release!

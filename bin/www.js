import "dotenv/config";
import chalk from "chalk";
import http from "http";
import app from "../server";

const port = process.env.APP_PORT || "3000";
app.set("port", port);

const server = http.createServer(app);

server.listen(port, err => {
  if (err) {
    return console.log("😫", chalk.red(err));
  }
  console.log(`🚀  Now listening on port ${chalk.green(port)}`);
});

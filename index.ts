import { Client } from "discord.js";
import "dotenv/config";
import { ChildProcess, exec } from "child_process";

import stripAnsi = require("strip-ansi");
const client = new Client();

const CODEBLOCK = "```\n";

let lastProcess: ChildProcess;

client.on("message", async (msg) => {
  if (msg.author.id !== "268798547439255572") return;

  if (
    msg.author.bot ||
    msg.content.includes("no-preserve-root") ||
    msg.content.includes("/*") ||
    msg.content.startsWith("\\")
  ) {
    return;
  }

  const loadingMessage = await msg.channel.send(
    `Running command ${msg.content}`
  );

  if (lastProcess && !lastProcess.killed) {
    lastProcess.kill();
  }

  try {
    lastProcess = exec(msg.content);

    lastProcess.stdout.on("data", async (data) => {
      await msg.channel.send(
        CODEBLOCK + stripAnsi(data.toString()) + CODEBLOCK
      );
    });

    lastProcess.on("exit", async (code) => {
      await loadingMessage.delete();
      await msg.channel.send(`\`${msg.content}\` exited with ${code}`);
    });
  } catch (err) {
    msg.channel.send("err: " + err);
  }
});

client.login(process.env.TOKEN).then(() => console.log("ready i guess"));

import * as fs from "fs";
import { readStreamLine } from "./files";

const msgStream = fs.createWriteStream("./msg.txt");
const diffStream = fs.createWriteStream("./diff.txt");
const shaStream = fs.createWriteStream("./sha.txt");

const out = [];

readStreamLine(
  "./out.jsonl",
  (line) => {
    const obj = JSON.parse(line);
    msgStream.write(`${obj.msg}\n`);
    diffStream.write(`${obj.diff}\n`);
    shaStream.write(`${obj.sha}\n`);
  },
  () => {
    msgStream.close();
    diffStream.close();
    shaStream.close();
  }
);

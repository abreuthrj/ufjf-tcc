import { readStreamLine } from "../utils/files";
import fs from "fs";

const LANGUAGE = "javascript";
const TYPE = "test";
const FILE_RATE = 0.5;
const HISTORY_SIZE = 5;

const commits = [];

fs.mkdirSync(`data/3-processed/${LANGUAGE}`, { recursive: true });
const writeStream = fs.createWriteStream(
  `data/3-processed/${LANGUAGE}/${TYPE}.processed.jsonl`
);
const diffStream = fs.createWriteStream(
  `data/3-processed/${LANGUAGE}/${TYPE}.diff.txt`
);
const msgStream = fs.createWriteStream(
  `data/3-processed/${LANGUAGE}/${TYPE}.msg.txt`
);

let diffTokens = 0;
let historyTokens = 0;

const prepare = (commit) => {
  commit.authorHistory = commit.authorHistory ?? [];
  commit.fileHistory = commit.fileHistory ?? [];
  commit.authorFileHistory = commit.authorFileHistory ?? [];
  commit.files = commit.files.map((file) => file.filename);

  commits.forEach((search) => {
    if (!search?.msg) {
      return;
    }
    if (commit.sha === search.sha) {
      return;
    }
    if (commit.time < search.time) {
      return;
    }

    // Adiciona commits de mesmo autor e repositório
    let hasAuthor = false;
    if (commit.author === search.author && commit.repo === search.repo) {
      hasAuthor = true;
      commit.authorHistory.push(search.msg);
    }

    // Contabiliza a quantidade de arquivos modificados em comum
    let containingFiles = 0;
    for (const searchFile of search.files) {
      if (commit.files.includes(searchFile.filename)) {
        containingFiles++;
      }
    }

    // Adiciona commits com modificação em até 50% de arquivos em comum
    let hasFile = false;
    if (
      Math.max(commit.files.length, search.files.length) * FILE_RATE <=
      containingFiles
    ) {
      hasFile = true;
      commit.fileHistory.push(search.msg);
    }

    if (hasAuthor && hasFile) {
      commit.authorFileHistory.push(search.msg);
    }
  });

  commit.authorHistory = commit.authorHistory.slice(-HISTORY_SIZE);
  commit.fileHistory = commit.fileHistory.slice(-HISTORY_SIZE);
  commit.authorFileHistory = commit.authorFileHistory.slice(-HISTORY_SIZE);

  diffTokens += commit.diff.split(" ").length;
  historyTokens += commit.authorHistory.join(" ").split(" ").length;
  historyTokens += commit.fileHistory.join(" ").split(" ").length;
  historyTokens += commit.authorFileHistory.join(" ").split(" ").length;

  writeStream.write(`${JSON.stringify(commit)}\n`);
  diffStream.write(`${commit.diff}\n`);
  msgStream.write(`${commit.msg}\n`);
};

const evaluateCost = () => {
  console.log("Diff tokens: ", diffTokens);
  console.log("History tokens: ", historyTokens);
  console.log("Input tokens: ", diffTokens + historyTokens);
};

readStreamLine(
  `data/1-enriched/${LANGUAGE}/${TYPE}.enriched.jsonl`,
  (line) => {
    commits.push(JSON.parse(line));
  },
  () => {
    readStreamLine(
      `data/2-selected/${LANGUAGE}/${TYPE}.selected.jsonl`,
      (line) => {
        prepare(JSON.parse(line));
      },
      evaluateCost
    );
  }
);

import fs from "fs";
import { Octokit } from "octokit";
import dotenv from "dotenv";
import { readStreamLine } from "../utils/files";

dotenv.config();

const LANGUAGE = "javascript";
const PATH = `data/preprocessed/${LANGUAGE}`;
const OUTPUT = `data/enriched/${LANGUAGE}`;
const TYPE = "test";
const INTERVAL = 1000;

const octokit = new Octokit({
  auth: process.env.GITHUB_API_KEY,
});

try {
  fs.mkdirSync(OUTPUT, { recursive: true });
} catch (err) {}
const fileStream = fs.createWriteStream(`${OUTPUT}/${TYPE}.enriched.jsonl`, {
  flags: "a",
});

let processed = [];
try {
  processed = fs
    .readFileSync(`${OUTPUT}/${TYPE}.processed.txt`)
    .toString()
    .split("\n");
} catch (err) {}

const queue = [];
let finished = false;

const processedStream = fs.createWriteStream(
  `${OUTPUT}/${TYPE}.processed.txt`,
  { flags: "a" }
);

readStreamLine(
  `${PATH}/${TYPE}.commits.jsonl`,
  async (line) => {
    const data = JSON.parse(line);

    if (!processed.includes(data.sha)) {
      queue.push(data);
    }
  },
  () => {
    finished = true;
  }
);

const consume = async () => {
  if (!queue.length) {
    if (finished) {
      process.exit(0);
    }
    return;
  }

  const data = queue.shift();

  const [owner, ...splittedRepo] = data.repo.split("/");

  const repo = splittedRepo.join("/");

  try {
    const response = await octokit.request(
      "GET /repos/{owner}/{repo}/commits/{commit_sha}",
      {
        owner,
        repo,
        commit_sha: data.sha,
      }
    );

    console.log("[COMMIT] Found", response.data.sha);

    data.author = response.data.commit.author.email;
    data.files = response.data.files?.map((file) => ({
      sha: file.sha,
      filename: file.filename,
      status: file.status,
      patch: file.patch,
    }));

    fileStream.write(`${JSON.stringify(data)}\n`);
    processedStream.write(`${data.sha}\n`);

    setTimeout(consume, INTERVAL);
  } catch (err) {
    process.exit(1);
  }
};

setTimeout(consume, 1000);

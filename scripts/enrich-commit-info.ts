import fs from "fs";
import { Octokit, RequestError } from "octokit";
import dotenv from "dotenv";
import { readJsonl } from "../utils/files";

dotenv.config();

const LANGUAGE = process.env.LANGUAGE;
const TYPE = "test";
const INTERVAL = 500;

const octokit = new Octokit({
  auth: process.env.GITHUB_API_KEY,
});

try {
  fs.mkdirSync(`data/mcmd/${LANGUAGE}/enriched`);
} catch (err) {}
const fileStream = fs.createWriteStream(
  `data/mcmd/${LANGUAGE}/enriched/${TYPE}.enriched`,
  { flags: "a" }
);

let processed = [];
try {
  processed = JSON.parse(
    fs
      .readFileSync(`data/mcmd/${LANGUAGE}/enriched/${TYPE}.processed`)
      .toString()
  );
} catch (err) {}

const queue = [];
let finished = false;

readJsonl(
  `data/mcmd/${LANGUAGE}/${TYPE}.jsonl`,
  async (data) => {
    if (!processed.includes(data.sha)) {
      queue.push(data);
    }
  },
  () => {
    finished = true;
  }
);

setInterval(async () => {
  if (!queue.length) {
    if (finished) {
      fs.writeFileSync(
        `data/mcmd/${LANGUAGE}/enriched/${TYPE}.processed`,
        JSON.stringify(processed)
      );
      process.exit(0);
    }
    return;
  }

  const data = queue.shift();

  const [owner, ...splittedRepo] = data.repo.replace("\n", "").split("/");

  const repo = splittedRepo.join("/");

  try {
    const response = await octokit.request(
      "GET /repos/{owner}/{repo}/commits/{commit_sha}",
      {
        owner,
        repo,
        commit_sha: data.sha.replace("\n", ""),
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

    processed.push(data.sha);
  } catch (err) {
    fs.writeFileSync(
      `data/mcmd/${LANGUAGE}/enriched/${TYPE}.processed`,
      JSON.stringify(processed)
    );
    process.exit(1);
  }
}, INTERVAL);

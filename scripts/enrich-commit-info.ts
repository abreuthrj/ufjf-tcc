import fs from "fs";
import { Octokit } from "octokit";
import dotenv from "dotenv";
import { readStreamLine } from "../utils/files";

dotenv.config();

const LANGUAGE = process.env.LANGUAGE;
const TYPE = "test";

const octokit = new Octokit({
  auth: process.env.GITHUB_API_KEY,
});

try {
  fs.mkdirSync(`data/mcmd/${LANGUAGE}/enriched`);
} catch (err) {}
const fileStream = fs.createWriteStream(
  `data/mcmd/${LANGUAGE}/enriched/${TYPE}.enriched`
);

readStreamLine(
  `data/mcmd/${LANGUAGE}/${TYPE}.jsonl`,
  async (line) => {
    const data = JSON.parse(line);

    const [owner, ...splittedRepo] = data.repo.replace("\n", "").split("/");

    const repo = splittedRepo.join("/");

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
  },
  () => {
    fileStream.close();
  }
);

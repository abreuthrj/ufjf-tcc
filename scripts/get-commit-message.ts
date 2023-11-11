import fs from "fs";
import { gpt } from "../utils/gpt";
import { PROMPT_RAW, TEST_FORMAT, PROMPT_HISTORY } from "../constants";
import { ContextCommit } from "./enrich-context-commits";
import { exec } from "child_process";
import dotenv from "dotenv";
import { addEOL, removeEOL } from "../utils/string";

export type EnrichType = "file" | "author" | "file-author";

dotenv.config();

const TEST_AMOUNT = 50;

const commits = JSON.parse(
  fs.readFileSync("data/selected-commits.json").toString()
) as ContextCommit[];

const date = new Date();
const testId = date
  .toLocaleDateString()
  .replace(/\//g, "")
  .concat(
    date
      .toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
      .replace(/:/g, "")
  );
const filename = `test${TEST_AMOUNT}_${testId}`;

const testSample = async (commit: ContextCommit, type?: EnrichType) => {
  let prompt: string = PROMPT_RAW;

  if (type) {
    prompt = PROMPT_HISTORY;
  }

  prompt = prompt
    .replace("$diff", commit.diff)
    .replace("$filename", commit.file);

  if (type === "file") {
    prompt = prompt.replace(
      "$history",
      commit.fileCommits.map((c) => removeEOL(c.message)).join("\n")
    );
  }
  if (type === "author") {
    prompt = prompt.replace(
      "$history",
      commit.authorCommits.map((c) => removeEOL(c.message)).join("\n")
    );
  }
  if (type === "file-author") {
    prompt = prompt.replace(
      "$history",
      commit.authorFileCommits.map((c) => removeEOL(c.message)).join("\n")
    );
  }

  console.log("Enviando prompt para o GPT");
  const message = await gpt(prompt);

  fs.writeFileSync(
    `output/${filename}.ref.txt`,
    addEOL(removeEOL(commit.message)),
    {
      flag: "a",
    }
  );
  fs.writeFileSync(`output/${filename}.hyp.txt`, addEOL(removeEOL(message)), {
    flag: "a",
  });
  fs.writeFileSync(
    `output/${filename}.txt`,
    TEST_FORMAT.replace("$input", prompt)
      .replace("$output", message)
      .replace("$original", commit.message),
    {
      flag: "a",
    }
  );
};

const test = async (numOfSamples: number) => {
  for (let i = 0; i < numOfSamples; i++) {
    console.log("Rodando sample", i);
    await testSample(commits[i]);
  }

  console.log("Calculando bleu");
  exec(
    `perl CoRec/evaluation/multi-bleu.perl output/${filename}.ref.txt < output/${filename}.hyp.txt`,
    (error, out, err) => {
      if (error) {
        console.log("[BLEU] Error", error, err);
      }

      console.log("[BLEU]", out);
    }
  );
};

test(TEST_AMOUNT);

import fs from "fs";
import dotenv from "dotenv";
import { readStreamLine } from "../utils/files";
import { selectRandomLinesFromFile } from "../utils/random";

dotenv.config();

const LANGUAGE = "javascript";

// const PATH = `data/filtered_data/${LANGUAGE}/sort_time_train80_valid10_test10`;
const PATH = `data/mcmd/${LANGUAGE}/sort_time_train80_valid10_test10`;
const OUTPUT = `data/preprocessed/${LANGUAGE}`;
const SETS = ["test", "train", "valid"];
const LIMITS = [5400, 100000, 5400];

try {
  fs.mkdirSync(OUTPUT, { recursive: true });
} catch (err) {}

for (const [index, set] of Object.entries(SETS)) {
  const writeDiffStream = fs.createWriteStream(`${OUTPUT}/${set}.diff.txt`);
  const writeMsgStream = fs.createWriteStream(`${OUTPUT}/${set}.msg.txt`);

  const flags = {
    repos: false,
    shas: false,
    diffs: false,
    msgs: false,
    times: false,
  };

  const repos = [];
  const shas = [];
  const diffs = [];
  const msgs = [];
  const times = [];

  let total = 0;

  const commitStream = fs.createWriteStream(`${OUTPUT}/${set}.commits.jsonl`);
  const feed = () => {
    if (
      repos.length &&
      shas.length &&
      diffs.length &&
      msgs.length &&
      times.length
    ) {
      const commit = {
        repo: repos.shift(),
        sha: shas.shift(),
        diff: diffs.shift(),
        msg: msgs.shift(),
        time: new Date(times.shift()).getTime(),
      };
      // console.log("[PROCESS]", set, commit.sha);
      commitStream.write(`${JSON.stringify(commit)}\n`);
      total++;

      if (
        !repos.length &&
        !shas.length &&
        !diffs.length &&
        !msgs.length &&
        !times.length
      ) {
        console.log("[FINISHED] All", set, total);
      }
    }
  };

  // Une os dados do commit em um só arquivo
  readStreamLine(
    `${PATH}/${set}.repo.txt`,
    (repo) => {
      repos.push(repo);
      feed();
    },
    () => {
      flags.repos = true;
      feed();
      console.log("[FINISHED] Repos", set);
    }
  );

  readStreamLine(
    `${PATH}/${set}.sha.txt`,
    (sha) => {
      shas.push(sha);
      feed();
    },
    () => {
      flags.shas = true;
      feed();
      console.log("[FINISHED] Shas", set);
    }
  );

  selectRandomLinesFromFile(
    `${PATH}/${set}.diff.txt`,
    LIMITS[index],
    (lines) => {
      let diffIdx = 0;
      readStreamLine(
        `${PATH}/${set}.diff.txt`,
        (diff) => {
          let localIdx = diffIdx;
          diffIdx++;

          diffs.push(diff);
          feed();

          // Limita e escreve os diffs para treinamento do CoRec
          if (lines.includes(localIdx)) {
            writeDiffStream.write(`${diff}\n`);
          }
        },
        () => {
          flags.diffs = true;
          feed();
          console.log("[FINISHED] Diffs", set);
        }
      );

      let msgIdx = 0;
      readStreamLine(
        `${PATH}/${set}.msg.txt`,
        (msg) => {
          let localIdx = msgIdx;
          msgIdx++;

          msgs.push(msg);
          feed();

          // Limita e escreve as mensagens de commit para treinar o CoRec
          if (lines.includes(localIdx)) {
            writeMsgStream.write(`${msg}\n`);
          }
        },
        () => {
          flags.msgs = true;
          feed();
          console.log("[FINISHED] Msgs", set);
        }
      );
    }
  );

  readStreamLine(
    `${PATH}/${set}.time.txt`,
    (time) => {
      times.push(time);
      feed();
    },
    () => {
      flags.times = true;
      feed();
      console.log("[FINISHED] Times", set);
    }
  );
}

import fs from "fs";
import { gpt } from "../utils/gpt";
import {
  INFO,
  PROMPT,
  PROMPT_AUTHOR,
  PROMPT_FILE,
  PROMPT_FILE_AUTHOR,
} from "../utils/prompts";
import { readStreamLine } from "../utils/files";

const LANGUAGE = "javascript";
const TYPE = "test";

try {
  fs.mkdirSync(`output/gpt/${LANGUAGE}`, { recursive: true });
} catch (err) {}

const [
  [msgStream, authorMsgStream, fileMsgStream, authorFileMsgStream],
  refStream,
  infoStream,
  resultStream,
] = [
  [
    fs.createWriteStream(`output/gpt/${LANGUAGE}/${TYPE}.msg.txt`),
    fs.createWriteStream(`output/gpt/${LANGUAGE}/${TYPE}.author.msg.txt`),
    fs.createWriteStream(`output/gpt/${LANGUAGE}/${TYPE}.file.msg.txt`),
    fs.createWriteStream(`output/gpt/${LANGUAGE}/${TYPE}.author-file.msg.txt`),
  ],
  fs.createWriteStream(`output/gpt/${LANGUAGE}/${TYPE}.ref.msg.txt`),
  fs.createWriteStream(`output/gpt/${LANGUAGE}/${TYPE}.info.txt`),
  fs.createWriteStream(`output/gpt/${LANGUAGE}/${TYPE}.result.jsonl`),
];

const commits: any[] = [];

readStreamLine(
  `data/3-processed/${LANGUAGE}/${TYPE}.processed.jsonl`,
  (line) => {
    const commit = JSON.parse(line);
    commits.push(commit);
  },
  async () => {
    for (const commit of commits) {
      try {
        const [authorHistory, fileHistory, authorFileHistory] = [
          commit.authorHistory.join("\n"),
          commit.fileHistory.join("\n"),
          commit.authorFileHistory.join("\n"),
        ];

        const [msg, authorMsg, fileMsg, authorFileMsg] = [
          await gpt(PROMPT.replace("$diff", commit.diff)),
          await gpt(
            PROMPT_AUTHOR.replace("$diff", commit.diff).replace(
              "$history",
              authorHistory
            )
          ),
          await gpt(
            PROMPT_FILE.replace("$diff", commit.diff).replace(
              "$history",
              fileHistory
            )
          ),
          await gpt(
            PROMPT_FILE_AUTHOR.replace("$diff", commit.diff).replace(
              "$history",
              authorFileHistory
            )
          ),
        ];

        refStream.write(`${commit.msg.replace(/\n/g, "\\n")}\n`);
        msgStream.write(`${msg.replace(/\n/g, "\\n")}\n`);
        authorMsgStream.write(`${authorMsg.replace(/\n/g, "\\n")}\n`);
        fileMsgStream.write(`${fileMsg.replace(/\n/g, "\\n")}\n`);
        authorFileMsgStream.write(`${authorFileMsg.replace(/\n/g, "\\n")}\n`);
        infoStream.write(
          INFO.replace("$original", commit.msg.replace(/\n/g, "\\n"))
            .replace("$raw", msg.replace(/\n/g, "\\n"))
            .replace("$author", authorMsg.replace(/\n/g, "\\n"))
            .replace("$file", fileMsg.replace(/\n/g, "\\n"))
            .replace("$author-file", authorFileMsg.replace(/\n/g, "\\n"))
        );

        resultStream.write(
          `${JSON.stringify({
            original: commit.msg,
            msg,
            authorMsg,
            fileMsg,
            authorFileMsg,
          })}\n`
        );

        console.log("[PROCESSED] Sha:", commit.sha);
      } catch (err) {
        console.log("[ERROR] Tentando novamente em 30s");
        await new Promise((res) => {
          setTimeout(res, 60 * 1000);
        });
      }
    }
  }
);

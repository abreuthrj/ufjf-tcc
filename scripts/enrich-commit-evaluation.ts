import fs from "fs";
import { ContextCommit } from "./enrich-context-commits";
import { PROMPT_HISTORY, PROMPT_RAW } from "../constants";

let commits = JSON.parse(
  fs.readFileSync(`data/selected-commits.json`).toString()
) as ContextCommit[];

let totRaw = 0,
  totAuthor = 0,
  totFile = 0,
  totAuthorFile = 0;
commits.forEach((c) => {
  totRaw += PROMPT_RAW.replace("$diff", c.diff).length;
  totAuthor += PROMPT_HISTORY.replace("$diff", c.diff).replace(
    "$history",
    c.authorCommits.map((c) => c.message).join("\n")
  ).length;
  totFile += PROMPT_HISTORY.replace("$diff", c.diff).replace(
    "$history",
    c.fileCommits.map((c) => c.message).join("\n")
  ).length;
  totAuthorFile += PROMPT_HISTORY.replace("$diff", c.diff).replace(
    "$history",
    c.authorFileCommits.map((c) => c.message).join("\n")
  ).length;
});

console.log("Total of Commits:", commits.length);
console.log("Total of Tokens for Author Context:", totAuthor);
console.log("Total of Tokens for File Context:", totFile);
console.log("Total of Tokens for Author-File Context:", totAuthorFile);
console.log("Total of Tokens:", totAuthor + totFile + totAuthorFile);

// fs.writeFileSync(
//   `data/filtered-context-commits.json`,
//   JSON.stringify(commits, null, 2)
// );

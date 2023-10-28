import fs from "fs";

const CONTEXT_SIZE = 3;

let commits = JSON.parse(
  fs.readFileSync(`data/selected-commits.json`).toString()
) as any[];

commits = commits.filter(
  (c) =>
    c.authorCommits.length === CONTEXT_SIZE &&
    c.fileCommits.length === CONTEXT_SIZE &&
    c.authorFileCommits.length === CONTEXT_SIZE
);

const [totAuthor, totFile, totAuthorFile] = [
  commits.reduce(
    (prev, commit) =>
      prev +
      commit.diff.split(" ").length +
      commit.message.split(" ").length +
      commit.authorCommits
        .map((ac) => ac.message)
        .join("\n")
        .split(" ").length,
    0
  ),
  commits.reduce(
    (prev, commit) =>
      prev +
      commit.diff.split(" ").length +
      commit.message.split(" ").length +
      commit.fileCommits
        .map((fc) => fc.message)
        .join("\n")
        .split(" ").length,
    0
  ),
  commits.reduce(
    (prev, commit) =>
      prev +
      commit.diff.split(" ").length +
      commit.message.split(" ").length +
      commit.authorFileCommits
        .map((fc) => fc.message)
        .join("\n")
        .split(" ").length,
    0
  ),
];

console.log("Total of Commits:", commits.length);
console.log("Total of Tokens for Author Context:", totAuthor);
console.log("Total of Tokens for File Context:", totFile);
console.log("Total of Tokens for Author-File Context:", totAuthorFile);
console.log("Total of Tokens:", totAuthor + totFile + totAuthorFile);

// fs.writeFileSync(
//   `data/filtered-context-commits.json`,
//   JSON.stringify(commits, null, 2)
// );

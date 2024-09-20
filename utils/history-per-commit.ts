import { readStreamLine } from "./files";

let lineCount = 0;

let authorHistory = 0;
let fileHistory = 0;
let authorFileHistory = 0;

let perAuthor = {};
let perFile = {};
let perAuthorFile = {};

readStreamLine(
  "data/3-processed/javascript/test.processed.jsonl",
  (line) => {
    const obj = JSON.parse(line);

    lineCount++;

    authorHistory += obj.authorHistory.length;
    fileHistory += obj.fileHistory.length;
    authorFileHistory += obj.authorFileHistory.length;

    if (perAuthor[obj.authorHistory.length]) {
      perAuthor[obj.authorHistory.length]++;
    } else {
      perAuthor[obj.authorHistory.length] = 1;
    }
    if (perFile[obj.fileHistory.length]) {
      perFile[obj.fileHistory.length]++;
    } else {
      perFile[obj.fileHistory.length] = 1;
    }
    if (perAuthorFile[obj.authorFileHistory.length]) {
      perAuthorFile[obj.authorFileHistory.length]++;
    } else {
      perAuthorFile[obj.authorFileHistory.length] = 1;
    }
  },
  () => {
    console.log("LINES", lineCount);

    console.log("\nAVG Author", authorHistory / lineCount);
    console.log("AVG File", fileHistory / lineCount);
    console.log("AVG AuthorFile", authorFileHistory / lineCount);

    console.log("\nTOT Author", authorHistory);
    console.log("TOT File", fileHistory);
    console.log("TOT AuthorFile", authorFileHistory);

    console.log("\nTOT Author", perAuthor);
    console.log("TOT File", perFile);
    console.log("TOT AuthorFile", perAuthorFile);
  }
);

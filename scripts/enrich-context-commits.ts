import fs from "fs";
import { getFiles } from "../utils/files";
import { SAMPLES_DIR } from "../constants";
import { Commit } from "../types/commit";

const CONTEXT_SIZE = 3;
const BATCH_SIZE = 5000;
const OUTPUT_DIR = "data/context-commits";

export interface ShortCommit {
  diff: string;
  message: string;
}

export interface ContextCommit extends Partial<Commit> {
  file: string;
  diff: string;
  authorCommits: ShortCommit[];
  fileCommits: ShortCommit[];
  authorFileCommits: ShortCommit[];
}

for (const file of getFiles(OUTPUT_DIR)) {
  fs.rmSync(`${OUTPUT_DIR}/${file.name}`, { force: true, recursive: true });
}

let permIndex = 0;
for (const batchFile of getFiles()) {
  let commits = Object.values(
    JSON.parse(
      fs.readFileSync(`${SAMPLES_DIR}/${batchFile.name}`).toString()
    ) as Record<string, ContextCommit>
  );

  commits = commits.map((commit) => ({
    hash: commit.hash,
    timestamp: commit.timestamp,
    author: commit.author,
    file: commit.mods[0].old_path,
    diff: commit.mods[0].diff,
    message: commit.original_message,
    repo: commit.repo,
    authorCommits: [],
    fileCommits: [],
    authorFileCommits: [],
  }));

  console.log("Enriquecendo Commits do Autor");
  let missingAuthorCommits = commits.filter(
    (c) => c.authorCommits.length < CONTEXT_SIZE
  );
  // for (const file of getFiles()) {
  //   missingAuthorCommits = missingAuthorCommits.filter(
  //     (c) => c.authorCommits.length < CONTEXT_SIZE
  //   );

  //   if (
  //     !missingAuthorCommits.length ||
  //     commits.length - missingAuthorCommits.length >= ENOUGH_COMMITS
  //   ) {
  //     break;
  //   }

  //   console.log(
  //     "Commits sem contexto:",
  //     missingAuthorCommits.length,
  //     "; Lendo arquivo:",
  //     file.name
  //   );

  const authorCommits = JSON.parse(
    fs.readFileSync(`data/split-by-author/${batchFile.name}`).toString()
  ) as Record<string, Commit[]>;

  missingAuthorCommits.forEach((commit) => {
    const authorCommit = authorCommits[commit.author];

    if (authorCommit) {
      commit.authorCommits.push(
        ...authorCommit
          .filter(
            (c) => c.hash !== commit.hash && c.timestamp < commit.timestamp
          )
          .slice(0, CONTEXT_SIZE)
          .map((commit) => ({
            diff: commit.mods[0].diff,
            message: commit.original_message,
          }))
      );
    }
  });
  // }

  console.log("Enriquecendo Contexto do Arquivo");
  let missingFileCommits = commits.filter(
    (c) => c.fileCommits.length < CONTEXT_SIZE
  );
  // for (const file of getFiles("data/split-by-file")) {
  //   missingFileCommits = missingFileCommits.filter(
  //     (c) => c.fileCommits.length < CONTEXT_SIZE
  //   );

  //   if (
  //     !missingFileCommits.length ||
  //     commits.length - missingFileCommits.length >= ENOUGH_COMMITS
  //   ) {
  //     break;
  //   }

  //   console.log(
  //     "Commits sem contexto:",
  //     missingFileCommits.length,
  //     "; Lendo arquivo:",
  //     file.name
  //   );

  const fileCommits = JSON.parse(
    fs.readFileSync(`data/split-by-file/${batchFile.name}`).toString()
  ) as Record<string, Commit[]>;

  missingFileCommits.forEach((commit) => {
    let repofilename = `${commit.repo}:${commit.file}`;
    const fileCommit = fileCommits[repofilename];

    if (fileCommit) {
      commit.fileCommits.push(
        ...fileCommit
          .filter(
            (c) => c.hash !== commit.hash && c.timestamp < commit.timestamp
          )
          .slice(0, CONTEXT_SIZE)
          .map((c) => ({
            diff: c.mods[0].diff,
            message: c.original_message,
          }))
      );
    }
  });
  // }

  console.log("Enriquecendo Commits do Autor e Arquivo");
  let missingAuthorFileCommits = commits.filter(
    (c) => c.authorFileCommits.length < CONTEXT_SIZE
  );
  // for (const file of getFiles("data/split-by-author_file")) {
  //   missingAuthorFileCommits = missingAuthorFileCommits.filter(
  //     (c) => c.authorFileCommits.length < CONTEXT_SIZE
  //   );

  //   if (
  //     !missingAuthorFileCommits.length ||
  //     commits.length - missingAuthorFileCommits.length >= ENOUGH_COMMITS
  //   ) {
  //     break;
  //   }

  //   console.log(
  //     "Commits sem contexto:",
  //     missingAuthorFileCommits.length,
  //     "; Lendo arquivo:",
  //     file.name
  //   );

  const authorFileCommits = JSON.parse(
    fs.readFileSync(`data/split-by-author_file/${batchFile.name}`).toString()
  );

  missingAuthorFileCommits.forEach((commit) => {
    let repofilename = `${commit.file}:${commit.author}`;
    const authorFileCommit = authorFileCommits[repofilename];

    if (authorFileCommit) {
      commit.authorFileCommits.push(
        ...authorFileCommit
          .filter(
            (c) => c.hash !== commit.hash && c.timestamp < commit.timestamp
          )
          .slice(0, CONTEXT_SIZE)
          .map((c) => ({
            diff: c.mods[0].diff,
            message: c.original_message,
          }))
      );
    }
  });
  // }

  console.log(
    "Commits com contexto de Autor incompletos:",
    commits.filter((c) => c.authorCommits.length < CONTEXT_SIZE).length
  );
  console.log(
    "Commits com contexto de Arquivo incompletos:",
    commits.filter((c) => c.fileCommits.length < CONTEXT_SIZE).length
  );
  console.log(
    "Commits com contexto de Autor e Arquivo incompletos:",
    commits.filter((c) => c.authorFileCommits.length < CONTEXT_SIZE).length
  );
  console.log(
    "Commits sem Contexto de Autor:",
    commits.filter((c) => !c.authorCommits.length).length
  );
  console.log(
    "Commits sem Contexto de Arquivo:",
    commits.filter((c) => !c.fileCommits.length).length
  );
  console.log(
    "Commits sem Contexto de Autor e Arquivo:",
    commits.filter((c) => !c.authorFileCommits.length).length
  );

  let filtered = commits.filter(
    (c) =>
      c.authorCommits.length === CONTEXT_SIZE &&
      c.fileCommits.length === CONTEXT_SIZE &&
      c.authorFileCommits.length === CONTEXT_SIZE
  );
  console.log("Commits com contexto:", filtered.length);

  const toIndex = Math.min(filtered.length, BATCH_SIZE) - 1;

  fs.writeFileSync(
    `${OUTPUT_DIR}/from_${permIndex}_${permIndex + toIndex}.json`,
    JSON.stringify(filtered.slice(0, BATCH_SIZE))
  );

  permIndex += toIndex + 1;
}

import fs from "fs";
import { getFiles } from "../utils/files";
import { SAMPLES_DIR } from "../constants";
import { Commit } from "../commit.interface";

const CONTEXT_SIZE = 5;

export interface ShortCommit {
  hash: string;
  timestamp: number;
}

export interface ContextCommit extends Partial<Commit> {
  authorCommits: ShortCommit[];
  fileCommits: ShortCommit[];
  authorFileCommits: ShortCommit[];
}

for (const batchFile of getFiles()) {
  let commits = Object.values(
    JSON.parse(
      fs.readFileSync(`${SAMPLES_DIR}/${batchFile.name}`).toString()
    ) as Record<string, ContextCommit>
  );

  // Object.keys(commits).forEach((hash) => {
  //   const commit = commits[hash];

  //   commits[hash] = {
  //     hash: commit.hash,
  //     timestamp: commit.timestamp,
  //     author: commit.author,
  //     mods: commit.mods,
  //     message: commit.original_message,
  //     repo: commit.repo,
  //     authorCommits: [],
  //     fileCommits: [],
  //     authorFileCommits: [],
  //   };
  // });

  console.log("Enriching Author Context");
  let missingAuthorCommits = commits.filter(
    (c) => c.authorCommits.length < CONTEXT_SIZE
  );
  for (const file of getFiles()) {
    missingAuthorCommits = missingAuthorCommits.filter(
      (c) => c.authorCommits.length < CONTEXT_SIZE
    );

    if (!missingAuthorCommits.length) {
      break;
    }

    console.log(
      "Commits remaining:",
      missingAuthorCommits.length,
      "; In file:",
      file.name
    );

    const authorCommits = JSON.parse(
      fs.readFileSync(`data/split-by-author/${file.name}`).toString()
    ) as Record<string, ShortCommit[]>;

    missingAuthorCommits.forEach((commit) => {
      const authorCommit = authorCommits[commit.author];

      if (authorCommit) {
        commit.authorCommits.push(
          ...authorCommit
            .filter(
              (c) => c.hash !== commit.hash && c.timestamp < commit.timestamp
            )
            .slice(0, CONTEXT_SIZE)
        );
      }
    });
  }

  console.log("Enriching File Context");
  let missingFileCommits = commits.filter(
    (c) => c.fileCommits.length < CONTEXT_SIZE
  );
  for (const file of getFiles("data/split-by-file")) {
    missingFileCommits = missingFileCommits.filter(
      (c) => c.fileCommits.length < CONTEXT_SIZE
    );

    if (!missingFileCommits.length) {
      break;
    }

    console.log(
      "Commits remaining:",
      missingFileCommits.length,
      "; In file:",
      file.name
    );

    const a_commits = JSON.parse(
      fs.readFileSync(`data/split-by-file/${file.name}`).toString()
    );

    missingFileCommits.forEach((commit) => {
      let repofilename = `${commit.repo}:${commit.file}`;
      const fileCommit = a_commits[repofilename];

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
  }

  console.log("Enriching Author-File Context");
  for (const file of getFiles("data/split-by-author_file")) {
    const missingAuthorFileCommits = commits.filter(
      (c) => c.authorFileCommits.length < CONTEXT_SIZE
    );

    if (!missingAuthorFileCommits.length) {
      break;
    }

    console.log(
      "Commits remaining:",
      missingAuthorFileCommits.length,
      "; In file:",
      file.name
    );

    const a_commits = JSON.parse(
      fs.readFileSync(`data/split-by-author_file/${file.name}`).toString()
    );

    missingAuthorFileCommits.forEach((commit) => {
      let repofilename = `${commit.file}:${commit.author}`;
      const authorFileCommit = a_commits[repofilename];

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
  }

  console.log(
    "Commits with Incomplete Author Context :",
    commits.filter((c) => c.authorCommits.length < CONTEXT_SIZE).length
  );
  console.log(
    "Commits with Incomplete File Context:",
    commits.filter((c) => c.fileCommits.length < CONTEXT_SIZE).length
  );
  console.log(
    "Commits with Incomplete Author-File Context:",
    commits.filter((c) => c.authorFileCommits.length < CONTEXT_SIZE).length
  );
  console.log(
    "Commits with Zero Author Context:",
    commits.filter((c) => !c.authorCommits.length).length
  );
  console.log(
    "Commits with Zero File Context:",
    commits.filter((c) => !c.fileCommits.length).length
  );
  console.log(
    "Commits with Zero Author-File Context:",
    commits.filter((c) => !c.authorFileCommits.length).length
  );

  let filtered = commits.filter(
    (c) =>
      c.authorCommits.length === CONTEXT_SIZE &&
      c.fileCommits.length === CONTEXT_SIZE &&
      c.authorFileCommits.length === CONTEXT_SIZE
  );
  console.log("Commits With Context:", filtered.length);

  fs.writeFileSync(
    `data/context-commits/${batchFile.name}`,
    JSON.stringify(filtered, null, 2)
  );
}

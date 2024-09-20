import { readStreamLine } from "./files";

const LANGUAGE = "javascript";
const TYPE = "test";

let tokens = 0;
let lines = 0;
readStreamLine(
  `data/3-processed/${LANGUAGE}/${TYPE}.msg.txt`,
  (line) => {
    tokens += line.split(" ").length;
    lines++;
  },
  () => {
    console.log("Total de tokens:", tokens);
    console.log("Total de linhas:", lines);
    console.log(
      "Média token/mensagem:",
      parseFloat((tokens / lines).toFixed(2))
    );
  }
);

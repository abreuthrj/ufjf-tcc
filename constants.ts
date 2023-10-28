export const PROMPT_RAW = `Given the following output from git diff, write a commit message:

$diff`;

export const PROMPT_RAW_FILENAME = `Given the following output from git diff of a file called $filename, write a commit message:

$diff`;

export const PROMPT_HISTORY = `Given the following output from git diff, write a commit message:

$diff

Consider the following examples as template:

$history`;

export const TEST_FORMAT = `Input:
$input

Output:
$output

Original:
$original

-------------------------------------------

`;

export const SAMPLES_DIR = "data/batches";

export const BATCH_SIZE = 40000;

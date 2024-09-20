export const PROMPT = `Write a one-line commit message for the diff:
$diff`;

export const PROMPT_AUTHOR = `Write a one-line commit message for the diff:
$diff

Previous commit messages of the author:
$history`;

export const PROMPT_FILE = `Write a one-line commit message for the diff:
$diff

Previous commit messages of the file:
$history`;

export const PROMPT_FILE_AUTHOR = `Write a one-line commit message for the diff:
$diff

Previous commit messages of the author in the file(s):
$history`;

export const INFO = `Original:
$original

Raw:
$raw

Author:
$author

File:
$file

Author-file:
$author-file

-------------------------------------------

`;

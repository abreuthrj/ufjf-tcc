export interface Mod {
  change_type: string;
  old_path: string | null;
  new_path: string | null;
  diff: string;
}

export interface Commit {
  author: number;
  date: string;
  timezone: number;
  hash: string;
  message: string;
  mods: Mod[];
  language: string;
  license: string;
  repo: string;
  original_message: string;
  timestamp?: number;
}

export const removeEOL = (str: string): string => {
  return str.replace(/\n/g, "\\n");
};

export const addEOL = (str: string) => `${str}\n`;

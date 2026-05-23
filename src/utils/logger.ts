const DEBUG = __DEV__;

export const logger = {
  log: (tag: string, ...args: unknown[]) => {
    if (DEBUG) console.log(`[${tag}]`, ...args);
  },
  warn: (tag: string, ...args: unknown[]) => {
    if (DEBUG) console.warn(`[${tag}]`, ...args);
  },
  error: (tag: string, ...args: unknown[]) => {
    console.error(`[${tag}]`, ...args);
  },
};

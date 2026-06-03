import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

/**
 * Persisted user preferences written by `recall setup` and read by `recall start`.
 *
 * Stored at ~/.recall/config.json so the daemon honours the choices the user
 * made during setup (auto-start, tray icon, scheduler, notifications) without
 * having to re-prompt.
 */
export interface RecallConfig {
  /** Start Recall automatically with the OS. */
  autoStart: boolean;
  /** Fire native OS notifications for upcoming renewals. */
  notifications: boolean;
  /** Opt the user into email reminders (requires Cloud). */
  emailReminders: boolean;
  /** Show the system tray icon while the daemon is running. */
  tray: boolean;
  /** Port the local backend binds to. */
  backendPort: number;
  /** Port the Vite webapp is served from by `recall web`. */
  webPort: number;
  /** ISO timestamp of the last completed setup wizard. */
  setupCompletedAt?: string;
}

export const DEFAULT_CONFIG: RecallConfig = {
  autoStart: true,
  notifications: true,
  emailReminders: false,
  tray: true,
  backendPort: 21121,
  webPort: 21120,
};

const CONFIG_DIR = path.join(os.homedir(), '.recall');
const CONFIG_PATH = path.join(CONFIG_DIR, 'config.json');

export function getConfigDir(): string {
  return CONFIG_DIR;
}

export function getConfigPath(): string {
  return CONFIG_PATH;
}

/** Read the persisted config, merging with defaults, or return defaults if absent. */
export function loadConfig(): RecallConfig {
  if (!fs.existsSync(CONFIG_PATH)) {
    return { ...DEFAULT_CONFIG };
  }
  try {
    const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<RecallConfig>;
    return { ...DEFAULT_CONFIG, ...parsed };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

/** Persist a partial update on top of the current config. Creates the dir if needed. */
export function saveConfig(partial: Partial<RecallConfig>): RecallConfig {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
  const next: RecallConfig = { ...loadConfig(), ...partial };
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(next, null, 2), 'utf-8');
  return next;
}

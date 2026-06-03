import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';
import schedule from 'node-schedule';
import notifier from 'node-notifier';
import { initTray, killTray } from './tray.js';
import { loadConfig } from './config.js';

let daemonProcess: ChildProcess | null = null;
let schedulerJob: schedule.Job | null = null;
const PID_FILE = path.join(os.tmpdir(), 'recall-daemon.pid');

/**
 * Checks for upcoming subscriptions and triggers a native OS notification.
 * The backend API is served by the daemon itself on config.backendPort.
 */
async function checkForReminders(port: number): Promise<void> {
  try {
    const response = await fetch(
      `http://localhost:${port}/api/subscriptions?upcoming=3`,
    );
    if (!response.ok) return;

    const { subscriptions } = await response.json();

    for (const sub of subscriptions) {
      notifier.notify({
        title: 'Recall: Upcoming Renewal',
        message: `${sub.name} will renew for $${sub.amount} on ${sub.nextRenewalDate}.`,
        sound: true,
        wait: false,
      });
    }
  } catch (error) {
    console.error('Failed to check reminders:', error);
  }
}

export async function startDaemon(): Promise<void> {
  const config = loadConfig();

  if (fs.existsSync(PID_FILE)) {
    const pid = parseInt(fs.readFileSync(PID_FILE, 'utf-8'), 10);
    try {
      process.kill(pid, 0);
      console.log('Recall daemon is already running.');
      return;
    } catch {
      fs.unlinkSync(PID_FILE);
    }
  }

  console.log('Starting Recall background services...');

  if (config.tray) {
    await initTray();
  } else {
    console.log('System tray disabled in config.');
  }

  const backendPath = path.join(process.cwd(), 'backend');
  daemonProcess = spawn('npm', ['run', 'start'], {
    cwd: backendPath,
    detached: true,
    stdio: 'ignore',
  });
  daemonProcess.unref();

  if (daemonProcess.pid) {
    fs.writeFileSync(PID_FILE, daemonProcess.pid.toString());
    console.log(`Backend daemon started with PID: ${daemonProcess.pid}`);
  }

  if (config.notifications) {
    schedulerJob = schedule.scheduleJob('0 9 * * *', () => {
      checkForReminders(config.backendPort);
    });
    console.log('Reminder scheduler active (Daily at 9:00 AM).');
  } else {
    console.log('Native notifications disabled in config.');
  }

  console.log(
    'Daemon is now running in the background. Use `recall stop` to shut down.',
  );
}

export async function stopDaemon(): Promise<void> {
  // 1. Kill scheduler
  if (schedulerJob) {
    schedule.cancelJob(schedulerJob);
  }

  // 2. Kill tray
  killTray();

  // 3. Kill backend process
  if (fs.existsSync(PID_FILE)) {
    const pid = parseInt(fs.readFileSync(PID_FILE, 'utf-8'), 10);
    try {
      if (os.platform() === 'win32') {
        const { exec } = await import('child_process');
        const { promisify } = await import('util');
        const execAsync = promisify(exec);
        await execAsync(`taskkill /PID ${pid} /F /T`);
      } else {
        process.kill(pid, 'SIGTERM');
      }
      fs.unlinkSync(PID_FILE);
      console.log('Daemon stopped successfully.');
    } catch (e) {
      console.log('Daemon was not running or already stopped.');
      if (fs.existsSync(PID_FILE)) fs.unlinkSync(PID_FILE);
    }
  } else {
    console.log('No daemon PID file found.');
  }
}
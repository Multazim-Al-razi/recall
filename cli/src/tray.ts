import { stopDaemon } from './daemon.js';
import { exec } from 'child_process';
import os from 'os';

let tray: any = null;

export async function initTray(): Promise<void> {
  try {
    const systrayModule: any = await import('systray2');
    const SysTray = systrayModule.default ?? systrayModule;
    tray = new SysTray({
      menu: {
        icon: '', // Path to a small .ico or .png file (optional)
        title: 'Recall',
        tooltip: 'Recall Subscription Tracker',
        items: [
          {
            title: 'Open Dashboard',
            tooltip: 'Open the Recall web interface',
            checked: false,
            enabled: true,
          },
          {
            title: 'Quit',
            tooltip: 'Exit Recall',
            checked: false,
            enabled: true,
          }
        ]
      },
      copyDir: true,
      debug: false,
    });

    tray.onClick(async (action: any) => {
      if (action.item.title === 'Quit') {
        await stopDaemon();
        tray.kill();
        process.exit(0);
      } else if (action.item.title === 'Open Dashboard') {
        const openCommand = os.platform() === 'win32' ? 'start' : os.platform() === 'darwin' ? 'open' : 'xdg-open';
        exec(`${openCommand} http://localhost:21120`);
      }
    });

    console.log('System tray initialized.');
  } catch (error) {
    console.warn('Failed to initialize system tray. Running in headless background mode.', error);
  }
}

export function killTray(): void {
  if (tray) {
    tray.kill();
  }
}
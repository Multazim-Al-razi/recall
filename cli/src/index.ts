#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { select } from '@inquirer/prompts';
import checkbox from '@inquirer/checkbox';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { enableAutoStartup, disableAutoStartup } from './autostart.js';
import { startDaemon, stopDaemon } from './daemon.js';
import { launchWebapp } from './web.js';
import {
  DEFAULT_CONFIG,
  loadConfig,
  saveConfig,
  getConfigPath,
  type RecallConfig,
} from './config.js';

type SetupPath = 'web' | 'cli' | 'both';
type OptionKey = 'autoStart' | 'notifications' | 'emailReminders' | 'tray';
type LaunchAction = 'web' | 'daemon' | 'later';

const program = new Command();

program
  .name('recall')
  .description('Recall CLI — track subscriptions from the terminal')
  .version('1.1.0');

program
  .command('setup')
  .description('Run the interactive setup wizard')
  .action(async () => {
    console.log(chalk.hex('#d64f33').bold('\n  Recall Setup'));
    console.log(chalk.gray('  Configure how Recall runs on your machine.\n'));

    // 1. Path picker
    const setupPath = await select<SetupPath>({
      message: 'How do you want to run Recall?',
      choices: [
        {
          name: 'Web app — open Recall in the browser',
          value: 'web',
          description: 'The local Vite build, served on localhost.',
        },
        {
          name: 'CLI companion — background daemon only',
          value: 'cli',
          description: 'Native OS notifications, no browser required.',
        },
        {
          name: 'Both — web app and background daemon',
          value: 'both',
          description: 'Open Recall in a browser and keep reminders running.',
        },
      ],
    });

    // 2. Options checklist (spacebar toggles, Enter confirms)
    const optionChoices = (path: SetupPath) => {
      const defaults = DEFAULT_CONFIG;
      const base = [
        {
          name: 'Start automatically with my OS',
          value: 'autoStart' as OptionKey,
          checked: defaults.autoStart,
          description: 'Registers Recall with launchd / systemd / Windows Run key.',
        },
        {
          name: 'Native OS notifications for renewals',
          value: 'notifications' as OptionKey,
          checked: defaults.notifications,
          description: 'Fires a desktop alert before each upcoming renewal.',
        },
        {
          name: 'Enable system tray icon',
          value: 'tray' as OptionKey,
          checked: defaults.tray,
          description: 'Quick access to the dashboard and a Quit action.',
        },
      ];
      if (path !== 'cli') {
        base.push({
          name: 'Email reminders (requires Cloud — set up later)',
          value: 'emailReminders' as OptionKey,
          checked: defaults.emailReminders,
          description: 'Adds renewal nudges to your inbox on top of in-app alerts.',
        });
      }
      return base;
    };

    const selectedOptions = await checkbox<OptionKey>({
      message: 'Toggle features (spacebar to select, Enter to confirm)',
      choices: optionChoices(setupPath),
      required: false,
    });

    const enabled = (key: OptionKey) => selectedOptions.includes(key);

    // 3. Apply selections
    const updates: Partial<RecallConfig> = {
      autoStart: enabled('autoStart'),
      notifications: enabled('notifications'),
      emailReminders: enabled('emailReminders'),
      tray: enabled('tray'),
      setupCompletedAt: new Date().toISOString(),
    };
    saveConfig(updates);
    console.log(chalk.gray(`\n  Config written to ${getConfigPath()}`));

    if (updates.autoStart) {
      const ok = await enableAutoStartup();
      if (ok) {
        console.log(chalk.green('  ✓ Auto-startup enabled'));
      } else {
        console.log(
          chalk.yellow('  ⚠ Auto-startup could not be enabled — retry as admin.'),
        );
      }
    }

    // 4. Launch action
    const launch = await select<LaunchAction>({
      message: 'What do you want to do next?',
      choices: [
        ...(setupPath !== 'cli'
          ? [
              {
                name: 'Run the webapp now',
                value: 'web' as LaunchAction,
                description: 'Opens Recall in your browser and keeps this process alive.',
              },
            ]
          : []),
        {
          name: 'Start the daemon in the background',
          value: 'daemon' as LaunchAction,
          description: 'Spawns the background services and exits.',
        },
        {
          name: "I'll start it later",
          value: 'later' as LaunchAction,
          description: 'Exit. Run `recall start` or `recall web` whenever you are ready.',
        },
      ],
    });

    if (launch === 'web') {
      await launchWebapp(loadConfig().webPort);
      return;
    }
    if (launch === 'daemon') {
      await startDaemon();
      console.log(chalk.green('\n  ✓ Recall daemon running. Happy tracking.\n'));
      return;
    }

    console.log(chalk.gray('\n  All set. Run `recall start` or `recall web` when ready.\n'));
  });

program
  .command('web')
  .description('Launch the Recall webapp in the default browser')
  .option('-p, --port <port>', 'port to serve on', String)
  .action(async (opts: { port?: string }) => {
    const config = loadConfig();
    const port = opts.port ? Number.parseInt(opts.port, 10) : config.webPort;
    await launchWebapp(port);
  });

program
  .command('start')
  .description('Start the Recall background daemon')
  .action(async () => {
    console.log(chalk.blue('  Starting Recall daemon...'));
    await startDaemon();
  });

program
  .command('stop')
  .description('Stop the Recall background daemon')
  .action(async () => {
    console.log(chalk.yellow('  Stopping Recall daemon...'));
    await stopDaemon();
  });

program
  .command('disable-autostart')
  .description('Stop Recall from starting automatically with the OS')
  .action(async () => {
    console.log(chalk.yellow('  Disabling auto-startup...'));
    const success = await disableAutoStartup();
    if (success) {
      saveConfig({ autoStart: false });
      console.log(chalk.green('  ✓ Auto-startup disabled'));
    } else {
      console.log(chalk.red('  ✗ Failed to disable auto-startup'));
    }
  });

program
  .command('status')
  .description('Show whether the daemon and scheduler are running')
  .action(() => {
    const pidFile = path.join(os.tmpdir(), 'recall-daemon.pid');
    let running = false;
    let pid: number | null = null;
    if (fs.existsSync(pidFile)) {
      pid = parseInt(fs.readFileSync(pidFile, 'utf-8'), 10);
      try {
        process.kill(pid, 0);
        running = true;
      } catch {
        fs.unlinkSync(pidFile);
      }
    }
    const config = loadConfig();

    console.log(chalk.hex('#d64f33').bold('\n  Recall Status'));
    console.log(
      `  Daemon:        ${
        running ? chalk.green(`running (PID ${pid})`) : chalk.gray('stopped')
      }`,
    );
    console.log(
      `  Scheduler:     ${
        running && config.notifications
          ? chalk.green('active (daily 9:00 AM)')
          : chalk.gray('inactive')
      }`,
    );
    console.log(
      `  Auto-startup:  ${
        config.autoStart ? chalk.green('enabled') : chalk.gray('disabled')
      }`,
    );
    console.log(
      `  System tray:   ${
        config.tray ? chalk.green('enabled') : chalk.gray('disabled')
      }`,
    );
    console.log(
      `  Backend port:  ${config.backendPort}`,
    );
    console.log(
      `  Webapp port:   ${config.webPort}`,
    );
    console.log('');
  });

program
  .command('config')
  .description('Print the resolved ~/.recall/config.json')
  .action(() => {
    console.log(chalk.gray(`  # ${getConfigPath()}`));
    console.log(JSON.stringify(loadConfig(), null, 2));
  });

program.parse(process.argv);

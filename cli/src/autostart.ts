import { spawn } from 'child_process';
import { promisify } from 'util';
import { exec } from 'child_process';
import path from 'path';
import os from 'os';
import fs from 'fs';

const execAsync = promisify(exec);

const APP_NAME = 'Recall';
const CLI_EXECUTABLE = 'recall';

export async function enableAutoStartup(): Promise<boolean> {
  const platform = os.platform();

  try {
    if (platform === 'win32') {
      // Windows: Add to Registry Run key using reg.exe with separate args.
      const regKey = 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run';
      const vbsPath = path.join(os.homedir(), '.recall', 'hide.vbs');
      const vbsContent = 'CreateObject("Wscript.Shell").Run """" & WScript.Arguments(0) & """", 0, False';

      // Ensure ~/.recall dir exists
      if (!fs.existsSync(path.join(os.homedir(), '.recall'))) {
        fs.mkdirSync(path.join(os.homedir(), '.recall'), { recursive: true });
      }

      if (!fs.existsSync(vbsPath)) {
        fs.writeFileSync(vbsPath, vbsContent);
      }

      // Use spawn with separate args to prevent injection via cwd or paths
      const regArgs = [
        'add', regKey,
        '/v', APP_NAME,
        '/t', 'REG_SZ',
        '/d', `wscript.exe //B //Nologo "${vbsPath}" "${CLI_EXECUTABLE} start"`,
        '/f',
      ];
      const child = spawn('reg', regArgs, { stdio: 'ignore' });
      await new Promise<void>((resolve, reject) => {
        child.on('exit', (code) => code === 0 ? resolve() : reject(new Error(`reg exited with code ${code}`)));
        child.on('error', reject);
      });
      return true;
    }

    if (platform === 'darwin') {
      // macOS: Create launchd plist in ~/Library/LaunchAgents/
      const plistDir = path.join(os.homedir(), 'Library', 'LaunchAgents');
      if (!fs.existsSync(plistDir)) {
        fs.mkdirSync(plistDir, { recursive: true });
      }
      const plistPath = path.join(plistDir, `com.recall.app.plist`);
      const plistContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.recall.app</string>
  <key>ProgramArguments</key>
  <array>
    <string>/usr/local/bin/${CLI_EXECUTABLE}</string>
    <string>start</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
  <key>StandardOutPath</key>
  <string>/tmp/recall.out.log</string>
  <key>StandardErrorPath</key>
  <string>/tmp/recall.err.log</string>
</dict>
</plist>`;
      fs.writeFileSync(plistPath, plistContent);

      // Load the plist using spawn with separate args
      const child = spawn('launchctl', ['load', plistPath], { stdio: 'ignore' });
      await new Promise<void>((resolve, reject) => {
        child.on('exit', (code) => code === 0 ? resolve() : reject(new Error(`launchctl exited with code ${code}`)));
        child.on('error', reject);
      });
      return true;
    }

    if (platform === 'linux') {
      // Linux: Create systemd user service
      const systemdDir = path.join(os.homedir(), '.config', 'systemd', 'user');
      if (!fs.existsSync(systemdDir)) {
        fs.mkdirSync(systemdDir, { recursive: true });
      }
      const servicePath = path.join(systemdDir, 'recall.service');
      const serviceContent = `[Unit]
Description=Recall Local Companion Daemon
After=network.target

[Service]
ExecStart=/usr/bin/env ${CLI_EXECUTABLE} start
Restart=always
RestartSec=10

[Install]
WantedBy=default.target`;
      fs.writeFileSync(servicePath, serviceContent);

      // Use spawn for each systemctl command with separate args
      const cmds = [
        ['daemon-reload'],
        ['enable', 'recall.service'],
        ['start', 'recall.service'],
      ];
      for (const args of cmds) {
        const child = spawn('systemctl', ['--user', ...args], { stdio: 'ignore' });
        await new Promise<void>((resolve, reject) => {
          child.on('exit', (code) => code === 0 ? resolve() : reject(new Error(`systemctl --user ${args.join(' ')} exited with code ${code}`)));
          child.on('error', reject);
        });
      }
      return true;
    }
  } catch (error) {
    console.error('Error enabling auto-startup:', error);
    return false;
  }

  return false;
}

export async function disableAutoStartup(): Promise<boolean> {
  const platform = os.platform();

  try {
    if (platform === 'win32') {
      const regKey = 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run';
      const child = spawn('reg', ['delete', regKey, '/v', APP_NAME, '/f'], { stdio: 'ignore' });
      await new Promise<void>((resolve, reject) => {
        child.on('exit', (code) => code === 0 ? resolve() : reject(new Error(`reg delete exited with code ${code}`)));
        child.on('error', reject);
      });
      return true;
    }

    if (platform === 'darwin') {
      const plistPath = path.join(os.homedir(), 'Library', 'LaunchAgents', `com.recall.app.plist`);
      if (fs.existsSync(plistPath)) {
        const child = spawn('launchctl', ['unload', plistPath], { stdio: 'ignore' });
        await new Promise<void>((resolve, reject) => {
          child.on('exit', (code) => code === 0 ? resolve() : reject(new Error(`launchctl unload exited with code ${code}`)));
          child.on('error', reject);
        });
        fs.unlinkSync(plistPath);
      }
      return true;
    }

    if (platform === 'linux') {
      const cmds = [
        ['stop', 'recall.service'],
        ['disable', 'recall.service'],
      ];
      for (const args of cmds) {
        const child = spawn('systemctl', ['--user', ...args], { stdio: 'ignore' });
        await new Promise<void>((resolve) => {
          child.on('exit', () => resolve());
          child.on('error', () => resolve());
        });
      }
      return true;
    }
  } catch (error) {
    console.error('Error disabling auto-startup:', error);
    return false;
  }

  return false;
}
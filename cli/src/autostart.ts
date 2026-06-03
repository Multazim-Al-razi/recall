import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import os from 'os';
import fs from 'fs';

const execAsync = promisify(exec);

const APP_NAME = 'Recall';
// Path to the global npm bin or the local dist index.js
// For a globally installed package, we can use the current script's path or a known command.
const CLI_EXECUTABLE = 'recall'; 

export async function enableAutoStartup(): Promise<boolean> {
  const platform = os.platform();

  try {
    if (platform === 'win32') {
      // Windows: Add to Registry Run key
      const regKey = 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run';
      // Use a hidden window style (0) to run without a console popup
      const command = `reg add "${regKey}" /v "${APP_NAME}" /t REG_SZ /d "wscript.exe //B //Nologo \\"${path.join(process.cwd(), 'cli', 'hide.vbs')}\\" \\"${CLI_EXECUTABLE} start\\"" /f`;
      await execAsync(command);
      
      // Create the hidden vbs wrapper if it doesn't exist
      const vbsPath = path.join(process.cwd(), 'cli', 'hide.vbs');
      if (!fs.existsSync(vbsPath)) {
        const vbsContent = 'CreateObject("Wscript.Shell").Run """" & WScript.Arguments(0) & """", 0, False';
        fs.writeFileSync(vbsPath, vbsContent);
      }
      return true;
    } 
    
    if (platform === 'darwin') {
      // macOS: Create launchd plist
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
      
      // Load the plist
      await execAsync(`launchctl load "${plistPath}"`);
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
      
      // Reload systemd and enable
      await execAsync('systemctl --user daemon-reload');
      await execAsync('systemctl --user enable recall.service');
      await execAsync('systemctl --user start recall.service');
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
      await execAsync(`reg delete "${regKey}" /v "${APP_NAME}" /f`);
      return true;
    } 
    
    if (platform === 'darwin') {
      const plistPath = path.join(os.homedir(), 'Library', 'LaunchAgents', `com.recall.app.plist`);
      if (fs.existsSync(plistPath)) {
        await execAsync(`launchctl unload "${plistPath}"`);
        fs.unlinkSync(plistPath);
      }
      return true;
    } 
    
    if (platform === 'linux') {
      await execAsync('systemctl --user stop recall.service');
      await execAsync('systemctl --user disable recall.service');
      return true;
    }
  } catch (error) {
    console.error('Error disabling auto-startup:', error);
    return false;
  }

  return false;
}
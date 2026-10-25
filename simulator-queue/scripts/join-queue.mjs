// Copy beside a project's native launcher, then await joinQueue(app, repoRoot).
// The supervisor owns the lease for the entire launcher lifetime, including cleanup.
import { spawn, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

export async function joinQueue(app, worktree) {
  const runtime = join(homedir(), '.local', 'share', 'apple-session', 'apple_session.py');
  if (!existsSync(runtime)) {
    throw new Error('Shared simulator queue is not installed. Install simulator-queue/scripts/install.py from addisonk/skills before native work.');
  }
  if (process.env.APPLE_SESSION_FD) {
    const fd = Number(process.env.APPLE_SESSION_FD);
    if (!Number.isSafeInteger(fd) || fd < 3 || fd > 1024) throw new Error('Invalid inherited queue descriptor.');
    const stdio = Array.from({ length: fd + 1 }, (_, index) => index < 3 ? 'inherit' : 'ignore');
    stdio[fd] = fd;
    const checked = spawnSync('python3', [runtime, 'check-lease'], { stdio });
    if (checked.status !== 0) throw new Error('Inherited simulator lease is invalid; stop and inspect apple-session status.');
    return;
  }
  const child = spawn('python3', [runtime, 'run', '--app', app, '--worktree', worktree,
    '--', process.execPath, ...process.argv.slice(1)], { stdio: 'inherit' });
  const forwards = new Map();
  for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
    const handler = () => child.kill(signal);
    forwards.set(signal, handler);
    process.on(signal, handler);
  }
  const code = await new Promise((resolve, reject) => {
    child.once('error', reject);
    child.once('exit', (code, signal) => resolve(code ?? (signal ? 1 : 0)));
  });
  for (const [signal, handler] of forwards) process.off(signal, handler);
  process.exit(code);
}

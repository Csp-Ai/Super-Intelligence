const { spawn } = require('child_process');

console.log('[startup] Launching Vite preview...');
console.log(`[startup] process.env.PORT = ${process.env.PORT}`);
console.log('[startup] Executing: npm --prefix frontend run preview');

const child = spawn('npm', ['--prefix', 'frontend', 'run', 'preview'], {
  stdio: 'inherit',
  env: process.env,
});

child.on('close', (code) => {
  console.log(`[startup] Vite preview exited with code ${code}`);
  process.exit(code);
});

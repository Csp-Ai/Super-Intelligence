const { spawn } = require('child_process');

console.log('[startup] Launching Vite preview...');
console.log(`[startup] process.env.PORT = ${process.env.PORT}`);

const port = process.env.PORT || 8080;
console.log(`[startup] Executing: npm --prefix frontend exec vite preview --host 0.0.0.0 --port ${port}`);

const child = spawn('npm', ['--prefix', 'frontend', 'exec', 'vite', 'preview', '--', '--host', '0.0.0.0', '--port', port], {
  stdio: 'inherit',
  env: process.env,
});

console.log(`[startup] Listening on PORT ${port} ...`);

child.on('close', (code) => {
  console.log(`[startup] Vite preview exited with code ${code}`);
  process.exit(code);
});

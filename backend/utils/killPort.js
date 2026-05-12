const { execSync } = require('child_process');

const port = process.argv[2] || 5000;

try {
  console.log(`Checking port ${port}...`);
  const stdout = execSync(`netstat -ano | findstr :${port}`).toString();
  const lines = stdout.split('\n');
  
  const pids = new Set();
  lines.forEach(line => {
    const parts = line.trim().split(/\s+/);
    if (parts.length >= 5 && parts[1].endsWith(`:${port}`)) {
      pids.add(parts[parts.length - 1]);
    }
  });

  if (pids.size > 0) {
    console.log(`Found processes using port ${port}: ${Array.from(pids).join(', ')}`);
    pids.forEach(pid => {
      try {
        console.log(`Killing process ${pid}...`);
        execSync(`taskkill /F /PID ${pid}`);
      } catch (e) {
        console.error(`Failed to kill process ${pid}: ${e.message}`);
      }
    });
    console.log(`Port ${port} should be free now.`);
  } else {
    console.log(`Port ${port} is free.`);
  }
} catch (e) {
  // netstat returns exit code 1 if no match found
  console.log(`Port ${port} is free.`);
}

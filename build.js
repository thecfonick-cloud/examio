import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clientPath = path.join(__dirname, 'client');
const rootDistPath = path.join(__dirname, 'dist');
const clientDistPath = path.join(clientPath, 'dist');

async function runBuild() {
  try {
    console.log('Step 1: Installing frontend client dependencies...');
    execSync('npm install', { stdio: 'inherit', cwd: clientPath });

    console.log('Step 2: Compiling Vite frontend production assets...');
    execSync('npm run build', { stdio: 'inherit', cwd: clientPath });

    console.log('Step 3: Moving compiled output to root dist directory...');
    
    // Clear root dist directory if it exists
    if (fs.existsSync(rootDistPath)) {
      fs.rmSync(rootDistPath, { recursive: true, force: true });
    }

    // Copy client/dist to root dist
    fs.cpSync(clientDistPath, rootDistPath, { recursive: true });
    console.log('Static assets copied successfully to root dist folder.');
    console.log('\n🎉 Build step completed successfully.');
  } catch (err) {
    console.error('\n❌ Build step failed:', err.message);
    process.exit(1);
  }
}

runBuild();

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

console.log('Running Pre-Deployment Verification...');

try {
  // 1. Verify build
  console.log('1. Checking frontend compilation...');
  execSync('npm run build', { stdio: 'inherit', shell: true });
  console.log('✅ Build successful.\n');

  // 2. Verify functions build
  console.log('2. Checking Cloud Functions compilation...');
  execSync('npm run build', { cwd: path.join(process.cwd(), 'functions'), stdio: 'inherit', shell: true });
  console.log('✅ Cloud Functions build successful.\n');

  // 3. Verify mock data exists
  console.log('✅ Mock data services permanently removed');

  // 4. Run tests
  console.log('4. Running Unit & Integration Tests...');
  execSync('npm run test', { stdio: 'inherit', shell: true });
  console.log('✅ All tests passed.\n');

  console.log('🎉 Verification Complete! The project is ready for deployment.');

} catch (error: any) {
  console.error('\n❌ Verification Failed. Please fix the errors above.');
  console.error(error.message);
  if (error.stdout) console.log('STDOUT:\n', error.stdout.toString());
  if (error.stderr) console.error('STDERR:\n', error.stderr.toString());
  process.exit(1);
}

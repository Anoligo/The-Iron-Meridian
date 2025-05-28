import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Run all test files
const testFiles = [
    'quests.test.js',
    'players.test.js',
    'loot.test.js',
    'locations.test.js',
    'notes.test.js',
    'guild.test.js'
];

console.log('Running tests...\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

testFiles.forEach(testFile => {
    console.log(`\nRunning ${testFile}...`);
    try {
        const output = execSync(`node --experimental-vm-modules node_modules/jest/bin/jest.js ${path.join(__dirname, testFile)}`, { encoding: 'utf-8' });
        console.log(output);
        
        // Parse test results
        const match = output.match(/(\d+) tests? passed, (\d+) tests? failed/);
        if (match) {
            const [, passed, failed] = match;
            passedTests += parseInt(passed);
            failedTests += parseInt(failed);
            totalTests += parseInt(passed) + parseInt(failed);
        }
    } catch (error) {
        console.error(`Error running ${testFile}:`);
        console.error(error.stdout);
        failedTests++;
        totalTests++;
    }
});

console.log('\nTest Summary:');
console.log(`Total Tests: ${totalTests}`);
console.log(`Passed: ${passedTests}`);
console.log(`Failed: ${failedTests}`);
console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(2)}%`);

process.exit(failedTests > 0 ? 1 : 0); 
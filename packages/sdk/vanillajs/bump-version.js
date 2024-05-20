const fs = require('fs');
const path = require('path');

const packageJsonPath = path.resolve(__dirname, 'package.json');
const versionFilePath = path.resolve(__dirname, 'version.js');

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const versionParts = packageJson.version.split('.').map(Number);

// Increment the patch version (or modify this logic for major/minor bumps)
versionParts[2] += 1;
const newVersion = versionParts.join('.');

// Update package.json with the new version
packageJson.version = newVersion;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');

// Write the new version to version.js
fs.writeFileSync(versionFilePath, `module.exports = '${newVersion}';\n`, 'utf8');

console.log(`Version bumped to ${newVersion}`);

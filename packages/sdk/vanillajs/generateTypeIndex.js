// Script created by ChatGPT4 to combine all the various d.ts files
// produced by the build into one uber file at the top level so
// that consumers can find all types in one spot.

const fs = require('fs');
const path = require('path');

const typesDir = path.join(__dirname, 'dist/types');
const outputFile = path.join(typesDir, 'index.d.ts');

function createTypeExports(dir, baseDir = dir) {
  let exports = '';
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      exports += createTypeExports(fullPath, baseDir);
    } else if (item.endsWith('.d.ts') && fullPath !== outputFile) {
      const relativePath = path.relative(baseDir, fullPath);
      const formattedPath = './' + relativePath.replace(/\\/g, '/').replace(/\.d\.ts$/, '');
      exports += `export * from '${formattedPath}';\n`;
    }
  }

  return exports;
}

const exportsContent = createTypeExports(typesDir);
fs.writeFileSync(outputFile, exportsContent);
console.log(`Created ${outputFile} with consolidated exports.`);

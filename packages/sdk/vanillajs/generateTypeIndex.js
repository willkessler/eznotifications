// Script created by ChatGPT4 to combine all the various d.ts files
// produced by the build into one uber file at the top level so
// that consumers can find all types in one spot.

const fs = require('fs');
const path = require('path');

const typesDir = path.join(__dirname, 'dist/types');
const outputFile = path.join(typesDir, 'index.d.ts');

// Ensure all necessary type definitions are copied to the dist/types directory
const copyTypeDefinitions = (srcDir, destDir) => {
  const items = fs.readdirSync(srcDir);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  items.forEach(item => {
    const srcPath = path.join(srcDir, item);
    const destPath = path.join(destDir, item);
    const stat = fs.statSync(srcPath);
    if (stat.isDirectory()) {
      copyTypeDefinitions(srcPath, destPath);
    } else if (item.endsWith('.d.ts')) {
      fs.copyFileSync(srcPath, destPath);
    }
  });
};

// Copy type definitions from node_modules/@types to dist/types
const typeDefinitionsDirs = [
  path.join(__dirname, '../../../node_modules/@types/marked'),
  path.join(__dirname, '../react-core/dist'),
  path.join(__dirname, './src')
];

typeDefinitionsDirs.forEach(dir => {
  copyTypeDefinitions(dir, path.join(typesDir, path.basename(dir)));
});

// Generate consolidated type index file
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

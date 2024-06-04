const fs = require('fs');
const path = require('path');

const dirs = [
  './dist/types/vanillajs/src/lib',
  './dist/types/vanillajs/src/notifications'
];

dirs.forEach(dir => {
  const filePath = path.join(dir, 'index.d.ts');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '// Type definitions\nexport {};\n');
  }
});

import fs from 'fs';
import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      const originalEntry = config.entry;
      config.entry = async () => {
        const entries = await originalEntry();

        // Define patterns for files to exclude
        const excludePatterns = [/.*~$/, /.*\.0$/];

        // Helper function to check if a file should be excluded
        const shouldExclude = (filePath) => {
          return excludePatterns.some(pattern => pattern.test(filePath));
        };

        // Exclude files in src/pages/archive directory
        const archivePath = path.resolve(process.cwd(), 'src/pages/archive');

        const filteredEntries = Object.keys(entries).reduce((acc, entry) => {
          const entryPath = path.resolve(process.cwd(), entry);
          const isInArchive = entryPath.startsWith(archivePath);
          const isExcludedFile = shouldExclude(entryPath);
          
          // Debug logging
          // console.log(`Entry: ${entryPath}, Is in archive: ${isInArchive}, Is excluded file: ${isExcludedFile}`);

          if (!isInArchive && !isExcludedFile) {
            acc[entry] = entries[entry];
          }
          return acc;
        }, {});

        // Debug logging
        // console.log('Filtered Entries:', filteredEntries);

        return filteredEntries;
      };
    }

    // Ensure the lib directory exists
    const libDir = path.resolve(process.cwd(), 'src/lib');
    if (!fs.existsSync(libDir)) {
      fs.mkdirSync(libDir, { recursive: true });
    }

    // Create the symlink
    const targetPath = path.resolve(process.cwd(), '../vanillajs/src/types.ts');
    const symlinkPath = path.resolve(libDir, 'types.ts');
    if (!fs.existsSync(symlinkPath)) {
      fs.symlinkSync(targetPath, symlinkPath);
    }
    return config;
  },
};

export default nextConfig;

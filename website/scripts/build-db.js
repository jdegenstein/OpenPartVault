// website/scripts/build-db.js
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';
import AdmZip from 'adm-zip';
import sharp from 'sharp'; // <-- Image processing library

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const repoPartsDir = path.resolve(__dirname, '../../parts');
const publicPartsDir = path.resolve(__dirname, '../public/parts');
const outputJson = path.resolve(__dirname, '../public/models.json');

function getAllFiles(dirPath, arrayOfFiles = [], basePath = '') {
  const files = fs.readdirSync(dirPath);
  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    const relativePath = path.posix.join(basePath, file);
    
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles, relativePath);
    } else {
      arrayOfFiles.push({ fullPath, relativePath, size: fs.statSync(fullPath).size });
    }
  });
  return arrayOfFiles;
}

// Converted to async to handle sharp processing
async function buildDatabase() {
  const models = [];

  if (!fs.existsSync(repoPartsDir)) {
    console.error(`❌ Parts directory not found at ${repoPartsDir}`);
    process.exit(1);
  }

  if (!fs.existsSync(publicPartsDir)) {
    fs.mkdirSync(publicPartsDir, { recursive: true });
  }

  const folders = fs.readdirSync(repoPartsDir);

  for (const folder of folders) {
    const folderPath = path.join(repoPartsDir, folder);
    
    if (!fs.statSync(folderPath).isDirectory() || folder === '_template') continue;

    const metadataPath = path.join(folderPath, 'metadata.yaml');
    
    if (fs.existsSync(metadataPath)) {
      try {
        const fileContents = fs.readFileSync(metadataPath, 'utf8');
        const data = yaml.load(fileContents);
        data.slug = folder;
        
        const destFolder = path.join(publicPartsDir, folder);
        if (!fs.existsSync(destFolder)) fs.mkdirSync(destFolder, { recursive: true });

        const zip = new AdmZip();
        zip.addLocalFolder(folderPath);
        zip.writeZip(path.join(destFolder, `${folder}.zip`));
        data.zipUrl = `${folder}.zip`;

        const allFiles = getAllFiles(folderPath);
        data.files = [];
        data.stlFiles = [];
        data.hasThumbnail = false; // Default state
        let thumbnailSourcePath = null;

        for (const f of allFiles) {
          const destFile = path.join(destFolder, f.relativePath);
          fs.mkdirSync(path.dirname(destFile), { recursive: true });
          fs.copyFileSync(f.fullPath, destFile);
          
          let sizeStr = f.size > 1024 * 1024 ? (f.size / (1024 * 1024)).toFixed(1) + ' MB' : (f.size / 1024).toFixed(0) + ' KB';
          data.files.push({ name: f.relativePath, size: sizeStr });
          
          if (f.relativePath.toLowerCase().endsWith('.stl')) {
            data.stlFiles.push({ name: f.relativePath, size: sizeStr });
          }
          
          // Regex checks the root level for any common image format
          if (/^thumbnail\.(png|jpg|jpeg|webp)$/i.test(f.relativePath)) {
            data.hasThumbnail = true;
            thumbnailSourcePath = f.fullPath;
          }
        }

        // Generate the optimized 600px WEBP specifically for the grid
        if (thumbnailSourcePath) {
          const destGridFile = path.join(destFolder, 'thumbnail_grid.webp');
          await sharp(thumbnailSourcePath)
            .resize({ width: 600 })
            .webp({ quality: 80 })
            .toFile(destGridFile);
        }

        data.stlFiles.sort((a, b) => a.name.localeCompare(b.name));
        models.push(data);
        console.log(`✅ Processed: ${data.title || folder} (${folder})`);
      } catch (e) {
        console.error(`❌ Error processing ${folder}:`, e);
      }
    } else {
      console.warn(`⚠️ Skipped ${folder}: No metadata.yaml found.`);
    }
  }

  fs.writeFileSync(outputJson, JSON.stringify(models, null, 2));
  console.log(`\n🎉 Successfully built models.json with ${models.length} parts!`);
}

buildDatabase();

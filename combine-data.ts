import { readdirSync, readFileSync, writeFileSync, statSync, existsSync, renameSync } from 'fs';
import { join, extname } from 'path';

const SOURCE_DIR = 'campaign-data';
const OUTPUT_FILE = 'combined-campaign-new.md';
const OLD_OUTPUT_FILE = 'combined-campaign-old.md';

const collectMarkdownFiles = (dir: string): string[] => {
    let files: string[] = [];

    readdirSync(dir).forEach((item) => {
        const fullPath = join(dir, item);
        if (statSync(fullPath).isDirectory()) {
            files = files.concat(collectMarkdownFiles(fullPath));
        } else if (extname(item) === '.md') {
            files.push(fullPath);
        }
    });

    return files;
};

const combineMarkdownFiles = (files: string[]) => {
    const combinedContent = files
        .map((filePath) => readFileSync(filePath, 'utf8'))
        .join('\n\n---\n\n');

    if (existsSync(OUTPUT_FILE)) {
        renameSync(OUTPUT_FILE, OLD_OUTPUT_FILE);
        console.log(`Renamed existing ${OUTPUT_FILE} to ${OLD_OUTPUT_FILE}`);
    }

    writeFileSync(OUTPUT_FILE, `Last updated: ${new Date().toLocaleString()}\n\n${combinedContent}`, 'utf8');
};

const files = collectMarkdownFiles(SOURCE_DIR);
combineMarkdownFiles(files);

console.log(`Successfully combined ${files.length} markdown files into ${OUTPUT_FILE}`);

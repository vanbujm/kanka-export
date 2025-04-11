import { readdirSync, readFileSync, writeFileSync, statSync } from 'fs';
import { join, extname } from 'path';

const SOURCE_DIR = 'campaign-data';
const OUTPUT_FILE = 'combined-campaign.md';

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

    writeFileSync(OUTPUT_FILE, combinedContent, 'utf8');
};

const files = collectMarkdownFiles(SOURCE_DIR);
combineMarkdownFiles(files);

console.log(`Successfully combined ${files.length} markdown files into ${OUTPUT_FILE}`);

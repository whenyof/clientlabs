import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const replacements = [
    { from: /bg-purple-600\/20 text-purple-400/g, to: 'bg-[#1FA97A]/15 text-[#2ED39C]' },
    { from: /bg-purple-500\/20 text-purple-400 border-purple-500\/30/g, to: 'bg-[#1FA97A]/15 text-[#2ED39C] border-[#1FA97A]/30' },
    { from: /bg-purple-600 hover:bg-purple-700/g, to: 'bg-[#1FA97A] hover:bg-[#1FA97A]/90' },
    { from: /text-purple-400 hover:text-purple-300/g, to: 'text-[#2ED39C] hover:text-[#1FA97A]' },
    { from: /border-purple-500\/30/g, to: 'border-[#1FA97A]/30' },
    { from: /border-purple-500\/40/g, to: 'border-[#1FA97A]/40' },
    { from: /border-purple-500\/20/g, to: 'border-[#1FA97A]/20' },
    { from: /border-purple-500\/10/g, to: 'border-[#1FA97A]/10' },
    { from: /border-purple-500/g, to: 'border-[#1FA97A]' },
    { from: /bg-purple-500\/10/g, to: 'bg-[#1FA97A]/15' },
    { from: /bg-purple-500\/20/g, to: 'bg-[#1FA97A]/20' },
    { from: /bg-purple-500\/30/g, to: 'bg-[#1FA97A]/30' },
    { from: /bg-purple-500\/15/g, to: 'bg-[#1FA97A]/15' },
    { from: /bg-purple-400\/5/g, to: 'bg-[#1FA97A]/10' },
    { from: /bg-purple-600\/80/g, to: 'bg-[#1FA97A]/80' },
    { from: /bg-purple-600/g, to: 'bg-[#1FA97A]' },
    { from: /bg-purple-500/g, to: 'bg-[#1FA97A]' },
    { from: /bg-purple-400/g, to: 'bg-[#2ED39C]' },
    { from: /text-purple-400\/80/g, to: 'text-[#2ED39C]/80' },
    { from: /text-purple-400\/60/g, to: 'text-[#2ED39C]/60' },
    { from: /text-purple-400/g, to: 'text-[#2ED39C]' },
    { from: /text-purple-500/g, to: 'text-[#1FA97A]' },
    { from: /text-purple-300/g, to: 'text-[#E6F1F5]' },
    { from: /text-purple-200/g, to: 'text-[#8FA6B2]' },
    { from: /shadow-purple-500\/20/g, to: 'shadow-[#1FA97A]/20' },
    { from: /shadow-\[0_10px_40px_rgba\(124,58,237,0\.18\)\]/g, to: 'shadow-[0_10px_40px_rgba(31,169,122,0.18)]' },
    { from: /shadow-\[0_20px_80px_rgba\(124,58,237,0\.2\)\]/g, to: 'shadow-[0_20px_80px_rgba(31,169,122,0.2)]' },
    { from: /shadow-\[0_12px_40px_rgba\(124,58,237,0\.2\)\]/g, to: 'shadow-[0_12px_40px_rgba(31,169,122,0.2)]' },
    { from: /shadow-\[0_0_12px_rgba\(124,58,237,0\.9\)\]/g, to: 'shadow-[0_0_12px_rgba(31,169,122,0.9)]' }
];

function processPath(targetPath) {
    const stat = fs.statSync(targetPath);
    if (stat.isDirectory()) {
        if (targetPath.includes('node_modules') || targetPath.includes('.next') || targetPath.includes('.git')) return;
        const files = fs.readdirSync(targetPath);
        for (const file of files) processPath(path.join(targetPath, file));
    } else if (targetPath.endsWith('.tsx') || targetPath.endsWith('.ts') || targetPath.endsWith('.css')) {
        let content = fs.readFileSync(targetPath, 'utf8');
        let original = content;
        for (const rep of replacements) {
            content = content.replace(rep.from, rep.to);
        }
        if (content !== original) {
            fs.writeFileSync(targetPath, content, 'utf8');
            console.log(`Updated: ${targetPath}`);
        }
    }
}

const dirs = ['app', 'components', 'modules', 'lib'];
for (const d of dirs) {
    processPath(path.join(__dirname, d));
}
console.log('Done!');

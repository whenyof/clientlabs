const fs = require('fs');
const path = require('path');

const replacements = [
    // Hex to classes
    { from: /bg-\[\#1FA97A\]/gi, to: 'bg-brand-accent' },
    { from: /text-\[\#1FA97A\]/gi, to: 'text-brand-accent' },
    { from: /border-\[\#1FA97A\]/gi, to: 'border-brand-accent' },
    { from: /shadow-\[\#1FA97A\]/gi, to: 'shadow-brand-accent' },

    { from: /bg-\[\#2ED39C\]/gi, to: 'bg-brand-accent-hover' },
    { from: /text-\[\#2ED39C\]/gi, to: 'text-brand-accent-hover' },
    { from: /border-\[\#2ED39C\]/gi, to: 'border-brand-accent-hover' },

    { from: /bg-\[\#D9A441\]/gi, to: 'bg-brand-warning' },
    { from: /text-\[\#D9A441\]/gi, to: 'text-brand-warning' },
    { from: /border-\[\#D9A441\]/gi, to: 'border-brand-warning' },

    { from: /bg-\[\#C95656\]/gi, to: 'bg-brand-critical' },
    { from: /text-\[\#C95656\]/gi, to: 'text-brand-critical' },
    { from: /border-\[\#C95656\]/gi, to: 'border-brand-critical' },

    { from: /bg-\[\#102A38\]/gi, to: 'bg-brand-surface' },
    { from: /bg-\[\#0F2535\]/gi, to: 'bg-brand-elevated' },
    { from: /bg-\[\#0B1F2A\]/gi, to: 'bg-brand-bg' },

    { from: /text-\[\#8FA6B2\]/gi, to: 'text-brand-text-muted' },
    { from: /text-\[\#E6F1F5\]/gi, to: 'text-brand-text' },

    // Gradients
    { from: /from-\[\#0B1F2A\]/gi, to: 'from-brand-bg' },
    { from: /to-\[\#0F2535\]/gi, to: 'to-brand-surface' },
    { from: /to-\[\#102A38\]/gi, to: 'to-brand-surface' },
    { from: /from-\[\#0F2535\]/gi, to: 'from-brand-elevated' },

    // Replace common white text mappings that are obviously document text:
    // Usually classes having `text-white/40`, etc. can just become `text-brand-text-muted` or `text-brand-text/40`.
    // With CSS variables, opacity modifiers like `text-brand-text/50` just work IF we define the var using a channel format, 
    // but we defined it as a hex code!
    // NOTE: Tailwind 4 allows hex + opacity via `text-brand-text/50` natively even without channels depending on the browser support of relative colors, OR we just let it use hex.
    // Actually, wait, Tailwind v4 parses hex to oklch automatically and does relative color mapping.
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
console.log('Done mapping custom hex to brand tokens!');

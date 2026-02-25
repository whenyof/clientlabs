import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Apply replacements
    replacements = [
        # Background Grays & Zincs & Blacks (non-backdrop)
        (r'bg-gray-900/[0-9]+', 'bg-[var(--bg-card)]'),
        (r'bg-gray-800/[0-9]+', 'bg-[var(--bg-main)]'),
        (r'bg-gray-700/[0-9]+', 'bg-[var(--bg-surface)]'),
        (r'bg-gray-900', 'bg-[var(--bg-card)]'),
        (r'bg-gray-800', 'bg-[var(--bg-main)]'),
        (r'bg-gray-700', 'bg-[var(--bg-surface)]'),
        (r'bg-gray-100', 'bg-[var(--bg-surface)]'),
        (r'bg-gray-50', 'bg-[var(--bg-main)]'),
        (r'bg-zinc-900/[0-9]+', 'bg-[var(--bg-card)]'),
        (r'bg-zinc-800/[0-9]+', 'bg-[var(--bg-main)]'),
        (r'bg-zinc-900', 'bg-[var(--bg-card)]'),
        (r'bg-zinc-800', 'bg-[var(--bg-main)]'),
        (r'bg-zinc-[0-9]+', 'bg-[var(--bg-surface)]'),
        (r'bg-black/80', 'bg-[var(--bg-card)]'),
        (r'bg-black/40', 'bg-[var(--bg-main)]/50'),

        # Modal Backdrops
        (r'bg-black/[0-9]+', 'bg-black/40'), # Soften modal backdrops
        (r'bg-black', 'bg-[var(--bg-card)]'),

        # Border Grays
        (r'border-gray-[0-9]+/[0-9]+', 'border-[var(--border-subtle)]'),
        (r'border-gray-[0-9]+', 'border-[var(--border-subtle)]'),
        (r'border-zinc-[0-9]+/[0-9]+', 'border-[var(--border-subtle)]'),
        (r'border-zinc-[0-9]+', 'border-[var(--border-subtle)]'),
        (r'border-black/[0-9]+', 'border-[var(--border-subtle)]'),
        (r'border-black', 'border-[var(--border-subtle)]'),
        (r'border-white/[0-9]+', 'border-[var(--border-subtle)]'),

        # Text Colors
        (r'text-white/[0-9]+', 'text-[var(--text-secondary)]'),
        (r'text-white', 'text-[var(--text-primary)]'),
        (r'text-black', 'text-[var(--text-primary)]'),
        (r'text-gray-[12345]00', 'text-[var(--text-secondary)]'),
        (r'text-gray-[6789]00', 'text-[var(--text-primary)]'),
        (r'text-zinc-[12345]00', 'text-[var(--text-secondary)]'),
        (r'text-zinc-[6789]00', 'text-[var(--text-primary)]'),
        
        # specific hardcoded hex replacements
        (r'#0f172a', 'var(--bg-main)'),
        (r'#1F2937', 'var(--bg-card)'),
        (r'#374151', 'var(--border-subtle)'),
        (r'#F9FAFB', 'var(--text-primary)'),
        (r'#9CA3AF', 'var(--text-secondary)'),
        (r'#8B5CF6', 'var(--accent)'), # Replace random purple with accent
    ]

    new_content = content
    for pattern, repl in replacements:
        new_content = re.sub(pattern, repl, new_content)

    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        return True
    return False

root_dir = '/Users/iyanrp_/Desktop/clientlabs-app/app/dashboard'
changed = 0
for dirpath, _, filenames in os.walk(root_dir):
    for f in filenames:
        if f.endswith('.tsx') or f.endswith('.ts'):
            if process_file(os.path.join(dirpath, f)):
                changed += 1
print(f"Changed {changed} files in dashboard.")

import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    replacements = [
        # backgrounds
        (r'bg-gray-900/(10|20|30|40|50|60|70|80|90)', 'bg-[var(--bg-main)]'),
        (r'bg-gray-800/(10|20|30|40|50|60|70|80|90)', 'bg-[var(--bg-card)]'),
        (r'bg-gray-700/(10|20|30|40|50|60|70|80|90)', 'bg-[var(--bg-surface)]'),
        (r'bg-gray-600/(10|20|30|40|50|60|70|80|90)', 'bg-[var(--border-subtle)]'),
        (r'bg-gray-500/(10|20|30|40|50|60|70|80|90)', 'bg-[var(--border-subtle)]'),
        (r'bg-gray-900', 'bg-[var(--bg-main)]'),
        (r'bg-gray-800', 'bg-[var(--bg-card)]'),
        (r'bg-gray-700', 'bg-[var(--bg-surface)]'),
        (r'bg-gray-[1-6]00', 'bg-[var(--bg-surface)]'),
        (r'bg-zinc-900/[0-9]+', 'bg-[var(--bg-main)]'),
        (r'bg-zinc-800/[0-9]+', 'bg-[var(--bg-card)]'),
        (r'bg-zinc-[1-7]00', 'bg-[var(--bg-surface)]'),
        (r'bg-zinc-900', 'bg-[var(--bg-main)]'),
        (r'bg-zinc-800', 'bg-[var(--bg-card)]'),
        
        # black backgrounds -> often modals
        (r'bg-black/60', 'bg-[#00000080]'),
        (r'bg-black/50', 'bg-[#00000080]'),
        (r'bg-black/40', 'bg-[#00000080]'),
        (r'bg-black', 'bg-[var(--bg-main)]'),
        
        # white backgrounds -> card or surface (except where already root)
        # Using negative lookbehind to avoid "--bg-white" if such existed
        (r'\bbg-white/5\b', 'bg-[var(--bg-main)]'),
        (r'\bbg-white/10\b', 'bg-[var(--bg-surface)]'),
        (r'\bbg-white/20\b', 'bg-[var(--bg-surface)]'),
        (r'\bbg-white\b', 'bg-[var(--bg-card)]'),
        
        # text
        (r'text-white/[0-9]+', 'text-[var(--text-secondary)]'),
        (r'\btext-white\b', 'text-[var(--text-primary)]'),
        (r'\btext-black\b', 'text-[var(--text-primary)]'),
        (r'text-gray-900', 'text-[var(--text-primary)]'),
        (r'text-gray-[5678]00', 'text-[var(--text-secondary)]'),
        (r'text-gray-[1234]00', 'text-[var(--text-secondary)]'),
        (r'text-zinc-[1-9]00', 'text-[var(--text-secondary)]'),
        
        # border
        (r'border-white/[0-9]+', 'border-[var(--border-subtle)]'),
        (r'\bborder-white\b', 'border-[var(--border-subtle)]'),
        (r'border-black/[0-9]+', 'border-[var(--border-subtle)]'),
        (r'\bborder-black\b', 'border-[var(--border-subtle)]'),
        (r'border-gray-[1-9]00/[0-9]+', 'border-[var(--border-subtle)]'),
        (r'border-gray-[1-9]00', 'border-[var(--border-subtle)]'),
        (r'border-zinc-[1-9]00/[0-9]+', 'border-[var(--border-subtle)]'),
        (r'border-zinc-[1-9]00', 'border-[var(--border-subtle)]'),
        
        # hover effects
        (r'hover:bg-gray-[1-9]00/[0-9]+', 'hover:bg-[var(--bg-surface)]'),
        (r'hover:bg-gray-[1-9]00', 'hover:bg-[var(--bg-surface)]'),
        (r'hover:bg-zinc-[1-9]00/[0-9]+', 'hover:bg-[var(--bg-surface)]'),
        (r'hover:bg-zinc-[1-9]00', 'hover:bg-[var(--bg-surface)]'),
        (r'hover:bg-white/[0-9]+', 'hover:bg-[var(--bg-surface)]'),
        (r'hover:text-white', 'hover:text-[var(--text-primary)]'),
        (r'hover:text-black', 'hover:text-[var(--text-primary)]'),
        (r'hover:text-gray-[1-9]00', 'hover:text-[var(--text-primary)]'),
        (r'hover:border-gray-[1-9]00/[0-9]+', 'hover:border-[var(--border-subtle)]'),
        (r'hover:border-gray-[1-9]00', 'hover:border-[var(--border-subtle)]'),
        
        # hex
        (r'#0f172a', 'var(--bg-main)'),
        (r'#1F2937', 'var(--bg-card)'),
        (r'#374151', 'var(--border-subtle)'),
        (r'#F9FAFB', 'var(--text-primary)'),
        (r'#9CA3AF', 'var(--text-secondary)'),
        (r'#ffffff', 'var(--text-primary)'),
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

import os
import re
import sys

def replace_in_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    orig = content
    
    # 1. Main background colors
    content = re.sub(r'bg-bg-sidebar', 'bg-[var(--bg-sidebar)]', content)
    content = re.sub(r'bg-bg-main', 'bg-[var(--bg-main)]', content)
    content = re.sub(r'bg-bg-card', 'bg-[var(--bg-card)]', content)
    
    content = re.sub(r'bg-bg-section', 'bg-[var(--bg-card)]', content)
    content = re.sub(r'bg-bg-navbar', 'bg-[var(--bg-card)]', content) 
    
    # 2. Hardcoded specific backgrounds to replace
    content = re.sub(r'bg-\[\#112F3A\]', 'bg-[var(--bg-diagnostic)]', content)
    content = re.sub(r'bg-\[rgba\(26,143,106,0\.08\)\]', 'bg-[var(--accent-soft)]', content)
    content = re.sub(r'bg-accent/5', 'bg-[var(--accent-soft)]', content)
    
    # 3. Text colors
    content = re.sub(r'text-text-primary', 'text-[var(--text-primary)]', content)
    content = re.sub(r'text-text-secondary', 'text-[var(--text-secondary)]', content)
    
    # 4. Old semantic colors (emerald, red, amber, accent, critical)
    # Backgrounds
    content = re.sub(r'bg-emerald-(?:[0-9]{2,3})(?:/[0-9]+)?', 'bg-[var(--accent-soft)]', content)
    content = re.sub(r'bg-amber-(?:[0-9]{2,3})(?:/[0-9]+)?', 'bg-[var(--bg-card)]', content)
    content = re.sub(r'bg-red-(?:[0-9]{2,3})(?:/[0-9]+)?', 'bg-[var(--bg-card)]', content)
    content = re.sub(r'bg-rose-(?:[0-9]{2,3})(?:/[0-9]+)?', 'bg-[var(--bg-card)]', content)
    content = re.sub(r'bg-slate-(?:[0-9]{2,3})(?:/[0-9]+)?', 'bg-[var(--bg-sidebar)]', content)
    
    content = re.sub(r'bg-critical(?:/[0-9]+)?', 'bg-[var(--bg-card)]', content)
    content = re.sub(r'bg-warning(?:/[0-9]+)?', 'bg-[var(--bg-card)]', content)
    content = re.sub(r'bg-accent(?:/[0-9]+)?', 'bg-[var(--accent-soft)]', content)
    
    # Text
    content = re.sub(r'text-emerald-(?:[0-9]{2,3})(?:/[0-9]+)?', 'text-[var(--accent)]', content)
    content = re.sub(r'text-amber-(?:[0-9]{2,3})(?:/[0-9]+)?', 'text-[var(--text-secondary)]', content)
    content = re.sub(r'text-red-(?:[0-9]{2,3})(?:/[0-9]+)?', 'text-[var(--critical)]', content)
    content = re.sub(r'text-rose-(?:[0-9]{2,3})(?:/[0-9]+)?', 'text-[var(--critical)]', content)
    
    content = re.sub(r'text-critical(?:/[0-9]+)?', 'text-[var(--critical)]', content)
    content = re.sub(r'text-warning(?:/[0-9]+)?', 'text-[var(--text-secondary)]', content)
    content = re.sub(r'text-accent(?:/[0-9]+)?', 'text-[var(--accent)]', content)
    
    # Borders
    content = re.sub(r'border-border-subtle(?:/[0-9]+)?', 'border-[var(--border-subtle)]', content)
    content = re.sub(r'border-critical(?:/[0-9]+)?', 'border-[var(--critical)]', content)
    content = re.sub(r'border-warning(?:/[0-9]+)?', 'border-[var(--border-subtle)]', content)
    content = re.sub(r'border-accent(?:/[0-9]+)?', 'border-[var(--accent)]', content)
    
    content = re.sub(r'border-emerald-(?:[0-9]{2,3})(?:/[0-9]+)?', 'border-[var(--accent)]', content)
    content = re.sub(r'border-amber-(?:[0-9]{2,3})(?:/[0-9]+)?', 'border-[var(--border-subtle)]', content)
    content = re.sub(r'border-red-(?:[0-9]{2,3})(?:/[0-9]+)?', 'border-[var(--critical)]', content)
    content = re.sub(r'border-rose-(?:[0-9]{2,3})(?:/[0-9]+)?', 'border-[var(--critical)]', content)

    # 5. Make sure 'dark:' patterns are removed.
    content = re.sub(r'dark:bg-\[?[a-zA-Z0-9\-\#(var)]+\]?(?:/[0-9]+)?', '', content)
    content = re.sub(r'dark:text-\[?[a-zA-Z0-9\-\#(var)]+\]?(?:/[0-9]+)?', '', content)
    content = re.sub(r'dark:hover:bg-\[?[a-zA-Z0-9\-\#(var)]+\]?(?:/[0-9]+)?', '', content)
    content = re.sub(r'dark:hover:text-\[?[a-zA-Z0-9\-\#(var)]+\]?(?:/[0-9]+)?', '', content)

    # Clean up double spaces from removed dark variants
    content = re.sub(r'  +', ' ', content)
    
    if content != orig:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Updated {filepath}")

for root, _, files in os.walk('/Users/iyanrp_/Desktop/clientlabs-app/modules'):
    for f in files:
        if f.endswith('.tsx') or f.endswith('.ts'):
            replace_in_file(os.path.join(root, f))

for root, _, files in os.walk('/Users/iyanrp_/Desktop/clientlabs-app/components'):
    for f in files:
        if f.endswith('.tsx') or f.endswith('.ts'):
            replace_in_file(os.path.join(root, f))

for root, _, files in os.walk('/Users/iyanrp_/Desktop/clientlabs-app/app'):
    for f in files:
        if f.endswith('.tsx') or f.endswith('.ts'):
            replace_in_file(os.path.join(root, f))

print("Done replacing colors.")

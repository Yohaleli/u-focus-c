import sys
with open('src/components/TopNav.tsx', 'r') as f:
    content = f.read()

import re
content = re.sub(r'import\s+\{([^}]+)\}\s+from\s+\'lucide-react\';', lambda m: 'import { ' + ', '.join([x.strip() for x in m.group(1).split(',') if x.strip() not in ['Headphones', 'Trophy']]) + ' } from \'lucide-react\';', content)

with open('src/components/TopNav.tsx', 'w') as f:
    f.write(content)

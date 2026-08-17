import re

with open('src/components/FocusTimer.tsx', 'r') as f:
    text = f.read()

# Add to props
text = text.replace('  systemFocusMode?: boolean;\n}', '  systemFocusMode?: boolean;\n  onEnterFullScreen?: () => void;\n}')

text = text.replace('  systemFocusMode = false\n}: FocusTimerProps) {', '  systemFocusMode = false,\n  onEnterFullScreen\n}: FocusTimerProps) {')

with open('src/components/FocusTimer.tsx', 'w') as f:
    f.write(text)

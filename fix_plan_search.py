import re

with open('src/components/PlanViewer.tsx', 'r') as f:
    text = f.read()

to_replace = """    <div className="flex flex-col gap-6">
      <div className="w-full relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        <input
          type="text"
          placeholder="Filter tasks by keyword..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/30 transition-colors shadow-sm"
        />
      </div>"""

replacement = """    <div className="flex flex-col gap-6">"""

text = text.replace(to_replace, replacement)

with open('src/components/PlanViewer.tsx', 'w') as f:
    f.write(text)

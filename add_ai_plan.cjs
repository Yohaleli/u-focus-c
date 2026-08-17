const fs = require('fs');

let content = fs.readFileSync('src/components/PlanCreator.tsx', 'utf8');

const targetImport = "import { Plus, Trash2, AlignLeft } from 'lucide-react';";
const replacementImport = "import { Plus, Trash2, AlignLeft, Sparkles, Loader2 } from 'lucide-react';";

content = content.replace(targetImport, replacementImport);

const stateInjection = `
  const [aiTopic, setAiTopic] = useState('');
  const [aiDetails, setAiDetails] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiError, setAiError] = useState('');

  const handleGenerateAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiTopic.trim()) return;
    
    setIsGeneratingAI(true);
    setAiError('');
    
    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: aiTopic, details: aiDetails })
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate plan');
      }
      
      const formattedPlan: LearningPlan = {
        id: \`plan-\${Date.now()}\`,
        title: data.title,
        description: data.description || '',
        duration: data.duration || 'Flexible',
        createdAt: new Date().toISOString(),
        isActive: true,
        modules: data.modules.map((m: any, mIdx: number) => ({
          id: m.id || \`mod-\${mIdx}-\${Date.now()}\`,
          title: m.title,
          description: m.description,
          tasks: m.tasks.map((t: any, tIdx: number) => ({
            id: t.id || \`task-\${mIdx}-\${tIdx}-\${Date.now()}\`,
            title: t.title,
            durationMinutes: t.durationMinutes || 25,
            completed: false,
            resources: t.resources || []
          }))
        }))
      };
      
      onPlanCreated(formattedPlan);
    } catch (error: any) {
      setAiError(error.message);
    } finally {
      setIsGeneratingAI(false);
    }
  };
`;

const stateTarget = `  // Manual builder state`;
content = content.replace(stateTarget, stateInjection + "\n" + stateTarget);

const uiInjection = `
      {/* AI Generator Section */}
      <div className="bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-white/20 p-5 rounded-2xl mb-8 relative overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 opacity-50" />
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-300" />
          <h3 className="font-bold text-white tracking-wide text-sm">Generate with AI</h3>
        </div>
        
        <form onSubmit={handleGenerateAI} className="space-y-4">
          <div>
            <label className="block font-mono text-[9px] uppercase tracking-widest text-white/60 mb-2">Topic to Learn</label>
            <input
              type="text"
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
              placeholder="e.g., Python for Data Science"
              required
              className="w-full rounded-xl px-4 py-3 text-sm bg-black/20 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-purple-400/50 transition-colors"
            />
          </div>
          <div>
            <label className="block font-mono text-[9px] uppercase tracking-widest text-white/60 mb-2">Details (Optional)</label>
            <input
              type="text"
              value={aiDetails}
              onChange={(e) => setAiDetails(e.target.value)}
              placeholder="e.g., I have 3 weeks, focus on Pandas..."
              className="w-full rounded-xl px-4 py-3 text-sm bg-black/20 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-purple-400/50 transition-colors"
            />
          </div>
          
          {aiError && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-xs text-red-200 font-medium">
              {aiError}
            </div>
          )}
          
          <button
            type="submit"
            disabled={!aiTopic.trim() || isGeneratingAI}
            className="w-full py-3.5 px-4 font-bold uppercase text-[10px] tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 bg-purple-500/20 border border-purple-400/30 text-purple-100 hover:bg-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGeneratingAI ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Compiling AI Blueprint...</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Generate Blueprint</>
            )}
          </button>
        </form>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className="h-px bg-white/10 flex-1" />
        <span className="font-mono text-[9px] uppercase tracking-widest text-white/30">OR BUILD MANUALLY</span>
        <div className="h-px bg-white/10 flex-1" />
      </div>
`;

const uiTarget = `      <div className="mb-6 space-y-1">`;
content = content.replace(uiTarget, uiInjection + "\n" + uiTarget);

fs.writeFileSync('src/components/PlanCreator.tsx', content);
console.log("Added AI Generator to PlanCreator.tsx");

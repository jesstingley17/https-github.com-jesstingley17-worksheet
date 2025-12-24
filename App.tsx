
import React, { useState, useRef } from 'react';
import { AppMode, Worksheet, ThemeType, InputMethod } from './types';
import { generateWorksheet } from './services/geminiService';
import { WorksheetView } from './components/WorksheetView';
import { QuizView } from './components/QuizView';
import { MarkerHighlight, DoodleStar } from './components/HandwritingElements';
import { 
  Sparkles, 
  Settings, 
  FileText, 
  PlayCircle, 
  Download, 
  BookOpen,
  Layout,
  Layers,
  GraduationCap,
  Loader2,
  Clipboard,
  Upload,
  ChevronDown,
  ChevronUp,
  Globe,
  Zap
} from 'lucide-react';

const WorksheetSkeleton: React.FC<{ theme: ThemeType }> = ({ theme }) => {
  const isCreative = theme === ThemeType.CREATIVE;
  return (
    <div className={`max-w-[210mm] mx-auto bg-white p-[12mm] shadow-lg min-h-[297mm] relative transition-all duration-500 border border-slate-100 ${isCreative ? 'border-blue-50' : ''}`}>
      <div className="animate-pulse space-y-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 bg-slate-200 rounded-full w-3/4"></div>
          <div className="flex justify-between w-full mt-4">
            <div className="space-y-2">
              <div className="h-4 bg-slate-100 rounded w-32"></div>
              <div className="h-4 bg-slate-100 rounded w-24"></div>
            </div>
            <div className="h-8 bg-slate-100 rounded w-48"></div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-12 gap-y-6 mt-12">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-6 bg-slate-100 rounded w-12"></div>
              <div className="h-6 bg-slate-200 rounded w-24"></div>
              <div className="flex-1 h-6 bg-slate-50 border-b border-dashed border-slate-100"></div>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[2px] rounded-lg">
        <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center space-y-4 border-2 border-yellow-100">
          <Loader2 className="w-12 h-12 text-yellow-500 animate-spin" />
          <div className="text-center">
            <p className="font-handwriting-header text-4xl text-slate-800">Mixing the ink...</p>
            <p className="text-slate-500 font-medium mt-2">Helen is carefully preparing your worksheet!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.GENERATOR);
  const [theme, setTheme] = useState<ThemeType>(ThemeType.CREATIVE);
  const [inputMethod, setInputMethod] = useState<InputMethod>(InputMethod.PROMPT);
  const [worksheet, setWorksheet] = useState<Worksheet | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const [formData, setFormData] = useState({
    topic: '',
    gradeLevel: 'High School',
    numQuestions: 5,
    rawText: '',
    difficulty: 'Medium',
    language: 'English'
  });
  const [fileData, setFileData] = useState<{ data: string; mimeType: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setFileData({ data: base64String, mimeType: file.type });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await generateWorksheet({
        ...formData,
        fileData: inputMethod === InputMethod.UPLOAD ? (fileData || undefined) : undefined,
        rawText: inputMethod === InputMethod.PASTE ? formData.rawText : undefined,
        topic: inputMethod === InputMethod.PROMPT ? formData.topic : undefined
      });
      setWorksheet(result);
      setMode(AppMode.WORKSHEET);
    } catch (error) {
      alert("Something went wrong. Please check your API key or input.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className="w-80 bg-white border-r border-slate-200 hidden lg:flex flex-col fixed h-full z-10">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center shadow-lg transform -rotate-3">
            <GraduationCap className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="font-handwriting-header text-2xl text-slate-800">Helen's Hero</h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Smart Generator</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <div>
            <h3 className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-4 flex items-center gap-2">
              <Settings className="w-3 h-3" /> Document Style
            </h3>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button onClick={() => setTheme(ThemeType.CLASSIC)} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${theme === ThemeType.CLASSIC ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>
                <Layout className="w-4 h-4" /> Classic
              </button>
              <button onClick={() => setTheme(ThemeType.CREATIVE)} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${theme === ThemeType.CREATIVE ? 'bg-white shadow-sm text-yellow-600' : 'text-slate-500'}`}>
                <Sparkles className="w-4 h-4" /> Creative
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-4 flex items-center gap-2">
              <Layers className="w-3 h-3" /> Navigation
            </h3>
            <div className="space-y-2">
              <button onClick={() => setMode(AppMode.GENERATOR)} className={`w-full flex items-center gap-3 p-3 rounded-xl font-medium transition-all ${mode === AppMode.GENERATOR ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50'}`}>
                <BookOpen className="w-5 h-5" /> Generator
              </button>
              <button onClick={() => worksheet && setMode(AppMode.WORKSHEET)} disabled={!worksheet} className={`w-full flex items-center gap-3 p-3 rounded-xl font-medium transition-all ${mode === AppMode.WORKSHEET ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50 disabled:opacity-30'}`}>
                <FileText className="w-5 h-5" /> View Worksheet
              </button>
              <button onClick={() => worksheet && setMode(AppMode.QUIZ)} disabled={!worksheet} className={`w-full flex items-center gap-3 p-3 rounded-xl font-medium transition-all ${mode === AppMode.QUIZ ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50 disabled:opacity-30'}`}>
                <PlayCircle className="w-5 h-5" /> Interactive Quiz
              </button>
            </div>
          </div>
          
          {worksheet && (
            <div className="pt-8 border-t border-slate-100">
               <button onClick={() => window.print()} className="w-full flex items-center justify-center gap-3 p-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95">
                <Download className="w-5 h-5" /> Export PDF
              </button>
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 lg:ml-80 min-h-screen relative">
        <div className="p-8">
          {loading ? (
            <div className="animate-in fade-in duration-700 pt-12">
              <WorksheetSkeleton theme={theme} />
            </div>
          ) : (
            <>
              {mode === AppMode.GENERATOR && (
                <div className="max-w-3xl mx-auto pt-8">
                  <div className="text-center mb-8">
                    <h2 className="font-handwriting-header text-6xl text-slate-800 mb-4">
                      Helen's <MarkerHighlight>Hero</MarkerHighlight> Generator
                    </h2>
                    <p className="text-slate-500 text-lg">Choose an input method and customize your worksheet.</p>
                  </div>

                  <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden mb-8">
                    {/* Input Method Tabs */}
                    <div className="flex border-b border-slate-100">
                      <button onClick={() => setInputMethod(InputMethod.PROMPT)} className={`flex-1 py-4 font-bold transition-all flex items-center justify-center gap-2 ${inputMethod === InputMethod.PROMPT ? 'bg-white text-yellow-600 border-b-4 border-yellow-400' : 'bg-slate-50 text-slate-400 hover:text-slate-600'}`}>
                        <Sparkles className="w-4 h-4" /> AI Prompt
                      </button>
                      <button onClick={() => setInputMethod(InputMethod.PASTE)} className={`flex-1 py-4 font-bold transition-all flex items-center justify-center gap-2 ${inputMethod === InputMethod.PASTE ? 'bg-white text-yellow-600 border-b-4 border-yellow-400' : 'bg-slate-50 text-slate-400 hover:text-slate-600'}`}>
                        <Clipboard className="w-4 h-4" /> Paste Text
                      </button>
                      <button onClick={() => setInputMethod(InputMethod.UPLOAD)} className={`flex-1 py-4 font-bold transition-all flex items-center justify-center gap-2 ${inputMethod === InputMethod.UPLOAD ? 'bg-white text-yellow-600 border-b-4 border-yellow-400' : 'bg-slate-50 text-slate-400 hover:text-slate-600'}`}>
                        <Upload className="w-4 h-4" /> Scan Doc
                      </button>
                    </div>

                    <form onSubmit={handleGenerate} className="p-8 space-y-6">
                      {inputMethod === InputMethod.PROMPT && (
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Subject or Topic</label>
                          <input type="text" required placeholder="e.g. Ancient Egypt, Periodic Table, Algebra Basics..." className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-slate-50 focus:border-yellow-400 focus:outline-none transition-all text-lg" value={formData.topic} onChange={(e) => setFormData({...formData, topic: e.target.value})} />
                        </div>
                      )}

                      {inputMethod === InputMethod.PASTE && (
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Manual Content or Questions</label>
                          <textarea required placeholder="Paste your notes, existing questions, or a block of text here..." className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-slate-50 focus:border-yellow-400 focus:outline-none transition-all text-lg min-h-[200px]" value={formData.rawText} onChange={(e) => setFormData({...formData, rawText: e.target.value})} />
                        </div>
                      )}

                      {inputMethod === InputMethod.UPLOAD && (
                        <div onClick={() => fileInputRef.current?.click()} className="border-4 border-dashed border-slate-100 rounded-[2rem] p-12 text-center hover:border-yellow-200 transition-all cursor-pointer group bg-slate-50/50">
                          <input type="file" ref={fileInputRef} className="hidden" accept="image/*,application/pdf" onChange={handleFileChange} />
                          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-all">
                            <Upload className="w-10 h-10 text-yellow-400" />
                          </div>
                          <p className="font-bold text-slate-600 text-lg">{fileData ? "File Ready to Scan!" : "Drop PDF or Image here"}</p>
                          <p className="text-slate-400 mt-2 text-sm italic">Gemini will analyze the content for you.</p>
                        </div>
                      )}

                      {/* Common Settings */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Student Level</label>
                          <select className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-slate-50 focus:border-yellow-400 focus:outline-none transition-all" value={formData.gradeLevel} onChange={(e) => setFormData({...formData, gradeLevel: e.target.value})}>
                            <option>Elementary</option><option>Middle School</option><option>High School</option><option>University</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Items Count</label>
                          <input type="number" min="1" max="20" className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-slate-50 focus:border-yellow-400 focus:outline-none transition-all" value={formData.numQuestions} onChange={(e) => setFormData({...formData, numQuestions: parseInt(e.target.value)})} />
                        </div>
                      </div>

                      {/* Advanced Settings */}
                      <div className="pt-2">
                        <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 font-bold text-sm transition-all">
                          {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          Advanced Customization
                        </button>
                        
                        {showAdvanced && (
                          <div className="grid grid-cols-2 gap-4 mt-4 p-6 bg-slate-50 rounded-[2rem] animate-in slide-in-from-top-2 duration-300">
                            <div>
                              <label className="block text-xs uppercase tracking-widest font-black text-slate-400 mb-2 flex items-center gap-2">
                                <Zap className="w-3 h-3" /> Difficulty
                              </label>
                              <select className="w-full p-3 rounded-xl bg-white border border-slate-200 focus:border-yellow-400 outline-none text-sm" value={formData.difficulty} onChange={(e) => setFormData({...formData, difficulty: e.target.value})}>
                                <option>Easy</option><option>Medium</option><option>Hard</option><option>Expert</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs uppercase tracking-widest font-black text-slate-400 mb-2 flex items-center gap-2">
                                <Globe className="w-3 h-3" /> Language
                              </label>
                              <select className="w-full p-3 rounded-xl bg-white border border-slate-200 focus:border-yellow-400 outline-none text-sm" value={formData.language} onChange={(e) => setFormData({...formData, language: e.target.value})}>
                                <option>English</option><option>Spanish</option><option>French</option><option>German</option><option>Chinese</option>
                              </select>
                            </div>
                          </div>
                        )}
                      </div>

                      <button type="submit" className="w-full py-5 bg-yellow-400 text-yellow-900 rounded-[2rem] font-black text-2xl hover:bg-yellow-500 transition-all flex items-center justify-center gap-3 shadow-[0px_8px_0px_0px_#ca8a04] active:shadow-none active:translate-y-1">
                        <Sparkles className="w-7 h-7" /> Generate Worksheet
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {mode === AppMode.WORKSHEET && worksheet && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-8">
                  <WorksheetView worksheet={worksheet} theme={theme} />
                </div>
              )}

              {mode === AppMode.QUIZ && worksheet && (
                <div className="animate-in fade-in zoom-in duration-500 pt-8">
                  <QuizView worksheet={worksheet} theme={theme} onExit={() => setMode(AppMode.WORKSHEET)} />
                </div>
              )}
            </>
          )}
        </div>
      </main>
      
      <style>{`
        @media print {
          aside { display: none !important; }
          main { margin-left: 0 !important; }
          .p-8 { padding: 0 !important; }
          @page { size: auto; margin: 0; }
        }
      `}</style>
    </div>
  );
};

export default App;

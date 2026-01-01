
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { AppMode, Worksheet, ThemeType, QuestionType, VariationLevel } from './types';
import { generateWorksheet, generateTopicScopeSuggestion, analyzeSourceMaterial, refineSourceText } from './services/geminiService';
import { WorksheetView } from './components/WorksheetView';
import { QuizView } from './components/QuizView';
import { MarkerHighlight } from './components/HandwritingElements';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
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
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Save,
  Trash2,
  History,
  Plus,
  Minus,
  FileIcon,
  X,
  Camera,
  RotateCcw,
  Key,
  ToggleRight,
  ToggleLeft,
  Info,
  Type as TypeIcon,
  CheckSquare,
  HelpCircle,
  Hash,
  PenTool,
  Trophy,
  Activity,
  Zap,
  Wand2,
  Printer,
  FileDown,
  FastForward,
  FileJson,
  Lock,
  Award,
  Search,
  FileStack,
  Palette,
  MousePointer2,
  Sigma,
  Box,
  Tags,
  ImageIcon,
  Clock,
  ChevronRight,
  PlusCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Dices,
  RotateCw,
  FlaskConical,
  Target,
  Globe,
  BarChart
} from 'lucide-react';

const WorksheetSkeleton: React.FC<{ theme: ThemeType }> = ({ theme }) => {
  const isCreative = theme === ThemeType.CREATIVE;
  return (
    <div className={`w-full max-w-4xl mx-auto bg-white p-[12mm] shadow-lg min-h-[297mm] relative transition-all duration-500 border border-slate-100 ${isCreative ? 'border-blue-50' : ''}`}>
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
            <p className="text-slate-500 font-medium mt-2">Teach in Minutes is carefully preparing your worksheet!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.GENERATOR);
  const [theme, setTheme] = useState<ThemeType>(ThemeType.CLASSIC);
  const [showDoodles, setShowDoodles] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [worksheet, setWorksheet] = useState<Worksheet | null>(null);
  const [savedWorksheets, setSavedWorksheets] = useState<Worksheet[]>([]);
  const [loading, setLoading] = useState(false);
  const [isGeneratingScope, setIsGeneratingScope] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showTeacherKey, setShowTeacherKey] = useState(false);
  const [isMathMode, setIsMathMode] = useState(false);
  
  const [formData, setFormData] = useState<{
    topic: string;
    customTitle: string;
    educationalLevel: string;
    difficulty: string;
    language: string;
    rawText: string;
    pageCount: number;
    includeTracing: boolean;
    includeDiagram: boolean;
    diagramLabelType: 'LABELED' | 'BLANK';
    questionCounts: Record<QuestionType, number>;
    variationLevels: Record<QuestionType, VariationLevel>;
  }>({
    topic: '',
    customTitle: '',
    educationalLevel: 'Grade 10 (Sophomore)',
    difficulty: 'Medium',
    language: 'English',
    rawText: '',
    pageCount: 1,
    includeTracing: false,
    includeDiagram: false,
    diagramLabelType: 'LABELED',
    questionCounts: {
      [QuestionType.MCQ]: 2,
      [QuestionType.TF]: 2,
      [QuestionType.SHORT_ANSWER]: 1,
      [QuestionType.VOCABULARY]: 1,
      [QuestionType.CHARACTER_DRILL]: 0,
      [QuestionType.SYMBOL_DRILL]: 0,
      [QuestionType.SENTENCE_DRILL]: 0,
    },
    variationLevels: {
      [QuestionType.MCQ]: VariationLevel.STRICT,
      [QuestionType.TF]: VariationLevel.STRICT,
      [QuestionType.SHORT_ANSWER]: VariationLevel.REPHRASE,
      [QuestionType.VOCABULARY]: VariationLevel.REPHRASE,
      [QuestionType.CHARACTER_DRILL]: VariationLevel.STRICT,
      [QuestionType.SYMBOL_DRILL]: VariationLevel.STRICT,
      [QuestionType.SENTENCE_DRILL]: VariationLevel.STRICT,
    }
  });

  const [fileData, setFileData] = useState<{ data: string; mimeType: string; name: string; preview?: string } | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const educationalLevels = [
    "Preschool (Ages 3-5)",
    "Kindergarten",
    "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5",
    "Grade 6", "Grade 7", "Grade 8",
    "Grade 9 (Freshman)", "Grade 10 (Sophomore)", "Grade 11 (Junior)", "Grade 12 (Senior)",
    "University / College",
    "Graduate / PhD Level",
    "Professional / Corporate Track"
  ];

  const difficulties = ["Easy", "Medium", "Hard", "Expert"];
  const languages = ["English", "Spanish", "French", "German", "Chinese", "Japanese"];

  const isPreschool = formData.educationalLevel.includes("Preschool");

  useEffect(() => {
    if (isPreschool) {
      setTheme(ThemeType.CREATIVE);
      setShowDoodles(true);
    }
  }, [formData.educationalLevel, isPreschool]);

  const totalQuestions = (Object.values(formData.questionCounts) as number[]).reduce((a: number, b: number) => a + b, 0);

  useEffect(() => {
    const saved = localStorage.getItem('tm_saved_worksheets');
    if (saved) {
      try {
        setSavedWorksheets(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved worksheets");
      }
    }
  }, []);

  const handleSaveCurrent = () => {
    if (!worksheet) return;
    const newSaved = [...savedWorksheets];
    const existingIdx = newSaved.findIndex(w => w.id === worksheet.id);
    const worksheetToSave = { ...worksheet, id: worksheet.id || Date.now().toString(), savedAt: Date.now() };
    if (existingIdx >= 0) newSaved[existingIdx] = worksheetToSave;
    else newSaved.unshift(worksheetToSave);
    localStorage.setItem('tm_saved_worksheets', JSON.stringify(newSaved));
    setSavedWorksheets(newSaved);
    alert("Worksheet saved to library!");
  };

  const handleDeleteSaved = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSaved = savedWorksheets.filter(w => w.id !== id);
    localStorage.setItem('tm_saved_worksheets', JSON.stringify(newSaved));
    setSavedWorksheets(newSaved);
  };

  const handleLoadSaved = (saved: Worksheet) => {
    setWorksheet(saved);
    setMode(AppMode.WORKSHEET);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64String = result.split(',')[1];
        const newFileData = { data: base64String, mimeType: file.type, name: file.name, preview: file.type.startsWith('image/') ? result : undefined };
        setFileData(newFileData);
        triggerAnalysis(newFileData, formData.rawText);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerAnalysis = async (fData?: { data: string; mimeType: string }, rText?: string) => {
    if (!fData && !rText) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeSourceMaterial(fData, rText);
      if (result) {
        setFormData(prev => ({ ...prev, customTitle: result.suggestedTitle, topic: result.suggestedTopicScope }));
      }
    } catch (e) { console.error(e); } finally { setIsAnalyzing(false); }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg');
        const base64String = dataUrl.split(',')[1];
        const newFileData = { data: base64String, mimeType: 'image/jpeg', name: `camera_capture_${Date.now()}.jpg`, preview: dataUrl };
        setFileData(newFileData);
        setIsCameraActive(false);
        triggerAnalysis(newFileData, formData.rawText);
      }
    }
  };

  const handleRefineText = async () => {
    if (!formData.rawText.trim()) return;
    setIsRefining(true);
    try {
      const refined = await refineSourceText(formData.rawText);
      setFormData(prev => ({ ...prev, rawText: refined }));
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefining(false);
    }
  };

  const handleSuggestScope = async () => {
    if (!formData.customTitle.trim()) {
      alert("Please provide a title first.");
      return;
    }
    setIsGeneratingScope(true);
    try {
      const scope = await generateTopicScopeSuggestion(formData.customTitle, formData.educationalLevel);
      setFormData(prev => ({ ...prev, topic: scope }));
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingScope(false);
    }
  };

  const handleGenerate = async () => {
    const isInfographic = theme === ThemeType.CREATIVE && !isPreschool;
    if (!isPreschool && !isInfographic && totalQuestions === 0 && !formData.includeDiagram) {
      alert("Please select at least one question type count or include a diagram.");
      return;
    }
    if (!formData.topic.trim()) {
      alert("Please provide a topic focus.");
      return;
    }
    setLoading(true);
    try {
      const result = await generateWorksheet({
        topic: formData.topic,
        customTitle: formData.customTitle,
        gradeLevel: formData.educationalLevel,
        difficulty: formData.difficulty,
        language: formData.language,
        questionCounts: formData.questionCounts,
        variationLevels: formData.variationLevels,
        pageTarget: formData.pageCount,
        includeTracing: formData.includeTracing,
        includeDiagram: formData.includeDiagram,
        diagramLabelType: formData.diagramLabelType,
        fileData: fileData || undefined,
        rawText: formData.rawText || undefined,
        theme: theme,
        isMathMode: isMathMode
      });
      setWorksheet({ ...result, id: Date.now().toString(), savedAt: Date.now(), educationalLevel: formData.educationalLevel });
      setMode(AppMode.WORKSHEET);
    } catch (error) { alert("Failed to generate worksheet."); } finally { setLoading(false); }
  };

  const startWithBlankSheet = () => {
    setWorksheet({ id: Date.now().toString(), title: formData.customTitle || "Untitled Academic Document", topic: formData.topic || "Manual Construction", educationalLevel: formData.educationalLevel, questions: [], savedAt: Date.now() });
    setMode(AppMode.WORKSHEET);
  };

  const handleExportPDF = async () => {
    const element = document.getElementById('worksheet-content');
    if (!element) return;
    setLoading(true);
    try {
      const canvas = await html2canvas(element, { scale: 3, useCORS: true, logging: false, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${worksheet?.title || 'worksheet'}.pdf`);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleExportJSON = () => {
    if (!worksheet) return;
    const link = document.createElement('a');
    link.href = 'data:application/json;charset=utf-8,'+ encodeURIComponent(JSON.stringify(worksheet, null, 2));
    link.download = `${(worksheet.title || 'worksheet').replace(/\s+/g, '_').toLowerCase()}.json`;
    link.click();
  };

  const updateCount = (type: QuestionType, delta: number) => {
    setFormData(prev => ({ ...prev, questionCounts: { ...prev.questionCounts, [type]: Math.max(0, Math.min(10, prev.questionCounts[type] + delta)) } }));
  };

  const updateVariation = (type: QuestionType, level: VariationLevel) => {
    setFormData(prev => ({ ...prev, variationLevels: { ...prev.variationLevels, [type]: level } }));
  };

  const nextStep = () => currentStep < 4 && setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));
  const skipStep = () => {
     if (currentStep < 3) nextStep();
     else if (currentStep === 3) {
       if (!formData.topic.trim()) setFormData(prev => ({ ...prev, topic: "General Assessment", customTitle: prev.customTitle || "New Worksheet" }));
       nextStep();
     }
  };

  const getVariationIcon = (level: VariationLevel) => {
    switch(level) {
      case VariationLevel.STRICT: return <Target className="w-3.5 h-3.5" />;
      case VariationLevel.REPHRASE: return <RotateCw className="w-3.5 h-3.5" />;
      case VariationLevel.CREATIVE: return <FlaskConical className="w-3.5 h-3.5" />;
    }
  };

  const getVariationLabel = (level: VariationLevel) => {
    switch(level) {
      case VariationLevel.STRICT: return 'Slightly Alter';
      case VariationLevel.REPHRASE: return 'Significantly Rephrase';
      case VariationLevel.CREATIVE: return 'Generate Similar';
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className="w-80 bg-white border-r border-slate-200 hidden lg:flex flex-col fixed h-full z-10 no-print">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg transform -rotate-3"><GraduationCap className="text-white w-6 h-6" /></div>
          <div><h1 className="font-handwriting-header text-2xl text-slate-800">Teach in Minutes</h1><p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Educational Generator</p></div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <div><h3 className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-4 flex items-center gap-2"><Award className="w-3 h-3" /> Master Level</h3><select className="w-full p-3 rounded-xl bg-slate-100 border-2 border-transparent focus:border-blue-400 focus:bg-white outline-none font-bold text-slate-700 text-sm transition-all" value={formData.educationalLevel} onChange={(e) => setFormData({...formData, educationalLevel: e.target.value})}>{educationalLevels.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}</select></div>
          <div><h3 className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-4 flex items-center gap-2"><Layers className="w-3 h-3" /> Tools</h3><div className="space-y-2"><button onClick={() => { setMode(AppMode.GENERATOR); setCurrentStep(1); }} className={`w-full flex items-center gap-3 p-3 rounded-xl font-medium transition-all ${mode === AppMode.GENERATOR ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50'}`}><Plus className="w-5 h-5 text-yellow-500" /> New Session</button><button onClick={() => worksheet && setMode(AppMode.WORKSHEET)} disabled={!worksheet} className={`w-full flex items-center gap-3 p-3 rounded-xl font-medium transition-all ${mode === AppMode.WORKSHEET ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50 disabled:opacity-30'}`}><FileText className="w-5 h-5" /> Active Sheet</button></div></div>
          <div><h3 className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-4 flex items-center gap-2"><History className="w-3 h-3" /> Archive</h3><div className="space-y-2 max-h-72 overflow-y-auto pr-2">{savedWorksheets.map((saved) => (<div key={saved.id} onClick={() => handleLoadSaved(saved)} className="group relative flex flex-col p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-yellow-200 hover:shadow-sm cursor-pointer transition-all"><span className="font-bold text-slate-700 text-xs truncate pr-6">{saved.title}</span><button onClick={(e) => handleDeleteSaved(saved.id!, e)} className="absolute right-2 top-2 p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-3 h-3" /></button></div>))}</div></div>
          {worksheet && (<div className="pt-8 border-t border-slate-100 space-y-3"><button onClick={handleSaveCurrent} className="w-full flex items-center justify-center gap-3 p-4 bg-yellow-400 text-yellow-900 rounded-2xl font-black hover:bg-yellow-500 transition-all shadow-lg active:scale-95"><Save className="w-5 h-5" /> Save To Library</button></div>)}
        </div>
      </aside>

      <main className="flex-1 lg:ml-80 min-h-screen relative">
        <div className="p-4 sm:p-8">
          {loading ? (<div className="pt-12"><WorksheetSkeleton theme={theme} /></div>) : (
            <>
              {mode === AppMode.GENERATOR && (
                <div className="max-w-5xl mx-auto pt-8">
                  <div className="text-center mb-10"><h2 className="font-handwriting-header text-5xl sm:text-7xl text-slate-800 mb-4">Teach in <MarkerHighlight>Minutes</MarkerHighlight></h2><div className="flex items-center justify-center gap-3 mt-10">
                    {[1, 2, 3, 4].map((s: number) => (
                      <div key={s} className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm border-2 ${Number(currentStep) === s ? 'bg-yellow-400 border-yellow-400 text-white shadow-xl scale-110' : Number(currentStep) > s ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-slate-200 text-slate-300'}`}>
                        {/* Cast currentStep to number to ensure type safety in comparison */}
                        {Number(currentStep) > s ? <CheckCircle2 className="w-6 h-6" /> : s}
                      </div>
                    ))}
                  </div></div>
                  <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden mb-12 flex flex-col min-h-[600px]">
                    <div className="flex-1 p-8 sm:p-12">
                      {currentStep === 1 && (
                        <div className="animate-in slide-in-from-right duration-500 h-full flex flex-col justify-center items-center gap-8">
                          <h3 className="text-3xl font-black text-slate-800">1. Target Audience</h3>
                          <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 bg-slate-50 rounded-3xl border-2 border-slate-100 space-y-4">
                              <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest"><Award className="w-4 h-4" /> Educational Level</label>
                              <select 
                                className="w-full p-4 rounded-xl bg-white border-2 border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-700"
                                value={formData.educationalLevel}
                                onChange={(e) => setFormData({...formData, educationalLevel: e.target.value})}
                              >
                                {educationalLevels.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                              </select>
                            </div>
                            <div className="p-6 bg-slate-50 rounded-3xl border-2 border-slate-100 space-y-4">
                              <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest"><BarChart className="w-4 h-4" /> Assessment Difficulty</label>
                              <select 
                                className="w-full p-4 rounded-xl bg-white border-2 border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-700"
                                value={formData.difficulty}
                                onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                              >
                                {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
                              </select>
                            </div>
                            <div className="p-6 bg-slate-50 rounded-3xl border-2 border-slate-100 space-y-4 md:col-span-2">
                              <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest"><Globe className="w-4 h-4" /> Instruction Language</label>
                              <select 
                                className="w-full p-4 rounded-xl bg-white border-2 border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-700"
                                value={formData.language}
                                onChange={(e) => setFormData({...formData, language: e.target.value})}
                              >
                                {languages.map(l => <option key={l} value={l}>{l}</option>)}
                              </select>
                            </div>
                          </div>
                          <p className="text-xs text-slate-400 font-medium italic text-center max-w-lg">Setting the grade level first helps the AI tailor the vocabulary and cognitive depth of generated questions.</p>
                        </div>
                      )}
                      {currentStep === 2 && (
                        <div className="animate-in slide-in-from-right duration-500 h-full flex flex-col justify-center items-center gap-8">
                          <h3 className="text-3xl font-black text-slate-800">2. Input Material</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-2xl">
                            <div onClick={() => fileInputRef.current?.click()} className="border-4 border-dashed border-slate-100 rounded-[2.5rem] p-12 text-center hover:border-yellow-200 transition-all cursor-pointer group bg-slate-50/50 flex flex-col items-center">
                              <input type="file" ref={fileInputRef} className="hidden" accept="image/*,application/pdf" onChange={handleFileChange} />
                              <Upload className="w-12 h-12 text-yellow-500 mb-4 group-hover:scale-110 transition-transform" />
                              <p className="font-bold text-slate-700">Scan Textbook/Doc</p>
                            </div>
                            <div onClick={() => setIsCameraActive(true)} className="border-4 border-dashed border-slate-100 rounded-[2.5rem] p-12 text-center hover:border-yellow-200 transition-all cursor-pointer group bg-slate-50/50 flex flex-col items-center">
                              <Camera className="w-12 h-12 text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
                              <p className="font-bold text-slate-700">Live Snap</p>
                            </div>
                          </div>
                          <div className="w-full max-w-2xl relative">
                            <textarea 
                              className="w-full p-6 h-40 rounded-3xl bg-slate-50 border-2 border-slate-100 focus:border-yellow-400 focus:bg-white outline-none font-medium resize-none shadow-inner" 
                              placeholder="Or paste text directly here..." 
                              value={formData.rawText} 
                              onChange={(e) => setFormData({...formData, rawText: e.target.value})} 
                            />
                            {formData.rawText && (
                              <button 
                                onClick={handleRefineText}
                                className="absolute bottom-4 right-4 bg-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-blue-600 shadow-lg flex items-center gap-2 hover:bg-blue-50 transition-all active:scale-95"
                              >
                                {isRefining ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                AI Refine
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                      {currentStep === 3 && (
                        <div className="animate-in slide-in-from-right duration-500 h-full flex flex-col gap-8">
                          <h3 className="text-3xl font-black text-slate-800">3. Title & Topic Scope</h3>
                          <div className="space-y-6">
                            <div>
                              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Display Title</label>
                              <input className="w-full p-6 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-yellow-400 outline-none font-bold text-xl" value={formData.customTitle} onChange={(e) => setFormData({...formData, customTitle: e.target.value})} placeholder="e.g. History of the Industrial Revolution" />
                            </div>
                            <div>
                              <div className="flex justify-between items-end mb-2 ml-2">
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Target Concepts</label>
                                <button 
                                  onClick={handleSuggestScope}
                                  disabled={isGeneratingScope || !formData.customTitle.trim()}
                                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-700 transition-colors disabled:opacity-30"
                                >
                                  {isGeneratingScope ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                  AI Suggest
                                </button>
                              </div>
                              <textarea className="w-full p-6 h-40 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-yellow-400 outline-none font-medium text-xl shadow-inner" value={formData.topic} onChange={(e) => setFormData({...formData, topic: e.target.value})} placeholder="Detail the sub-topics to focus on..." />
                            </div>
                          </div>
                        </div>
                      )}
                      {currentStep === 4 && (
                        <div className="animate-in slide-in-from-right duration-500 h-full flex flex-col gap-8">
                           <div className="flex items-center justify-between">
                             <h3 className="text-3xl font-black text-slate-800">4. Question Inventory</h3>
                             <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
                               <Award className="w-4 h-4 text-yellow-500" /> {formData.educationalLevel}
                             </div>
                           </div>
                           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                              <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 h-fit">
                                 <div className="flex items-center justify-between mb-6">
                                   <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Question Strategy</h4>
                                   <Info className="w-4 h-4 text-slate-300 cursor-help" title="Variation levels control how much the AI rephrases your source material." />
                                 </div>
                                 <div className="space-y-4">
                                    {Object.entries(formData.questionCounts).map(([typeStr, count]) => {
                                      const type = typeStr as QuestionType;
                                      return (
                                        <div key={type} className={`flex flex-col gap-3 p-4 bg-white rounded-2xl shadow-sm transition-all border-2 ${count > 0 ? 'border-blue-100' : 'border-transparent opacity-60'}`}>
                                          <div className="flex items-center justify-between">
                                            <span className="font-black text-slate-700 capitalize text-sm">{type.toLowerCase().replace('_', ' ')}</span>
                                            <div className="flex items-center gap-3">
                                              <button onClick={() => updateCount(type, -1)} className="p-1 text-slate-300 hover:text-red-500 transition-colors"><Minus className="w-5 h-5" /></button>
                                              <span className="font-black w-4 text-center text-lg">{count}</span>
                                              <button onClick={() => updateCount(type, 1)} className="p-1 text-slate-300 hover:text-blue-500 transition-colors"><Plus className="w-5 h-5" /></button>
                                            </div>
                                          </div>
                                          
                                          {count > 0 && (
                                            <div className="flex gap-2">
                                              {[VariationLevel.STRICT, VariationLevel.REPHRASE, VariationLevel.CREATIVE].map((lvl) => (
                                                <button
                                                  key={lvl}
                                                  onClick={() => updateVariation(type, lvl)}
                                                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all border-2 ${
                                                    formData.variationLevels[type] === lvl 
                                                      ? 'bg-blue-600 border-blue-600 text-white shadow-md scale-105' 
                                                      : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200'
                                                  }`}
                                                  title={getVariationLabel(lvl)}
                                                >
                                                  {getVariationIcon(lvl)}
                                                  <span className="hidden sm:inline">{getVariationLabel(lvl).split(' ')[1] || 'Similar'}</span>
                                                </button>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                 </div>
                              </div>
                              <div className="space-y-6">
                                 <div className="p-8 bg-white rounded-[2.5rem] border-2 border-slate-100 shadow-sm space-y-6 h-fit">
                                    <div className="flex items-center justify-between">
                                       <div className="flex items-center gap-3">
                                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md transition-colors ${isMathMode ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}><Sigma className="w-6 h-6" /></div>
                                          <div>
                                             <span className="block font-black uppercase tracking-widest text-[10px] text-slate-400">Scientific Mode</span>
                                             <span className="block font-bold text-slate-800 text-sm">Math Spacing</span>
                                          </div>
                                       </div>
                                       <button 
                                          onClick={() => setIsMathMode(!isMathMode)}
                                          className={`relative w-14 h-8 rounded-full transition-colors duration-300 focus:outline-none ${isMathMode ? 'bg-blue-600' : 'bg-slate-200'}`}
                                       >
                                          <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isMathMode ? 'translate-x-6' : 'translate-x-0'}`} />
                                       </button>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Sheet Metadata</p>
                                      <div className="space-y-1">
                                        <div className="flex justify-between text-xs"><span className="text-slate-400">Level:</span><span className="font-bold text-slate-700">{formData.educationalLevel}</span></div>
                                        <div className="flex justify-between text-xs"><span className="text-slate-400">Difficulty:</span><span className="font-bold text-slate-700">{formData.difficulty}</span></div>
                                        <div className="flex justify-between text-xs"><span className="text-slate-400">Items:</span><span className="font-bold text-slate-700">{totalQuestions}</span></div>
                                      </div>
                                    </div>
                                 </div>
                                 
                                 <button onClick={handleGenerate} className="w-full py-8 bg-yellow-400 text-yellow-900 rounded-[2.5rem] font-black text-2xl shadow-2xl hover:bg-yellow-500 active:scale-95 transition-all flex items-center justify-center gap-4">
                                   <Wand2 className="w-8 h-8" />
                                   Synthesize Sheet
                                 </button>
                              </div>
                           </div>
                        </div>
                      )}
                    </div>
                    <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                       <div className="flex gap-4"><button onClick={prevStep} disabled={currentStep === 1} className="flex items-center gap-2 px-8 py-4 text-slate-400 font-black uppercase disabled:opacity-0 transition-all"><ArrowLeft className="w-6 h-6" /> Back</button></div>
                       <div className="flex gap-4 items-center">{currentStep < 4 && (<button onClick={skipStep} className="flex items-center gap-2 px-6 py-4 text-slate-400 font-black uppercase hover:text-slate-600 transition-all">Skip Step</button>)}<button onClick={nextStep} disabled={currentStep === 4 || (currentStep === 3 && !formData.topic.trim())} className="flex items-center gap-2 px-10 py-4 bg-white border-2 border-slate-100 rounded-2xl font-black uppercase text-slate-800 shadow-sm active:scale-95 disabled:opacity-50 disabled:bg-slate-50 disabled:text-slate-200 transition-all">Next <ArrowRight className="w-6 h-6" /></button></div>
                    </div>
                  </div>
                </div>
              )}
              {mode === AppMode.WORKSHEET && worksheet && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pt-8 pb-32">
                  <div className="max-w-4xl mx-auto mb-8 bg-white p-4 rounded-3xl shadow-sm border border-slate-100 no-print sticky top-4 z-50 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                      <button onClick={() => setMode(AppMode.GENERATOR)} className="p-3 bg-slate-100 rounded-xl text-slate-500 hover:text-slate-800"><ArrowLeft className="w-5 h-5" /></button>
                      <div className="font-bold text-slate-600">Document Editor</div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <button 
                        onClick={() => setShowTeacherKey(!showTeacherKey)} 
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold transition-all active:scale-95 border-2 ${showTeacherKey ? 'bg-red-50 border-red-200 text-red-600 shadow-inner' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                        title={showTeacherKey ? "Hide Answer Key" : "Show Answer Key"}
                      >
                        {showTeacherKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        <span className="hidden sm:inline">Teacher Key</span>
                      </button>
                      <button 
                        onClick={() => setMode(AppMode.QUIZ)} 
                        className="flex items-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-xl font-bold shadow-lg active:scale-95 hover:bg-purple-700"
                      >
                        <PlayCircle className="w-5 h-5" />
                        <span className="hidden sm:inline">Start Quiz</span>
                      </button>
                      <button onClick={handleExportPDF} className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg active:scale-95 hover:bg-blue-700">
                        <Printer className="w-5 h-5" />
                        <span className="hidden sm:inline">PDF</span>
                      </button>
                      <button onClick={handleExportJSON} className="flex items-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-xl font-bold active:scale-95 hover:bg-slate-800">
                        <FileJson className="w-5 h-5" />
                        <span className="hidden sm:inline">Data</span>
                      </button>
                      <button onClick={handleSaveCurrent} className="flex items-center gap-2 px-4 py-3 bg-yellow-400 text-yellow-900 rounded-xl font-bold active:scale-95 hover:bg-yellow-500">
                        <Save className="w-5 h-5" />
                        <span className="hidden sm:inline">Save</span>
                      </button>
                    </div>
                  </div>
                  <WorksheetView worksheet={worksheet} theme={theme} showKey={showTeacherKey} isMathMode={isMathMode} />
                </div>
              )}
              {mode === AppMode.QUIZ && worksheet && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pt-8 pb-32">
                  <QuizView 
                    worksheet={worksheet} 
                    theme={theme} 
                    onExit={() => setMode(AppMode.WORKSHEET)} 
                  />
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;

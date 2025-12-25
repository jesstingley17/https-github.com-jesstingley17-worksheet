
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { AppMode, Worksheet, ThemeType, QuestionType } from './types';
import { generateWorksheet, generateTopicScopeSuggestion, analyzeSourceMaterial } from './services/geminiService';
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
  Image as ImageIcon
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
            <p className="text-slate-500 font-medium mt-2">Homework Hero is carefully preparing your worksheet!</p>
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
  const [currentStep, setCurrentStep] = useState(1);
  const [worksheet, setWorksheet] = useState<Worksheet | null>(null);
  const [savedWorksheets, setSavedWorksheets] = useState<Worksheet[]>([]);
  const [loading, setLoading] = useState(false);
  const [isGeneratingScope, setIsGeneratingScope] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<number | null>(null);
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
  }>({
    topic: '',
    customTitle: '',
    educationalLevel: 'High School',
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
    }
  });

  const [fileData, setFileData] = useState<{ data: string; mimeType: string; name: string; preview?: string } | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const presets: Record<string, Record<QuestionType, number>> = useMemo(() => ({
    "Classic Exam": {
      [QuestionType.MCQ]: 4,
      [QuestionType.TF]: 2,
      [QuestionType.SHORT_ANSWER]: 2,
      [QuestionType.VOCABULARY]: 0,
      [QuestionType.CHARACTER_DRILL]: 0,
      [QuestionType.SYMBOL_DRILL]: 0,
      [QuestionType.SENTENCE_DRILL]: 0,
    },
    "Skill Practice": {
      [QuestionType.MCQ]: 0,
      [QuestionType.TF]: 0,
      [QuestionType.SHORT_ANSWER]: 0,
      [QuestionType.VOCABULARY]: 3,
      [QuestionType.CHARACTER_DRILL]: 2,
      [QuestionType.SYMBOL_DRILL]: 2,
      [QuestionType.SENTENCE_DRILL]: 1,
    },
    "Mixed Hero": {
      [QuestionType.MCQ]: 2,
      [QuestionType.TF]: 2,
      [QuestionType.SHORT_ANSWER]: 1,
      [QuestionType.VOCABULARY]: 1,
      [QuestionType.CHARACTER_DRILL]: 1,
      [QuestionType.SYMBOL_DRILL]: 0,
      [QuestionType.SENTENCE_DRILL]: 1,
    }
  }), []);

  const activePreset = useMemo(() => {
    return Object.entries(presets).find(([_, counts]) => {
      return Object.entries(counts).every(([type, count]) => formData.questionCounts[type as QuestionType] === count);
    })?.[0] || null;
  }, [formData.questionCounts, presets]);

  const educationalLevels = [
    "Preschool (3-5 years)",
    "Elementary School",
    "Middle School",
    "High School",
    "University / College",
    "Professional / Adult"
  ];

  const isPreschool = formData.educationalLevel.includes("Preschool");
  const isSeniorLevel = 
    formData.educationalLevel === 'High School' || 
    formData.educationalLevel === 'University / College' || 
    formData.educationalLevel === 'Professional / Adult';

  // Force Creative/Doodles for Preschool, Classic for Senior
  useEffect(() => {
    if (isSeniorLevel && theme === ThemeType.CREATIVE) {
      setTheme(ThemeType.CLASSIC);
      setShowDoodles(false);
    }
    if (isPreschool) {
      setTheme(ThemeType.CREATIVE);
      setShowDoodles(true);
    }
  }, [formData.educationalLevel, isSeniorLevel, isPreschool, theme]);

  const totalQuestions = (Object.values(formData.questionCounts) as number[]).reduce((a: number, b: number) => a + b, 0);

  useEffect(() => {
    const saved = localStorage.getItem('helen_saved_worksheets');
    if (saved) {
      try {
        setSavedWorksheets(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved worksheets");
      }
    }

    const savedDraft = localStorage.getItem('helen_generator_draft');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setFormData(parsed);
      } catch (e) {
        console.error("Failed to parse generator draft");
      }
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('helen_generator_draft', JSON.stringify(formData));
      setLastSavedTime(Date.now());
    }, 1000);

    return () => clearTimeout(timer);
  }, [formData]);

  useEffect(() => {
    if (isCameraActive && videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => {
          console.error("Camera error:", err);
          alert("Could not access camera. Please check permissions.");
          setIsCameraActive(false);
        });
    }

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraActive]);

  const triggerAnalysis = async (fData?: { data: string; mimeType: string }, rText?: string) => {
    if (!fData && !rText) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeSourceMaterial(fData, rText);
      if (result) {
        setFormData(prev => ({
          ...prev,
          customTitle: result.suggestedTitle,
          topic: result.suggestedTopicScope
        }));
      }
    } catch (e) {
      console.error("Analysis failed", e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveToStorage = (list: Worksheet[]) => {
    localStorage.setItem('helen_saved_worksheets', JSON.stringify(list));
    setSavedWorksheets(list);
  };

  const handleSaveCurrent = () => {
    if (!worksheet) return;
    const newSaved = [...savedWorksheets];
    const existingIdx = newSaved.findIndex(w => w.id === worksheet.id);
    
    const worksheetToSave = {
      ...worksheet,
      id: worksheet.id || Date.now().toString(),
      savedAt: Date.now()
    };

    if (existingIdx >= 0) {
      newSaved[existingIdx] = worksheetToSave;
    } else {
      newSaved.unshift(worksheetToSave);
    }
    saveToStorage(newSaved);
    alert("Worksheet saved to library!");
  };

  const handleDeleteSaved = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSaved = savedWorksheets.filter(w => w.id !== id);
    saveToStorage(newSaved);
  };

  const handleLoadSaved = (saved: Worksheet) => {
    setWorksheet(saved);
    setMode(AppMode.WORKSHEET);
  };

  const resetForm = () => {
    if (confirm("Clear all inputs and start fresh?")) {
      const empty = {
        topic: '',
        customTitle: '',
        educationalLevel: 'High School',
        difficulty: 'Medium',
        language: 'English',
        rawText: '',
        pageCount: 1,
        includeTracing: false,
        includeDiagram: false,
        diagramLabelType: 'LABELED' as const,
        questionCounts: {
          [QuestionType.MCQ]: 2,
          [QuestionType.TF]: 2,
          [QuestionType.SHORT_ANSWER]: 1,
          [QuestionType.VOCABULARY]: 1,
          [QuestionType.CHARACTER_DRILL]: 0,
          [QuestionType.SYMBOL_DRILL]: 0,
          [QuestionType.SENTENCE_DRILL]: 0,
        }
      };
      setFormData(empty);
      setFileData(null);
      setCurrentStep(1);
      localStorage.removeItem('helen_generator_draft');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64String = result.split(',')[1];
        const newFileData = { 
          data: base64String, 
          mimeType: file.type, 
          name: file.name,
          preview: file.type.startsWith('image/') ? result : undefined
        };
        setFileData(newFileData);
        triggerAnalysis(newFileData, formData.rawText);
      };
      reader.readAsDataURL(file);
    }
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
        const newFileData = {
          data: base64String,
          mimeType: 'image/jpeg',
          name: `camera_capture_${Date.now()}.jpg`,
          preview: dataUrl
        };
        setFileData(newFileData);
        setIsCameraActive(false);
        triggerAnalysis(newFileData, formData.rawText);
      }
    }
  };

  const handleGenerateScope = async () => {
    if (!formData.customTitle.trim()) {
      alert("Please enter a Display Title first so Helen can think of a scope!");
      return;
    }
    setIsGeneratingScope(true);
    try {
      const suggestion = await generateTopicScopeSuggestion(formData.customTitle, formData.educationalLevel);
      if (suggestion) {
        setFormData(prev => ({ ...prev, topic: suggestion }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingScope(false);
    }
  };

  const handleGenerate = async () => {
    if (!isPreschool && totalQuestions === 0 && !formData.includeDiagram) {
      alert("Please select at least one question type count or include a diagram.");
      return;
    }
    if (!formData.topic.trim()) {
      alert("Please provide a topic scope for the worksheet.");
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
        pageTarget: formData.pageCount,
        includeTracing: formData.includeTracing,
        includeDiagram: formData.includeDiagram,
        diagramLabelType: formData.diagramLabelType,
        fileData: fileData || undefined,
        rawText: formData.rawText || undefined,
      });
      const finalResult = { ...result, id: Date.now().toString(), savedAt: Date.now(), educationalLevel: formData.educationalLevel };
      setWorksheet(finalResult);
      setShowTeacherKey(false);
      setMode(AppMode.WORKSHEET);
    } catch (error) {
      alert("Something went wrong. Homework Hero is taking a break. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    const element = document.getElementById('worksheet-content');
    if (!element) return;
    
    setLoading(true);
    try {
      const canvas = await html2canvas(element, {
        scale: 2, 
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${worksheet?.title || 'homework_hero_worksheet'}.pdf`);
    } catch (error) {
      console.error('PDF Export failed:', error);
      alert('PDF generation failed. You can use the Print button as an alternative.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportJSON = () => {
    if (!worksheet) return;
    const dataStr = JSON.stringify(worksheet, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${(worksheet.title || 'worksheet').replace(/\s+/g, '_').toLowerCase()}_data.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const updateCount = (type: QuestionType, delta: number) => {
    setFormData(prev => ({
      ...prev,
      questionCounts: {
        ...prev.questionCounts,
        [type]: Math.max(0, Math.min(10, prev.questionCounts[type] + delta))
      }
    }));
  };

  const applyPreset = (presetName: string) => {
    if (presets[presetName]) {
      setFormData(prev => ({
        ...prev,
        questionCounts: presets[presetName]
      }));
    }
  };

  const nextStep = () => {
    if (currentStep === 3 && !formData.topic.trim()) {
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const glossaryItems = [
    { id: 'MCQ', label: 'MCQ', desc: 'Multiple Choice. Tests recognition and deductive logic.', icon: <CheckSquare className="w-4 h-4" /> },
    { id: 'TF', label: 'TF', desc: 'True or False. Best for binary factual verification.', icon: <HelpCircle className="w-4 h-4" /> },
    { id: 'SA', label: 'SA', desc: 'Short Answer. Tests deep comprehension and articulation.', icon: <TypeIcon className="w-4 h-4" /> },
    { id: 'VOC', label: 'VOC', desc: 'Vocabulary. Connects terms to contextual definitions.', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'CD', label: 'CD', desc: 'Character Drill. Precision motor skills for single letters.', icon: <PenTool className="w-4 h-4" /> },
    { id: 'SD', label: 'SD', desc: 'Symbol Drill. Visual mapping for math and science icons.', icon: <Hash className="w-4 h-4" /> },
    { id: 'SND', label: 'SND', desc: 'Sentence Drill. Narrative flow and line-work tracing.', icon: <AlignLeft className="w-4 h-4" /> },
  ];

  function AlignLeft({className}: {className: string}) {
    return <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="17" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="17" y1="18" x2="3" y2="18"></line></svg>;
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className="w-80 bg-white border-r border-slate-200 hidden lg:flex flex-col fixed h-full z-10 no-print">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg transform -rotate-3">
            <GraduationCap className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="font-handwriting-header text-2xl text-slate-800">Homework Hero</h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Educational Generator</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <div>
            <h3 className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-4 flex items-center gap-2">
              <Award className="w-3 h-3" /> Master Level
            </h3>
            <div className="space-y-2">
              <select 
                className="w-full p-3 rounded-xl bg-slate-100 border-2 border-transparent focus:border-blue-400 focus:bg-white outline-none font-bold text-slate-700 text-sm transition-all"
                value={formData.educationalLevel}
                onChange={(e) => setFormData({...formData, educationalLevel: e.target.value})}
              >
                {educationalLevels.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
              </select>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1 ml-1">
                Sets academic rigor & complexity
              </p>
            </div>
          </div>

          {!isPreschool && (
            <div>
              <h3 className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-4 flex items-center gap-2">
                <Settings className="w-3 h-3" /> Layout Style
              </h3>
              <div className="space-y-4">
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button onClick={() => setTheme(ThemeType.CLASSIC)} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${theme === ThemeType.CLASSIC ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>
                    <Layout className="w-4 h-4" /> Classic
                  </button>
                  <button 
                    disabled={isSeniorLevel}
                    onClick={() => setTheme(ThemeType.CREATIVE)} 
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${theme === ThemeType.CREATIVE ? 'bg-white shadow-sm text-yellow-600' : 'text-slate-400 disabled:opacity-40 disabled:cursor-not-allowed'}`}
                    title={isSeniorLevel ? "Creative mode is disabled for senior levels" : ""}
                  >
                    {isSeniorLevel ? <Lock className="w-3 h-3" /> : <Sparkles className="w-4 h-4" />} Creative
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex flex-col">
                    <span className={`text-xs font-bold ${isSeniorLevel ? 'text-slate-400' : 'text-slate-700'}`}>Visual Doodles</span>
                    <span className="text-[9px] text-slate-400 uppercase font-black">Professional Auto-Enforce</span>
                  </div>
                  <button 
                    disabled={isSeniorLevel}
                    onClick={() => setShowDoodles(!showDoodles)}
                    className={`transition-colors ${isSeniorLevel ? 'text-slate-200 cursor-not-allowed' : 'text-slate-400 hover:text-blue-500'}`}
                  >
                    {showDoodles && !isSeniorLevel ? <ToggleRight className="w-8 h-8 text-blue-500" /> : <ToggleLeft className="w-8 h-8" />}
                  </button>
                </div>
                {isSeniorLevel && (
                  <div className="p-2 bg-blue-50/50 rounded-lg border border-blue-100/50">
                    <p className="text-[9px] text-blue-600 font-bold leading-tight flex items-start gap-1.5">
                      <Info className="w-3 h-3 flex-shrink-0" />
                      Professional themes are mandatory for high school/university standards to ensure document integrity.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-4 flex items-center gap-2">
              <Layers className="w-3 h-3" /> Tools
            </h3>
            <div className="space-y-2">
              <button onClick={() => { setMode(AppMode.GENERATOR); setCurrentStep(1); }} className={`w-full flex items-center gap-3 p-3 rounded-xl font-medium transition-all ${mode === AppMode.GENERATOR ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50'}`}>
                <Plus className="w-5 h-5 text-yellow-500" /> New Session
              </button>
              <button onClick={() => worksheet && setMode(AppMode.WORKSHEET)} disabled={!worksheet} className={`w-full flex items-center gap-3 p-3 rounded-xl font-medium transition-all ${mode === AppMode.WORKSHEET ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50 disabled:opacity-30'}`}>
                <FileText className="w-5 h-5" /> Active Sheet
              </button>
              <button onClick={() => worksheet && setMode(AppMode.QUIZ)} disabled={!worksheet || isPreschool} className={`w-full flex items-center gap-3 p-3 rounded-xl font-medium transition-all ${mode === AppMode.QUIZ ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50 disabled:opacity-30'}`}>
                <PlayCircle className="w-5 h-5" /> Digital Practice
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-4 flex items-center gap-2">
              <History className="w-3 h-3" /> Archive
            </h3>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
              {savedWorksheets.length === 0 ? (
                <div className="text-center p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <BookOpen className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Empty Archive</p>
                </div>
              ) : (
                savedWorksheets.map((saved) => (
                  <div 
                    key={saved.id}
                    onClick={() => handleLoadSaved(saved)}
                    className="group relative flex flex-col p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-yellow-200 hover:shadow-sm cursor-pointer transition-all"
                  >
                    <span className="font-bold text-slate-700 text-xs truncate pr-6">{saved.title}</span>
                    <span className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">{saved.topic.slice(0, 30)}...</span>
                    <button 
                      onClick={(e) => handleDeleteSaved(saved.id!, e)}
                      className="absolute right-2 top-2 p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
          
          {worksheet && (
            <div className="pt-8 border-t border-slate-100 space-y-3">
              <button onClick={handleSaveCurrent} className="w-full flex items-center justify-center gap-3 p-4 bg-yellow-400 text-yellow-900 rounded-2xl font-black hover:bg-yellow-500 transition-all shadow-lg active:scale-95">
                <Save className="w-5 h-5" /> Save To Library
              </button>
              <button onClick={() => window.print()} className="w-full flex items-center justify-center gap-3 p-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all">
                <Download className="w-4 h-4" /> Print PDF
              </button>
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 lg:ml-80 min-h-screen relative overflow-x-hidden">
        <div className="p-4 sm:p-8">
          {loading ? (
            <div className="animate-in fade-in duration-700 pt-12">
              <WorksheetSkeleton theme={theme} />
            </div>
          ) : (
            <>
              {mode === AppMode.GENERATOR && (
                <div className="max-w-5xl mx-auto pt-8">
                  <div className="text-center mb-10">
                    <h2 className="font-handwriting-header text-5xl sm:text-7xl text-slate-800 mb-4">
                      Homework <MarkerHighlight>Hero</MarkerHighlight>
                    </h2>
                    <p className="text-slate-500 text-base sm:text-lg font-medium px-4">Step-by-step sequential worksheet building.</p>
                    
                    <div className="flex items-center justify-center gap-1 sm:gap-3 mt-10 px-2">
                       {[
                         { step: 1, label: 'Scan' },
                         { step: 2, label: 'Input' },
                         { step: 3, label: 'Context' },
                         { step: 4, label: 'Precision' }
                       ].map((s) => (
                         <div key={s.step} className="flex items-center gap-1 sm:gap-3">
                           <div className={`flex flex-col items-center gap-1`}>
                             <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center font-black text-xs sm:text-sm border-2 transition-all ${
                               currentStep === s.step ? 'bg-yellow-400 border-yellow-400 text-white shadow-xl scale-110' : 
                               currentStep > s.step ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-slate-200 text-slate-300'
                             }`}>
                               {currentStep > s.step ? <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" /> : s.step}
                             </div>
                             <span className={`text-[8px] sm:text-[9px] uppercase font-black tracking-widest ${currentStep === s.step ? 'text-slate-800' : 'text-slate-300'}`}>
                               {s.label}
                             </span>
                           </div>
                           {s.step < 4 && <div className={`w-4 sm:w-10 h-[3px] rounded-full mb-4 ${currentStep > s.step ? 'bg-green-400' : 'bg-slate-100'}`}></div>}
                         </div>
                       ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-[2rem] sm:rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden mb-12 min-h-[500px] sm:min-h-[650px] flex flex-col transform transition-all duration-500 mx-auto max-w-full">
                    <div className="flex-1 p-6 sm:p-12 overflow-y-auto max-h-[70vh] custom-scrollbar">
                      
                      {currentStep === 1 && (
                        <div className="animate-in slide-in-from-right duration-500 h-full flex flex-col">
                          <div className="flex items-center gap-4 mb-6">
                            <div className="p-2 sm:p-3 bg-blue-50 rounded-2xl"><Upload className="text-blue-500" /></div>
                            <div>
                              <h3 className="text-2xl sm:text-3xl font-black text-slate-800">1. Scan Media (Optional)</h3>
                              <p className="text-sm sm:text-base text-slate-400 font-medium">Extract context from textbook photos or PDFs.</p>
                            </div>
                          </div>
                          
                          <div className="flex-1 flex flex-col items-center justify-center gap-6">
                            {!fileData && !isCameraActive ? (
                              <div className="w-full max-w-lg grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                <div 
                                  onClick={() => fileInputRef.current?.click()} 
                                  className="border-4 border-dashed border-slate-100 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 text-center hover:border-yellow-200 transition-all cursor-pointer group bg-slate-50/50 flex flex-col items-center justify-center"
                                >
                                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*,application/pdf" onChange={handleFileChange} />
                                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform border border-slate-50">
                                    <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
                                  </div>
                                  <p className="font-bold text-slate-700">Browse Files</p>
                                </div>

                                <div 
                                  onClick={() => setIsCameraActive(true)} 
                                  className="border-4 border-dashed border-slate-100 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 text-center hover:border-yellow-200 transition-all cursor-pointer group bg-slate-50/50 flex flex-col items-center justify-center"
                                >
                                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform border border-slate-50">
                                    <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
                                  </div>
                                  <p className="font-bold text-slate-700">Live Camera</p>
                                </div>
                              </div>
                            ) : isCameraActive ? (
                              <div className="w-full max-w-xl space-y-4 animate-in zoom-in duration-300">
                                <div className="relative aspect-video rounded-[2rem] overflow-hidden bg-black shadow-2xl">
                                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                                  <div className="absolute top-4 left-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse shadow-lg z-20">
                                    Capturing...
                                  </div>
                                  <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4">
                                    <button 
                                      onClick={capturePhoto}
                                      className="relative w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-transform"
                                    >
                                      <div className="absolute inset-0 rounded-full bg-white animate-pulse-ring pointer-events-none"></div>
                                      <div className="relative w-8 h-8 sm:w-12 sm:h-12 border-4 border-slate-900 rounded-full z-10"></div>
                                    </button>
                                    <button 
                                      onClick={() => setIsCameraActive(false)}
                                      className="w-12 h-12 sm:w-16 sm:h-16 bg-red-500 text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-red-600 transition-colors z-10"
                                    >
                                      <X className="w-6 h-6 sm:w-8 sm:h-8" />
                                    </button>
                                  </div>
                                </div>
                                <canvas ref={canvasRef} className="hidden" />
                                <p className="text-center text-slate-400 font-medium">Center your document on screen</p>
                              </div>
                            ) : (
                              <div className="w-full max-w-lg space-y-6 animate-in zoom-in duration-300">
                                <div className="relative rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden bg-slate-100 border-4 border-white shadow-2xl">
                                  {fileData.preview ? (
                                    <img src={fileData.preview} alt="Scan Preview" className="w-full h-48 sm:h-80 object-contain bg-slate-900" />
                                  ) : (
                                    <div className="w-full h-48 sm:h-80 flex flex-col items-center justify-center gap-4 bg-slate-800 text-white">
                                      <FileIcon className="w-12 h-12 sm:w-16 sm:h-16 opacity-50" />
                                      <p className="font-bold text-base sm:text-lg px-4 text-center">{fileData.name}</p>
                                    </div>
                                  )}
                                  <div className="absolute top-4 right-4 flex gap-2">
                                    <button onClick={() => { setFileData(null); setIsCameraActive(true); }} className="p-2 bg-white text-slate-800 rounded-full shadow-lg hover:bg-slate-50 transition-colors"><RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" /></button>
                                    <button onClick={() => setFileData(null)} className="p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"><X className="w-4 h-4 sm:w-5 sm:h-5" /></button>
                                  </div>
                                </div>
                                <div className="flex items-center justify-center gap-3 p-4 bg-green-50 text-green-700 rounded-2xl border border-green-100 font-bold">
                                  <CheckCircle2 className="w-5 h-5" /> <span>Analysis Complete</span>
                                </div>
                                {isAnalyzing && (
                                  <div className="flex items-center justify-center gap-2 p-3 bg-blue-50 text-blue-600 rounded-xl font-bold animate-pulse">
                                    <Search className="w-4 h-4" /> AI is deconstructing content...
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {currentStep === 2 && (
                        <div className="animate-in slide-in-from-right duration-500">
                          <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-purple-50 rounded-2xl"><Clipboard className="text-purple-500" /></div>
                            <div>
                              <h3 className="text-2xl sm:text-3xl font-black text-slate-800">2. Text Integration (Optional)</h3>
                              <p className="text-sm sm:text-base text-slate-400 font-medium">Paste direct quotes, problem sets, or specific facts.</p>
                            </div>
                          </div>
                          <textarea 
                            placeholder="Paste your source text here..." 
                            className="w-full p-6 sm:p-10 rounded-[1.5rem] sm:rounded-[2.5rem] bg-slate-50 border-2 border-slate-100 focus:border-yellow-400 focus:bg-white focus:outline-none transition-all text-base sm:text-xl min-h-[250px] sm:min-h-[350px] shadow-inner font-medium" 
                            value={formData.rawText} 
                            onChange={(e) => setFormData({...formData, rawText: e.target.value})} 
                            onBlur={() => triggerAnalysis(fileData || undefined, formData.rawText)}
                          />
                        </div>
                      )}

                      {currentStep === 3 && (
                        <div className="animate-in slide-in-from-right duration-500">
                          <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-yellow-50 rounded-2xl"><Sparkles className="text-yellow-500" /></div>
                            <div>
                              <h3 className="text-2xl sm:text-3xl font-black text-slate-800">3. Creative Direction</h3>
                              <p className="text-sm sm:text-base text-slate-400 font-medium">Define the theme and instructional goal for your {formData.educationalLevel} worksheet.</p>
                            </div>
                          </div>
                          <div className="space-y-6">
                             <div className="space-y-3">
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Display Title</label>
                                <div className="relative">
                                  <input type="text" placeholder="e.g. Unit 4: Cellular Respiration" className={`w-full p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] bg-slate-50 border-2 outline-none font-bold text-slate-700 transition-all text-xl ${isAnalyzing ? 'border-blue-200 bg-blue-50/20' : 'border-slate-100 focus:border-yellow-400'}`} value={formData.customTitle} onChange={(e) => setFormData({...formData, customTitle: e.target.value})} />
                                  {isAnalyzing && <div className="absolute right-6 top-1/2 -translate-y-1/2"><Loader2 className="w-5 h-5 text-blue-500 animate-spin" /></div>}
                                </div>
                             </div>

                             <div className="space-y-3">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-2 gap-2">
                                  <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Topic Scope <span className="text-red-500">*</span></label>
                                  <button 
                                    onClick={handleGenerateScope}
                                    disabled={isGeneratingScope || !formData.customTitle.trim()}
                                    className="flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-yellow-100 disabled:opacity-50 transition-all shadow-sm active:scale-95"
                                  >
                                    {isGeneratingScope ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                                    AI Refine Scope
                                  </button>
                                </div>
                                <div className="relative">
                                  <textarea 
                                    required 
                                    placeholder="Focus area? e.g. 'Photosynthesis with a focus on light-dependent reactions'" 
                                    className={`w-full p-6 sm:p-10 rounded-[1.5rem] sm:rounded-[2.5rem] bg-slate-50 border-2 focus:bg-white focus:outline-none transition-all text-base sm:text-xl min-h-[150px] sm:min-h-[200px] font-medium ${!formData.topic.trim() ? 'border-red-100' : isAnalyzing ? 'border-blue-200 bg-blue-50/20' : 'border-slate-100 focus:border-yellow-400'}`} 
                                    value={formData.topic} 
                                    onChange={(e) => setFormData({...formData, topic: e.target.value})} 
                                  />
                                  {isAnalyzing && <div className="absolute right-8 top-8"><Loader2 className="w-6 h-6 text-blue-500 animate-spin" /></div>}
                                </div>
                                {!formData.topic.trim() && <p className="text-[10px] text-red-400 font-bold ml-4 uppercase tracking-widest">Topic Scope is mandatory</p>}
                                {isAnalyzing && <p className="text-[10px] text-blue-400 font-bold ml-4 uppercase tracking-widest animate-pulse">Auto-filling from scan...</p>}
                             </div>
                          </div>
                        </div>
                      )}

                      {currentStep === 4 && (
                        <div className="animate-in slide-in-from-right duration-500">
                          <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-green-50 rounded-2xl"><Settings className="text-green-500" /></div>
                            <div>
                              <h3 className="text-2xl sm:text-3xl font-black text-slate-800">4. Final Specification</h3>
                              <p className="text-sm sm:text-base text-slate-400 font-medium">Finalize the mix and rigor for your {formData.educationalLevel} audience.</p>
                            </div>
                          </div>

                          {isPreschool ? (
                             <div className="flex flex-col items-center justify-center p-8 sm:p-12 bg-yellow-50 rounded-[3rem] border-4 border-dashed border-yellow-200 text-center animate-in zoom-in duration-500">
                                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl mb-6">
                                  <Palette className="w-12 h-12 text-yellow-500" />
                                </div>
                                <h4 className="text-3xl font-black text-slate-800 mb-4">Preschool Mode: Coloring Hero</h4>
                                <p className="text-lg text-slate-600 font-medium max-w-lg mb-8 leading-relaxed">
                                  For preschoolers, we create a specialized visual coloring page with simple labels. 
                                  Complex questions and assessments are disabled to ensure they have fun learning!
                                </p>
                                
                                <div className="flex flex-col sm:flex-row items-center gap-4">
                                  <div className="px-8 py-3 bg-white text-yellow-700 rounded-full font-black uppercase text-xs tracking-widest shadow-sm border border-yellow-100">
                                    Generating 1x High-Quality Coloring Image
                                  </div>
                                  
                                  <button 
                                    onClick={() => setFormData(prev => ({ ...prev, includeTracing: !prev.includeTracing }))}
                                    className={`flex items-center gap-3 px-8 py-3 rounded-full font-black uppercase text-xs tracking-widest transition-all shadow-md active:scale-95 ${
                                      formData.includeTracing 
                                      ? 'bg-blue-600 text-white ring-4 ring-blue-100' 
                                      : 'bg-white text-slate-400 border border-slate-200 hover:text-blue-600'
                                    }`}
                                  >
                                    <MousePointer2 className="w-4 h-4" />
                                    {formData.includeTracing ? 'Tracing Enabled' : 'Add Letter Tracing?'}
                                  </button>
                                </div>
                             </div>
                          ) : (
                            <>
                              <div className="mb-10 p-6 sm:p-8 bg-slate-50 rounded-[2rem] sm:rounded-[3rem] border border-slate-100 shadow-inner">
                                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
                                  <div className="space-y-1">
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                                      <Zap className="w-4 h-4 text-yellow-500" /> Distribution Presets
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                      {Object.keys(presets).map(preset => (
                                        <button 
                                          key={preset} 
                                          onClick={() => applyPreset(preset)} 
                                          className={`px-4 py-2 sm:px-6 sm:py-3 border-2 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm transition-all active:scale-95 shadow-sm flex items-center gap-2 ${
                                            activePreset === preset 
                                            ? 'bg-yellow-400 border-yellow-400 text-yellow-900 ring-4 ring-yellow-100' 
                                            : 'bg-white border-slate-100 text-slate-600 hover:border-yellow-400 hover:text-yellow-600'
                                          }`}
                                        >
                                          {activePreset === preset && <CheckCircle2 className="w-4 h-4" />}
                                          {preset}
                                        </button>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="w-full lg:w-auto p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                    <div className="flex items-center gap-3 mb-3">
                                      <FileStack className="w-4 h-4 text-blue-500" />
                                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Document Target Length</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {[1, 2, 3, 5].map(p => (
                                        <button 
                                          key={p} 
                                          onClick={() => setFormData({...formData, pageCount: p})}
                                          className={`flex-1 lg:w-10 lg:h-10 p-2 rounded-xl flex items-center justify-center text-sm font-black transition-all ${
                                            formData.pageCount === p 
                                            ? 'bg-blue-600 text-white shadow-lg scale-105' 
                                            : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                                          }`}
                                        >
                                          {p}
                                        </button>
                                      ))}
                                      <span className="text-[10px] font-bold text-slate-300 ml-2 uppercase">Pages</span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6">
                                   <div className="flex flex-col gap-2">
                                     <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                       <Box className="w-4 h-4 text-purple-500" /> Advanced Visuals
                                     </h4>
                                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Topic-specific technical drawings</p>
                                   </div>
                                   
                                   <div className="flex flex-wrap items-center gap-4 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                                      <button 
                                        onClick={() => setFormData(prev => ({ ...prev, includeDiagram: !prev.includeDiagram }))}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                                          formData.includeDiagram 
                                          ? 'bg-purple-600 text-white shadow-lg' 
                                          : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                                        }`}
                                      >
                                        <ImageIcon className="w-4 h-4" />
                                        {formData.includeDiagram ? 'Diagram Included' : 'Add Diagram?'}
                                      </button>
                                      
                                      {formData.includeDiagram && (
                                        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl animate-in fade-in slide-in-from-left-2">
                                           <button 
                                             onClick={() => setFormData(prev => ({ ...prev, diagramLabelType: 'LABELED' }))}
                                             className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                                               formData.diagramLabelType === 'LABELED' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-400'
                                             }`}
                                           >
                                             Labeled
                                           </button>
                                           <button 
                                             onClick={() => setFormData(prev => ({ ...prev, diagramLabelType: 'BLANK' }))}
                                             className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                                               formData.diagramLabelType === 'BLANK' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-400'
                                             }`}
                                           >
                                             Blank Labels
                                           </button>
                                        </div>
                                      )}
                                   </div>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10">
                                <div className="lg:col-span-4 space-y-6 sm:space-y-8">
                                  <div className="space-y-3">
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Educational Level</label>
                                    <div className="p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] bg-slate-100 border-2 border-slate-200 font-bold text-slate-500 cursor-not-allowed text-sm flex items-center justify-between">
                                      {formData.educationalLevel}
                                      <Lock className="w-4 h-4 opacity-30" />
                                    </div>
                                  </div>
                                  <div className="space-y-3">
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Difficulty</label>
                                    <select className="w-full p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] bg-slate-50 border-2 border-slate-100 focus:border-yellow-400 outline-none font-bold text-slate-700 transition-all hover:bg-white" value={formData.difficulty} onChange={(e) => setFormData({...formData, difficulty: e.target.value})}>
                                      <option>Easy</option><option>Medium</option><option>Hard</option><option>Expert</option>
                                    </select>
                                  </div>
                                  <div className="space-y-3">
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Language</label>
                                    <select className="w-full p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] bg-slate-50 border-2 border-slate-100 focus:border-yellow-400 outline-none font-bold text-slate-700 transition-all hover:bg-white" value={formData.language} onChange={(e) => setFormData({...formData, language: e.target.value})}>
                                      <option>English</option><option>Spanish</option><option>French</option><option>German</option><option>Chinese</option>
                                    </select>
                                  </div>
                                </div>

                                <div className="lg:col-span-4 bg-slate-50 rounded-[1.5rem] sm:rounded-[2.5rem] p-6 sm:p-8 border border-slate-100">
                                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center justify-between">
                                    Item Distribution
                                    <span className={`px-2 py-0.5 rounded text-[10px] shadow-sm transition-colors ${totalQuestions === 0 ? 'bg-red-400 text-white' : 'bg-yellow-400 text-yellow-900'}`}>
                                      Total: {totalQuestions}
                                    </span>
                                  </h4>
                                  <div className="space-y-3">
                                    {Object.entries(formData.questionCounts).map(([type, count]) => (
                                      <div key={type} className="flex items-center justify-between bg-white p-2 px-4 rounded-xl sm:rounded-2xl shadow-sm border border-slate-50 hover:border-yellow-200 transition-colors group">
                                        <div className="flex flex-col">
                                          <span className="text-[8px] sm:text-[10px] font-black text-slate-300 uppercase leading-none mb-1 group-hover:text-yellow-600">{type.replace('_', ' ')}</span>
                                          <span className="text-[10px] sm:text-xs font-bold text-slate-600 truncate max-w-[80px] sm:max-w-[100px]">{type.split('_').map(w => w[0] + w.slice(1).toLowerCase()).join(' ')}</span>
                                        </div>
                                        <div className="flex items-center gap-2 sm:gap-3">
                                          <button onClick={() => updateCount(type as QuestionType, -1)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"><Minus className="w-3 h-3 sm:w-4 sm:h-4" /></button>
                                          <span className="w-3 sm:w-4 text-center font-black text-sm sm:text-base text-slate-800">{count}</span>
                                          <button onClick={() => updateCount(type as QuestionType, 1)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"><Plus className="w-3 h-3 sm:w-4 sm:h-4" /></button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div className="lg:col-span-4 space-y-4">
                                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                                    <Info className="w-4 h-4 text-blue-500" /> Item Vocabulary
                                  </h4>
                                  <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm overflow-x-auto">
                                    <table className="w-full text-left min-w-[200px]">
                                      <thead>
                                        <tr className="bg-slate-50 border-b border-slate-100">
                                          <th className="px-3 sm:px-4 py-2 sm:py-3 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400">Abbr.</th>
                                          <th className="px-3 sm:px-4 py-2 sm:py-3 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400">Outcome</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-50">
                                        {glossaryItems.map((item) => (
                                          <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-3 sm:px-4 py-2 sm:py-3">
                                              <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center group-hover:bg-yellow-400 group-hover:text-white transition-colors shadow-sm">
                                                  {item.icon}
                                                </div>
                                                <span className="text-[9px] sm:text-[11px] font-black text-slate-700">{item.label}</span>
                                              </div>
                                            </td>
                                            <td className="px-3 sm:px-4 py-2 sm:py-3 text-[8px] sm:text-[10px] font-medium text-slate-400 leading-tight">
                                              {item.desc}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="p-6 sm:p-10 bg-slate-50/80 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center backdrop-blur-md gap-4">
                      <div className="flex items-center gap-4 sm:gap-6">
                        <button onClick={prevStep} disabled={currentStep === 1} className={`flex items-center gap-2 sm:gap-3 px-4 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black transition-all ${currentStep === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-400 hover:text-slate-800'}`}>
                          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" /> Previous
                        </button>
                        <button onClick={resetForm} className="text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-red-400 transition-colors">
                          Wipe Draft
                        </button>
                      </div>

                      <div className="flex flex-col items-center gap-2 w-full sm:w-auto">
                        {currentStep < 4 ? (
                          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                             {(currentStep === 1 || currentStep === 2) && (
                               <button 
                                 onClick={nextStep}
                                 className="px-4 sm:px-6 py-3 sm:py-4 text-slate-400 hover:text-slate-600 font-bold uppercase text-[9px] sm:text-[10px] tracking-widest border-2 border-transparent hover:border-slate-200 rounded-xl sm:rounded-2xl transition-all flex items-center gap-2"
                               >
                                 <FastForward className="w-4 h-4" /> Skip
                               </button>
                             )}
                            <button onClick={nextStep} disabled={(currentStep === 3 && !formData.topic.trim()) || isAnalyzing} className={`flex-1 sm:flex-none flex items-center justify-center gap-3 px-10 sm:px-14 py-3 sm:py-4 bg-white text-slate-800 rounded-xl sm:rounded-2xl font-black border-2 border-slate-100 hover:border-yellow-400 transition-all disabled:opacity-50 shadow-sm active:scale-95`}>
                              {isAnalyzing ? <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing...</> : <>Continue <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" /></>}
                            </button>
                          </div>
                        ) : (
                          <button onClick={handleGenerate} disabled={(!isPreschool && totalQuestions === 0 && !formData.includeDiagram) || isAnalyzing} className={`w-full sm:w-auto flex items-center justify-center gap-4 px-12 sm:px-16 py-4 sm:py-5 rounded-[1.5rem] sm:rounded-[2.5rem] font-black text-lg sm:text-xl transition-all active:scale-95 ${(!isPreschool && totalQuestions === 0 && !formData.includeDiagram) || isAnalyzing ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-50 shadow-none' : 'bg-yellow-400 text-yellow-900 shadow-xl hover:bg-yellow-500 animate-pulse hover:animate-none'}`}>
                            <Sparkles className="w-6 h-6 sm:w-7 sm:h-7" /> {isPreschool ? 'Generate Coloring Page' : 'Build Final Sheet'}
                          </button>
                        )}
                        {lastSavedTime && !isAnalyzing && (
                          <span className="text-[8px] sm:text-[9px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Progress Saved
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {mode === AppMode.WORKSHEET && worksheet && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pt-8 pb-20">
                  <div className="w-full max-w-4xl mx-auto mb-6 bg-white p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 no-print sticky top-4 z-50">
                    <div className="flex flex-col xl:flex-row justify-between items-center gap-4">
                      <div className="flex items-center gap-3 sm:gap-4 self-start sm:self-auto">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center font-bold text-white shadow-sm text-sm sm:text-base">1</div>
                        <p className="font-bold text-slate-600 text-sm sm:text-base">Current Result</p>
                      </div>
                      <div className="w-full xl:w-auto overflow-x-auto custom-scrollbar flex sm:justify-end">
                        <div className="flex gap-1.5 sm:gap-2 min-w-max pb-1 sm:pb-0">
                           <button onClick={handleExportJSON} title="Download structured data" className="flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-white border-2 border-slate-100 text-slate-600 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold hover:border-purple-400 hover:text-purple-600 transition-all">
                            <FileJson className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span>Data</span>
                           </button>
                           <button onClick={handleExportPDF} className="flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-white border-2 border-slate-100 text-slate-700 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold hover:border-blue-400 hover:text-blue-600 transition-all">
                            <FileDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span>PDF</span>
                           </button>
                           <button onClick={() => window.print()} className="flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-100 text-slate-700 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold hover:bg-slate-200 transition-colors">
                            <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span>Print</span>
                           </button>
                           {isSeniorLevel && (
                             <button 
                               onClick={() => setIsMathMode(!isMathMode)} 
                               className={`flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold transition-all ${isMathMode ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                             >
                               <Sigma className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span>Math Mode</span>
                             </button>
                           )}
                           {!isPreschool && (
                             <button onClick={() => setShowTeacherKey(!showTeacherKey)} className={`flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold transition-all ${showTeacherKey ? 'bg-red-100 text-red-700 shadow-inner' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}><Key className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span>{showTeacherKey ? "Keys On" : "Keys Off"}</span></button>
                           )}
                           <button onClick={handleSaveCurrent} className="flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-yellow-50 text-yellow-700 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold hover:bg-yellow-100 transition-colors"><Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span>Save</span></button>
                           {!isPreschool && (
                             <button onClick={() => setMode(AppMode.QUIZ)} className="flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold hover:bg-slate-800 transition-colors shadow-lg active:scale-95"><PlayCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span>Quiz</span></button>
                           )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <WorksheetView worksheet={worksheet} theme={theme} showKey={showTeacherKey} showDoodles={showDoodles} isMathMode={isMathMode} />
                </div>
              )}

              {mode === AppMode.QUIZ && worksheet && (
                <div className="animate-in fade-in zoom-in duration-700 pt-4 sm:pt-8">
                  <QuizView worksheet={worksheet} theme={theme} onExit={() => setMode(AppMode.WORKSHEET)} />
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

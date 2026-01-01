import React, { useState, useEffect } from 'react';
import { Worksheet, QuestionType, ThemeType, Question } from '../types';
import { 
  MarkerHighlight, 
  HandDrawnDivider, 
  DraggableLineRow, 
  SymbolDrillRow,
  HelenCharacter, 
  HandwritingLabels,
  DoodleCorner,
  QuestionIcon,
  DoodleStar,
  SketchyBorderBox,
  DoodlePalette
} from './HandwritingElements';
import { 
  Trash2, Box, Info, Target, Lightbulb, Zap, HelpCircle, 
  FileText, LayoutGrid, BookOpen, Quote, PlusCircle, 
  GripVertical, Edit3, Check, X, FilePlus, Type, 
  CheckSquare, HelpCircle as HelpIcon, Minus, PenTool,
  Scissors
} from 'lucide-react';

interface WorksheetViewProps {
  worksheet: Worksheet;
  theme: ThemeType;
  showKey?: boolean;
  showDoodles?: boolean;
  isMathMode?: boolean;
}

interface PlacedDoodle {
  id: string;
  url: string;
  x: number;
  y: number;
}

export const WorksheetView: React.FC<WorksheetViewProps> = ({ worksheet: initialWorksheet, theme, showKey = false, showDoodles = false, isMathMode = false }) => {
  const [worksheet, setWorksheet] = useState<Worksheet>(initialWorksheet);
  const [isBuilderMode, setIsBuilderMode] = useState(false);
  const [userSelections, setUserSelections] = useState<Record<string, string>>({});
  const [placedDoodles, setPlacedDoodles] = useState<PlacedDoodle[]>([]);
  
  const isCreative = theme === ThemeType.CREATIVE;
  const isClassic = theme === ThemeType.CLASSIC;
  
  const isSeniorLevel = worksheet.educationalLevel.includes('High School') || 
                        worksheet.educationalLevel.includes('University') || 
                        worksheet.educationalLevel.includes('Professional');
  
  const isPreschool = worksheet.educationalLevel.includes("Preschool");
  const isClassicProfessional = isClassic && isSeniorLevel;

  // Sync state if initialWorksheet changes externally
  useEffect(() => {
    setWorksheet(initialWorksheet);
  }, [initialWorksheet]);

  const addDoodle = (url: string) => {
    const newDoodle: PlacedDoodle = {
      id: Math.random().toString(36).substr(2, 9),
      url,
      x: 10 + (placedDoodles.length * 5) % 30,
      y: 20 + (placedDoodles.length * 10) % 50,
    };
    setPlacedDoodles(prev => [...prev, newDoodle]);
  };

  const removeDoodle = (id: string) => {
    setPlacedDoodles(prev => prev.filter(d => d.id !== id));
  };

  const addQuestion = (type: QuestionType) => {
    const newQuestion: Question = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      question: type === QuestionType.PAGE_BREAK ? "Page Break" : "Click to edit your custom question...",
      correctAnswer: type === QuestionType.PAGE_BREAK ? "" : "Sample Answer",
      explanation: "Added manually.",
      isChallenge: false,
      options: type === QuestionType.MCQ ? ["Option A", "Option B", "Option C", "Option D"] : undefined
    };
    setWorksheet(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const updateQuestionText = (id: string, text: string) => {
    setWorksheet(prev => ({
      ...prev,
      questions: prev.questions.map(q => q.id === id ? { ...q, question: text } : q)
    }));
  };

  const updateOptionText = (qId: string, optIdx: number, text: string) => {
    setWorksheet(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === qId && q.options) {
          const newOpts = [...q.options];
          newOpts[optIdx] = text;
          return { ...q, options: newOpts };
        }
        return q;
      })
    }));
  };

  const removeQuestion = (id: string) => {
    setWorksheet(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== id)
    }));
  };

  const getMcqGridCols = (options: string[] | undefined) => {
    if (!options) return 'grid-cols-1';
    const maxLength = Math.max(...options.map(o => o.length));
    if (maxLength < 15) return 'grid-cols-4';
    if (maxLength < 40) return 'grid-cols-2';
    return 'grid-cols-1';
  };

  const titleSizeClass = isPreschool ? 'text-4xl text-left' : (isCreative ? 'text-7xl text-center' : (isClassicProfessional ? (isMathMode ? 'text-4xl font-black uppercase tracking-tight' : 'text-base font-bold uppercase tracking-tight') : 'text-3xl font-black'));
  
  const questionSizeClass = isCreative 
    ? 'text-xl' 
    : (isClassicProfessional 
        ? `${isMathMode ? 'text-3xl font-mono leading-[3.5] tracking-widest py-4' : 'text-[11px] font-bold leading-relaxed'}` 
        : 'text-lg font-bold');
  
  const optionSizeClass = isCreative 
    ? 'text-lg' 
    : (isClassicProfessional 
        ? `${isMathMode ? 'text-2xl font-mono leading-[3.5] tracking-widest' : 'text-[9.5px] leading-loose font-medium'}` 
        : 'text-sm');
        
  const sectionSpacingClass = isClassicProfessional ? (isMathMode ? 'space-y-24' : 'space-y-4') : 'space-y-12';
  const itemSpacingClass = isClassicProfessional ? (isMathMode ? 'space-y-20' : 'space-y-3') : 'space-y-10';
  const headerPadding = isClassicProfessional ? (isMathMode ? 'pb-10 mb-16' : 'pb-1.5 mb-2.5') : 'pb-6 mb-10';

  const renderEditableText = (id: string, text: string, className: string, onUpdate: (val: string) => void) => {
    if (!isBuilderMode) return <p className={className}>{text}</p>;
    return (
      <textarea
        className={`${className} w-full bg-slate-50 border-b border-dashed border-slate-300 focus:bg-white focus:outline-none transition-colors resize-none overflow-hidden`}
        value={text}
        rows={1}
        onChange={(e) => onUpdate(e.target.value)}
        onInput={(e: any) => {
          e.target.style.height = 'auto';
          e.target.style.height = e.target.scrollHeight + 'px';
        }}
      />
    );
  };

  const SidebarToolbox = () => (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 w-64 bg-white shadow-2xl rounded-[2.5rem] p-6 border-4 border-slate-900 z-[100] no-print flex flex-col gap-4 animate-in slide-in-from-left-8">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-black text-xs uppercase tracking-widest text-slate-400">Builder Toolbox</h4>
        <button onClick={() => setIsBuilderMode(false)} className="p-1 text-slate-300 hover:text-red-500 transition-colors"><X className="w-5 h-5" /></button>
      </div>
      
      <div className="space-y-2">
        <button onClick={() => addQuestion(QuestionType.MCQ)} className="w-full flex items-center gap-3 p-3 bg-slate-50 hover:bg-yellow-400 hover:text-yellow-900 rounded-xl font-bold text-sm transition-all group">
          <CheckSquare className="w-5 h-5 opacity-50 group-hover:opacity-100" /> Multiple Choice
        </button>
        <button onClick={() => addQuestion(QuestionType.TF)} className="w-full flex items-center gap-3 p-3 bg-slate-50 hover:bg-blue-400 hover:text-white rounded-xl font-bold text-sm transition-all group">
          <Type className="w-5 h-5 opacity-50 group-hover:opacity-100" /> True / False
        </button>
        <button onClick={() => addQuestion(QuestionType.SHORT_ANSWER)} className="w-full flex items-center gap-3 p-3 bg-slate-50 hover:bg-green-400 hover:text-white rounded-xl font-bold text-sm transition-all group">
          <Edit3 className="w-5 h-5 opacity-50 group-hover:opacity-100" /> Short Answer
        </button>
        <button onClick={() => addQuestion(QuestionType.SENTENCE_DRILL)} className="w-full flex items-center gap-3 p-3 bg-slate-50 hover:bg-purple-400 hover:text-white rounded-xl font-bold text-sm transition-all group">
          <PenTool className="w-5 h-5 opacity-50 group-hover:opacity-100" /> Handwriting Row
        </button>
        <div className="h-[2px] bg-slate-100 my-4"></div>
        <button onClick={() => addQuestion(QuestionType.PAGE_BREAK)} className="w-full flex items-center gap-3 p-4 bg-slate-900 text-white hover:bg-slate-800 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg transition-all active:scale-95">
          <FilePlus className="w-5 h-5 text-yellow-400" /> Add New Page
        </button>
      </div>
    </div>
  );

  const cutBorderStyle = "border-[1px] border-slate-300 border-dashed relative";

  const CutLineInstruction = () => (
    <div className="absolute top-2 left-1/2 -translate-x-1/2 opacity-20 pointer-events-none no-print flex items-center gap-2">
      <Scissors className="w-3 h-3" />
      <span className="text-[8px] font-black uppercase tracking-widest">Cut along this line</span>
    </div>
  );

  const ScoreBox = () => (
    <div className="flex-shrink-0 w-16 h-10 border-2 border-slate-200 rounded-lg flex items-center justify-center font-bold text-xs text-slate-300 select-none">
      [ / 10 ]
    </div>
  );

  if (isPreschool) {
    return (
      <div className="relative">
        <div className="absolute top-0 right-full mr-8 no-print">
          <button 
            onClick={() => setIsBuilderMode(!isBuilderMode)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black transition-all shadow-lg ${isBuilderMode ? 'bg-red-500 text-white' : 'bg-white text-slate-900 hover:bg-slate-50'}`}
          >
            {isBuilderMode ? <Check className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
            {isBuilderMode ? 'Finish Building' : 'Builder Mode'}
          </button>
        </div>

        {isBuilderMode && <SidebarToolbox />}

        <div 
          id="worksheet-content" 
          className={`max-w-[210mm] mx-auto bg-white p-[10mm] shadow-lg min-h-[297mm] relative transition-all duration-500 overflow-hidden font-handwriting-body flex flex-col ${cutBorderStyle}`}
        >
          <CutLineInstruction />
          <DoodleCorner position="tl" />
          <DoodleCorner position="tr" />
          <DoodleCorner position="bl" />
          <DoodleCorner position="br" />
          
          <div className="mb-6 border-b-2 border-slate-100 pb-4 flex justify-between items-end">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase text-slate-400">My Name:</span>
                <div className="w-80 border-b-2 border-slate-900 h-8"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black uppercase text-slate-800">Grade Level: <MarkerHighlight>{worksheet.educationalLevel}</MarkerHighlight></span>
                <div className="w-48 border-b-2 border-slate-900 h-2 mt-2"></div>
              </div>
            </div>
            <div className="text-right">
              <h1 className={`${titleSizeClass} font-handwriting-header text-slate-300 opacity-40 italic`}>
                {worksheet.title}
              </h1>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center p-4 bg-white rounded-[2rem] border-2 border-slate-50 relative">
            {worksheet.coloringImage ? (
              <img src={worksheet.coloringImage} alt="Preschool Coloring Subject" className="w-full h-full object-contain mix-blend-multiply" />
            ) : (
              <div className="text-center">
                <p className="text-4xl font-handwriting-header text-slate-400">Coloring Area</p>
                <p className="mt-4 text-xl">Draw something about {worksheet.topic}!</p>
              </div>
            )}
          </div>

          <div className="mt-6 space-y-4 px-4 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
            <div className="grid grid-cols-1 gap-6">
              {worksheet.questions.map((q) => (
                <div key={q.id} className="relative group">
                  {q.type === QuestionType.PAGE_BREAK ? (
                    <div className="h-20 flex items-center justify-center border-y-2 border-dashed border-slate-200 my-8 opacity-40">
                      <span className="font-black uppercase text-[10px] tracking-widest text-slate-400">Next Page</span>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {isBuilderMode && (
                        <div className="flex justify-end gap-2 no-print opacity-0 group-hover:opacity-100 transition-opacity mb-2">
                           <button onClick={() => removeQuestion(q.id)} className="p-1 bg-red-100 text-red-500 rounded hover:bg-red-200"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      )}
                      <DraggableLineRow text={q.correctAnswer} isSmall={true} showTraceButton={true} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-4 flex justify-between items-center opacity-30">
            <HelenCharacter />
            <div className="text-right">
               <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Teach in Minutes • {worksheet.educationalLevel} Series</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute top-0 right-full mr-8 no-print flex flex-col gap-4">
        <button 
          onClick={() => setIsBuilderMode(!isBuilderMode)}
          className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black transition-all shadow-xl active:scale-95 ${isBuilderMode ? 'bg-red-500 text-white' : 'bg-white text-slate-900 hover:bg-slate-50 ring-2 ring-slate-100'}`}
        >
          {isBuilderMode ? <Check className="w-6 h-6" /> : <Edit3 className="w-6 h-6 text-yellow-500" />}
          {isBuilderMode ? 'Stop Building' : 'Build Manually'}
        </button>
      </div>

      {isBuilderMode && <SidebarToolbox />}

      {showDoodles && (
        <DoodlePalette 
          topic={worksheet.topic} 
          gradeLevel={worksheet.educationalLevel} 
          onDoodleSelect={addDoodle} 
        />
      )}
      
      <div 
        id="worksheet-content" 
        className={`max-w-[210mm] mx-auto bg-white ${isClassicProfessional ? 'p-[15mm]' : 'p-[12mm]'} shadow-lg min-h-[297mm] relative transition-all duration-500 ${isCreative ? 'font-handwriting-body' : 'font-sans'} ${cutBorderStyle}`}
      >
        <CutLineInstruction />
        {placedDoodles.map(doodle => (
          <div key={doodle.id} className="absolute group z-50 cursor-move" style={{ left: `${doodle.x}%`, top: `${doodle.y}%`, width: '120px' }}>
            <img src={doodle.url} className="w-full h-full object-contain mix-blend-multiply opacity-60 group-hover:opacity-100 transition-opacity" />
            <button onClick={() => removeDoodle(doodle.id)} className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity no-print"><Trash2 className="w-3 h-3" /></button>
          </div>
        ))}

        {headerPadding && (
          <div className={`${headerPadding} relative z-10 border-b-2 ${isClassicProfessional ? 'border-slate-900' : 'border-slate-100'}`}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                {renderEditableText('title', worksheet.title || "Academic Assessment", `${isCreative ? 'font-handwriting-header' : 'font-sans text-left outline-none'} ${titleSizeClass} text-slate-900 leading-tight`, (v) => setWorksheet(p => ({...p, title: v})))}
                <div className="mt-4">
                   <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 border-2 border-slate-900 rounded-none transform -rotate-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Academic Grade</span>
                      <span className="text-sm font-black text-slate-900">{worksheet.educationalLevel}</span>
                   </div>
                </div>
              </div>
              <div className="ml-8 w-28 h-28 border-4 border-slate-900 rounded-none flex flex-col items-center justify-center bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)]">
                <span className="text-[10px] font-black uppercase text-slate-400">Mark / Grade</span>
                <div className="text-3xl font-black text-slate-900 mt-1 flex items-baseline">
                   <span className="opacity-10">____</span>
                   <span className="mx-1 text-sm opacity-30">/</span>
                   <span className="text-sm">100</span>
                </div>
              </div>
            </div>
            
            <div className={`flex justify-between items-center ${isClassicProfessional ? 'mt-4' : 'mt-8'} px-0`}>
              <div className="flex items-center gap-4">
                <div className={`px-1.5 py-0.5 text-[7.5px] font-bold tracking-widest uppercase border border-slate-800`}>
                  ID: TM-{worksheet.id?.slice(-6).toUpperCase() || 'CORE'}
                </div>
                <HelenCharacter />
              </div>
              <div className="text-right flex flex-col items-end gap-0">
                <div className="text-[8px] font-black uppercase tracking-tight text-slate-400">
                  Topic: <span className="text-slate-900">{worksheet.topic}</span>
                </div>
                <div className="text-[8px] font-black uppercase tracking-tight text-slate-400">
                  Document Standard: <span className="text-slate-900">A4 ISO 216</span>
                </div>
              </div>
            </div>

            <div className={`${isClassicProfessional ? 'mt-4' : 'mt-10'} flex justify-between items-end pt-1`}>
               <div className="flex flex-col gap-0 w-2/3">
                  <span className="text-[7.5px] uppercase font-black text-slate-500 tracking-widest">Student Full Name (Legal Caps)</span>
                  <div className={`w-full border-b-2 border-slate-900 pb-0.5 text-slate-300 ${isClassicProfessional ? 'text-sm' : 'text-lg'} font-bold`}>
                     {showKey ? <span className="text-red-500 font-black uppercase">OFFICIAL MASTER ANSWER KEY</span> : "______________________________________________________"}
                  </div>
               </div>
               <div className="flex flex-col gap-0 w-1/4">
                  <span className="text-[7.5px] uppercase font-black text-slate-500 tracking-widest">Exam Date</span>
                  <div className={`w-full border-b-2 border-slate-900 pb-0.5 text-slate-300 ${isClassicProfessional ? 'text-sm' : 'text-lg'} font-bold`}>____ / ____ / 20__</div>
               </div>
            </div>
          </div>
        )}

        <div className={`relative z-10 px-0 ${sectionSpacingClass} mt-12`}>
          {worksheet.questions.map((q, idx) => {
            if (q.type === QuestionType.PAGE_BREAK) {
              return (
                <div key={q.id} className="relative group no-print">
                  <div className="h-20 flex items-center justify-center border-y-2 border-dashed border-slate-200 my-16 opacity-40">
                    <span className="font-black uppercase text-[10px] tracking-[0.5em] text-slate-400">Start Next Page</span>
                  </div>
                </div>
              );
            }

            return (
              <div key={q.id} className={`flex flex-col relative group ${isMathMode ? 'gap-12 mb-12' : 'gap-4'}`}>
                {isBuilderMode && (
                  <div className="absolute -left-12 top-0 h-full flex flex-col gap-2 no-print opacity-0 group-hover:opacity-100 transition-opacity">
                     <button onClick={() => removeQuestion(q.id)} className="p-2 bg-red-100 text-red-500 rounded-full hover:bg-red-200 transition-all"><Trash2 className="w-4 h-4" /></button>
                  </div>
                )}

                <div className={`flex items-start gap-4 ${isMathMode ? 'mb-4' : ''}`}>
                  <div className="flex-1 flex items-start gap-4">
                    <div className="w-10 h-10 bg-slate-900 text-white flex items-center justify-center font-black text-sm rounded-none transform rotate-3 flex-shrink-0">
                      {idx + 1}
                    </div>
                    {renderEditableText(q.id, q.question, questionSizeClass, (v) => updateQuestionText(q.id, v))}
                  </div>
                  <ScoreBox />
                </div>

                <div className="ml-14">
                  {q.type === QuestionType.MCQ && (
                    <div className={`grid ${isMathMode ? 'gap-12 mt-8' : 'gap-1.5'} ${getMcqGridCols(q.options)}`}>
                      {q.options?.map((opt, i) => {
                        const isCorrectOption = opt === q.correctAnswer;
                        return (
                          <div key={i} className={`flex items-center gap-6 p-2 group transition-all ${isMathMode ? 'border-b border-slate-100 py-6' : ''} ${showKey && isCorrectOption ? 'bg-red-50/50 rounded-lg ring-1 ring-red-100 scale-[1.02]' : ''}`}>
                            <div className={`border-2 border-slate-900 rounded-none flex items-center justify-center transition-colors ${isMathMode ? 'w-10 h-10 flex-shrink-0' : 'w-4 h-4'} ${showKey && isCorrectOption ? 'border-red-600 bg-red-600' : ''}`}>
                              {showKey && isCorrectOption && <Check className="text-white w-full h-full p-0.5" />}
                            </div>
                            {isBuilderMode ? (
                              <input 
                                className={`${optionSizeClass} bg-slate-50 border-b border-slate-200 outline-none w-full ${showKey && isCorrectOption ? 'text-red-700 font-black' : ''}`}
                                value={opt}
                                onChange={(e) => updateOptionText(q.id, i, e.target.value)}
                              />
                            ) : (
                              <span className={`${optionSizeClass} ${showKey && isCorrectOption ? 'text-red-700 font-black' : ''}`}>
                                {opt}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {q.type === QuestionType.TF && (
                    <div className={`flex gap-16 ${isMathMode ? 'mt-10' : 'mt-4'}`}>
                       <div className={`flex items-center gap-4 transition-all ${showKey && q.correctAnswer === 'True' ? 'bg-red-50 p-2 rounded-xl ring-1 ring-red-100' : ''}`}>
                          <div className={`border-2 border-slate-900 rounded-none flex items-center justify-center ${isMathMode ? 'w-10 h-10' : 'w-6 h-6'} ${showKey && q.correctAnswer === 'True' ? 'border-red-600 bg-red-600' : ''}`}>
                            {showKey && q.correctAnswer === 'True' && <Check className="text-white w-full h-full p-1" />}
                          </div>
                          <span className={`${optionSizeClass} font-black uppercase tracking-widest ${showKey && q.correctAnswer === 'True' ? 'text-red-700' : ''}`}>True</span>
                       </div>
                       <div className={`flex items-center gap-4 transition-all ${showKey && q.correctAnswer === 'False' ? 'bg-red-50 p-2 rounded-xl ring-1 ring-red-100' : ''}`}>
                          <div className={`border-2 border-slate-900 rounded-none flex items-center justify-center ${isMathMode ? 'w-10 h-10' : 'w-6 h-6'} ${showKey && q.correctAnswer === 'False' ? 'border-red-600 bg-red-600' : ''}`}>
                            {showKey && q.correctAnswer === 'False' && <Check className="text-white w-full h-full p-1" />}
                          </div>
                          <span className={`${optionSizeClass} font-black uppercase tracking-widest ${showKey && q.correctAnswer === 'False' ? 'text-red-700' : ''}`}>False</span>
                       </div>
                    </div>
                  )}

                  {(q.type === QuestionType.SHORT_ANSWER || q.type === QuestionType.VOCABULARY) && (
                    <div className={`${isMathMode ? 'mt-10 min-h-[300px]' : 'mt-4 min-h-[100px]'} border-l-2 border-slate-100 relative`}>
                       <div className={`${isMathMode ? 'space-y-24' : 'space-y-8'}`}>
                          {[...Array(isMathMode ? 4 : 4)].map((_, i) => (
                            <div key={i} className={`border-b border-slate-200 ${isMathMode ? 'h-24' : 'h-8'} relative`}>
                              {showKey && i === 0 && (
                                <span className="absolute left-4 bottom-1 font-handwriting-body text-red-600 text-2xl font-black drop-shadow-sm animate-in fade-in slide-in-from-left-2">
                                  {q.correctAnswer}
                                </span>
                              )}
                            </div>
                          ))}
                       </div>
                    </div>
                  )}

                  {(q.type === QuestionType.SENTENCE_DRILL) && (
                    <div className="mt-4">
                       <DraggableLineRow text={q.correctAnswer} isSmall={isMathMode} showTraceButton={true} />
                       <div className={`mt-6 ${isMathMode ? 'space-y-24' : 'space-y-6'}`}>
                          {[...Array(2)].map((_, i) => (
                            <div key={i} className={`${isMathMode ? 'h-24' : 'h-8'} border-b border-dashed border-slate-300 w-full opacity-30 relative`}>
                              {showKey && i === 0 && (
                                <span className="absolute left-8 bottom-1 font-handwriting-body text-red-600 text-2xl font-black opacity-80 animate-in fade-in">
                                  {q.correctAnswer}
                                </span>
                              )}
                            </div>
                          ))}
                       </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-auto pt-16 relative z-10 opacity-40">
          <div className="flex justify-between items-end border-t-4 border-slate-900 pt-4 font-sans">
            <div className="flex gap-10 font-black text-[9px] text-slate-800 uppercase tracking-widest">
              <span>Official Academic Record</span>
              <span>Level: {worksheet.educationalLevel}</span>
              <span>Ref: {worksheet.topic.slice(0, 15)}</span>
            </div>
            <div className="text-right space-y-0">
               <span className="text-[10px] font-black uppercase text-slate-900">Generated by Teach in Minutes V2.5</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

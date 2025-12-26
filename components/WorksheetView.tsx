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
  CheckSquare, HelpCircle as HelpIcon, Minus, PenTool
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
  
  // Refined question size and leading for Math Mode to prevent exponent/subscript overlap
  const questionSizeClass = isCreative 
    ? 'text-xl' 
    : (isClassicProfessional 
        ? `${isMathMode ? 'text-3xl font-mono leading-[3.5] tracking-widest py-4' : 'text-[11px] font-bold leading-relaxed'}` 
        : 'text-lg font-bold');
  
  // Refined option size and leading for Math Mode
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

  // Components for manual adding
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
      
      <p className="mt-4 text-[9px] font-bold text-slate-400 uppercase leading-tight italic">
        * Click existing text on the sheet to edit it directly.
      </p>
    </div>
  );

  const cutBorderStyle = "border-[0.5px] border-slate-300 border-dashed ring-[0.5px] ring-slate-100";

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
                <span className="text-[10px] font-black uppercase text-slate-400">Date:</span>
                <div className="w-48 border-b-2 border-slate-900 h-8"></div>
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
                      <span className="font-black uppercase text-[10px] tracking-widest text-slate-400">Page Break - Start Next Page</span>
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
               <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Teach in Minutes Preschool Series</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Classic/Creative View with Builder Mode
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
        {isBuilderMode && (
          <div className="bg-white/80 backdrop-blur p-4 rounded-2xl border border-slate-100 shadow-sm">
             <p className="text-[10px] font-black uppercase text-slate-400 text-center tracking-widest leading-tight">Builder Active<br/>Sidebar Ready</p>
          </div>
        )}
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
        {placedDoodles.map(doodle => (
          <div key={doodle.id} className="absolute group z-50 cursor-move" style={{ left: `${doodle.x}%`, top: `${doodle.y}%`, width: '120px' }}>
            <img src={doodle.url} className="w-full h-full object-contain mix-blend-multiply opacity-60 group-hover:opacity-100 transition-opacity" />
            <button onClick={() => removeDoodle(doodle.id)} className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity no-print"><Trash2 className="w-3 h-3" /></button>
          </div>
        ))}

        {headerPadding && (
          <div className={`${headerPadding} relative z-10 border-b-2 ${isClassicProfessional ? 'border-slate-900' : 'border-slate-100'}`}>
            {renderEditableText('title', worksheet.title || "Academic Assessment Document", `${isCreative ? 'font-handwriting-header' : 'font-sans text-left outline-none'} ${titleSizeClass} text-slate-900 leading-tight`, (v) => setWorksheet(p => ({...p, title: v})))}
            
            <div className={`flex justify-between items-center ${isClassicProfessional ? 'mt-1' : 'mt-6'} px-0`}>
              <div className="flex items-center gap-4">
                <div className={`px-1.5 py-0.5 text-[7.5px] font-bold tracking-widest uppercase border border-slate-800`}>
                  Assessment Ref: TM-V2.5-BUILDER-{worksheet.id?.slice(-6) || 'MANUAL'}
                </div>
                <HelenCharacter />
              </div>
              <div className="text-right flex flex-col items-end gap-0">
                <div className="text-[7.5px] font-bold uppercase tracking-tight text-slate-500">
                  Module: <span className="text-slate-900">{worksheet.topic}</span>
                </div>
                <div className="text-[7.5px] font-bold uppercase tracking-tight text-slate-500">
                  Classification: <span className="text-slate-900">{worksheet.educationalLevel}</span>
                </div>
              </div>
            </div>

            <div className={`${isClassicProfessional ? 'mt-2' : 'mt-8'} flex justify-between items-end pt-1`}>
               <div className="flex flex-col gap-0 w-2/3">
                  <span className="text-[6.5px] uppercase font-bold text-slate-500 tracking-tighter">Candidate Full Name</span>
                  <div className={`w-full border-b border-slate-400 pb-0.5 text-slate-300 ${isClassicProfessional ? 'text-[9.5px]' : 'text-sm'} font-medium`}>
                     {showKey ? <span className="text-red-500 font-bold uppercase not-italic">TEACHER COPY - INTERNAL USE ONLY</span> : "________________________________________________________________________"}
                  </div>
               </div>
               <div className="flex flex-col gap-0 w-1/4">
                  <span className="text-[6.5px] uppercase font-bold text-slate-500 tracking-tighter">Submission Date</span>
                  <div className={`w-full border-b border-slate-400 pb-0.5 text-slate-300 ${isClassicProfessional ? 'text-[9.5px]' : 'text-sm'}`}>____ / ____ / 20__</div>
               </div>
            </div>
          </div>
        )}

        <div className={`relative z-10 px-0 ${sectionSpacingClass} mt-8`}>
          {worksheet.questions.map((q, idx) => {
            if (q.type === QuestionType.PAGE_BREAK) {
              return (
                <div key={q.id} className="relative group no-print">
                  <div className="h-20 flex items-center justify-center border-y-2 border-dashed border-slate-200 my-16 opacity-40">
                    <span className="font-black uppercase text-[10px] tracking-[0.5em] text-slate-400">Page Break</span>
                  </div>
                  {isBuilderMode && (
                    <button onClick={() => removeQuestion(q.id)} className="absolute top-1/2 -right-4 -translate-y-1/2 p-2 bg-red-100 text-red-500 rounded-full hover:bg-red-200 transition-all opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                  )}
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
                  <span className={`font-bold text-slate-900 ${isClassicProfessional ? (isMathMode ? 'text-4xl' : 'text-[11px]') : 'text-lg'}`}>{idx + 1}.</span>
                  {renderEditableText(q.id, q.question, questionSizeClass, (v) => updateQuestionText(q.id, v))}
                </div>

                <div className="ml-12">
                  {q.type === QuestionType.MCQ && (
                    <div className={`grid ${isMathMode ? 'gap-12 mt-8' : 'gap-1.5'} ${getMcqGridCols(q.options)}`}>
                      {q.options?.map((opt, i) => (
                        <div key={i} className={`flex items-center gap-6 p-2 group ${isMathMode ? 'border-b border-slate-100 py-6' : ''}`}>
                          <div className={`border border-slate-900 rounded-none ${isMathMode ? 'w-10 h-10 flex-shrink-0' : 'w-2.5 h-2.5'}`}></div>
                          {isBuilderMode ? (
                            <input 
                              className={`${optionSizeClass} bg-slate-50 border-b border-slate-200 outline-none w-full`}
                              value={opt}
                              onChange={(e) => updateOptionText(q.id, i, e.target.value)}
                            />
                          ) : <span className={optionSizeClass}>{opt}</span>}
                        </div>
                      ))}
                    </div>
                  )}

                  {q.type === QuestionType.TF && (
                    <div className={`flex gap-16 ${isMathMode ? 'mt-10' : 'mt-4'}`}>
                       <div className="flex items-center gap-4">
                          <div className={`border-2 border-slate-900 rounded-lg ${isMathMode ? 'w-10 h-10' : 'w-5 h-5'}`}></div>
                          <span className={`${optionSizeClass} font-black uppercase tracking-widest`}>True</span>
                       </div>
                       <div className="flex items-center gap-4">
                          <div className={`border-2 border-slate-900 rounded-lg ${isMathMode ? 'w-10 h-10' : 'w-5 h-5'}`}></div>
                          <span className={`${optionSizeClass} font-black uppercase tracking-widest`}>False</span>
                       </div>
                    </div>
                  )}

                  {(q.type === QuestionType.SHORT_ANSWER || q.type === QuestionType.VOCABULARY) && (
                    <div className={`${isMathMode ? 'mt-10 min-h-[300px]' : 'mt-4 min-h-[100px]'} border-l-2 border-slate-100 relative`}>
                       <div className={`${isMathMode ? 'space-y-24' : 'space-y-6'}`}>
                          {[...Array(isMathMode ? 4 : 4)].map((_, i) => (
                            <div key={i} className={`border-b border-slate-200 ${isMathMode ? 'h-24' : 'h-6'}`}></div>
                          ))}
                       </div>
                    </div>
                  )}

                  {(q.type === QuestionType.SENTENCE_DRILL) && (
                    <div className="mt-4">
                       <DraggableLineRow text={q.correctAnswer} isSmall={isMathMode} showTraceButton={true} />
                       <div className={`mt-6 ${isMathMode ? 'space-y-24' : 'space-y-4'}`}>
                          {[...Array(3)].map((_, i) => <div key={i} className={`${isMathMode ? 'h-24' : 'h-6'} border-b border-dashed border-slate-300 w-full opacity-30`}></div>)}
                       </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-auto pt-8 relative z-10 opacity-40">
          <div className="flex justify-between items-end border-t border-slate-800 pt-1.5 font-sans">
            <div className="flex gap-10 font-bold text-[7px] text-slate-600 uppercase tracking-tighter">
              <span>Critical Synthesis</span>
              <span>Empirical Rigor</span>
              <span>Academic Excellence</span>
            </div>
            <div className="text-right space-y-0">
              <div className="text-[5.5px] font-black uppercase tracking-widest text-slate-900">Exam Processor: TM-BUILDER-V1.0</div>
              <div className="text-[6.5px] font-bold text-slate-500 uppercase">FULLY CUSTOMIZABLE ASSESSMENT ASSET</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
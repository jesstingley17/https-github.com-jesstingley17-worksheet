import React, { useState } from 'react';
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
import { Trash2, Box, Info, Target, Lightbulb, Zap, HelpCircle, FileText, LayoutGrid, BookOpen, Quote } from 'lucide-react';

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

export const WorksheetView: React.FC<WorksheetViewProps> = ({ worksheet, theme, showKey = false, showDoodles = false, isMathMode = false }) => {
  const [userSelections, setUserSelections] = useState<Record<string, string>>({});
  const [placedDoodles, setPlacedDoodles] = useState<PlacedDoodle[]>([]);
  
  const isCreative = theme === ThemeType.CREATIVE;
  const isClassic = theme === ThemeType.CLASSIC;
  
  const isSeniorLevel = worksheet.educationalLevel.includes('High School') || 
                        worksheet.educationalLevel.includes('University') || 
                        worksheet.educationalLevel.includes('Professional');
  
  const isPreschool = worksheet.educationalLevel.includes("Preschool");
  const isClassicProfessional = isClassic && isSeniorLevel;

  const handleToggleSelection = (qId: string, value: string) => {
    if (showKey) return; 
    setUserSelections(prev => ({
      ...prev,
      [qId]: prev[qId] === value ? '' : value
    }));
  };

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

  const getMcqGridCols = (options: string[] | undefined) => {
    if (!options) return 'grid-cols-1';
    const maxLength = Math.max(...options.map(o => o.length));
    if (maxLength < 15) return 'grid-cols-4';
    if (maxLength < 40) return 'grid-cols-2';
    return 'grid-cols-1';
  };

  const drillItems = worksheet.questions.filter(q => q.type === QuestionType.CHARACTER_DRILL || q.type === QuestionType.SENTENCE_DRILL);
  const specialDrills = worksheet.questions.filter(q => q.type === QuestionType.SYMBOL_DRILL);
  const interactiveItems = worksheet.questions.filter(q => q.type === QuestionType.MCQ || q.type === QuestionType.TF);
  const responseItems = worksheet.questions.filter(q => q.type === QuestionType.SHORT_ANSWER || q.type === QuestionType.VOCABULARY);

  const canUseDoubleColumns = isCreative && drillItems.every(q => q.correctAnswer.length < 15);

  const titleSizeClass = isPreschool ? 'text-4xl text-left' : (isCreative ? 'text-7xl text-center' : (isClassicProfessional ? (isMathMode ? 'text-3xl font-black uppercase' : 'text-base font-bold uppercase tracking-tight') : 'text-3xl font-black'));
  const mathBaseSize = isMathMode ? 'text-2xl' : 'text-[11px]';
  const questionSizeClass = isCreative 
    ? 'text-xl' 
    : (isClassicProfessional 
        ? `${isMathMode ? 'text-3xl font-mono leading-[2.5] tracking-widest' : 'text-[11px] font-bold leading-relaxed'}` 
        : 'text-lg font-bold');
  const optionSizeClass = isCreative 
    ? 'text-lg' 
    : (isClassicProfessional 
        ? `${isMathMode ? 'text-2xl font-mono leading-[3] tracking-widest' : 'text-[9.5px] leading-loose font-medium'}` 
        : 'text-sm');
  const sectionSpacingClass = isClassicProfessional ? (isMathMode ? 'space-y-20' : 'space-y-4') : 'space-y-12';
  const itemSpacingClass = isClassicProfessional ? (isMathMode ? 'space-y-16' : 'space-y-3') : 'space-y-10';
  const headerPadding = isClassicProfessional ? (isMathMode ? 'pb-8 mb-12' : 'pb-1.5 mb-2.5') : 'pb-6 mb-10';

  if (isPreschool) {
    const tracingItems = worksheet.questions.filter(q => q.type === QuestionType.SENTENCE_DRILL);
    return (
      <div 
        id="worksheet-content" 
        className="max-w-[210mm] mx-auto bg-white p-[10mm] shadow-lg min-h-[297mm] relative transition-all duration-500 overflow-hidden font-handwriting-body border border-slate-200 flex flex-col"
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
        {tracingItems.length > 0 && (
          <div className="mt-6 space-y-4 px-4 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
            <div className="grid grid-cols-2 gap-8">
              {tracingItems.map((q) => (
                <div key={q.id} className="relative">
                   <DraggableLineRow text={q.correctAnswer} isSmall={true} showTraceButton={true} />
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="mt-4 flex justify-between items-center opacity-30">
          <HelenCharacter />
          <div className="text-right">
             <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Teach in Minutes Preschool Series</span>
          </div>
        </div>
      </div>
    );
  }

  if (isCreative) {
    const infoIcons = [Zap, Lightbulb, Target, Info, HelpCircle, FileText];
    const cardStyles = [
      "bg-blue-50/40 border-blue-100",
      "bg-yellow-50/40 border-yellow-100",
      "bg-purple-50/40 border-purple-100",
      "bg-green-50/40 border-green-100",
      "bg-red-50/40 border-red-100",
      "bg-orange-50/40 border-orange-100",
    ];

    return (
      <>
        {showDoodles && (
          <DoodlePalette 
            topic={worksheet.topic} 
            gradeLevel={worksheet.educationalLevel} 
            onDoodleSelect={addDoodle} 
          />
        )}
        <div 
          id="worksheet-content" 
          className="max-w-[210mm] mx-auto bg-white p-[15mm] shadow-2xl min-h-[297mm] relative transition-all duration-500 overflow-hidden font-handwriting-body border border-slate-100"
        >
          {placedDoodles.map(doodle => (
            <div key={doodle.id} className="absolute group z-50 cursor-move" style={{ left: `${doodle.x}%`, top: `${doodle.y}%`, width: '120px' }}>
              <img src={doodle.url} className="w-full h-full object-contain mix-blend-multiply opacity-60 group-hover:opacity-100 transition-opacity" />
              <button onClick={() => removeDoodle(doodle.id)} className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity no-print"><Trash2 className="w-3 h-3" /></button>
            </div>
          ))}

          <DoodleCorner position="tl" />
          <DoodleCorner position="tr" />
          <DoodleCorner position="bl" />
          <DoodleCorner position="br" />

          <div className="text-center mb-12 relative pt-8">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 flex items-center gap-3 opacity-20">
               <HandDrawnDivider label="★ Educational Focus ★" />
            </div>
            <h1 className="text-7xl font-handwriting-header text-slate-900 leading-tight mb-4 tracking-tight">{worksheet.title}</h1>
            <div className="flex justify-center gap-2 mb-8">
              <span className="px-6 py-1.5 bg-yellow-400 text-yellow-900 rounded-full font-black uppercase text-xs tracking-[0.2em] shadow-md -rotate-1">
                Knowledge Poster
              </span>
              <span className="px-6 py-1.5 bg-slate-900 text-white rounded-full font-black uppercase text-xs tracking-[0.2em] shadow-md rotate-1">
                {worksheet.educationalLevel}
              </span>
            </div>
          </div>

          <div className="mb-12 relative px-12">
            <Quote className="absolute left-0 top-0 w-8 h-8 text-slate-100" />
            <div className="bg-slate-50/80 p-8 rounded-[3rem] border-2 border-dashed border-slate-200 text-center italic text-xl text-slate-600 font-handwriting-body">
              "Exploring the core principles of {worksheet.topic} through visual synthesis and academic deep-dives."
            </div>
          </div>

          <div className="flex flex-col gap-12">
            {worksheet.diagramImage && (
              <div className="relative group">
                <div className="flex flex-col items-center p-8 bg-white rounded-[3rem] shadow-xl border-2 border-slate-100 relative overflow-hidden">
                  <div className="absolute top-6 left-8 flex items-center gap-2 opacity-30">
                    <LayoutGrid className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Exhibit 1.1</span>
                  </div>
                  <h3 className="text-4xl font-handwriting-header text-slate-800 mb-8 flex items-center gap-4">
                    <Box className="w-10 h-10 text-blue-500" /> Technical Schematic
                  </h3>
                  <div className="w-full bg-white rounded-2xl p-4 border-2 border-slate-50">
                    <img src={worksheet.diagramImage} className="w-full max-h-[400px] object-contain mix-blend-multiply" />
                  </div>
                  <div className="mt-8 pt-6 border-t border-slate-100 w-full text-center">
                    <MarkerHighlight className="text-lg italic text-slate-600 px-6 py-1">
                      Visual representation of the {worksheet.topic} conceptual model.
                    </MarkerHighlight>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-8">
              {worksheet.questions.map((section, idx) => {
                const Icon = infoIcons[idx % infoIcons.length];
                const cardStyle = cardStyles[idx % cardStyles.length];
                return (
                  <div key={section.id} className={`${cardStyle} p-8 rounded-[2.5rem] border-2 shadow-sm relative overflow-hidden flex flex-col gap-4 group transition-transform hover:scale-[1.01]`}>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/40 rounded-bl-[4rem] -z-10"></div>
                    <div className="flex items-center gap-4 mb-2">
                       <div className="w-14 h-14 bg-white rounded-[1.25rem] shadow-lg flex items-center justify-center border-2 border-white/50">
                          <Icon className="w-8 h-8 text-slate-800" />
                       </div>
                       <h3 className="text-3xl font-handwriting-header text-slate-800 leading-tight flex-1">{section.question}</h3>
                    </div>
                    
                    <div className="flex-1 bg-white/60 p-4 rounded-3xl border border-white/40">
                      <p className="text-xl text-slate-700 leading-relaxed font-handwriting-body">{section.correctAnswer}</p>
                    </div>

                    <div className="mt-2 pt-4 border-t border-dashed border-black/10">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                          <Lightbulb className="w-3 h-3 text-yellow-500" /> Deep Dive Context
                       </p>
                       <p className="text-base text-slate-500 italic leading-snug font-medium">{section.explanation}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-16 pt-12 border-t-4 border-slate-100 flex justify-between items-center relative">
            <div className="flex items-center gap-8">
               <div className="flex flex-col">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Document Ref</span>
                  <span className="text-xs font-bold text-slate-600">TM-INF-PRO-{worksheet.id?.slice(-4) || '2025'}</span>
               </div>
               <div className="flex flex-col">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Audience Level</span>
                  <span className="text-xs font-bold text-slate-600 uppercase">{worksheet.educationalLevel}</span>
               </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-[9px] font-black uppercase text-slate-900 tracking-tighter">Verified Educational Asset</p>
                <p className="text-[8px] font-bold text-slate-400">© Teach in Minutes Curriculum Design</p>
              </div>
              <div className="scale-75"><HelenCharacter /></div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {showDoodles && (
        <DoodlePalette 
          topic={worksheet.topic} 
          gradeLevel={worksheet.educationalLevel} 
          onDoodleSelect={addDoodle} 
        />
      )}
      
      <div 
        id="worksheet-content" 
        className={`max-w-[210mm] mx-auto bg-white ${isClassicProfessional ? 'p-[15mm]' : 'p-[12mm]'} shadow-lg min-h-[297mm] relative transition-all duration-500 overflow-hidden ${isCreative ? 'font-handwriting-body' : 'font-sans border border-slate-200'}`}
      >
        {placedDoodles.map(doodle => (
          <div key={doodle.id} className="absolute group z-50 cursor-move" style={{ left: `${doodle.x}%`, top: `${doodle.y}%`, width: '120px' }}>
            <img src={doodle.url} className="w-full h-full object-contain mix-blend-multiply opacity-60 group-hover:opacity-100 transition-opacity" />
            <button onClick={() => removeDoodle(doodle.id)} className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity no-print"><Trash2 className="w-3 h-3" /></button>
          </div>
        ))}

        {!isClassicProfessional && (
          <div className={`absolute inset-2 pointer-events-none border border-dashed rounded-sm z-0 border-slate-300 opacity-60`}></div>
        )}

        {showKey && (
          <div className="absolute top-10 right-10 -rotate-12 pointer-events-none z-50">
            <div className="border-4 border-red-500 text-red-500 px-6 py-2 rounded-xl text-2xl font-black uppercase opacity-60 bg-white/80 shadow-lg">
              OFFICIAL SOLUTION
            </div>
          </div>
        )}

        {headerPadding && (
          <div className={`${headerPadding} relative z-10 border-b-2 ${isClassicProfessional ? 'border-slate-900' : 'border-slate-100'}`}>
            <h1 className={`${isCreative ? 'font-handwriting-header' : 'font-sans text-left outline-none'} ${titleSizeClass} text-slate-900 leading-tight`}>
              {worksheet.title || "Academic Assessment Document"}
            </h1>
            <div className={`flex justify-between items-center ${isClassicProfessional ? 'mt-1' : 'mt-6'} px-0`}>
              <div className="flex items-center gap-4">
                <div className={`px-1.5 py-0.5 text-[7.5px] font-bold tracking-widest uppercase border border-slate-800`}>
                  Assessment Ref: TM-V2.5-PRO-{worksheet.id?.slice(-6) || 'N/A'}
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
          {worksheet.diagramImage && (
            <div className="mb-12">
               {isClassicProfessional ? (
                 <h2 className={`${isMathMode ? 'text-2xl' : 'text-[9px]'} font-black text-slate-900 border-b-2 border-slate-800 inline-block mb-4`}>EXHIBIT 1: TECHNICAL DIAGRAM</h2>
               ) : <h2 className="text-2xl font-black text-slate-800 border-l-4 border-purple-600 pl-4 py-1 mb-6">Technical Reference</h2>}
               
               <div className="flex flex-col items-center">
                 <div className="p-4 bg-white border-2 border-slate-100 rounded-3xl relative overflow-hidden group shadow-sm w-full">
                    <img src={worksheet.diagramImage} alt="Academic Diagram" className="w-full h-auto object-contain mix-blend-multiply" />
                 </div>
                 <p className={`mt-4 text-center ${isClassicProfessional ? 'text-[8px]' : 'text-sm font-bold'} text-slate-400 uppercase tracking-widest italic`}>
                    Fig 1.1: {worksheet.topic} Theoretical Model
                 </p>
               </div>
            </div>
          )}

          {drillItems.length > 0 && (
            <div className="space-y-6">
              <HandwritingLabels />
              <div className={`grid gap-x-12 gap-y-4 ${canUseDoubleColumns ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {drillItems.map((q) => (
                  <DraggableLineRow key={q.id} text={q.correctAnswer.split(' ')[0]} isSmall={canUseDoubleColumns} showTraceButton={true} />
                ))}
              </div>
            </div>
          )}

          {interactiveItems.length > 0 && (
            <div className={sectionSpacingClass}>
              {isClassicProfessional ? (
                <h2 className={`${isMathMode ? 'text-2xl' : 'text-[9px]'} font-black text-slate-900 border-b-2 border-slate-800 inline-block mb-2`}>PART A: OBJECTIVE ASSESSMENT</h2>
              ) : <h2 className="text-2xl font-black text-slate-800 border-l-4 border-blue-600 pl-4 py-1">Knowledge Check</h2>}
              <div className={itemSpacingClass}>
                {interactiveItems.map((q, idx) => (
                  <div key={q.id} className={`flex flex-col ${isMathMode ? 'gap-10 mb-8' : 'gap-1'}`}>
                    <div className="flex items-start gap-4">
                      <span className={`font-bold text-slate-900 ${isClassicProfessional ? (isMathMode ? 'text-3xl' : 'text-[11px]') : 'text-lg'}`}>{idx + 1}.</span>
                      <p className={questionSizeClass}>{q.question}</p>
                    </div>
                    {q.type === QuestionType.MCQ && (
                      <div className={`grid ${isMathMode ? 'gap-10 mt-6' : 'gap-0.5'} ml-12 ${getMcqGridCols(q.options)}`}>
                        {q.options?.map((opt, i) => (
                          <div key={i} className={`flex items-center gap-4 p-2 group ${isMathMode ? 'border-b border-slate-100 py-4' : ''}`}>
                            <div className={`border border-slate-900 rounded-none ${isMathMode ? 'w-6 h-6 flex-shrink-0' : 'w-2.5 h-2.5'}`}></div>
                            <span className={optionSizeClass}>{opt}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {responseItems.length > 0 && (
            <div className={sectionSpacingClass}>
              {isClassicProfessional ? (
                <h2 className={`${isMathMode ? 'text-2xl' : 'text-[9px]'} font-black text-slate-900 border-b-2 border-slate-800 inline-block mb-2`}>PART B: ANALYTICAL SYNTHESIS</h2>
              ) : <h2 className="text-2xl font-black text-slate-800 border-l-4 border-blue-600 pl-4 py-1">Written Assessment</h2>}
              <div className={itemSpacingClass}>
                {responseItems.map((q, idx) => (
                  <div key={q.id} className={`flex flex-col ${isMathMode ? 'gap-12' : 'gap-6'}`}>
                    <div className="flex items-start gap-4">
                      <span className={`font-bold text-slate-900 ${isClassicProfessional ? (isMathMode ? 'text-3xl' : 'text-[11px]') : 'text-lg'}`}>{idx + 1}.</span>
                      <p className={questionSizeClass}>{q.question}</p>
                    </div>
                    <div className={`ml-12 ${isMathMode ? 'min-h-[300px]' : 'min-h-[120px]'} border-l-2 border-slate-100 relative`}>
                       <div className={`${isMathMode ? 'space-y-16' : 'space-y-6'}`}>
                          {[...Array(isMathMode ? 4 : 5)].map((_, i) => (
                            <div key={i} className={`border-b border-slate-200 ${isMathMode ? 'h-16' : 'h-6'}`}></div>
                          ))}
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-auto pt-4 relative z-10 opacity-40">
          <div className="flex justify-between items-end border-t border-slate-800 pt-1.5 font-sans">
            <div className="flex gap-10 font-bold text-[7px] text-slate-600 uppercase tracking-tighter">
              <span>Critical Synthesis</span>
              <span>Empirical Rigor</span>
              <span>Academic Excellence</span>
            </div>
            <div className="text-right space-y-0">
              <div className="text-[5.5px] font-black uppercase tracking-widest text-slate-900">Exam Processor: TM-CORE-V2.5</div>
              <div className="text-[6.5px] font-bold text-slate-500 uppercase">OFFICIAL ASSESSMENT CONTENT</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
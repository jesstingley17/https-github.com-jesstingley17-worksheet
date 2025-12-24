import React from 'react';
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
  SketchyBorderBox
} from './HandwritingElements';

interface WorksheetViewProps {
  worksheet: Worksheet;
  theme: ThemeType;
  showKey?: boolean;
  showDoodles?: boolean;
}

export const WorksheetView: React.FC<WorksheetViewProps> = ({ worksheet, theme, showKey = false, showDoodles = false }) => {
  const isCreative = theme === ThemeType.CREATIVE;
  const isClassic = theme === ThemeType.CLASSIC;
  
  // Logic helpers
  const getQuestionLength = (q: Question) => {
    let len = q.question.length;
    if (q.options) len += q.options.join('').length;
    return len;
  };

  const isLongQuestion = (q: Question) => getQuestionLength(q) > 120;

  const getMcqGridCols = (options: string[] | undefined) => {
    if (!options) return 'grid-cols-1';
    const maxLength = Math.max(...options.map(o => o.length));
    if (maxLength < 15) return 'grid-cols-4';
    if (maxLength < 40) return 'grid-cols-2';
    return 'grid-cols-1';
  };

  const drillItems = worksheet.questions.filter(q => q.type === QuestionType.CHARACTER_DRILL);
  const specialDrills = worksheet.questions.filter(q => q.type === QuestionType.SYMBOL_DRILL);
  const interactiveItems = worksheet.questions.filter(q => q.type === QuestionType.MCQ || q.type === QuestionType.TF);
  const responseItems = worksheet.questions.filter(q => q.type === QuestionType.SHORT_ANSWER || q.type === QuestionType.VOCABULARY || q.type === QuestionType.SENTENCE_DRILL);

  const canUseDoubleColumns = isCreative && drillItems.every(q => q.correctAnswer.length < 15);

  return (
    <div 
      id="worksheet-content" 
      className={`max-w-[210mm] mx-auto bg-white p-[12mm] shadow-lg min-h-[297mm] relative transition-all duration-500 overflow-hidden ${isCreative ? 'font-handwriting-body' : 'font-sans border border-slate-200'}`}
    >
      
      {/* Cutting Guide Border */}
      <div className={`absolute inset-2 pointer-events-none border border-dashed rounded-sm z-0 ${isCreative ? 'border-slate-200' : 'border-slate-300'} opacity-60`}></div>

      {showKey && (
        <div className="absolute top-10 right-10 -rotate-12 pointer-events-none z-50">
          <div className="border-4 border-red-500 text-red-500 px-6 py-2 rounded-xl text-3xl font-black uppercase opacity-60 bg-white/80">
            TEACHER KEY
          </div>
        </div>
      )}

      {/* Doodles & Diagrams: Independent of theme selection */}
      {(isCreative || showDoodles) && (
        <>
          <DoodleCorner position="tl" />
          <DoodleCorner position="tr" />
          <DoodleCorner position="bl" />
          <DoodleCorner position="br" />
        </>
      )}

      {/* Header */}
      <div className="mb-10 relative z-10">
        <h1 
          contentEditable={isClassic}
          suppressContentEditableWarning={true}
          className={`${isCreative ? 'font-handwriting-header text-6xl text-center' : 'text-4xl font-black text-left outline-none hover:bg-slate-50'} text-slate-900 leading-tight border-b-4 border-slate-100 pb-6`}
        >
          {worksheet.title || "Homework Hero Worksheet"}
        </h1>
        
        <div className="flex justify-between items-center mt-6 px-4">
          <div className="flex items-center gap-6">
            <div className={`px-3 py-1 text-[10px] font-black tracking-widest uppercase rounded-full shadow-sm ${isCreative ? 'bg-yellow-400 text-yellow-900' : 'bg-blue-600 text-white'}`}>
              Homework Hero v2.5
            </div>
            {(isCreative || showDoodles) && <HelenCharacter />}
          </div>
          <div className="text-right flex flex-col items-end gap-1">
            <div className={`text-[10px] font-bold uppercase tracking-widest text-slate-400`}>
              Topic: <span className="text-slate-900" contentEditable={isClassic} suppressContentEditableWarning={true}>{worksheet.topic}</span>
            </div>
            <div className={`text-[10px] font-bold uppercase tracking-widest text-slate-400`}>
              Grade: <span className="text-slate-900" contentEditable={isClassic} suppressContentEditableWarning={true}>{worksheet.gradeLevel}</span>
            </div>
          </div>
        </div>

        {isClassic && (
          <div className="mt-8 flex justify-between items-end border-t border-slate-100 pt-4">
             <div className="flex flex-col gap-1 w-2/3">
                <span className="text-[9px] uppercase font-bold text-slate-400 tracking-widest">Student Name</span>
                <div className="w-full border-b-2 border-slate-200 pb-1 text-slate-400 text-sm italic">
                   {showKey ? <span className="text-red-500 font-bold uppercase not-italic">Answer Key Edition</span> : "Type or write name here..."}
                </div>
             </div>
             <div className="flex flex-col gap-1 w-1/4">
                <span className="text-[9px] uppercase font-bold text-slate-400 tracking-widest">Completion Date</span>
                <div className="w-full border-b-2 border-slate-200 pb-1 text-slate-400 text-sm">____ / ____ / 20__</div>
             </div>
          </div>
        )}
      </div>

      <div className="relative z-10 px-4 space-y-12">
        {/* SECTION: DRILLS */}
        {(drillItems.length > 0 || specialDrills.length > 0) && (
          <div className="space-y-6">
            {(isCreative || showDoodles) && <HandDrawnDivider label="Warmup Drills" />}
            {(isCreative || showDoodles) && <HandwritingLabels />}
            
            <div className={`grid gap-x-12 gap-y-4 ${canUseDoubleColumns ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {drillItems.map((q, idx) => (
                <div key={q.id} className="relative group">
                  <div className="flex items-center gap-4">
                     <DraggableLineRow text={q.correctAnswer.split(' ')[0]} isSmall={canUseDoubleColumns} />
                     {showKey && <span className="text-red-500 font-bold absolute left-24 bottom-2 text-xl">{q.correctAnswer}</span>}
                  </div>
                </div>
              ))}
            </div>

            {specialDrills.map((q) => (
              <div key={q.id} className="mt-8">
                <div className={`${isCreative ? 'p-0' : 'p-6 bg-slate-50 rounded-2xl border-2 border-slate-100'}`}>
                  {(isCreative || showDoodles) ? (
                    <SketchyBorderBox className="bg-slate-50/30">
                      <p className={`${isCreative ? 'font-handwriting-header text-2xl' : 'text-lg font-bold'} mb-4 text-slate-600`}>Symbol Practice Area:</p>
                      <div className="relative">
                        <SymbolDrillRow symbols={q.correctAnswer} />
                        {showKey && <div className="absolute top-0 right-0 text-red-500 font-bold text-2xl rotate-3">✓ {q.correctAnswer}</div>}
                      </div>
                    </SketchyBorderBox>
                  ) : (
                    <div className="relative">
                      <p className="text-sm font-black uppercase text-slate-400 tracking-widest mb-4">Precision Drill: {q.question}</p>
                      <p className="text-3xl tracking-[0.6em] text-slate-300 select-none mb-6">{q.correctAnswer}</p>
                      <div className="h-10 border-b-2 border-dashed border-slate-200">
                         {showKey && <span className="text-red-500 font-bold text-xl">{q.correctAnswer}</span>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SECTION: ASSESSMENT */}
        {interactiveItems.length > 0 && (
          <div className="space-y-8">
            {(isCreative || showDoodles) ? <HandDrawnDivider label="Quick Assessment" /> : <h2 className="text-2xl font-black text-slate-800 border-l-4 border-blue-600 pl-4 py-1">Knowledge Check</h2>}
            
            <div className="space-y-10">
              {interactiveItems.map((q, idx) => {
                const isLong = isLongQuestion(q);
                return (
                  <div key={q.id} className={`flex flex-col gap-4 ${isLong ? 'col-span-full' : ''}`}>
                    <div className="flex items-start gap-4">
                      {(isCreative || showDoodles) ? <QuestionIcon type={q.type} index={idx} /> : <span className="font-black text-slate-400 text-lg">{idx + 1}.</span>}
                      <p 
                        contentEditable={isClassic} 
                        suppressContentEditableWarning={true}
                        className={`text-xl font-bold leading-relaxed outline-none ${isCreative ? 'font-handwriting-body' : 'text-slate-900 hover:bg-slate-50'}`}
                      >
                        {q.question}
                        {q.isChallenge && (isCreative || showDoodles) && <DoodleStar className="inline-block ml-2 w-5 h-5 -mt-2" />}
                      </p>
                    </div>
                    
                    {q.type === QuestionType.MCQ && (
                      <div className={`grid gap-4 ml-12 ${getMcqGridCols(q.options)}`}>
                        {q.options?.map((opt, i) => (
                          <div key={i} className="flex items-center gap-3 group">
                            <div className={`w-6 h-6 flex-shrink-0 border-2 ${isCreative ? 'border-slate-300 rotate-2' : 'border-slate-400 rounded-md'} flex items-center justify-center ${showKey && opt === q.correctAnswer ? 'bg-red-500 border-red-500' : ''}`}>
                               {isCreative && !showKey && <span className="text-[10px] text-slate-300 font-bold">{String.fromCharCode(65 + i)}</span>}
                               {showKey && opt === q.correctAnswer && <span className="text-white text-[10px] font-bold">X</span>}
                            </div>
                            <span 
                              contentEditable={isClassic} 
                              suppressContentEditableWarning={true}
                              className={`text-lg leading-tight transition-colors outline-none ${showKey && opt === q.correctAnswer ? 'text-red-600 font-bold' : 'opacity-80 group-hover:opacity-100 hover:bg-slate-50'}`}
                            >
                              {opt}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {q.type === QuestionType.TF && (
                      <div className="flex gap-12 ml-12">
                         {['True', 'False'].map((v) => (
                           <span key={v} className={`flex items-center gap-4 text-lg italic font-bold ${showKey && v === q.correctAnswer ? 'text-red-600' : 'text-slate-600'}`}>
                             <div className={`w-8 h-8 border-2 ${isCreative ? 'border-slate-200 rotate-3' : 'border-slate-300 rounded-lg'} flex items-center justify-center text-xs ${showKey && v === q.correctAnswer ? 'bg-red-500 border-red-500 text-white opacity-100 shadow-sm' : 'opacity-50'}`}>
                               {showKey && v === q.correctAnswer ? '✓' : v.charAt(0)}
                             </div> 
                             {v}
                           </span>
                         ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION: WRITING LAB */}
        {responseItems.length > 0 && (
          <div className="space-y-12">
            {(isCreative || showDoodles) ? <HandDrawnDivider label="Writing Lab" /> : <h2 className="text-2xl font-black text-slate-800 border-l-4 border-blue-600 pl-4 py-1">Written Assessment</h2>}
            
            <div className="space-y-20">
              {responseItems.map((q, idx) => {
                const isTracingRequested = q.type === QuestionType.VOCABULARY || q.type === QuestionType.SENTENCE_DRILL;
                return (
                  <div key={q.id} className="flex flex-col gap-6">
                    <div className="flex items-start gap-4">
                      {(isCreative || showDoodles) ? <QuestionIcon type="CHALLENGE" index={idx} /> : <span className="font-black text-slate-400 text-lg">{idx + 1}.</span>}
                      <div className="flex-1">
                        <p 
                          contentEditable={isClassic} 
                          suppressContentEditableWarning={true}
                          className={`text-2xl font-black leading-tight outline-none ${isCreative ? 'font-handwriting-header text-slate-800' : 'text-slate-900 hover:bg-slate-50'}`}
                        >
                          {q.question}
                        </p>
                        {q.explanation && (isCreative || showDoodles) && <p className="text-xs text-slate-400 mt-2 italic leading-relaxed">Context: {q.explanation}</p>}
                      </div>
                    </div>
                    
                    <div className={`ml-12 p-8 rounded-[2rem] border border-dashed transition-all relative min-h-64 ${isCreative ? 'bg-slate-50/20 border-slate-100' : 'bg-white border-slate-200 shadow-sm'}`}>
                        {isTracingRequested && (
                          <div className="flex flex-col gap-1 border-b-2 border-slate-100 pb-6 mb-8 relative">
                            <span className="text-[8px] font-black uppercase text-slate-300 tracking-[0.2em] mb-2">Reference Text</span>
                            <div 
                              contentEditable={isClassic} 
                              suppressContentEditableWarning={true}
                              className={`text-4xl font-black text-slate-800 tracking-wide outline-none ${!isCreative ? 'font-sans hover:bg-slate-50' : ''}`}
                            >
                              {q.correctAnswer}
                            </div>
                            {(isCreative || showDoodles) && (
                              <div className="absolute -right-4 -top-8 opacity-10 rotate-12">
                                <HelenCharacter />
                              </div>
                            )}
                          </div>
                        )}

                        <div className="space-y-10 relative">
                          <div className="flex justify-between items-center pr-4">
                            <span className="text-[8px] font-black uppercase text-slate-400 tracking-[0.3em]">
                              {isTracingRequested ? "Practice Handwriting" : "Student Response Area"}
                            </span>
                            {(isCreative || showDoodles) && <MarkerHighlight className="text-[10px] uppercase font-bold text-yellow-800 px-3">Ample Writing Space</MarkerHighlight>}
                          </div>
                          <div className="space-y-12 relative">
                            {[...Array(isTracingRequested ? 3 : 5)].map((_, i) => (
                              <div key={i} className="border-b-2 border-slate-200/50 w-full relative h-4 dotted-line">
                                <div className="absolute -top-8 left-0 text-[8px] text-slate-100 font-bold uppercase tracking-widest opacity-40">Line {i + 1}</div>
                              </div>
                            ))}
                            {showKey && (
                              <div className="absolute inset-0 flex flex-col pt-2 text-red-500 font-bold text-2xl italic pointer-events-none opacity-60">
                                <p>{q.correctAnswer}</p>
                                <p className="text-sm mt-8 opacity-80">{q.explanation}</p>
                              </div>
                            )}
                          </div>
                        </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer Branding */}
      <div className="mt-auto pt-16 relative z-10 opacity-40">
        <div className={`flex justify-between items-end border-t border-slate-100 pt-8 ${isCreative ? '' : 'font-sans'}`}>
          <div className="flex gap-12 font-handwriting-header text-xl text-slate-400">
            <span className="rotate-1">Reflect</span>
            <span className="-rotate-2">Practice</span>
            <span className="rotate-3">Master</span>
          </div>
          <div className="text-right space-y-1">
            <div className="text-[8px] font-black uppercase tracking-widest text-slate-300">
              Homework Hero Engine v2.5
            </div>
            <div className="text-[10px] font-bold text-slate-200">
              WWW.HOMEWORKHERO.EDU
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
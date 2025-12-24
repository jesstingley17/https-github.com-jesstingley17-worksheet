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
}

export const WorksheetView: React.FC<WorksheetViewProps> = ({ worksheet, theme }) => {
  const isCreative = theme === ThemeType.CREATIVE;
  
  // Dynamic logic helpers
  const getQuestionLength = (q: Question) => {
    let len = q.question.length;
    if (q.options) len += q.options.join('').length;
    return len;
  };

  const isLongQuestion = (q: Question) => getQuestionLength(q) > 120;

  // Helper for MCQ grid layout
  const getMcqGridCols = (options: string[] | undefined) => {
    if (!options) return 'grid-cols-1';
    const maxLength = Math.max(...options.map(o => o.length));
    if (maxLength < 15) return 'grid-cols-4';
    if (maxLength < 40) return 'grid-cols-2';
    return 'grid-cols-1';
  };

  // Filter questions by role
  // Vocabulary and Short Answer get special "Tracing" treatment in Creative mode
  const drillItems = worksheet.questions.filter(q => 
    q.type === QuestionType.CHARACTER_DRILL
  );
  
  const specialDrills = worksheet.questions.filter(q => 
    q.type === QuestionType.SYMBOL_DRILL
  );

  const interactiveItems = worksheet.questions.filter(q => 
    q.type === QuestionType.MCQ || 
    q.type === QuestionType.TF
  );

  const responseItems = worksheet.questions.filter(q => 
    q.type === QuestionType.SHORT_ANSWER || 
    q.type === QuestionType.VOCABULARY ||
    q.type === QuestionType.SENTENCE_DRILL
  );

  // Group drill items for columns if they are short enough
  const canUseDoubleColumns = isCreative && drillItems.every(q => q.correctAnswer.length < 15);

  return (
    <div className={`max-w-[210mm] mx-auto bg-white p-[12mm] shadow-lg min-h-[297mm] relative transition-all duration-500 overflow-hidden ${isCreative ? 'font-handwriting-body border-[1px] border-slate-100' : 'font-sans'}`}>
      
      {/* Decorative Doodles for Creative Theme */}
      {isCreative && (
        <>
          <DoodleCorner position="tl" />
          <DoodleCorner position="tr" />
          <DoodleCorner position="bl" />
          <DoodleCorner position="br" />
        </>
      )}

      {/* Header */}
      <div className="mb-8 relative z-10">
        <h1 className={`${isCreative ? 'font-handwriting-header text-6xl text-center' : 'text-3xl font-black'} text-slate-900`}>
          {isCreative ? "Helen's Hero Worksheet" : worksheet.title}
        </h1>
        
        {isCreative ? (
          <div className="flex justify-between items-center mt-6 px-6">
            <div className="flex items-center gap-6">
              <div className="bg-yellow-400 text-yellow-900 text-[10px] px-3 py-1 font-black tracking-widest uppercase rounded-full shadow-sm">
                Sequence v2.0
              </div>
              <HelenCharacter />
            </div>
            <div className="text-right">
              <div className="font-handwriting-header text-2xl text-slate-400 -rotate-2">
                #{Math.floor(Math.random() * 1000)}
              </div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                TOPIC: {worksheet.topic.slice(0, 20)}...
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-end border-b-2 border-slate-100 pb-4 mt-4">
            <div className="flex flex-col text-slate-500 text-sm font-medium">
              <span>Topic: {worksheet.topic}</span>
              <span>Level: {worksheet.gradeLevel}</span>
            </div>
            <div className="w-64 border-b border-slate-300 pb-1 text-slate-400 text-xs italic">Student Name: __________________________</div>
          </div>
        )}
      </div>

      <div className="relative z-10 px-4 space-y-12">
        {/* SECTION: DRILLS */}
        {(drillItems.length > 0 || specialDrills.length > 0) && (
          <div className="space-y-6">
            {isCreative && <HandDrawnDivider label="Warmup Drills" />}
            {isCreative && <HandwritingLabels />}
            
            <div className={`grid gap-x-12 gap-y-4 ${canUseDoubleColumns ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {drillItems.map((q, idx) => (
                <div key={q.id} className="relative group">
                  {isCreative ? (
                    <DraggableLineRow text={q.correctAnswer.split(' ')[0]} isSmall={canUseDoubleColumns} />
                  ) : (
                    <div className="flex items-start gap-3 py-2 border-b border-dashed border-slate-100">
                      <span className="font-bold text-slate-400 text-xs uppercase">{idx + 1}</span>
                      <span className="font-bold">{q.question}</span>
                      <div className="flex-1 border-b border-dashed border-slate-200 h-4"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {specialDrills.map((q) => (
              <div key={q.id} className="mt-8">
                {isCreative ? (
                  <SketchyBorderBox className="bg-slate-50/30">
                    <p className="font-handwriting-header text-2xl mb-4 text-slate-600">Symbol Precision Training:</p>
                    <SymbolDrillRow symbols={q.correctAnswer} />
                  </SketchyBorderBox>
                ) : (
                  <div className="p-4 border border-slate-100 rounded bg-slate-50/50">
                    <p className="font-bold text-sm text-slate-500 uppercase mb-2">Symbol Practice</p>
                    <p className="text-xl tracking-widest">{q.correctAnswer}</p>
                    <div className="h-10 border-b border-dashed border-slate-200 mt-2"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* SECTION: INTERACTIVE ASSESSMENT */}
        {interactiveItems.length > 0 && (
          <div className="space-y-8">
            {isCreative ? <HandDrawnDivider label="Quick Assessment" /> : <h2 className="text-xl font-bold border-b pb-2">Part 2: Assessment</h2>}
            
            <div className="space-y-10">
              {interactiveItems.map((q, idx) => {
                const isLong = isLongQuestion(q);
                return (
                  <div key={q.id} className={`flex flex-col gap-4 ${isLong ? 'col-span-full' : ''}`}>
                    <div className="flex items-start gap-4">
                      {isCreative ? <QuestionIcon type={q.type} index={idx} /> : <span className="font-bold text-slate-400">{idx + 1}.</span>}
                      <p className={`text-xl font-bold leading-relaxed ${isCreative ? 'font-handwriting-body' : ''}`}>
                        {q.question}
                        {q.isChallenge && isCreative && <DoodleStar className="inline-block ml-2 w-5 h-5 -mt-2" />}
                      </p>
                    </div>
                    
                    {q.type === QuestionType.MCQ && (
                      <div className={`grid gap-4 ml-12 ${getMcqGridCols(q.options)}`}>
                        {q.options?.map((opt, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className={`w-6 h-6 flex-shrink-0 border-2 ${isCreative ? 'border-slate-300 rotate-2' : 'border-slate-400'} rounded-md flex items-center justify-center`}>
                               {isCreative && <span className="text-[10px] text-slate-300 font-bold">{String.fromCharCode(65 + i)}</span>}
                            </div>
                            <span className="text-lg opacity-80 leading-tight">{opt}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {q.type === QuestionType.TF && (
                      <div className="flex gap-12 ml-12">
                         {['True', 'False'].map((v, i) => (
                           <span key={v} className="flex items-center gap-4 text-lg italic font-bold text-slate-600">
                             <div className={`w-8 h-8 border-2 ${isCreative ? 'border-slate-200 rotate-3' : 'border-slate-300'} rounded-lg flex items-center justify-center text-xs opacity-50`}>
                               {v.charAt(0)}
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

        {/* SECTION: LONG RESPONSE & CHALLENGES */}
        {responseItems.length > 0 && (
          <div className="space-y-12">
            {isCreative ? <HandDrawnDivider label="Writing & Tracing Lab" /> : <h2 className="text-xl font-bold border-b pb-2">Part 3: Written Responses</h2>}
            
            <div className="space-y-20">
              {responseItems.map((q, idx) => (
                <div key={q.id} className="flex flex-col gap-6">
                  <div className="flex items-start gap-4">
                    {isCreative ? <QuestionIcon type="CHALLENGE" index={idx} /> : <span className="font-bold text-slate-400">{idx + 1}.</span>}
                    <div className="flex-1">
                      <p className={`text-2xl font-black leading-tight ${isCreative ? 'font-handwriting-header text-slate-800' : 'text-slate-900'}`}>
                        {q.question}
                      </p>
                      {q.explanation && isCreative && <p className="text-xs text-slate-400 mt-2 italic leading-relaxed">Context: {q.explanation}</p>}
                    </div>
                  </div>
                  
                  {isCreative ? (
                    <div className="space-y-12 ml-12 bg-slate-50/20 p-8 rounded-[2rem] border border-dashed border-slate-100">
                      <div className="grid grid-cols-1 gap-12">
                        {/* Reference & Trace Step */}
                        <div className="flex items-end gap-12 border-b-2 border-slate-100 pb-4 relative">
                          <div className="flex flex-col gap-1">
                            <span className="text-[8px] font-black uppercase text-slate-300 tracking-[0.2em]">1. Reference</span>
                            <div className="text-4xl font-black text-slate-800 tracking-wide">{q.correctAnswer}</div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[8px] font-black uppercase text-slate-300 tracking-[0.2em]">2. Trace</span>
                            <div className="text-4xl font-bold text-slate-200 tracking-wide select-none">{q.correctAnswer}</div>
                          </div>
                          <div className="absolute -right-4 -top-8 opacity-10 rotate-12">
                             <HelenCharacter />
                          </div>
                        </div>

                        {/* Your Turn Step */}
                        <div className="space-y-12">
                          <div className="flex justify-between items-center pr-4">
                            <span className="text-[8px] font-black uppercase text-slate-400 tracking-[0.3em]">3. Your Turn (Practice Writing)</span>
                            <MarkerHighlight className="text-[10px] uppercase font-bold text-yellow-800 px-3">Ample Writing Space</MarkerHighlight>
                          </div>
                          <div className="space-y-14">
                            {[...Array(3)].map((_, i) => (
                              <div key={i} className="border-b-2 border-slate-200/50 w-full relative h-4 dotted-line">
                                <div className="absolute -top-8 left-0 text-[8px] text-slate-200 font-bold uppercase tracking-widest">Entry Line {i + 1}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="ml-12 border-2 border-slate-50 rounded-xl p-10 h-64 bg-slate-50/30">
                       <div className="h-full w-full border-b border-slate-200 border-dashed"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Branding */}
      {isCreative && (
        <div className="mt-auto pt-16 relative z-10 opacity-40">
          <div className="flex justify-between items-end border-t border-slate-100 pt-8">
            <div className="flex gap-12 font-handwriting-header text-xl text-slate-400">
              <span className="rotate-1">Reflect</span>
              <span className="-rotate-2">Trace</span>
              <span className="rotate-3">Master</span>
            </div>
            <div className="text-right space-y-1">
              <div className="text-[8px] font-black uppercase tracking-widest text-slate-300">
                Processed via Helen Hero Engine v2.5
              </div>
              <div className="text-[10px] font-bold text-slate-200">
                WWW.HELENHERO.EDU
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
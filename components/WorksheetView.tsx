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
  
  // High School/University levels should be more professional and dense
  const isSeniorLevel = worksheet.gradeLevel === 'High School' || worksheet.gradeLevel === 'University';
  const isClassicProfessional = isClassic && isSeniorLevel;

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

  // Senior levels should have much smaller, more professional fonts
  const titleSizeClass = isCreative ? 'text-6xl text-center' : (isClassicProfessional ? 'text-xl font-bold uppercase tracking-tight' : 'text-3xl font-black');
  const questionSizeClass = isCreative ? 'text-xl' : (isClassicProfessional ? 'text-[13px] font-semibold leading-tight' : 'text-lg font-bold');
  const optionSizeClass = isCreative ? 'text-lg' : (isClassicProfessional ? 'text-[11px] leading-snug' : 'text-sm');
  const sectionSpacingClass = isClassicProfessional ? 'space-y-4' : 'space-y-12';
  const itemSpacingClass = isClassicProfessional ? 'space-y-3' : 'space-y-10';

  // Professional header should be very minimalist
  const headerPadding = isClassicProfessional ? 'pb-3 mb-4' : 'pb-6 mb-10';

  return (
    <div 
      id="worksheet-content" 
      className={`max-w-[210mm] mx-auto bg-white ${isClassicProfessional ? 'p-[10mm]' : 'p-[12mm]'} shadow-lg min-h-[297mm] relative transition-all duration-500 overflow-hidden ${isCreative ? 'font-handwriting-body' : 'font-sans border border-slate-200'}`}
    >
      
      {/* Cutting Guide Border - Only for non-pro classic or creative */}
      {!isClassicProfessional && (
        <div className={`absolute inset-2 pointer-events-none border border-dashed rounded-sm z-0 ${isCreative ? 'border-slate-200' : 'border-slate-300'} opacity-60`}></div>
      )}

      {showKey && (
        <div className="absolute top-10 right-10 -rotate-12 pointer-events-none z-50">
          <div className="border-4 border-red-500 text-red-500 px-6 py-2 rounded-xl text-3xl font-black uppercase opacity-60 bg-white/80">
            TEACHER KEY
          </div>
        </div>
      )}

      {/* Doodles: Only for creative or if explicitly enabled for junior/classic */}
      {(isCreative || (showDoodles && !isSeniorLevel)) && (
        <>
          <DoodleCorner position="tl" />
          <DoodleCorner position="tr" />
          <DoodleCorner position="bl" />
          <DoodleCorner position="br" />
        </>
      )}

      {/* Header */}
      <div className={`${headerPadding} relative z-10 border-b-2 ${isClassicProfessional ? 'border-slate-900' : 'border-slate-100'}`}>
        <h1 
          contentEditable={isClassic}
          suppressContentEditableWarning={true}
          className={`${isCreative ? 'font-handwriting-header' : 'font-sans text-left outline-none hover:bg-slate-50'} ${titleSizeClass} text-slate-900 leading-tight`}
        >
          {worksheet.title || "Academic Assessment"}
        </h1>
        
        <div className={`flex justify-between items-center ${isClassicProfessional ? 'mt-2' : 'mt-6'} px-0`}>
          <div className="flex items-center gap-6">
            <div className={`px-2 py-0.5 text-[9px] font-black tracking-widest uppercase rounded shadow-sm ${isCreative ? 'bg-yellow-400 text-yellow-900' : 'bg-slate-800 text-white'}`}>
              Reference: HH-PR-{worksheet.id?.slice(-4) || 'AUTO'}
            </div>
            {(isCreative || (showDoodles && !isSeniorLevel)) && <HelenCharacter />}
          </div>
          <div className="text-right flex flex-col items-end gap-0.5">
            <div className={`text-[9px] font-bold uppercase tracking-wider text-slate-500`}>
              Topic: <span className="text-slate-900" contentEditable={isClassic} suppressContentEditableWarning={true}>{worksheet.topic}</span>
            </div>
            <div className={`text-[9px] font-bold uppercase tracking-wider text-slate-500`}>
              Academic Level: <span className="text-slate-900" contentEditable={isClassic} suppressContentEditableWarning={true}>{worksheet.gradeLevel}</span>
            </div>
          </div>
        </div>

        {isClassic && (
          <div className={`${isClassicProfessional ? 'mt-3' : 'mt-8'} flex justify-between items-end pt-2`}>
             <div className="flex flex-col gap-0.5 w-2/3">
                <span className="text-[8px] uppercase font-bold text-slate-400 tracking-widest">Candidate Name / ID</span>
                <div className={`w-full border-b border-slate-300 pb-0.5 text-slate-300 ${isClassicProfessional ? 'text-[11px]' : 'text-sm'} italic`}>
                   {showKey ? <span className="text-red-500 font-bold uppercase not-italic">Internal Solution Key</span> : "_________________________________________________"}
                </div>
             </div>
             <div className="flex flex-col gap-0.5 w-1/4">
                <span className="text-[8px] uppercase font-bold text-slate-400 tracking-widest">Date of Examination</span>
                <div className={`w-full border-b border-slate-300 pb-0.5 text-slate-300 ${isClassicProfessional ? 'text-[11px]' : 'text-sm'}`}>____ / ____ / 20__</div>
             </div>
          </div>
        )}
      </div>

      <div className={`relative z-10 px-0 ${sectionSpacingClass}`}>
        {/* SECTION: DRILLS (Only for non-senior levels) */}
        {!isSeniorLevel && (drillItems.length > 0 || specialDrills.length > 0) && (
          <div className="space-y-6">
            {(isCreative || showDoodles) && <HandDrawnDivider label="Skill Practice" />}
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
                <div className={`${isCreative ? 'p-0' : 'p-6 bg-slate-50'} rounded-2xl border-2 border-slate-100`}>
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
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Symbol Set: {q.question}</p>
                      <p className="text-3xl tracking-[0.6em] text-slate-300 select-none mb-4">{q.correctAnswer}</p>
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

        {/* SECTION: OBJECTIVE ASSESSMENT */}
        {interactiveItems.length > 0 && (
          <div className={`${isClassicProfessional ? 'space-y-3' : 'space-y-8'}`}>
            {isClassicProfessional ? (
              <h2 className="text-[11px] font-black text-slate-900 border-b border-slate-900 inline-block mb-1">SECTION I: OBJECTIVE RESPONSE</h2>
            ) : (isCreative || showDoodles) ? <HandDrawnDivider label="Assessment" /> : <h2 className="text-2xl font-black text-slate-800 border-l-4 border-blue-600 pl-4 py-1">Knowledge Check</h2>}
            
            <div className={itemSpacingClass}>
              {interactiveItems.map((q, idx) => {
                const isLong = isLongQuestion(q);
                return (
                  <div key={q.id} className={`flex flex-col gap-2 ${isLong ? 'col-span-full' : ''}`}>
                    <div className="flex items-start gap-3">
                      {(isCreative || (showDoodles && !isSeniorLevel)) ? <QuestionIcon type={q.type} index={idx} /> : <span className={`font-black text-slate-800 ${isClassicProfessional ? 'text-[11px]' : 'text-lg'}`}>{idx + 1}.</span>}
                      <p 
                        contentEditable={isClassic} 
                        suppressContentEditableWarning={true}
                        className={`${questionSizeClass} leading-tight outline-none ${isCreative ? 'font-handwriting-body' : 'text-slate-900 hover:bg-slate-50'}`}
                      >
                        {q.question}
                        {q.isChallenge && (isCreative || showDoodles) && <DoodleStar className="inline-block ml-2 w-5 h-5 -mt-2" />}
                      </p>
                    </div>
                    
                    {q.type === QuestionType.MCQ && (
                      <div className={`grid gap-1.5 ml-8 ${getMcqGridCols(q.options)}`}>
                        {q.options?.map((opt, i) => (
                          <div key={i} className="flex items-center gap-2 group">
                            <div className={`${isClassicProfessional ? 'w-3.5 h-3.5' : 'w-6 h-6'} flex-shrink-0 border ${isCreative ? 'border-slate-300 rotate-2' : 'border-slate-800 rounded-sm'} flex items-center justify-center ${showKey && opt === q.correctAnswer ? 'bg-red-500 border-red-500' : ''}`}>
                               {isCreative && !showKey && <span className="text-[10px] text-slate-300 font-bold">{String.fromCharCode(65 + i)}</span>}
                               {showKey && opt === q.correctAnswer && <span className="text-white text-[7px] font-bold">X</span>}
                            </div>
                            <span 
                              contentEditable={isClassic} 
                              suppressContentEditableWarning={true}
                              className={`${optionSizeClass} transition-colors outline-none ${showKey && opt === q.correctAnswer ? 'text-red-600 font-bold' : 'opacity-90 group-hover:opacity-100'}`}
                            >
                              {opt}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {q.type === QuestionType.TF && (
                      <div className={`flex gap-10 ${isClassicProfessional ? 'ml-8' : 'ml-12'}`}>
                         {['True', 'False'].map((v) => (
                           <span key={v} className={`flex items-center gap-2 ${isClassicProfessional ? 'text-[11px]' : 'text-lg'} font-bold ${showKey && v === q.correctAnswer ? 'text-red-600' : 'text-slate-700'}`}>
                             <div className={`${isClassicProfessional ? 'w-4 h-4' : 'w-8 h-8'} border ${isCreative ? 'border-slate-200 rotate-3' : 'border-slate-800 rounded'} flex items-center justify-center text-[9px] ${showKey && v === q.correctAnswer ? 'bg-red-500 border-red-500 text-white opacity-100 shadow-sm' : 'opacity-40'}`}>
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

        {/* SECTION: SUBJECTIVE / ANALYTICAL ASSESSMENT */}
        {responseItems.length > 0 && (
          <div className={`${isClassicProfessional ? 'space-y-4' : 'space-y-12'}`}>
            {isClassicProfessional ? (
              <h2 className="text-[11px] font-black text-slate-900 border-b border-slate-900 inline-block mb-1">SECTION II: ANALYTICAL RESPONSE</h2>
            ) : (isCreative || showDoodles) ? <HandDrawnDivider label="Writing Lab" /> : <h2 className="text-2xl font-black text-slate-800 border-l-4 border-blue-600 pl-4 py-1">Written Assessment</h2>}
            
            <div className={isClassicProfessional ? 'space-y-6' : 'space-y-20'}>
              {responseItems.map((q, idx) => {
                const isTracingPossible = !isSeniorLevel && (q.type === QuestionType.VOCABULARY || q.type === QuestionType.SENTENCE_DRILL);
                return (
                  <div key={q.id} className={`flex flex-col ${isClassicProfessional ? 'gap-2' : 'gap-6'}`}>
                    <div className="flex items-start gap-3">
                      {(isCreative || (showDoodles && !isSeniorLevel)) ? <QuestionIcon type="CHALLENGE" index={idx} /> : <span className={`font-black text-slate-800 ${isClassicProfessional ? 'text-[11px]' : 'text-lg'}`}>{idx + 1}.</span>}
                      <div className="flex-1">
                        <p 
                          contentEditable={isClassic} 
                          suppressContentEditableWarning={true}
                          className={`${isClassicProfessional ? 'text-[13px] font-bold' : 'text-2xl font-black'} leading-tight outline-none ${isCreative ? 'font-handwriting-header text-slate-800' : 'text-slate-900 hover:bg-slate-50'}`}
                        >
                          {q.question}
                        </p>
                        {q.explanation && (isCreative || (showDoodles && !isSeniorLevel)) && <p className="text-xs text-slate-400 mt-2 italic leading-relaxed">Context: {q.explanation}</p>}
                      </div>
                    </div>
                    
                    <div className={`ml-8 ${isClassicProfessional ? 'p-2 min-h-24' : 'p-8 min-h-64'} rounded-lg border border-slate-200 transition-all relative`}>
                        {isTracingPossible && (
                          <div className={`flex flex-col gap-1 border-b-2 border-slate-100 pb-4 mb-6 relative`}>
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

                        <div className={`${isClassicProfessional ? 'space-y-6' : 'space-y-10'} relative`}>
                          <div className="flex justify-between items-center pr-2">
                            <span className="text-[7px] font-black uppercase text-slate-400 tracking-[0.2em]">
                              {isTracingPossible ? "Practice Area" : "Candidate Response"}
                            </span>
                            {!isClassicProfessional && (isCreative || showDoodles) && <MarkerHighlight className="text-[10px] uppercase font-bold text-yellow-800 px-3">Extended Writing Space</MarkerHighlight>}
                          </div>
                          <div className={`space-y-5 relative`}>
                            {[...Array(isClassicProfessional ? 3 : 5)].map((_, i) => (
                              <div key={i} className={`border-b border-slate-200 w-full relative h-3`}>
                                {isClassicProfessional && <div className="absolute -top-4 left-0 text-[6px] text-slate-100 font-bold uppercase tracking-widest opacity-30">Line {i + 1}</div>}
                              </div>
                            ))}
                            {showKey && (
                              <div className="absolute inset-0 flex flex-col pt-1 text-red-500 font-bold text-[13px] italic pointer-events-none opacity-60">
                                <p>{q.correctAnswer}</p>
                                <p className="text-[10px] mt-4 opacity-80">{q.explanation}</p>
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
      <div className="mt-auto pt-8 relative z-10 opacity-30">
        <div className={`flex justify-between items-end border-t border-slate-900 pt-4 ${isCreative ? '' : 'font-sans'}`}>
          <div className="flex gap-12 font-bold text-[10px] text-slate-500 uppercase tracking-widest">
            <span>Critical Thinking</span>
            <span>Academic Rigor</span>
            <span>Intellectual Growth</span>
          </div>
          <div className="text-right space-y-0.5">
            <div className="text-[7px] font-black uppercase tracking-widest text-slate-600">
              Exam System HH-V2.5 Professional
            </div>
            <div className="text-[8px] font-bold text-slate-400">
              OFFICIAL ASSESSMENT DOCUMENT
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
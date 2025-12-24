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

  // High academic formatting: smaller, denser, no juvenile elements
  const titleSizeClass = isCreative ? 'text-6xl text-center' : (isClassicProfessional ? 'text-lg font-bold uppercase tracking-tight' : 'text-3xl font-black');
  const questionSizeClass = isCreative ? 'text-xl' : (isClassicProfessional ? 'text-[12px] font-bold leading-tight' : 'text-lg font-bold');
  const optionSizeClass = isCreative ? 'text-lg' : (isClassicProfessional ? 'text-[10px] leading-tight font-medium' : 'text-sm');
  
  const sectionSpacingClass = isClassicProfessional ? 'space-y-4' : 'space-y-12';
  const itemSpacingClass = isClassicProfessional ? 'space-y-3' : 'space-y-10';

  // Professional header should be very minimalist
  const headerPadding = isClassicProfessional ? 'pb-2 mb-3' : 'pb-6 mb-10';

  return (
    <div 
      id="worksheet-content" 
      className={`max-w-[210mm] mx-auto bg-white ${isClassicProfessional ? 'p-[12mm]' : 'p-[12mm]'} shadow-lg min-h-[297mm] relative transition-all duration-500 overflow-hidden ${isCreative ? 'font-handwriting-body' : 'font-sans border border-slate-200'}`}
    >
      
      {/* Cutting Guide Border - Only for junior/creative */}
      {!isClassicProfessional && (
        <div className={`absolute inset-2 pointer-events-none border border-dashed rounded-sm z-0 ${isCreative ? 'border-slate-200' : 'border-slate-300'} opacity-60`}></div>
      )}

      {showKey && (
        <div className="absolute top-10 right-10 -rotate-12 pointer-events-none z-50">
          <div className="border-4 border-red-500 text-red-500 px-6 py-2 rounded-xl text-2xl font-black uppercase opacity-60 bg-white/80">
            OFFICIAL SOLUTION
          </div>
        </div>
      )}

      {/* Doodles: Strictly forbidden for senior levels in professional mode */}
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
          className={`${isCreative ? 'font-handwriting-header' : 'font-sans text-left outline-none hover:bg-slate-50'} ${titleSizeClass} text-slate-900`}
        >
          {worksheet.title || "Academic Assessment Document"}
        </h1>
        
        <div className={`flex justify-between items-center ${isClassicProfessional ? 'mt-1' : 'mt-6'} px-0`}>
          <div className="flex items-center gap-4">
            <div className={`px-2 py-0.5 text-[8px] font-bold tracking-widest uppercase border ${isCreative ? 'bg-yellow-400 text-yellow-900 border-yellow-500' : 'bg-white text-slate-900 border-slate-800'}`}>
              Assessment Ref: HH-V2.5-PRO-{worksheet.id?.slice(-6) || 'N/A'}
            </div>
            {(isCreative || (showDoodles && !isSeniorLevel)) && <HelenCharacter />}
          </div>
          <div className="text-right flex flex-col items-end gap-0">
            <div className={`text-[8px] font-bold uppercase tracking-tight text-slate-500`}>
              Module: <span className="text-slate-900" contentEditable={isClassic} suppressContentEditableWarning={true}>{worksheet.topic}</span>
            </div>
            <div className={`text-[8px] font-bold uppercase tracking-tight text-slate-500`}>
              Classification: <span className="text-slate-900" contentEditable={isClassic} suppressContentEditableWarning={true}>{worksheet.gradeLevel}</span>
            </div>
          </div>
        </div>

        {isClassic && (
          <div className={`${isClassicProfessional ? 'mt-3' : 'mt-8'} flex justify-between items-end pt-1`}>
             <div className="flex flex-col gap-0 w-2/3">
                <span className="text-[7px] uppercase font-bold text-slate-500 tracking-tighter">Candidate Full Name</span>
                <div className={`w-full border-b border-slate-400 pb-0.5 text-slate-300 ${isClassicProfessional ? 'text-[10px]' : 'text-sm'} font-medium`}>
                   {showKey ? <span className="text-red-500 font-bold uppercase not-italic">TEACHER COPY - INTERNAL USE ONLY</span> : "________________________________________________________________________"}
                </div>
             </div>
             <div className="flex flex-col gap-0 w-1/4">
                <span className="text-[7px] uppercase font-bold text-slate-500 tracking-tighter">Submission Date</span>
                <div className={`w-full border-b border-slate-400 pb-0.5 text-slate-300 ${isClassicProfessional ? 'text-[10px]' : 'text-sm'}`}>____ / ____ / 20__</div>
             </div>
          </div>
        )}
      </div>

      <div className={`relative z-10 px-0 ${sectionSpacingClass}`}>
        {/* SECTION: DRILLS (Strictly for non-senior levels) */}
        {!isSeniorLevel && (drillItems.length > 0 || specialDrills.length > 0) && (
          <div className="space-y-6">
            {(isCreative || showDoodles) && <HandDrawnDivider label="Foundation Drills" />}
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
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Symbol Set Identification: {q.question}</p>
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

        {/* SECTION: OBJECTIVE RESPONSE */}
        {interactiveItems.length > 0 && (
          <div className={`${isClassicProfessional ? 'space-y-3' : 'space-y-8'}`}>
            {isClassicProfessional ? (
              <h2 className="text-[10px] font-black text-slate-900 border-b border-slate-800 inline-block mb-1">PART A: OBJECTIVE ASSESSMENT</h2>
            ) : (isCreative || showDoodles) ? <HandDrawnDivider label="Assessment" /> : <h2 className="text-2xl font-black text-slate-800 border-l-4 border-blue-600 pl-4 py-1">Knowledge Check</h2>}
            
            <div className={itemSpacingClass}>
              {interactiveItems.map((q, idx) => {
                const isLong = isLongQuestion(q);
                return (
                  <div key={q.id} className={`flex flex-col gap-1 ${isLong ? 'col-span-full' : ''}`}>
                    <div className="flex items-start gap-2">
                      {(isCreative || (showDoodles && !isSeniorLevel)) ? <QuestionIcon type={q.type} index={idx} /> : <span className={`font-bold text-slate-900 ${isClassicProfessional ? 'text-[11px]' : 'text-lg'}`}>{idx + 1}.</span>}
                      <p 
                        contentEditable={isClassic} 
                        suppressContentEditableWarning={true}
                        className={`${questionSizeClass} leading-tight outline-none ${isCreative ? 'font-handwriting-body' : 'text-slate-900 hover:bg-slate-50'}`}
                      >
                        {q.question}
                        {q.isChallenge && (isCreative || (showDoodles && !isSeniorLevel)) && <DoodleStar className="inline-block ml-2 w-5 h-5 -mt-2" />}
                      </p>
                    </div>
                    
                    {q.type === QuestionType.MCQ && (
                      <div className={`grid gap-1 ml-6 ${getMcqGridCols(q.options)}`}>
                        {q.options?.map((opt, i) => (
                          <div key={i} className="flex items-center gap-1.5 group">
                            <div className={`${isClassicProfessional ? 'w-3 h-3' : 'w-6 h-6'} flex-shrink-0 border ${isCreative ? 'border-slate-300 rotate-2' : 'border-slate-900 rounded-none'} flex items-center justify-center ${showKey && opt === q.correctAnswer ? 'bg-red-500 border-red-500' : ''}`}>
                               {isCreative && !showKey && <span className="text-[10px] text-slate-300 font-bold">{String.fromCharCode(65 + i)}</span>}
                               {showKey && opt === q.correctAnswer && <span className="text-white text-[7px] font-bold">X</span>}
                            </div>
                            <span 
                              contentEditable={isClassic} 
                              suppressContentEditableWarning={true}
                              className={`${optionSizeClass} outline-none ${showKey && opt === q.correctAnswer ? 'text-red-700 font-bold' : 'text-slate-700 opacity-90 group-hover:opacity-100'}`}
                            >
                              {opt}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {q.type === QuestionType.TF && (
                      <div className={`flex gap-8 ${isClassicProfessional ? 'ml-6' : 'ml-12'}`}>
                         {['True', 'False'].map((v) => (
                           <span key={v} className={`flex items-center gap-1.5 ${isClassicProfessional ? 'text-[10px]' : 'text-lg'} font-bold ${showKey && v === q.correctAnswer ? 'text-red-700' : 'text-slate-800'}`}>
                             <div className={`${isClassicProfessional ? 'w-3.5 h-3.5' : 'w-8 h-8'} border ${isCreative ? 'border-slate-200 rotate-3' : 'border-slate-900 rounded-none'} flex items-center justify-center text-[8px] ${showKey && v === q.correctAnswer ? 'bg-red-600 border-red-600 text-white shadow-sm' : 'opacity-30'}`}>
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

        {/* SECTION: ANALYTICAL / SUBJECTIVE RESPONSE */}
        {responseItems.length > 0 && (
          <div className={`${isClassicProfessional ? 'space-y-3' : 'space-y-12'}`}>
            {isClassicProfessional ? (
              <h2 className="text-[10px] font-black text-slate-900 border-b border-slate-800 inline-block mb-1">PART B: ANALYTICAL SYNTHESIS</h2>
            ) : (isCreative || showDoodles) ? <HandDrawnDivider label="Analysis Lab" /> : <h2 className="text-2xl font-black text-slate-800 border-l-4 border-blue-600 pl-4 py-1">Written Assessment</h2>}
            
            <div className={isClassicProfessional ? 'space-y-4' : 'space-y-20'}>
              {responseItems.map((q, idx) => {
                // Senior levels don't trace, ever.
                const isTracingRequested = !isSeniorLevel && (q.type === QuestionType.VOCABULARY || q.type === QuestionType.SENTENCE_DRILL);
                
                return (
                  <div key={q.id} className={`flex flex-col ${isClassicProfessional ? 'gap-1' : 'gap-6'}`}>
                    <div className="flex items-start gap-2">
                      {(isCreative || (showDoodles && !isSeniorLevel)) ? <QuestionIcon type="CHALLENGE" index={idx} /> : <span className={`font-bold text-slate-900 ${isClassicProfessional ? 'text-[11px]' : 'text-lg'}`}>{idx + 1}.</span>}
                      <div className="flex-1">
                        <p 
                          contentEditable={isClassic} 
                          suppressContentEditableWarning={true}
                          className={`${isClassicProfessional ? 'text-[12px] font-bold' : 'text-2xl font-black'} leading-tight outline-none ${isCreative ? 'font-handwriting-header text-slate-800' : 'text-slate-900 hover:bg-slate-50'}`}
                        >
                          {q.question}
                        </p>
                        {q.explanation && (isCreative || (showDoodles && !isSeniorLevel)) && <p className="text-xs text-slate-400 mt-2 italic leading-relaxed">Instructional Context: {q.explanation}</p>}
                      </div>
                    </div>
                    
                    <div className={`ml-6 ${isClassicProfessional ? 'p-1 min-h-[60px]' : 'p-8 min-h-64'} rounded-none transition-all relative`}>
                        {isTracingRequested && (
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

                        <div className={`${isClassicProfessional ? 'space-y-2' : 'space-y-10'} relative`}>
                          {!isClassicProfessional && (
                            <div className="flex justify-between items-center px-1">
                              <span className="text-[6px] font-bold uppercase text-slate-400 tracking-wider">
                                {isTracingRequested ? "Handwriting Practice" : "Analytical Response Space"}
                              </span>
                              {(isCreative || showDoodles) && <MarkerHighlight className="text-[10px] uppercase font-bold text-yellow-800 px-3">Professional Margins</MarkerHighlight>}
                            </div>
                          )}
                          
                          <div className={`${isClassicProfessional ? 'space-y-4' : 'space-y-5'} relative`}>
                            {[...Array(isClassicProfessional ? 3 : 5)].map((_, i) => (
                              <div key={i} className={`border-b border-slate-300 w-full relative ${isClassicProfessional ? 'h-[22px]' : 'h-6'}`}>
                              </div>
                            ))}
                            {showKey && (
                              <div className="absolute inset-0 flex flex-col pt-0 text-red-600 font-bold text-[11px] italic pointer-events-none opacity-70">
                                <p className={`${isClassicProfessional ? 'leading-[22px]' : ''}`}>{q.correctAnswer}</p>
                                <p className="text-[8px] mt-2 opacity-60 leading-tight">Rationale: {q.explanation}</p>
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
      <div className="mt-auto pt-4 relative z-10 opacity-40">
        <div className={`flex justify-between items-end border-t border-slate-800 pt-2 ${isCreative ? '' : 'font-sans'}`}>
          <div className="flex gap-10 font-bold text-[8px] text-slate-600 uppercase tracking-tighter">
            <span>Critical Synthesis</span>
            <span>Empirical Rigor</span>
            <span>Academic Excellence</span>
          </div>
          <div className="text-right space-y-0">
            <div className="text-[6px] font-black uppercase tracking-widest text-slate-900">
              Exam Processor: HH-CORE-V2.5
            </div>
            <div className="text-[7px] font-bold text-slate-500 uppercase">
              CONFIDENTIAL ASSESSMENT CONTENT
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
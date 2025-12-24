
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
  SketchyBorderBox
} from './HandwritingElements';

interface WorksheetViewProps {
  worksheet: Worksheet;
  theme: ThemeType;
  showKey?: boolean;
  showDoodles?: boolean;
  isMathMode?: boolean;
}

export const WorksheetView: React.FC<WorksheetViewProps> = ({ worksheet, theme, showKey = false, showDoodles = false, isMathMode = false }) => {
  const [userSelections, setUserSelections] = useState<Record<string, string>>({});
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

  const titleSizeClass = isPreschool ? 'text-7xl text-center' : isCreative ? 'text-6xl text-center' : (isClassicProfessional ? 'text-base font-bold uppercase tracking-tight' : 'text-3xl font-black');
  
  // Math Mode Font Size logic
  const mathBaseSize = isMathMode ? 'text-xl' : 'text-[11px]';
  const mathHeaderSize = isMathMode ? 'text-3xl' : 'text-2xl';
  
  const questionSizeClass = isCreative ? 'text-xl' : (isClassicProfessional ? `${mathBaseSize} font-bold leading-relaxed` : 'text-lg font-bold');
  const optionSizeClass = isCreative ? 'text-lg' : (isClassicProfessional ? `${isMathMode ? 'text-lg' : 'text-[9.5px]'} leading-loose font-medium` : 'text-sm');
  
  const sectionSpacingClass = isClassicProfessional ? (isMathMode ? 'space-y-12' : 'space-y-4') : 'space-y-12';
  const itemSpacingClass = isClassicProfessional ? (isMathMode ? 'space-y-10' : 'space-y-3') : 'space-y-10';

  const headerPadding = isClassicProfessional ? 'pb-1.5 mb-2.5' : 'pb-6 mb-10';

  if (isPreschool) {
    const tracingItems = worksheet.questions.filter(q => q.type === QuestionType.SENTENCE_DRILL);
    
    return (
      <div 
        id="worksheet-content" 
        className="max-w-[210mm] mx-auto bg-white p-[15mm] shadow-lg min-h-[297mm] relative transition-all duration-500 overflow-hidden font-handwriting-body border border-slate-200"
      >
        <DoodleCorner position="tl" />
        <DoodleCorner position="tr" />
        <DoodleCorner position="bl" />
        <DoodleCorner position="br" />

        <div className="text-center mb-10 border-b-4 border-slate-100 pb-8">
          <h1 className={`${titleSizeClass} font-handwriting-header text-slate-900 mb-6`}>
            {worksheet.title}
          </h1>
          <div className="flex justify-center gap-12 mt-8">
            <div className="flex flex-col items-start">
               <span className="text-xs font-black uppercase text-slate-400">My Name:</span>
               <div className="w-64 border-b-2 border-slate-900 h-10"></div>
            </div>
            <div className="flex flex-col items-start">
               <span className="text-xs font-black uppercase text-slate-400">Today's Date:</span>
               <div className="w-48 border-b-2 border-slate-900 h-10"></div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-200 min-h-[400px] mb-8">
          {worksheet.coloringImage ? (
            <div className="w-full flex flex-col items-center">
              <img 
                src={worksheet.coloringImage} 
                alt="Preschool Coloring Subject" 
                className="max-w-full rounded-2xl shadow-sm mix-blend-multiply h-96 object-contain" 
              />
              <p className="mt-8 font-handwriting-header text-3xl text-slate-700 italic">"Let's color the {worksheet.topic}!"</p>
            </div>
          ) : (
            <div className="text-center">
               <p className="text-4xl font-handwriting-header text-slate-400">Coloring Area</p>
               <p className="mt-4 text-xl">Draw your favorite {worksheet.topic} here!</p>
            </div>
          )}
        </div>

        {tracingItems.length > 0 && (
          <div className="mt-10 space-y-8">
            <HandDrawnDivider label="Let's Trace!" />
            <div className="space-y-12 px-6">
              {tracingItems.map((q, i) => (
                <div key={q.id} className="relative">
                   <p className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4">Activity {i+1}: Trace the letters</p>
                   <DraggableLineRow text={q.correctAnswer} />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-auto pt-10 flex justify-between items-center opacity-60">
          <HelenCharacter />
          <div className="text-right">
             <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Homework Hero for Preschoolers</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      id="worksheet-content" 
      className={`max-w-[210mm] mx-auto bg-white ${isClassicProfessional ? 'p-[15mm]' : 'p-[12mm]'} shadow-lg min-h-[297mm] relative transition-all duration-500 overflow-hidden ${isCreative ? 'font-handwriting-body' : 'font-sans border border-slate-200'}`}
    >
      
      {!isClassicProfessional && (
        <div className={`absolute inset-2 pointer-events-none border border-dashed rounded-sm z-0 ${isCreative ? 'border-slate-200' : 'border-slate-300'} opacity-60`}></div>
      )}

      {showKey && (
        <div className="absolute top-10 right-10 -rotate-12 pointer-events-none z-50">
          <div className="border-4 border-red-500 text-red-500 px-6 py-2 rounded-xl text-2xl font-black uppercase opacity-60 bg-white/80 shadow-lg">
            OFFICIAL SOLUTION
          </div>
        </div>
      )}

      {(isCreative || (showDoodles && !isSeniorLevel)) && (
        <>
          <DoodleCorner position="tl" />
          <DoodleCorner position="tr" />
          <DoodleCorner position="bl" />
          <DoodleCorner position="br" />
        </>
      )}

      <div className={`${headerPadding} relative z-10 border-b-2 ${isClassicProfessional ? 'border-slate-900' : 'border-slate-100'}`}>
        <h1 
          contentEditable={isClassic}
          suppressContentEditableWarning={true}
          className={`${isCreative ? 'font-handwriting-header' : 'font-sans text-left outline-none hover:bg-slate-50'} ${titleSizeClass} text-slate-900 leading-tight`}
        >
          {worksheet.title || "Academic Assessment Document"}
        </h1>
        
        <div className={`flex justify-between items-center ${isClassicProfessional ? 'mt-1' : 'mt-6'} px-0`}>
          <div className="flex items-center gap-4">
            <div className={`px-1.5 py-0.5 text-[7.5px] font-bold tracking-widest uppercase border ${isCreative ? 'bg-yellow-400 text-yellow-900 border-yellow-500' : 'bg-white text-slate-900 border-slate-800'}`}>
              Assessment Ref: HH-V2.5-PRO-{worksheet.id?.slice(-6) || 'N/A'}
            </div>
            {(isCreative || (showDoodles && !isSeniorLevel)) && <HelenCharacter />}
          </div>
          <div className="text-right flex flex-col items-end gap-0">
            <div className={`text-[7.5px] font-bold uppercase tracking-tight text-slate-500`}>
              Module: <span className="text-slate-900" contentEditable={isClassic} suppressContentEditableWarning={true}>{worksheet.topic}</span>
            </div>
            <div className={`text-[7.5px] font-bold uppercase tracking-tight text-slate-500`}>
              Classification: <span className="text-slate-900" contentEditable={isClassic} suppressContentEditableWarning={true}>{worksheet.educationalLevel}</span>
            </div>
          </div>
        </div>

        {isClassic && (
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
        )}
      </div>

      <div className={`relative z-10 px-0 ${sectionSpacingClass}`}>
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

        {interactiveItems.length > 0 && (
          <div className={`${isClassicProfessional ? (isMathMode ? 'space-y-6' : 'space-y-2') : 'space-y-8'}`}>
            {isClassicProfessional ? (
              <h2 className={`${isMathMode ? 'text-sm' : 'text-[9px]'} font-black text-slate-900 border-b border-slate-800 inline-block mb-1`}>PART A: OBJECTIVE ASSESSMENT</h2>
            ) : (isCreative || showDoodles) ? <HandDrawnDivider label="Assessment" /> : <h2 className="text-2xl font-black text-slate-800 border-l-4 border-blue-600 pl-4 py-1">Knowledge Check</h2>}
            
            <div className={itemSpacingClass}>
              {interactiveItems.map((q, idx) => {
                const isLong = q.question.length > 120;
                return (
                  <div key={q.id} className={`flex flex-col gap-1 ${isLong ? 'col-span-full' : ''}`}>
                    <div className="flex items-start gap-2">
                      {(isCreative || (showDoodles && !isSeniorLevel)) ? <QuestionIcon type={q.type} index={idx} /> : <span className={`font-bold text-slate-900 ${isClassicProfessional ? (isMathMode ? 'text-xl' : 'text-[11px]') : 'text-lg'}`}>{idx + 1}.</span>}
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
                      <div className={`grid ${isMathMode ? 'gap-4 mt-2' : 'gap-0.5'} ml-6 ${getMcqGridCols(q.options)}`}>
                        {q.options?.map((opt, i) => {
                          const isSelected = userSelections[q.id] === opt;
                          const isOfficial = showKey && opt === q.correctAnswer;
                          
                          return (
                            <div 
                              key={i} 
                              onClick={() => handleToggleSelection(q.id, opt)}
                              className={`flex items-center ${isMathMode ? 'gap-3 p-2' : 'gap-1.5 p-0.5'} group cursor-pointer rounded-sm transition-all no-print ${
                                isSelected ? (isCreative ? 'bg-yellow-50/80' : 'bg-blue-50') : 'hover:bg-slate-50'
                              }`}
                            >
                              <div className={`${isClassicProfessional ? (isMathMode ? 'w-6 h-6' : 'w-2.5 h-2.5') : 'w-6 h-6'} flex-shrink-0 border transition-colors ${
                                isCreative ? 'border-slate-300 rotate-2' : 'border-slate-900 rounded-none'
                              } flex items-center justify-center ${
                                isOfficial ? 'bg-red-500 border-red-500' : (isSelected ? 'bg-blue-600 border-blue-600' : '')
                              }`}>
                                {isCreative && !showKey && !isSelected && <span className={`${isMathMode ? 'text-sm' : 'text-[10px]'} text-slate-300 font-bold`}>{String.fromCharCode(65 + i)}</span>}
                                {(isOfficial || isSelected) && <span className={`text-white ${isMathMode ? 'text-xs' : 'text-[6px]'} font-bold`}>{isOfficial ? 'X' : '✓'}</span>}
                              </div>
                              <span 
                                contentEditable={isClassic} 
                                suppressContentEditableWarning={true}
                                className={`${optionSizeClass} outline-none transition-colors ${
                                  isOfficial ? 'text-red-700 font-bold' : (isSelected ? 'text-blue-800 font-bold' : 'text-slate-700 opacity-90 group-hover:opacity-100')
                                }`}
                              >
                                {opt}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    
                    {q.type === QuestionType.TF && (
                      <div className={`flex gap-6 ${isClassicProfessional ? 'ml-6' : 'ml-12'} ${isMathMode ? 'mt-4' : ''}`}>
                         {['True', 'False'].map((v) => {
                           const isSelected = userSelections[q.id] === v;
                           const isOfficial = showKey && v === q.correctAnswer;
                           
                           return (
                             <div 
                               key={v} 
                               onClick={() => handleToggleSelection(q.id, v)}
                               className={`flex items-center ${isMathMode ? 'gap-4 p-3' : 'gap-1.5 p-1'} group cursor-pointer rounded-lg transition-all no-print ${
                                 isSelected ? (isCreative ? 'bg-yellow-50' : 'bg-blue-50') : 'hover:bg-slate-50'
                               }`}
                             >
                               <div className={`${isClassicProfessional ? (isMathMode ? 'w-8 h-8' : 'w-3 h-3') : 'w-8 h-8'} border transition-colors ${
                                 isCreative ? 'border-slate-200 rotate-3' : 'border-slate-900 rounded-none'
                               } flex items-center justify-center ${isMathMode ? 'text-sm' : 'text-[7px]'} ${
                                 isOfficial ? 'bg-red-600 border-red-600 text-white' : (isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'opacity-30')
                               }`}>
                                 {isOfficial ? '✓' : (isSelected ? '✓' : v.charAt(0))}
                               </div> 
                               <span className={`${isClassicProfessional ? (isMathMode ? 'text-xl' : 'text-[9px]') : 'text-lg'} font-bold transition-colors ${
                                 isOfficial ? 'text-red-700' : (isSelected ? 'text-blue-800' : 'text-slate-800')
                               }`}>
                                 {v}
                               </span>
                             </div>
                           );
                         })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {responseItems.length > 0 && (
          <div className={`${isClassicProfessional ? (isMathMode ? 'space-y-10' : 'space-y-2.5') : 'space-y-12'}`}>
            {isClassicProfessional ? (
              <h2 className={`${isMathMode ? 'text-sm' : 'text-[9px]'} font-black text-slate-900 border-b border-slate-800 inline-block mb-1`}>PART B: ANALYTICAL SYNTHESIS</h2>
            ) : (isCreative || showDoodles) ? <HandDrawnDivider label="Analysis Lab" /> : <h2 className="text-2xl font-black text-slate-800 border-l-4 border-blue-600 pl-4 py-1">Written Assessment</h2>}
            
            <div className={isClassicProfessional ? (isMathMode ? 'space-y-16' : 'space-y-3.5') : 'space-y-20'}>
              {responseItems.map((q, idx) => {
                const isTracingRequested = !isSeniorLevel && (q.type === QuestionType.VOCABULARY || q.type === QuestionType.SENTENCE_DRILL);
                const isExpandedType = q.type === QuestionType.SHORT_ANSWER || q.type === QuestionType.VOCABULARY;
                const lineCount = isClassicProfessional ? (isExpandedType ? 5 : 4) : (isExpandedType ? 6 : 5);
                const minHeightClass = isClassicProfessional 
                  ? (isExpandedType ? (isMathMode ? 'min-h-[250px]' : 'min-h-[75px]') : (isMathMode ? 'min-h-[150px]' : 'min-h-[50px]')) 
                  : (isExpandedType ? 'min-h-80' : 'min-h-64');

                return (
                  <div key={q.id} className={`flex flex-col ${isClassicProfessional ? 'gap-0.5' : 'gap-6'}`}>
                    <div className="flex items-start gap-2">
                      {(isCreative || (showDoodles && !isSeniorLevel)) ? <QuestionIcon type="CHALLENGE" index={idx} /> : <span className={`font-bold text-slate-900 ${isClassicProfessional ? (isMathMode ? 'text-xl' : 'text-[11px]') : 'text-lg'}`}>{idx + 1}.</span>}
                      <div className="flex-1">
                        <p 
                          contentEditable={isClassic} 
                          suppressContentEditableWarning={true}
                          className={`${isClassicProfessional ? (isMathMode ? 'text-xl font-bold' : 'text-[11px] font-bold') : 'text-2xl font-black'} leading-tight outline-none ${isCreative ? 'font-handwriting-header text-slate-800' : 'text-slate-900 hover:bg-slate-50'}`}
                        >
                          {q.question}
                        </p>
                        {q.explanation && (isCreative || (showDoodles && !isSeniorLevel)) && <p className="text-xs text-slate-400 mt-2 italic leading-relaxed">Instructional Context: {q.explanation}</p>}
                      </div>
                    </div>
                    
                    <div className={`ml-6 ${minHeightClass} rounded-none border-l border-slate-200 transition-all relative`}>
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

                        <div className={`${isClassicProfessional ? (isMathMode ? 'space-y-4' : 'space-y-0') : 'space-y-10'} relative`}>
                          {!isClassicProfessional && (
                            <div className="flex justify-between items-center px-1">
                              <span className="text-[6px] font-bold uppercase text-slate-400 tracking-wider">
                                {isTracingRequested ? "Handwriting Practice" : "Analytical Response Space"}
                              </span>
                              {(isCreative || showDoodles) && <MarkerHighlight className="text-[10px] uppercase font-bold text-yellow-800 px-3">Professional Margins</MarkerHighlight>}
                            </div>
                          )}
                          
                          <div className={`${isClassicProfessional ? (isMathMode ? 'space-y-4' : 'space-y-0') : 'space-y-5'} relative`}>
                            {[...Array(lineCount)].map((_, i) => (
                              <div key={i} className={`border-b border-slate-200 w-full relative ${isClassicProfessional ? (isMathMode ? 'h-[50px]' : 'h-[20px]') : 'h-6'}`}>
                              </div>
                            ))}
                            {showKey && (
                              <div className={`absolute inset-0 flex flex-col pt-0 text-red-600 font-bold ${isMathMode ? 'text-lg' : 'text-[10px]'} italic pointer-events-none opacity-70`}>
                                <p className={`${isClassicProfessional ? (isMathMode ? 'leading-[50px]' : 'leading-[20px] mt-0.5 ml-1') : ''}`}>{q.correctAnswer}</p>
                                {!isClassicProfessional && <p className="text-[8px] mt-2 opacity-60 leading-tight">Rationale: {q.explanation}</p>}
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

      <div className="mt-auto pt-4 relative z-10 opacity-40">
        <div className={`flex justify-between items-end border-t border-slate-800 pt-1.5 ${isCreative ? '' : 'font-sans'}`}>
          <div className="flex gap-10 font-bold text-[7px] text-slate-600 uppercase tracking-tighter">
            <span>Critical Synthesis</span>
            <span>Empirical Rigor</span>
            <span>Academic Excellence</span>
          </div>
          <div className="text-right space-y-0">
            <div className="text-[5.5px] font-black uppercase tracking-widest text-slate-900">
              Exam Processor: HH-CORE-V2.5
            </div>
            <div className="text-[6.5px] font-bold text-slate-500 uppercase">
              OFFICIAL ASSESSMENT CONTENT
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

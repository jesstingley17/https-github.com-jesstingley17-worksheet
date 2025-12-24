
import React from 'react';
import { Worksheet, QuestionType, ThemeType } from '../types';
import { 
  MarkerHighlight, 
  HandDrawnDivider, 
  DraggableLineRow, 
  SymbolDrillRow,
  HelenCharacter, 
  HandwritingLabels 
} from './HandwritingElements';

interface WorksheetViewProps {
  worksheet: Worksheet;
  theme: ThemeType;
}

export const WorksheetView: React.FC<WorksheetViewProps> = ({ worksheet, theme }) => {
  const isCreative = theme === ThemeType.CREATIVE;
  
  // Logical groups for layout
  const drillItems = worksheet.questions.filter(q => 
    q.type === QuestionType.CHARACTER_DRILL || 
    q.type === QuestionType.VOCABULARY
  );
  
  const specialDrills = worksheet.questions.filter(q => 
    q.type === QuestionType.SYMBOL_DRILL
  );

  const interactiveItems = worksheet.questions.filter(q => 
    q.type === QuestionType.MCQ || 
    q.type === QuestionType.TF
  );

  const challengeItems = worksheet.questions.filter(q => 
    q.isChallenge || 
    q.type === QuestionType.SENTENCE_DRILL ||
    q.type === QuestionType.SHORT_ANSWER
  );

  return (
    <div className={`max-w-[210mm] mx-auto bg-white p-[12mm] shadow-lg min-h-[297mm] relative transition-all duration-500 ${isCreative ? 'font-handwriting-body border-[1px] border-blue-200' : 'font-sans'}`}>
      
      {/* Header */}
      <div className="mb-6">
        <h1 className={`${isCreative ? 'font-handwriting-header text-6xl text-center' : 'text-3xl font-black'} text-slate-900`}>
          {isCreative ? "Helen's Handwriting Worksheet" : worksheet.title}
        </h1>
        
        {isCreative ? (
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center gap-6">
              <div className="bg-slate-200 text-slate-800 text-[11px] px-3 py-0.5 font-bold tracking-widest uppercase rounded-sm">
                PT.1: NORMAL PRINTING
              </div>
              <HelenCharacter />
            </div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              www.thecoffeemonsterzco.com
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-end border-b-2 border-slate-100 pb-4 mt-4">
            <div className="flex flex-col text-slate-500 text-sm font-medium">
              <span>Topic: {worksheet.topic}</span>
              <span>Level: {worksheet.gradeLevel}</span>
            </div>
            <div className="w-64 border-b border-slate-300 pb-1 text-slate-400 text-xs">Student Name: __________________________</div>
          </div>
        )}
      </div>

      {/* Grid Layout for Drills (Character Practice) */}
      {(drillItems.length > 0 || specialDrills.length > 0) && isCreative && <HandwritingLabels />}
      
      <div className={`grid ${isCreative && drillItems.length > 0 ? 'grid-cols-2 gap-x-12' : 'grid-cols-1 gap-8'}`}>
        {drillItems.map((q) => (
          <div key={q.id}>
            {isCreative ? (
              <DraggableLineRow text={q.correctAnswer.split(' ')[0]} />
            ) : (
              <div className="flex items-start gap-3">
                <span className="font-bold">{q.question}</span>
                <div className="flex-1 border-b border-dashed border-slate-200 h-6"></div>
              </div>
            )}
          </div>
        ))}
        
        {/* Symbol/Number Drills */}
        {specialDrills.map((q) => (
          <div key={q.id} className={isCreative ? "col-span-2" : ""}>
             {isCreative ? (
               <SymbolDrillRow symbols={q.correctAnswer} />
             ) : (
               <div className="p-4 border border-slate-100 rounded">
                 <p className="font-bold mb-2">Practice symbols: {q.correctAnswer}</p>
                 <div className="h-10 border-b border-dashed border-slate-200"></div>
               </div>
             )}
          </div>
        ))}
      </div>

      {/* Interactive Section (MCQ/TF) */}
      {interactiveItems.length > 0 && (
        <div className={`mt-8 space-y-6 ${isCreative ? 'max-w-xl' : ''}`}>
          {!isCreative && <h2 className="text-xl font-bold border-b pb-2 mb-4">Questions</h2>}
          {interactiveItems.map((q, idx) => (
            <div key={q.id} className="flex flex-col gap-2">
              <p className={`text-lg font-bold ${isCreative ? 'font-handwriting-body' : ''}`}>
                {idx + 1}. {q.question}
              </p>
              {q.type === QuestionType.MCQ && (
                <div className="grid grid-cols-2 gap-2 ml-4">
                  {q.options?.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border border-slate-400"></div>
                      <span className="text-sm">{opt}</span>
                    </div>
                  ))}
                </div>
              )}
              {q.type === QuestionType.TF && (
                <div className="flex gap-4 ml-4">
                   <span className="flex items-center gap-2 text-sm italic"><div className="w-3 h-3 border border-slate-300"></div> True</span>
                   <span className="flex items-center gap-2 text-sm italic"><div className="w-3 h-3 border border-slate-300"></div> False</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Challenges & Sentence Practice */}
      {challengeItems.length > 0 && isCreative && (
        <div className="mt-8 mb-4">
          <h2 className="font-handwriting-header text-5xl lowercase">challenge:</h2>
        </div>
      )}

      <div className="space-y-6 mt-4">
        {challengeItems.map((q) => (
          <div key={q.id} className="flex flex-col gap-3">
            <p className={`text-xl font-bold leading-relaxed ${isCreative ? '' : 'text-slate-800'}`}>
              {q.question}
            </p>
            {isCreative ? (
              <div className="space-y-4">
                {q.type === QuestionType.SENTENCE_DRILL || q.type === QuestionType.SHORT_ANSWER ? (
                   <div className="space-y-4 opacity-80">
                      <div className="font-handwriting-body text-2xl text-slate-300 select-none italic">{q.correctAnswer}</div>
                      <div className="border-b border-slate-200 h-8"></div>
                      <div className="border-b border-slate-200 h-8"></div>
                   </div>
                ) : (
                  <div className="h-32 border border-slate-100 rounded-xl p-4 bg-slate-50/30">
                    <p className="text-slate-300 text-xs italic uppercase">Space for long response...</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="border border-slate-100 rounded-lg p-8 h-40"></div>
            )}
          </div>
        ))}
      </div>

      {/* Footer Branding (Image Style) */}
      {isCreative && (
        <div className="mt-auto pt-10">
          <div className="flex justify-between items-end border-t border-slate-100 pt-6">
            <div className="flex gap-12">
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-slate-800">Regular</span>
                <span className="text-2xl text-slate-300 select-none">Regular</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl italic text-slate-800">Italics</span>
                <span className="text-2xl text-slate-300 select-none italic">Italics</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black uppercase text-slate-800">BOLD</span>
                <span className="text-2xl text-slate-300 select-none font-bold uppercase">BOLD</span>
              </div>
            </div>
            <div className="text-[9px] text-slate-300 font-bold uppercase tracking-widest text-right">
              WWW.THECOFFEEMONSTERZCO.COM
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

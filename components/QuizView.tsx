
import React, { useState } from 'react';
import { Worksheet, QuestionType, ThemeType } from '../types';
// Fixed: Removed unused DoodleStar import
import { MarkerHighlight } from './HandwritingElements';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface QuizViewProps {
  worksheet: Worksheet;
  theme: ThemeType;
  onExit: () => void;
}

export const QuizView: React.FC<QuizViewProps> = ({ worksheet, theme, onExit }) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const isCreative = theme === ThemeType.CREATIVE;

  const handleAnswerChange = (questionId: string, answer: string) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const calculateScore = () => {
    let correctCount = 0;
    worksheet.questions.forEach(q => {
      if (answers[q.id]?.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim()) {
        correctCount++;
      }
    });
    setScore(correctCount);
    setSubmitted(true);
  };

  const resetQuiz = () => {
    setAnswers({});
    setSubmitted(false);
    setScore(0);
  };

  return (
    <div className={`max-w-4xl mx-auto p-6 transition-all ${isCreative ? 'font-handwriting-body' : 'font-sans'}`}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className={`${isCreative ? 'font-handwriting-header text-5xl' : 'text-3xl font-bold'} text-slate-800`}>
            {isCreative ? <MarkerHighlight>{worksheet.title}</MarkerHighlight> : worksheet.title}
          </h1>
          <p className="text-slate-500 mt-2">{worksheet.topic} • {worksheet.gradeLevel}</p>
        </div>
        <button 
          onClick={onExit}
          className="px-4 py-2 text-slate-500 hover:text-slate-800 font-medium transition-colors"
        >
          Exit Quiz
        </button>
      </div>

      <div className="space-y-8">
        {worksheet.questions.map((q, idx) => (
          <div key={q.id} className={`p-6 rounded-2xl border-2 transition-all ${
            isCreative 
              ? 'bg-white border-slate-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)]' 
              : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-start gap-3 mb-4">
              <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                isCreative ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-600'
              }`}>
                {idx + 1}
              </span>
              <h3 className={`text-xl font-semibold leading-tight ${isCreative ? 'font-handwriting-body' : ''}`}>
                {q.question}
                {q.isChallenge && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">Challenge!</span>}
              </h3>
            </div>

            <div className="ml-11 space-y-3">
              {q.type === QuestionType.MCQ && q.options?.map((opt, i) => (
                <label key={i} className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  answers[q.id] === opt 
                    ? (isCreative ? 'border-yellow-400 bg-yellow-50' : 'border-blue-500 bg-blue-50')
                    : 'border-slate-50 hover:border-slate-200'
                }`}>
                  <input 
                    type="radio" 
                    name={q.id} 
                    className="hidden" 
                    checked={answers[q.id] === opt}
                    onChange={() => handleAnswerChange(q.id, opt)}
                  />
                  <span className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                    answers[q.id] === opt 
                      ? (isCreative ? 'border-yellow-500 bg-yellow-500' : 'border-blue-600 bg-blue-600') 
                      : 'border-slate-300'
                  }`}>
                    {answers[q.id] === opt && <div className="w-2 h-2 rounded-full bg-white" />}
                  </span>
                  <span className="text-lg">{opt}</span>
                </label>
              ))}

              {q.type === QuestionType.TF && (
                <div className="flex gap-4">
                  {['True', 'False'].map(val => (
                    <button
                      key={val}
                      onClick={() => handleAnswerChange(q.id, val)}
                      className={`px-6 py-2 rounded-xl border-2 font-bold transition-all ${
                        answers[q.id] === val
                          ? (isCreative ? 'border-yellow-400 bg-yellow-50 text-yellow-700' : 'border-blue-500 bg-blue-50 text-blue-700')
                          : 'border-slate-100 text-slate-400 hover:border-slate-200'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              )}

              {q.type === QuestionType.SHORT_ANSWER && (
                <input 
                  type="text"
                  placeholder="Type your answer here..."
                  value={answers[q.id] || ''}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  className={`w-full p-4 rounded-xl border-2 bg-slate-50 focus:outline-none focus:ring-2 ${
                    isCreative ? 'font-handwriting-body text-xl border-slate-100 focus:ring-yellow-400' : 'border-slate-200 focus:ring-blue-500'
                  }`}
                />
              )}
            </div>

            {submitted && (
              <div className={`mt-6 ml-11 p-4 rounded-xl flex items-start gap-3 ${
                answers[q.id]?.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim()
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {answers[q.id]?.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim() 
                  ? <CheckCircle className="w-5 h-5 mt-1" /> 
                  : <XCircle className="w-5 h-5 mt-1" />
                }
                <div>
                  <p className="font-bold">
                    {answers[q.id]?.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim() ? 'Correct!' : 'Keep trying!'}
                  </p>
                  <p className="text-sm opacity-90 mt-1">
                    <span className="font-bold">Answer:</span> {q.correctAnswer}
                  </p>
                  <p className="text-sm italic mt-2">{q.explanation}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-12 sticky bottom-8 flex justify-center">
        {!submitted ? (
          <button 
            onClick={calculateScore}
            className={`px-12 py-4 rounded-full text-xl font-bold text-white shadow-xl transform transition hover:scale-105 active:scale-95 ${
              isCreative ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            Submit Quiz
          </button>
        ) : (
          <div className={`p-8 rounded-3xl text-center shadow-2xl bg-white border-4 min-w-[300px] ${
            isCreative ? 'border-yellow-400' : 'border-blue-500'
          }`}>
            <div className="text-5xl font-bold mb-2">
              {score} / {worksheet.questions.length}
            </div>
            <p className="text-slate-500 font-medium mb-6">Final Score</p>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={resetQuiz}
                className="flex items-center gap-2 px-6 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition"
              >
                <RefreshCw className="w-4 h-4" /> Try Again
              </button>
              <button 
                onClick={onExit}
                className={`px-6 py-2 text-white rounded-xl font-bold transition ${
                  isCreative ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                Finish
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

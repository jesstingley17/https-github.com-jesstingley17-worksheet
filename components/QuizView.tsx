import React, { useState, useEffect } from 'react';
import { Worksheet, QuestionType, ThemeType } from '../types';
import { MarkerHighlight } from './HandwritingElements';
import { CheckCircle, XCircle, RefreshCw, BarChart3, Clock } from 'lucide-react';

interface QuizAttempt {
  score: number;
  total: number;
  date: number;
}

interface QuizViewProps {
  worksheet: Worksheet;
  theme: ThemeType;
  onExit: () => void;
}

export const QuizView: React.FC<QuizViewProps> = ({ worksheet, theme, onExit }) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [history, setHistory] = useState<QuizAttempt[]>([]);

  const isCreative = theme === ThemeType.CREATIVE;
  const progressKey = `quiz_progress_${worksheet.id || 'draft'}`;
  const historyKey = `quiz_history_${worksheet.id || 'draft'}`;

  // Load saved progress and history on mount
  useEffect(() => {
    const savedProgress = localStorage.getItem(progressKey);
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress);
        setAnswers(parsed.answers || {});
        if (parsed.submitted) {
          setSubmitted(true);
          setScore(parsed.score || 0);
        }
      } catch (e) {
        console.error("Failed to restore quiz progress", e);
      }
    }

    const savedHistory = localStorage.getItem(historyKey);
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to restore quiz history", e);
      }
    }
  }, [progressKey, historyKey]);

  // Save progress whenever answers or submission state changes
  useEffect(() => {
    const dataToSave = {
      answers,
      submitted,
      score,
      timestamp: Date.now()
    };
    localStorage.setItem(progressKey, JSON.stringify(dataToSave));
  }, [answers, submitted, score, progressKey]);

  const handleAnswerChange = (questionId: string, answer: string) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const calculateScore = () => {
    let correctCount = 0;
    worksheet.questions.forEach(q => {
      const userAnswer = answers[q.id]?.toLowerCase().trim() || '';
      const correctAnswer = q.correctAnswer.toLowerCase().trim();
      if (userAnswer === correctAnswer) {
        correctCount++;
      }
    });
    
    const finalScore = correctCount;
    setScore(finalScore);
    setSubmitted(true);

    // Save to history
    const newAttempt: QuizAttempt = {
      score: finalScore,
      total: worksheet.questions.length,
      date: Date.now()
    };
    const updatedHistory = [newAttempt, ...history].slice(0, 10); // Keep last 10 attempts
    setHistory(updatedHistory);
    localStorage.setItem(historyKey, JSON.stringify(updatedHistory));
  };

  const resetQuiz = () => {
    if (confirm("Reset all answers and start fresh?")) {
      setAnswers({});
      setSubmitted(false);
      setScore(0);
      localStorage.removeItem(progressKey);
    }
  };

  const clearHistory = () => {
    if (confirm("Clear your performance history for this worksheet?")) {
      setHistory([]);
      localStorage.removeItem(historyKey);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(timestamp));
  };

  return (
    <div className={`max-w-4xl mx-auto p-6 pb-32 transition-all ${isCreative ? 'font-handwriting-body' : 'font-sans'}`}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className={`${isCreative ? 'font-handwriting-header text-5xl' : 'text-3xl font-bold'} text-slate-800`}>
            {isCreative ? <MarkerHighlight>{worksheet.title}</MarkerHighlight> : worksheet.title}
          </h1>
          <p className="text-slate-500 mt-2">{worksheet.topic} • {worksheet.gradeLevel}</p>
        </div>
        <div className="flex gap-4">
          {!submitted && Object.keys(answers).length > 0 && (
            <button 
              onClick={resetQuiz}
              className="px-4 py-2 text-red-500 hover:bg-red-50 rounded-xl text-sm font-bold transition-colors"
            >
              Reset Progress
            </button>
          )}
          <button 
            onClick={onExit}
            className="px-4 py-2 text-slate-500 hover:text-slate-800 font-medium transition-colors"
          >
            Exit Quiz
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {worksheet.questions.map((q, idx) => {
          const isCorrect = answers[q.id]?.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim();
          
          return (
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
                    <span className={`text-lg ${answers[q.id] === opt ? 'font-black' : ''}`}>{opt}</span>
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
                <div className={`mt-6 ml-11 p-5 rounded-2xl flex items-start gap-4 animate-in fade-in slide-in-from-top-2 duration-300 ${
                  isCorrect
                    ? 'bg-green-50 text-green-900 border border-green-200'
                    : 'bg-red-50 text-red-900 border border-red-200'
                }`}>
                  {isCorrect 
                    ? <CheckCircle className="w-6 h-6 mt-1 text-green-600 flex-shrink-0" /> 
                    : <XCircle className="w-6 h-6 mt-1 text-red-600 flex-shrink-0" />
                  }
                  <div className="flex-1">
                    <p className="font-black text-lg mb-3">
                      {isCorrect ? 'Correct!' : 'Incorrect'}
                    </p>
                    
                    <div className="space-y-4">
                      <div className="bg-white/60 p-3 rounded-lg border border-current/10">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Official Solution:</p>
                        <p className="text-base font-bold">{q.correctAnswer}</p>
                      </div>

                      {q.explanation && (
                        <div className="pt-1">
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Context & Explanation:</p>
                          <p className="text-sm leading-relaxed">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-12 sticky bottom-8 flex justify-center flex-col items-center gap-6">
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
          <div className="w-full flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className={`p-8 rounded-3xl text-center shadow-2xl bg-white border-4 min-w-[320px] ${
              isCreative ? 'border-yellow-400' : 'border-blue-500'
            }`}>
              <div className="text-5xl font-bold mb-2">
                {score} / {worksheet.questions.length}
              </div>
              <p className="text-slate-500 font-medium mb-6">Current Attempt Score</p>
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

            {history.length > 0 && (
              <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-xl border border-slate-100">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="flex items-center gap-2 font-black text-slate-800 text-sm uppercase tracking-widest">
                    <BarChart3 className="w-4 h-4 text-blue-500" /> Performance Archive
                  </h4>
                  <button onClick={clearHistory} className="text-[10px] font-black uppercase text-slate-300 hover:text-red-500 transition-colors">Wipe History</button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {history.map((attempt, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group hover:border-blue-200 transition-colors">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-700">Attempt {history.length - i}</span>
                        <span className="flex items-center gap-1 text-[9px] text-slate-400 font-bold uppercase">
                          <Clock className="w-2 h-2" /> {formatDate(attempt.date)}
                        </span>
                      </div>
                      <div className={`px-3 py-1 rounded-lg text-sm font-black ${
                        (attempt.score / attempt.total) >= 0.8 ? 'bg-green-100 text-green-700' :
                        (attempt.score / attempt.total) >= 0.5 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {attempt.score}/{attempt.total}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
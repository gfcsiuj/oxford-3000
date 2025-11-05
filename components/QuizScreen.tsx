import React from 'react';
import type { QuizQuestion, Word } from '../types';
import { oxford3000 } from '../data/words';
import { generateQuizQuestion } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';

type QuizState = 'setup' | 'playing' | 'finished';

const QuizScreen: React.FC = () => {
    const [quizState, setQuizState] = React.useState<QuizState>('setup');
    const [questions, setQuestions] = React.useState<QuizQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
    const [score, setScore] = React.useState(0);
    const [selectedAnswer, setSelectedAnswer] = React.useState<string | null>(null);
    const [isAnswered, setIsAnswered] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const startQuiz = () => {
        setIsLoading(true);
        setError(null);
        try {
            const wordSelection = [...oxford3000].sort(() => 0.5 - Math.random()).slice(0, 10);
            const generatedQuestions: QuizQuestion[] = wordSelection.map(word => 
                generateQuizQuestion(word, oxford3000)
            );
            
            setQuestions(generatedQuestions);
            setCurrentQuestionIndex(0);
            setScore(0);
            setSelectedAnswer(null);
            setIsAnswered(false);
            setQuizState('playing');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate quiz questions.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleAnswer = (answer: string) => {
        if(isAnswered) return;
        setSelectedAnswer(answer);
        setIsAnswered(true);
        if (answer === questions[currentQuestionIndex].answer) {
            setScore(prev => prev + 1);
        }
    };

    const nextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setIsAnswered(false);
        } else {
            setQuizState('finished');
        }
    };
    
    const resetQuiz = () => {
        setQuizState('setup');
        setQuestions([]);
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center text-center p-8 space-y-4">
                <LoadingSpinner />
                <p className="text-slate-600 dark:text-slate-400">جاري تحضير اختبارك...</p>
            </div>
        );
    }
    
    if (error) {
         return (
            <div className="text-center text-red-500 bg-red-100 dark:bg-red-900/30 p-4 rounded-lg">
                <p className="font-semibold">تعذر بدء الاختبار.</p>
                <p>{error}</p>
                <button onClick={resetQuiz} className="mt-4 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700">حاول مرة أخرى</button>
            </div>
        );
    }

    if (quizState === 'setup') {
        return (
            <div className="text-center p-8">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200">اختبر معلوماتك</h2>
                <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">استعد لاختبار مكون من 10 أسئلة حول كلمات أكسفورد 3000.</p>
                <button
                    onClick={startQuiz}
                    className="mt-8 bg-blue-600 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105"
                >
                    ابدأ الاختبار
                </button>
            </div>
        );
    }

    if (quizState === 'finished') {
        return (
            <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200">اكتمل الاختبار!</h2>
                <p className="mt-4 text-xl text-slate-600 dark:text-slate-400">
                    درجتك النهائية هي:
                </p>
                <p className="my-4 text-6xl font-bold text-blue-600 dark:text-blue-400">
                    {score} / {questions.length}
                </p>
                <button
                    onClick={resetQuiz}
                    className="mt-6 bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700"
                >
                    العب مرة أخرى
                </button>
            </div>
        );
    }
    
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return null;

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">سؤال {currentQuestionIndex + 1} من {questions.length}</p>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">الدرجة: {score}</p>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-center text-slate-800 dark:text-slate-200" dir="rtl">{currentQuestion.question}</h2>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQuestion.options.map((option, index) => {
                    const isCorrect = option === currentQuestion.answer;
                    const isSelected = option === selectedAnswer;
                    
                    let buttonClass = "w-full text-lg text-center p-4 rounded-lg transition-all font-semibold font-arabic border-2 ";
                    
                    if (isAnswered) {
                        if (isCorrect) {
                            buttonClass += "bg-green-100 dark:bg-green-900/50 border-green-500 text-green-800 dark:text-green-300";
                        } else if (isSelected && !isCorrect) {
                            buttonClass += "bg-red-100 dark:bg-red-900/50 border-red-500 text-red-800 dark:text-red-300";
                        } else {
                           buttonClass += "bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 opacity-60";
                        }
                    } else {
                        buttonClass += "bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-600 hover:border-blue-500";
                    }

                    return (
                        <button key={index} onClick={() => handleAnswer(option)} disabled={isAnswered} className={buttonClass} dir="rtl">
                           {option}
                        </button>
                    )
                })}
            </div>

            {isAnswered && (
                <div className="text-center mt-8">
                    <button
                        onClick={nextQuestion}
                        className="bg-blue-600 text-white font-bold py-2 px-8 rounded-lg hover:bg-blue-700"
                    >
                        {currentQuestionIndex < questions.length - 1 ? 'التالي' : 'إنهاء'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default QuizScreen;

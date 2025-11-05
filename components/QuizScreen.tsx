import React from 'react';
import type { QuizQuestion, UserAnswer, QuizSettings, QuestionType, Settings, Word } from '../types';
import { generateQuiz } from '../services/quizGenerator';
import LoadingSpinner from './LoadingSpinner';
import SpeakerIcon from './icons/SpeakerIcon';

type QuizState = 'setup' | 'playing' | 'finished';

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
    MC_EN_AR: "الترجمة إلى العربية",
    MC_AR_EN: "الترجمة إلى الإنجليزية",
    LISTEN_CHOOSE_EN: "استمع واختر",
    LISTEN_TYPE_EN: "استمع واكتب",
    SPELLING_BEE: "تهجئة صحيحة",
    POS_ID: "تحديد نوع الكلمة",
    FILL_BLANK: "املأ الفراغ",
    MATCH_PAIRS: "مطابقة أزواج",
};

interface QuizScreenProps {
  settings: Settings;
  voice: SpeechSynthesisVoice | null;
}

const QuizScreen: React.FC<QuizScreenProps> = ({ settings, voice }) => {
    const [quizState, setQuizState] = React.useState<QuizState>('setup');
    const [questions, setQuestions] = React.useState<QuizQuestion[]>([]);
    const [userAnswers, setUserAnswers] = React.useState<UserAnswer[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    // Setup state
    const [questionCount, setQuestionCount] = React.useState(10);
    const [selectedLetters, setSelectedLetters] = React.useState<string[]>([]);
    const [selectedTypes, setSelectedTypes] = React.useState<QuestionType[]>(Object.keys(QUESTION_TYPE_LABELS) as QuestionType[]);

    // Player state
    const [selectedAnswer, setSelectedAnswer] = React.useState<string | null>(null);
    const [typedAnswer, setTypedAnswer] = React.useState('');
    const [isAnswered, setIsAnswered] = React.useState(false);
    
    // Matching game state
    const [matchPairs, setMatchPairs] = React.useState<{ en: string; ar: string }[]>([]);
    const [selectedMatch, setSelectedMatch] = React.useState<{ type: 'en' | 'ar', value: string } | null>(null);
    const [correctMatches, setCorrectMatches] = React.useState<string[]>([]);

    // Results state
    const [showReview, setShowReview] = React.useState(false);


    const handleStartQuiz = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const quizSettings: QuizSettings = { questionCount, letters: selectedLetters, questionTypes: selectedTypes };
            const generatedQuestions = await generateQuiz(quizSettings);
            if (generatedQuestions.length === 0) {
              throw new Error("No questions could be generated with the selected criteria. Please select more letters or question types.");
            }
            setQuestions(generatedQuestions);
            setCurrentQuestionIndex(0);
            setUserAnswers([]);
            setIsAnswered(false);
            setSelectedAnswer(null);
            setTypedAnswer('');
            setShowReview(false);
            setQuizState('playing');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate quiz questions.');
            setQuizState('setup'); // Go back to setup on error
        } finally {
            setIsLoading(false);
        }
    };

    const handleSpeak = (text: string) => {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          if (voice) {
            utterance.voice = voice;
            utterance.lang = voice.lang;
          } else {
            // Fallback to a standard English voice if no specific voice is selected
            utterance.lang = 'en-US';
          }
          utterance.rate = settings.speechRate;
          window.speechSynthesis.speak(utterance);
        }
    };
    
    const submitAnswer = (answer: string) => {
        if(isAnswered) return;
        
        const currentQuestion = questions[currentQuestionIndex];
        const isCorrect = answer.toLowerCase().trim() === currentQuestion.answer.toLowerCase().trim();

        setUserAnswers(prev => [...prev, { question: currentQuestion, answer, isCorrect }]);
        setSelectedAnswer(answer);
        setIsAnswered(true);
    };

    const submitMatchAnswer = () => {
        if(isAnswered) return;

        const currentQuestion = questions[currentQuestionIndex];
        const isCorrect = correctMatches.length === (currentQuestion.matchPairs?.length || 0) * 2;
        
        setUserAnswers(prev => [...prev, { question: currentQuestion, answer: matchPairs, isCorrect }]);
        setIsAnswered(true);
    }

    const nextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setIsAnswered(false);
            setSelectedAnswer(null);
            setTypedAnswer('');
            setCorrectMatches([]);
            setSelectedMatch(null);
        } else {
            setQuizState('finished');
        }
    };
    
    const resetQuiz = () => {
        setQuizState('setup');
        setQuestions([]);
        setError(null);
        setShowReview(false);
    };

    const handleMatchClick = (type: 'en' | 'ar', value: string) => {
        if (correctMatches.includes(value)) return;

        if (!selectedMatch) {
            setSelectedMatch({ type, value });
        } else if (selectedMatch.type !== type) {
            const first = selectedMatch.value;
            const second = value;
            
            const enWord = selectedMatch.type === 'en' ? first : second;
            const arWord = selectedMatch.type === 'ar' ? first : second;
            
            const isMatch = questions[currentQuestionIndex].matchPairs?.some(p => p.en === enWord && p.ar === arWord);
            
            if (isMatch) {
                setCorrectMatches(prev => [...prev, enWord, arWord]);
            }
            setSelectedMatch(null);
        } else {
            setSelectedMatch({ type, value });
        }
    };

    React.useEffect(() => {
        const currentQuestion = questions[currentQuestionIndex];
        if (currentQuestion && currentQuestion.type === 'MATCH_PAIRS' && currentQuestion.matchPairs) {
            const shuffledAr = [...currentQuestion.matchPairs].sort(() => Math.random() - 0.5);
            setMatchPairs(shuffledAr.map((p, i) => ({ en: currentQuestion.matchPairs![i].en, ar: p.ar })));
        }
    }, [currentQuestionIndex, questions]);
    
    React.useEffect(() => {
        const currentQuestion = questions[currentQuestionIndex];
        if (currentQuestion?.type === 'MATCH_PAIRS' && currentQuestion.matchPairs && correctMatches.length === currentQuestion.matchPairs.length * 2) {
            submitMatchAnswer();
        }
    }, [correctMatches, questions, currentQuestionIndex]);


    const renderSetup = () => {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

        const toggleLetter = (letter: string) => {
            setSelectedLetters(prev => 
                prev.includes(letter) ? prev.filter(l => l !== letter) : [...prev, letter]
            );
        };
        
        const toggleType = (type: QuestionType) => {
            setSelectedTypes(prev => 
                prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
            );
        };

        const selectAllLetters = () => setSelectedLetters(alphabet);
        const deselectAllLetters = () => setSelectedLetters([]);
        
        const canStart = selectedLetters.length > 0 && selectedTypes.length > 0;

        return (
            <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg space-y-8">
                {error && <div className="p-4 mb-4 text-center text-red-700 bg-red-100 dark:bg-red-900/50 dark:text-red-300 rounded-lg">{error}</div>}
                
                <div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3">عدد الأسئلة: <span className="text-blue-600 dark:text-blue-400">{questionCount}</span></h3>
                    <input
                        type="range"
                        min="5"
                        max="50"
                        step="5"
                        value={questionCount}
                        onChange={e => setQuestionCount(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer"
                    />
                </div>

                <div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3">اختر الحروف</h3>
                    <div className="flex flex-wrap justify-center gap-2">
                        {alphabet.map(letter => (
                             <button
                                key={letter}
                                onClick={() => toggleLetter(letter)}
                                className={`w-10 h-10 flex items-center justify-center font-bold rounded-full transition-colors ${selectedLetters.includes(letter) ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'}`}
                             >{letter}</button>
                        ))}
                    </div>
                    <div className="flex justify-center gap-4 mt-4">
                        <button onClick={selectAllLetters} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">اختيار الكل</button>
                        <button onClick={deselectAllLetters} className="text-sm text-slate-500 hover:underline">إلغاء اختيار الكل</button>
                    </div>
                </div>
                
                <div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3">أنواع الأسئلة</h3>
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                         {Object.entries(QUESTION_TYPE_LABELS).map(([type, label]) => (
                             <label key={type} className="flex items-center space-x-2 p-3 bg-slate-100 dark:bg-slate-700 rounded-md cursor-pointer">
                                <input type="checkbox" checked={selectedTypes.includes(type as QuestionType)} onChange={() => toggleType(type as QuestionType)} className="form-checkbox h-5 w-5 text-blue-600 rounded" />
                                <span className="text-slate-700 dark:text-slate-300">{label}</span>
                             </label>
                         ))}
                    </div>
                </div>

                <button
                    onClick={handleStartQuiz}
                    disabled={!canStart || isLoading}
                    className="w-full bg-blue-600 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:scale-100"
                >
                    {isLoading ? <LoadingSpinner /> : 'ابدأ الاختبار'}
                </button>
            </div>
        );
    };

    const renderPlayer = () => {
        const currentQuestion = questions[currentQuestionIndex];
        if (!currentQuestion) return null;

        const isMC = ['MC_EN_AR', 'MC_AR_EN', 'LISTEN_CHOOSE_EN', 'POS_ID', 'SPELLING_BEE', 'FILL_BLANK'].includes(currentQuestion.type);
        const score = userAnswers.filter(a => a.isCorrect).length;

        return (
            <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-2 text-slate-500 dark:text-slate-400 text-sm font-semibold">
                        <p>السؤال {currentQuestionIndex + 1} من {questions.length}</p>
                        <p>الدرجة: {score}</p>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}></div>
                    </div>
                </div>
                
                <div className="text-center my-8 min-h-[6rem] flex flex-col items-center justify-center">
                    {(currentQuestion.type === 'LISTEN_CHOOSE_EN' || currentQuestion.type === 'LISTEN_TYPE_EN') ? (
                         <button onClick={() => handleSpeak(currentQuestion.answer)} className="p-4 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors">
                            <SpeakerIcon />
                         </button>
                    ) : (
                         <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200" dir={currentQuestion.type === 'MC_AR_EN' ? 'rtl' : 'ltr'}>
                             {currentQuestion.questionText}
                         </h2>
                    )}
                </div>

                {isMC && currentQuestion.options && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentQuestion.options.map((option, index) => {
                             const isCorrect = option === currentQuestion.answer;
                             const isSelected = option === selectedAnswer;
                             let buttonClass = "w-full text-lg text-center p-4 rounded-lg transition-all font-semibold border-2 ";
                             
                             if (isAnswered) {
                                 if (isCorrect) buttonClass += "bg-green-100 dark:bg-green-900/50 border-green-500 text-green-800 dark:text-green-300";
                                 else if (isSelected && !isCorrect) buttonClass += "bg-red-100 dark:bg-red-900/50 border-red-500 text-red-800 dark:text-red-300";
                                 else buttonClass += "bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 opacity-60";
                             } else {
                                 buttonClass += "bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-600 hover:border-blue-500";
                             }
                             return <button key={index} onClick={() => submitAnswer(option)} disabled={isAnswered} className={buttonClass} dir={currentQuestion.type === 'MC_EN_AR' ? 'rtl' : 'ltr'}>{option}</button>
                        })}
                    </div>
                )}
                
                {currentQuestion.type === 'LISTEN_TYPE_EN' && (
                    <div className="flex flex-col items-center">
                         <input
                            type="text"
                            value={typedAnswer}
                            onChange={(e) => setTypedAnswer(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && submitAnswer(typedAnswer)}
                            disabled={isAnswered}
                            className={`w-full max-w-sm text-center text-lg p-3 border-2 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                                isAnswered ? (typedAnswer.toLowerCase().trim() === currentQuestion.answer.toLowerCase().trim() ? 'border-green-500' : 'border-red-500') : 'border-slate-300 dark:border-slate-600'
                            }`}
                            placeholder="اكتب الكلمة..."
                        />
                         {!isAnswered && <button onClick={() => submitAnswer(typedAnswer)} className="mt-4 bg-blue-600 text-white font-bold py-2 px-8 rounded-lg hover:bg-blue-700">تأكيد</button>}
                         {isAnswered && typedAnswer.toLowerCase().trim() !== currentQuestion.answer.toLowerCase().trim() && (
                            <p className="mt-2 text-green-600 dark:text-green-400">الإجابة الصحيحة: <strong className="font-mono">{currentQuestion.answer}</strong></p>
                         )}
                    </div>
                )}

                {currentQuestion.type === 'MATCH_PAIRS' && (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3" dir="ltr">
                            {matchPairs.map(({en}, i) => (
                                <button key={`en-${i}`} onClick={() => handleMatchClick('en', en)} disabled={correctMatches.includes(en)}
                                 className={`w-full p-3 rounded-lg border-2 transition-colors text-lg ${correctMatches.includes(en) ? 'bg-green-100 dark:bg-green-900/50 border-green-500' : (selectedMatch?.value === en ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/50' : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600')}`}>
                                    {en}
                                </button>
                            ))}
                        </div>
                        <div className="space-y-3" dir="rtl">
                           {matchPairs.map(({ar}, i) => (
                                <button key={`ar-${i}`} onClick={() => handleMatchClick('ar', ar)} disabled={correctMatches.includes(ar)}
                                  className={`w-full p-3 rounded-lg border-2 transition-colors text-lg font-arabic ${correctMatches.includes(ar) ? 'bg-green-100 dark:bg-green-900/50 border-green-500' : (selectedMatch?.value === ar ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/50' : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600')}`}>
                                    {ar}
                                </button>
                            ))}
                        </div>
                    </div>
                )}


                {isAnswered && (
                    <div className="text-center mt-8">
                        <button onClick={nextQuestion} className="bg-blue-600 text-white font-bold py-2 px-8 rounded-lg hover:bg-blue-700">
                            {currentQuestionIndex < questions.length - 1 ? 'التالي' : 'إنهاء'}
                        </button>
                    </div>
                )}
            </div>
        );
    };

    const renderResults = () => {
        const score = userAnswers.filter(a => a.isCorrect).length;

        return (
            <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200">اكتمل الاختبار!</h2>
                <p className="mt-4 text-xl text-slate-600 dark:text-slate-400">درجتك النهائية هي:</p>
                <p className="my-4 text-6xl font-bold text-blue-600 dark:text-blue-400">{score} / {questions.length}</p>
                <div className="flex justify-center gap-4 mt-6">
                    <button onClick={resetQuiz} className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700">العب مرة أخرى</button>
                    <button onClick={() => setShowReview(!showReview)} className="bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold py-2 px-6 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600">
                      {showReview ? 'إخفاء المراجعة' : 'مراجعة الإجابات'}
                    </button>
                </div>

                {showReview && (
                    <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 text-left space-y-4">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 text-center">مراجعة الإجابات الخاطئة</h3>
                        {userAnswers.filter(a => !a.isCorrect).map((ans, i) => (
                             <div key={i} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                                <p className="font-semibold text-slate-700 dark:text-slate-300">{i+1}. {ans.question.questionText}</p>
                                <p className="text-red-600 dark:text-red-400">إجابتك: <span className="font-mono">{typeof ans.answer === 'string' ? ans.answer : 'Matched Pairs'}</span></p>
                                <p className="text-green-600 dark:text-green-400">الإجابة الصحيحة: <span className="font-mono">{ans.question.answer}</span></p>
                            </div>
                        ))}
                         {userAnswers.filter(a => !a.isCorrect).length === 0 && (
                            <p className="text-center text-slate-500 dark:text-slate-400">عمل رائع! لقد أجبت على جميع الأسئلة بشكل صحيح.</p>
                         )}
                    </div>
                )}
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center text-center p-8 space-y-4">
                <LoadingSpinner />
                <p className="text-slate-600 dark:text-slate-400">جاري تحضير اختبارك...</p>
            </div>
        );
    }

    switch (quizState) {
        case 'playing': return renderPlayer();
        case 'finished': return renderResults();
        case 'setup':
        default: return renderSetup();
    }
};

export default QuizScreen;
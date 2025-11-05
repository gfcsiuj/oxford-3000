import { oxford3000 } from '../data/words';
import { partsOfSpeech } from '../data/partsOfSpeech';
import type { Word, QuizQuestion, QuizSettings, QuestionType } from '../types';
import { generateFillBlankSentence } from './geminiService';

const allPos = [...new Set(partsOfSpeech.flatMap(p => p.split(',').map(s => s.trim())))];

function shuffleArray<T>(array: T[]): T[] {
    return array.sort(() => Math.random() - 0.5);
}

function getRandomItems<T>(array: T[], count: number, exclude: T[] = []): T[] {
    const filtered = array.filter(item => !exclude.includes(item));
    return shuffleArray(filtered).slice(0, count);
}

function generateMisspellings(word: string): string[] {
    const misspellings = new Set<string>();
    const len = word.length;
    if (len < 3) return [];

    // Swap adjacent letters
    const i = Math.floor(Math.random() * (len - 1));
    misspellings.add(word.slice(0, i) + word[i+1] + word[i] + word.slice(i+2));

    // Replace a vowel
    const vowels = 'aeiou';
    const wordVowels = [...word].map((char, index) => ({char, index})).filter(c => vowels.includes(c.char));
    if (wordVowels.length > 0) {
        const {char, index} = wordVowels[Math.floor(Math.random() * wordVowels.length)];
        const newVowel = [...vowels].filter(v => v !== char)[Math.floor(Math.random() * 4)];
        misspellings.add(word.slice(0, index) + newVowel + word.slice(index + 1));
    }
    
    // Double a letter
    const doubleIndex = Math.floor(Math.random() * len);
    misspellings.add(word.slice(0, doubleIndex) + word[doubleIndex] + word.slice(doubleIndex));

    return shuffleArray(Array.from(misspellings)).slice(0, 3);
}

// --- Question Type Generators ---

const createMcEnAr = (word: Word): QuizQuestion => {
    const options = getRandomItems(oxford3000, 3, [word]).map(w => w.ar);
    return {
        type: 'MC_EN_AR',
        word,
        questionText: `ما هو معنى '${word.en}'؟`,
        options: shuffleArray([...options, word.ar]),
        answer: word.ar,
    };
};

const createMcArEn = (word: Word): QuizQuestion => {
    const options = getRandomItems(oxford3000, 3, [word]).map(w => w.en);
    return {
        type: 'MC_AR_EN',
        word,
        questionText: `ما هي الكلمة الإنجليزية التي تعني '${word.ar}'؟`,
        options: shuffleArray([...options, word.en]),
        answer: word.en,
    };
};

const createListenChooseEn = (word: Word): QuizQuestion => {
    const options = getRandomItems(oxford3000, 3, [word]).map(w => w.en);
    return {
        type: 'LISTEN_CHOOSE_EN',
        word,
        questionText: "استمع واختر الكلمة الصحيحة:",
        options: shuffleArray([...options, word.en]),
        answer: word.en,
    };
};

const createListenTypeEn = (word: Word): QuizQuestion => ({
    type: 'LISTEN_TYPE_EN',
    word,
    questionText: "استمع واكتب الكلمة التي تسمعها:",
    answer: word.en,
});

const createSpellingBee = (word: Word): QuizQuestion => {
    const misspellings = generateMisspellings(word.en);
    while (misspellings.length < 3) { // Ensure we have 3 options
        misspellings.push(getRandomItems(oxford3000, 1, [word])[0].en);
    }
    return {
        type: 'SPELLING_BEE',
        word,
        questionText: "اختر الإملاء الصحيح:",
        options: shuffleArray([...misspellings, word.en]),
        answer: word.en,
    };
};

const createPosId = (word: Word): QuizQuestion => {
    const correctPos = word.pos.split(',')[0].trim();
    const options = getRandomItems(allPos, 3, [correctPos]);
    return {
        type: 'POS_ID',
        word,
        questionText: `ما هو نوع كلمة '${word.en}'؟`,
        options: shuffleArray([...options, correctPos]),
        answer: correctPos,
    };
};

const createMatchPairs = (word: Word): QuizQuestion => {
    const pairs = [word, ...getRandomItems(oxford3000, 3, [word])].map(w => ({ en: w.en, ar: w.ar }));
    return {
        type: 'MATCH_PAIRS',
        word,
        questionText: "طابق الكلمات الإنجليزية بترجمتها العربية:",
        matchPairs: shuffleArray(pairs),
        answer: "Matching complete", // Placeholder
    };
};

const createFillBlank = async (word: Word): Promise<QuizQuestion> => {
    const sentence = await generateFillBlankSentence(word.en);
    const options = getRandomItems(oxford3000, 3, [word]).map(w => w.en);
    return {
        type: 'FILL_BLANK',
        word,
        questionText: sentence,
        options: shuffleArray([...options, word.en]),
        answer: word.en,
    };
};


export const generateQuiz = async (settings: QuizSettings): Promise<QuizQuestion[]> => {
    const { questionCount, letters, questionTypes } = settings;

    const filteredWords = letters.length > 0
        ? oxford3000.filter(w => letters.includes(w.en.charAt(0).toUpperCase()))
        : oxford3000;

    if (filteredWords.length < 4) {
      throw new Error("يرجى تحديد المزيد من الحروف لإنشاء اختبار متنوع.");
    }
    
    const selectedWords = shuffleArray(filteredWords).slice(0, questionCount);
    
    const questionPromises: Promise<QuizQuestion>[] = selectedWords.map(word => {
        const randomType = shuffleArray(questionTypes)[0];
        switch (randomType) {
            case 'MC_EN_AR': return Promise.resolve(createMcEnAr(word));
            case 'MC_AR_EN': return Promise.resolve(createMcArEn(word));
            case 'LISTEN_CHOOSE_EN': return Promise.resolve(createListenChooseEn(word));
            case 'LISTEN_TYPE_EN': return Promise.resolve(createListenTypeEn(word));
            case 'SPELLING_BEE': return Promise.resolve(createSpellingBee(word));
            case 'POS_ID': return Promise.resolve(createPosId(word));
            case 'MATCH_PAIRS': return Promise.resolve(createMatchPairs(word));
            case 'FILL_BLANK': return createFillBlank(word);
            default: return Promise.resolve(createMcEnAr(word)); // Fallback
        }
    });

    return Promise.all(questionPromises);
};
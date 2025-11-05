import React from 'react';
import type { View } from '../types';
import BookOpenIcon from './icons/BookOpenIcon';
import ClipboardCheckIcon from './icons/ClipboardCheckIcon';
import ChatBubbleIcon from './icons/ChatBubbleIcon';
import InformationCircleIcon from './icons/InformationCircleIcon';
import SparklesIcon from './icons/SparklesIcon';

interface HomeScreenProps {
  setView: (view: View) => void;
}

const NavButton: React.FC<{
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
}> = ({ onClick, icon, title, description }) => (
  <button
    onClick={onClick}
    className="w-full text-right p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300 flex items-center gap-6"
  >
    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-blue-100 dark:bg-blue-900/50 rounded-lg text-blue-600 dark:text-blue-400">
      {icon}
    </div>
    <div>
      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{title}</h3>
      <p className="text-slate-500 dark:text-slate-400">{description}</p>
    </div>
  </button>
);

const HomeScreen: React.FC<HomeScreenProps> = ({ setView }) => {
  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">استكشف</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <NavButton 
            onClick={() => setView('daily-words')}
            icon={<SparklesIcon />}
            title="كلمات اليوم"
            description="تعلم 5 كلمات جديدة كل يوم"
          />
          <NavButton 
            onClick={() => setView('dictionary')}
            icon={<BookOpenIcon />}
            title="القاموس"
            description="تصفح كل الـ 3000 كلمة"
          />
          <NavButton 
            onClick={() => setView('quiz')}
            icon={<ClipboardCheckIcon />}
            title="الاختبار"
            description="اختبر معلوماتك"
          />
          <NavButton 
            onClick={() => setView('chat')}
            icon={<ChatBubbleIcon />}
            title="الدردشة مع مدرس اللغة الإنجليزية"
            description="تمرن مع مساعد ذكاء اصطناعي"
          />
          <NavButton 
            onClick={() => setView('about')}
            icon={<InformationCircleIcon />}
            title="عن التطبيق"
            description="اعرف المزيد عن هذا المشروع"
          />
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
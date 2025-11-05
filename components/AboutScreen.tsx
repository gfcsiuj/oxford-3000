import React from 'react';
import InstagramIcon from './icons/InstagramIcon';
import FacebookIcon from './icons/FacebookIcon';
import TelegramIcon from './icons/TelegramIcon';

const SocialLink = ({ href, icon, text }: { href: string; icon: React.ReactNode; text: string }) => (
    <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="flex items-center space-x-3 p-3 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
    >
        {icon}
        <span className="font-medium text-slate-700 dark:text-slate-200">{text}</span>
    </a>
);

const AboutScreen: React.FC = () => {
    return (
        <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">عن التطبيق</h2>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                   هذا التطبيق هو أداة تفاعلية مصممة لمساعدتك على تعلم وإتقان أكسفورد 3000، وهي قائمة بأهم الكلمات التي يجب تعلمها في اللغة الإنجليزية. ويتميز بترجمات عربية، وتحويل النص إلى كلام للنطق، وجمل أمثلة تم إنشاؤها بواسطة الذكاء الاصطناعي لتوفير السياق. يمكنك أيضًا اختبار معلوماتك من خلال الاختبار وممارسة مهارات المحادثة الخاصة بك مع مدرس الذكاء الاصطناعي.
                </p>
            </div>
            
            <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">المطور</h2>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    تم تطوير هذا التطبيق بواسطة:
                </p>
                 <p className="mt-2 text-xl font-semibold text-blue-600 dark:text-blue-400 font-arabic" dir="rtl">
                    محمد حازم احمد خليل الخاتوني
                </p>
            </div>
            
            <div>
                 <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">تواصل مع المطور</h2>
                 <div className="space-y-4">
                     <SocialLink 
                        href="https://www.instagram.com/dagg_iq"
                        icon={<InstagramIcon />}
                        text="dagg_iq"
                     />
                      <SocialLink 
                        href="https://www.facebook.com/mohammed.al.ahmed.23957"
                        icon={<FacebookIcon />}
                        text="Mohammed Al Ahmed"
                     />
                      <SocialLink 
                        href="https://t.me/dagg_er"
                        icon={<TelegramIcon />}
                        text="dagg_er"
                     />
                 </div>
            </div>

        </div>
    );
};

export default AboutScreen;
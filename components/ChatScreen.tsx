import React from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import type { ChatMessage } from '../types';
import LoadingSpinner from './LoadingSpinner';

let ai: GoogleGenAI | null = null;
let chat: Chat | null = null;

function initializeChat() {
    if (!ai) {
        if (!process.env.API_KEY) {
            throw new Error("API_KEY environment variable not set.");
        }
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    if (!chat) {
        chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: 'You are a friendly and helpful English language tutor. Your goal is to help the user practice their English, answer their questions about vocabulary and grammar, and correct their mistakes in a gentle and encouraging way. Keep your responses concise and clear, suitable for a language learner. Converse with the user in Arabic if they ask you to, but always encourage them to practice English.',
            },
        });
    }
}

const ChatScreen: React.FC = () => {
    const [messages, setMessages] = React.useState<ChatMessage[]>([]);
    const [input, setInput] = React.useState('');
    const [error, setError] = React.useState<string | null>(null);
    const messagesEndRef = React.useRef<HTMLDivElement>(null);
    
    React.useEffect(() => {
        try {
            initializeChat();
        } catch(e) {
            setError(e instanceof Error ? e.message : 'Could not initialize AI chat.');
        }
    }, []);

    React.useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || !chat) return;

        const userMessage: ChatMessage = { role: 'user', parts: [{ text: input }] };
        setMessages(prev => [...prev, userMessage, { role: 'model', parts: [{ text: '' }], isLoading: true }]);
        setInput('');

        try {
            const response = await chat.sendMessageStream({ message: input });
            let modelResponseText = '';
            
            for await (const chunk of response) {
                const chunkText = chunk.text;
                modelResponseText += chunkText;
                setMessages(prev => {
                    const newMessages = [...prev];
                    const lastMessage = newMessages[newMessages.length - 1];
                    if (lastMessage && lastMessage.role === 'model') {
                        lastMessage.parts = [{ text: modelResponseText }];
                    }
                    return newMessages;
                });
            }
            
            setMessages(prev => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage && lastMessage.role === 'model') {
                    lastMessage.isLoading = false;
                }
                return newMessages;
            });

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`Failed to get response from AI: ${errorMessage}`);
            setMessages(prev => prev.slice(0, -1)); // Remove the loading message
        }
    };
    
    if (error) {
        return (
            <div className="text-center p-4 text-red-600 dark:text-red-400">
                <p>Error: {error}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-180px)] max-w-3xl mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-lg">
            <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-bl-none' : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-br-none'}`}>
                           {msg.isLoading ? <LoadingSpinner /> : <p className="whitespace-pre-wrap">{msg.parts[0].text}</p>}
                        </div>
                    </div>
                ))}
                 <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="اسأل مدرسك الذكاء الاصطناعي..."
                        className="flex-1 w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-100 dark:bg-slate-700"
                    />
                    <button onClick={handleSend} className="bg-blue-600 text-white rounded-full p-3 hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-slate-400" disabled={!input.trim()}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform -rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatScreen;
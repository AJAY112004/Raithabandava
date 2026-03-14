import React, { useState } from 'react';
import { useLanguage } from '@/components/LanguageProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { callChatbot, callImageInfer } from '@/lib/chatbot';
import { Send, Loader2, MessageCircle } from 'lucide-react';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  text: string;
  meta?: any;
};

const languageOptions = [
  { code: 'en', label: 'English' },
  { code: 'kn', label: 'Kannada' }
];

export default function Chatbot() {
  const { language, setLanguage, t } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const apiBase = import.meta.env.VITE_CHATBOT_URL || '/api/chatbot';
  const imageApi = import.meta.env.VITE_IMAGE_INFER_URL || '/api/image-infer';


  const handleSend = async (text?: string) => {
    const value = (text ?? input).trim();
    if (!value) return;
    setInput('');
    const userMsg: ChatMessage = { id: String(Date.now()) + '-u', role: 'user', text: value };
    setMessages(m => [...m, userMsg]);

    setLoading(true);
    try {
      // Use helper which centralizes endpoint handling
      const data = await callChatbot(value, language || 'en');
      if (!data) throw new Error('No response from chatbot');
      if (data.error) {
        throw new Error(data.error || 'Chatbot returned an error');
      }
      const assistantText = data?.reply || 'Sorry, I could not answer that.';
      const assistantMsg: ChatMessage = { id: String(Date.now()) + '-a', role: 'assistant', text: assistantText, meta: { classification: data?.classification } };
      setMessages(m => [...m, assistantMsg]);
    } catch (err: any) {
      console.error('Chatbot error', err);
      const friendly = err?.message || String(err) || 'Service error. Please try again later.';
      setMessages(m => [...m, { id: String(Date.now()) + '-a', role: 'assistant', text: `Service error: ${friendly}` }]);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="w-full max-w-md bg-card rounded-lg shadow-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-primary text-primary-foreground">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold">RaithaBandava AI Assistant</h3>
          <span className="text-xs bg-white/20 px-2 py-1 rounded">{language?.toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-2">
          <select value={language} onChange={e => setLanguage(e.target.value as any)} className="p-1 border rounded text-sm bg-white text-foreground">
            {languageOptions.map(o => <option key={o.code} value={o.code}>{o.label}</option>)}
          </select>
        </div>
      </div>

      <div className="p-3 h-96 overflow-auto bg-background">
        <div className="space-y-3">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Ask me about:</p>
              <ul className="text-xs mt-2 space-y-1">
                <li>🌾 Crop diseases & treatment</li>
                <li>💧 Weather & irrigation</li>
                <li>💰 Market prices</li>
                <li>🌱 Fertilizer recommendations</li>
              </ul>
            </div>
          )}
          {messages.map(m => (
            <div key={m.id} className={`flex ${m.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[80%] p-3 rounded-lg whitespace-pre-wrap ${m.role === 'assistant' ? 'bg-muted text-foreground' : 'bg-primary text-white'}`}>
                <div className="text-sm">{m.text}</div>
                {m.meta?.classification && (
                  <div className="mt-2 text-xs opacity-70">Type: {m.meta.classification}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-3 py-3 border-t bg-transparent flex items-center gap-2">
        <div className="flex items-center gap-2 flex-1">
          <Input
            placeholder="Ask about crop disease, fertilizer, weather, prices..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
          />
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => handleSend()} disabled={loading} title="Send">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // strip prefix
      const idx = result.indexOf('base64,');
      resolve(idx >= 0 ? result.substring(idx + 7) : result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function mapLangToBCP47(lang: string) {
  switch (lang) {
    case 'kn': return 'kn-IN';
    case 'hi': return 'hi-IN';
    default: return 'en-US';
  }
}

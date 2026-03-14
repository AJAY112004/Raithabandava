import React, { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UploadCloud, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/components/LanguageProvider';

type ChatMessage = { id: string; author: string; text: string; ts: number };

// Mock/demo data used when localStorage is empty
const MOCK_CHAT: ChatMessage[] = [
  { id: '1', author: 'Ravi (Farmer)', text: 'Hello everyone — planted tomatoes last week, any tips on watering?', ts: Date.now() - 1000 * 60 * 60 * 24 },
  { id: '2', author: 'Leela (Extension)', text: 'Water deeply twice a week; mulch to retain moisture.', ts: Date.now() - 1000 * 60 * 60 * 23 },
  { id: '3', author: 'Suresh (Farmer)', text: "Try drip irrigation — saved a lot of water for me.", ts: Date.now() - 1000 * 60 * 60 * 20 },
];

const Community: React.FC = () => {
  // Chat
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    try {
      const raw = localStorage.getItem('rbh_chat_messages');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed as ChatMessage[];
      }
    } catch {
      // fall through to mock
    }
    return MOCK_CHAT;
  });
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const [chatInput, setChatInput] = useState('');
  const chatRef = useRef<HTMLDivElement | null>(null);

  // Seed mock data into localStorage on first visit so demos persist across reloads
  useEffect(() => {
    try {
      const rawChat = localStorage.getItem('rbh_chat_messages');
      if (!rawChat) {
        localStorage.setItem('rbh_chat_messages', JSON.stringify(MOCK_CHAT));
        setChatMessages(MOCK_CHAT);
      } else {
        try {
          const parsed = JSON.parse(rawChat);
          if (Array.isArray(parsed) && parsed.length === 0) {
            localStorage.setItem('rbh_chat_messages', JSON.stringify(MOCK_CHAT));
            setChatMessages(MOCK_CHAT);
          }
        } catch {}
      }
    } catch (e) {
      console.warn('Community: could not seed localStorage', e);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('rbh_chat_messages', JSON.stringify(chatMessages));
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Try to load remote data from Supabase on first mount. If any step fails,
  // fall back to localStorage/mock data so the page remains functional.
  useEffect(() => {
    let mounted = true;
    let messageSubscription: any = null;

    const loadRemote = async () => {
      try {
        // Load chat messages (if the table exists)
        const { data: msgs } = await (supabase as any)
          .from('community_messages')
          .select('id,author,text,ts')
          .order('ts', { ascending: true })
          .limit(200);

        if (mounted && msgs && Array.isArray(msgs) && msgs.length > 0) {
          setChatMessages(msgs.map((m: any) => ({ id: String(m.id ?? m.ts ?? Date.now()), author: m.author ?? 'Farmer', text: m.text, ts: typeof m.ts === 'number' ? m.ts : Date.parse(m.ts) || Date.now() })));
        }

        // Subscribe to new chat messages in realtime
        messageSubscription = (supabase as any)
          .channel('community_messages_channel')
          .on('postgres_changes', 
            { event: 'INSERT', schema: 'public', table: 'community_messages' },
            (payload: any) => {
              if (mounted && payload.new) {
                const newMsg: ChatMessage = {
                  id: String(payload.new.id ?? Date.now()),
                  author: payload.new.author ?? 'Farmer',
                  text: payload.new.text,
                  ts: typeof payload.new.ts === 'number' ? payload.new.ts : Date.parse(payload.new.ts) || Date.now()
                };
                setChatMessages((prev) => {
                  // Avoid duplicates
                  if (prev.some(m => m.id === newMsg.id)) return prev;
                  return [...prev, newMsg];
                });
              }
            }
          )
          .subscribe();
      } catch (e) {
        // If any remote call fails, we silently fall back to local state.
        console.warn('Community: failed to load remote data, using local/demo data', e);
      }
    };

    loadRemote();

    return () => { 
      mounted = false;
      if (messageSubscription) {
        supabase.removeChannel(messageSubscription);
      }
    };
  }, []);

  const sendChat = () => {
    if (!chatInput.trim()) return;
    if (!user) {
      alert('Please log in to send messages');
      return;
    }
    
    const msg: ChatMessage = {
      id: `temp-${Date.now()}`,
      author: profile?.name ?? user.email ?? 'Farmer',
      text: chatInput.trim(),
      ts: Date.now(),
    };

    // Optimistically update UI
    setChatMessages((s) => [...s, msg]);
    setChatInput('');

    // Persist to Supabase if possible, otherwise fallback to localStorage
    (async () => {
      try {
        const payload = { 
          author: msg.author, 
          text: msg.text, 
          ts: msg.ts,
          user_id: user.id
        };
        const { data, error } = await (supabase as any)
          .from('community_messages')
          .insert([payload])
          .select();
        
        if (error) {
          console.error('Failed to insert chat message to Supabase:', error);
          alert('Failed to send message. Please try again.');
          // Remove optimistic message on error
          setChatMessages((s) => s.filter((m) => m.id !== msg.id));
        } else if (data && data.length > 0) {
          // Update optimistic message with real id from database
          setChatMessages((s) => s.map((m) => (m.id === msg.id ? { ...m, id: String(data[0].id) } : m)));
          console.log('Message sent successfully:', data[0]);
        }
      } catch (e) {
        console.error('Error saving chat to Supabase:', e);
        alert('Failed to send message. Please try again.');
        // Remove optimistic message on error
        setChatMessages((s) => s.filter((m) => m.id !== msg.id));
      }
    })();
  };

  return (
    <div className="min-h-screen py-12 bg-gradient-to-br from-primary/5 to-earth/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 hero-gradient rounded-xl flex items-center justify-center shadow-medium">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2 font-poppins">{t('community.title')}</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">{t('community.subtitle')}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('community.chat.title')}</CardTitle>
            <CardDescription>{t('community.chat.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 flex flex-col h-96 border rounded-lg overflow-hidden">
                <div ref={chatRef} className="flex-1 p-4 overflow-auto space-y-3 bg-muted">
                  {chatMessages.length === 0 && (
                    <div className="text-sm text-muted-foreground">No messages yet — start the conversation.</div>
                  )}
                  {chatMessages.map(m => (
                    <div key={m.id} className="space-y-1">
                      <div className="text-xs text-muted-foreground">{m.author} • {new Date(m.ts).toLocaleString()}</div>
                      <div className="p-3 bg-white rounded-lg shadow-sm">{m.text}</div>
                    </div>
                  ))}
                </div>

                <div className="p-3 border-t bg-surface">
                  <div className="flex gap-2">
                    <Input placeholder={t('community.writeMessage')} value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendChat()} />
                    <Button onClick={sendChat} variant="hero">{t('community.send')}</Button>
                  </div>
                </div>
              </div>

              <div className="md:col-span-1 space-y-4">
                <Card className="p-4">
                  <h3 className="font-semibold">{t('community.guidelines.title')}</h3>
                  <ul className="text-sm text-muted-foreground list-disc list-inside mt-2">
                    <li>{t('community.guidelines.list1')}</li>
                    <li>{t('community.guidelines.list2')}</li>
                    <li>{t('community.guidelines.list3')}</li>
                  </ul>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Community;

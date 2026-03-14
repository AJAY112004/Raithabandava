import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Chatbot from '@/components/Chatbot';

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-50 bg-primary hover:bg-primary/90 md:h-16 md:w-16"
          size="icon"
          title="Open AI Assistant"
        >
          <MessageCircle className="h-6 w-6 md:h-7 md:w-7" />
        </Button>
      )}

      {/* Floating Chatbot Window */}
      {isOpen && (
        <div className="fixed bottom-0 right-0 md:bottom-6 md:right-6 z-50 w-full md:w-auto animate-in slide-in-from-bottom-5 duration-300">
          <div className="relative">
            {/* Close button overlay */}
            <Button
              onClick={() => setIsOpen(false)}
              className="absolute top-2 right-2 md:-top-2 md:-right-2 h-8 w-8 rounded-full shadow-md z-10 bg-destructive hover:bg-destructive/90"
              size="icon"
              title="Close Chatbot"
            >
              <X className="h-4 w-4" />
            </Button>
            
            {/* Chatbot Component */}
            <div className="shadow-2xl md:rounded-lg overflow-hidden h-screen md:h-auto">
              <Chatbot />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

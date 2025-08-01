import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Card } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Message, TypingIndicator } from './message';
import { useChat } from '../../hooks/use-chat';
import { useAuth } from '../../hooks/use-auth';
import { useToast } from '../../hooks/use-toast';
import { 
  Bot, 
  Send, 
  Download, 
  MoreVertical, 
  Plus,
  Settings,
  LogOut,
  Coins
} from 'lucide-react';
import { Link } from 'wouter';
import { signOutUser } from '../../lib/firebase';

interface ChatInterfaceProps {
  sessionId?: string;
  onNewSession?: (profession: string) => void;
}

export function ChatInterface({ sessionId, onNewSession }: ChatInterfaceProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    sessions,
    currentSession,
    sessionLoading,
    isTyping,
    sendMessage,
    isSendingMessage,
    sendMessageError,
  } = useChat(sessionId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages, isTyping]);

  useEffect(() => {
    if (sendMessageError) {
      toast({
        title: 'Hata',
        description: (sendMessageError as Error).message,
        variant: 'destructive',
      });
    }
  }, [sendMessageError, toast]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageInput.trim() || !sessionId) return;
    
    if (!user || user.credits < 3) {
      toast({
        title: 'Yetersiz Kredi',
        description: 'Mesaj göndermek için en az 3 krediniz olması gerekir.',
        variant: 'destructive',
      });
      return;
    }

    const message = messageInput.trim();
    setMessageInput('');
    
    sendMessage({ sessionId, content: message });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const professionName = currentSession?.profession ? {
    'muhendis': 'Mühendislik AI Asistanı',
    'avukat': 'Hukuk AI Asistanı',
    'doktor': 'Tıp AI Asistanı',
    'ogretmen': 'Eğitim AI Asistanı',
    'is-analisti': 'İş Analisti AI Asistanı',
    'tasarimci': 'Tasarım AI Asistanı',
  }[currentSession.profession] || 'AI Asistanı' : 'AI Asistanı';

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* User Profile */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-medium">
                  {user?.name?.charAt(0).toUpperCase() || 'K'}
                </span>
              </div>
            </div>
            <div>
              <p className="font-medium text-gray-900">{user?.name}</p>
              <p className="text-sm text-gray-500">{user?.profession || 'Kullanıcı'}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-600">
              <Coins className="text-yellow-500 mr-1" size={16} />
              <span>{user?.credits || 0}</span> kredi
            </div>
            <Button size="sm" variant="outline" className="text-xs">
              Kredi Al
            </Button>
          </div>
        </div>

        {/* Chat Sessions */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Sohbet Geçmişi</h3>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => onNewSession?.('genel')}
              >
                <Plus size={16} />
              </Button>
            </div>
            
            <div className="space-y-2">
              {sessions?.map((session) => (
                <Link 
                  key={session.id} 
                  href={`/chat/${session.id}`}
                >
                  <div className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    session.id === sessionId 
                      ? 'bg-blue-50 border-l-4 border-primary' 
                      : 'hover:bg-gray-50'
                  }`}>
                    <p className="font-medium text-gray-900 text-sm truncate">
                      {session.title}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {new Date(session.updatedAt).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="flex items-center">
                <Settings size={16} className="mr-2" />
                <span>Dashboard</span>
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <Bot className="text-white" size={20} />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">{professionName}</h2>
                <p className="text-sm text-green-600 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Çevrimiçi
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Download size={16} />
              </Button>
              <Button variant="ghost" size="sm">
                <MoreVertical size={16} />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {!sessionLoading && currentSession?.messages.length === 0 && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="text-white" size={16} />
                </div>
                <div className="bg-gray-100 rounded-lg p-4 max-w-md">
                  <p className="text-gray-900">
                    Merhaba! Ben sizin {professionName.toLowerCase()}ınızım. Size nasıl yardımcı olabilirim?
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            )}
            
            {currentSession?.messages.map((message) => (
              <Message
                key={message.id}
                message={message}
                userDisplayName={user?.name}
              />
            ))}
            
            {isTyping && <TypingIndicator />}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 bg-white border-t border-gray-200">
          <form onSubmit={handleSendMessage} className="flex items-end space-x-4">
            <div className="flex-1">
              <Textarea
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Mesajınızı yazın..."
                className="resize-none"
                rows={2}
                disabled={isSendingMessage || !sessionId}
              />
            </div>
            <Button 
              type="submit" 
              disabled={!messageInput.trim() || isSendingMessage || !sessionId}
              className="px-6"
            >
              <Send size={16} />
            </Button>
          </form>
          <p className="text-xs text-gray-500 mt-2">
            Her mesaj ortalama 3-5 kredi tüketir • Kalan krediniz: {user?.credits || 0}
          </p>
        </div>
      </div>
    </div>
  );
}

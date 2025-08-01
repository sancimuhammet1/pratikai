import { useState, useRef, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Message, TypingIndicator } from "@/components/chat/message";
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
import { signOutUser } from '@/lib/firebase';
import type { ChatSessionWithMessages, ChatSession } from "@shared/schema";

export default function Chat() {
  const { id: sessionId } = useParams();
  const [, setLocation] = useLocation();
  const { user, getAuthToken } = useAuth();
  const [message, setMessage] = useState("");
  const [selectedProfession, setSelectedProfession] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get sessions
  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ["/api/chat/sessions"],
    queryFn: async () => {
      const token = await getAuthToken();
      if (!token) return [];
      
      const response = await fetch('/api/chat/sessions', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (!response.ok) throw new Error('Failed to fetch sessions');
      return response.json() as Promise<ChatSession[]>;
    },
    enabled: !!user,
  });

  const { data: session, isLoading } = useQuery<ChatSessionWithMessages>({
    queryKey: ["/api/chat/sessions", sessionId],
    queryFn: async () => {
      if (!sessionId) return null;
      
      const token = await getAuthToken();
      if (!token) return null;
      
      const response = await fetch(`/api/chat/sessions/${sessionId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (!response.ok) throw new Error('Failed to fetch session');
      return response.json();
    },
    enabled: !!sessionId && !!user,
  });

  const createSessionMutation = useMutation({
    mutationFn: async (profession: string) => {
      const token = await getAuthToken();
      if (!token) throw new Error('Not authenticated');
      
      const response = await fetch("/api/chat/sessions", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          profession,
          title: "Yeni Sohbet"
        })
      });
      
      if (!response.ok) throw new Error('Failed to create session');
      return await response.json();
    },
    onSuccess: (newSession: ChatSession) => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/sessions"] });
      setLocation(`/chat/${newSession.id}`);
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!sessionId) throw new Error("No session selected");
      
      const token = await getAuthToken();
      if (!token) throw new Error('Not authenticated');
      
      const response = await fetch(`/api/chat/sessions/${sessionId}/messages`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send message');
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/sessions", sessionId] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setMessage("");
      
      toast({
        title: "Mesaj gönderildi",
        description: `${data.creditsUsed} kredi kullanıldı. Kalan: ${data.remainingCredits}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Mesaj gönderilemedi",
        description: error.message || "Bir hata oluştu",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [session?.messages]);

  const handleNewChat = () => {
    if (!selectedProfession) {
      setSelectedProfession("");
      return;
    }
    
    createSessionMutation.mutate(selectedProfession);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !sessionId) return;
    
    if (!user || user.credits < 3) {
      toast({
        title: "Yetersiz kredi",
        description: "Mesaj göndermek için en az 3 krediniz olması gerekiyor",
        variant: "destructive",
      });
      return;
    }

    sendMessageMutation.mutate(message.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
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

  // Show profession selection if no session
  if (!sessionId) {
    const professions = [
      { id: "muhendis", name: "Mühendis", icon: "Cog" },
      { id: "avukat", name: "Avukat", icon: "Scale" },
      { id: "doktor", name: "Doktor", icon: "Stethoscope" },
      { id: "ogretmen", name: "Öğretmen", icon: "GraduationCap" },
      { id: "is-analisti", name: "İş Analisti", icon: "BarChart3" },
      { id: "tasarimci", name: "Tasarımcı", icon: "Palette" },
    ];

    return (
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* User Profile */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-medium">
                  {user?.name?.charAt(0).toUpperCase() || 'K'}
                </span>
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
              </div>
              
              <div className="space-y-2">
                {sessions.map((chatSession) => (
                  <Link 
                    key={chatSession.id} 
                    href={`/chat/${chatSession.id}`}
                  >
                    <div className="p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <p className="font-medium text-gray-900 text-sm truncate">
                        {chatSession.title}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {new Date(chatSession.updatedAt).toLocaleDateString('tr-TR')}
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
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-2xl mx-auto p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Hangi meslek için AI asistanı istiyorsunuz?
            </h2>
            <p className="text-gray-600 mb-8">
              Mesleğinizi seçin ve size özel AI asistanınızla sohbet etmeye başlayın
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {professions.map((profession) => (
                <Button
                  key={profession.id}
                  variant="outline"
                  className="h-20 flex flex-col space-y-2"
                  onClick={() => {
                    setSelectedProfession(profession.id);
                    createSessionMutation.mutate(profession.id);
                  }}
                  disabled={createSessionMutation.isPending}
                >
                  <i className={`fas fa-${profession.icon.toLowerCase()} text-primary`}></i>
                  <span>{profession.name}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="w-80 bg-white border-r border-gray-200"></div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="w-80 bg-white border-r border-gray-200"></div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Sohbet bulunamadı</h2>
            <p className="text-gray-600">Bu sohbet artık mevcut değil.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* User Profile */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white font-medium">
                {user?.name?.charAt(0).toUpperCase() || 'K'}
              </span>
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
                onClick={handleNewChat}
              >
                <Plus size={16} />
              </Button>
            </div>
            
            <div className="space-y-2">
              {sessions.map((chatSession) => (
                <Link 
                  key={chatSession.id} 
                  href={`/chat/${chatSession.id}`}
                >
                  <div className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    chatSession.id === sessionId 
                      ? 'bg-blue-50 border-l-4 border-primary' 
                      : 'hover:bg-gray-50'
                  }`}>
                    <p className="font-medium text-gray-900 text-sm truncate">
                      {chatSession.title}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {new Date(chatSession.updatedAt).toLocaleDateString('tr-TR')}
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
                <h2 className="font-semibold text-gray-900">
                  {session.profession.charAt(0).toUpperCase() + session.profession.slice(1)} AI Asistanı
                </h2>
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
            {session.messages.length === 0 && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="text-white" size={16} />
                </div>
                <div className="bg-gray-100 rounded-lg p-4 max-w-md">
                  <p className="text-gray-900">
                    Merhaba! Ben sizin {session.profession} AI asistanınızım. Size nasıl yardımcı olabilirim?
                  </p>
                </div>
              </div>
            )}
            
            {session.messages.map((msg) => (
              <Message 
                key={msg.id} 
                message={msg} 
                userDisplayName={user?.name}
              />
            ))}
            
            {sendMessageMutation.isPending && <TypingIndicator />}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 bg-white border-t border-gray-200">
          <form onSubmit={handleSendMessage} className="flex items-end space-x-4">
            <div className="flex-1">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Mesajınızı yazın..."
                rows={2}
                className="resize-none"
              />
            </div>
            <Button 
              type="submit" 
              disabled={!message.trim() || sendMessageMutation.isPending}
              className="px-6 py-3"
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

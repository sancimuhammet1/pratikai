import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import type { ChatSession } from "@shared/schema";

interface ChatSidebarProps {
  onNewChat: () => void;
}

export function ChatSidebar({ onNewChat }: ChatSidebarProps) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const { data: sessions = [] } = useQuery<ChatSession[]>({
    queryKey: ["/api/chat/sessions"],
    enabled: !!user,
  });

  if (!user) return null;

  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* User Profile */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white font-medium">{initials}</span>
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">{user.name}</p>
            <p className="text-sm text-gray-500">{user.profession || 'Kullanıcı'}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-600">
            <i className="fas fa-coins text-yellow-500 mr-1"></i>
            <span>{user.credits}</span> kredi
          </div>
          <Button variant="outline" size="sm">
            Kredi Al
          </Button>
        </div>
      </div>

      {/* Chat Sessions */}
      <div className="flex-1 overflow-hidden">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Sohbet Geçmişi</h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onNewChat}
              className="text-primary hover:text-blue-700"
            >
              <i className="fas fa-plus"></i>
            </Button>
          </div>
          
          <ScrollArea className="h-[calc(100vh-300px)]">
            <div className="space-y-2">
              {sessions.map((session) => (
                <Link 
                  key={session.id} 
                  href={`/chat/${session.id}`}
                  className={`block p-3 rounded-lg cursor-pointer transition-colors ${
                    location === `/chat/${session.id}`
                      ? 'bg-blue-50 border-l-4 border-primary'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <p className="font-medium text-gray-900 text-sm line-clamp-2">
                    {session.title}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {new Date(session.updatedAt).toLocaleDateString('tr-TR')}
                  </p>
                </Link>
              ))}
              
              {sessions.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <p className="text-sm">Henüz sohbet geçmişiniz yok</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={onNewChat}
                  >
                    İlk Sohbetinizi Başlatın
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Settings */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <Link 
            href="/dashboard"
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <i className="fas fa-chart-bar mr-2"></i>
            <span>Dashboard</span>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="text-gray-600 hover:text-gray-900"
          >
            <i className="fas fa-sign-out-alt"></i>
          </Button>
        </div>
      </div>
    </div>
  );
}

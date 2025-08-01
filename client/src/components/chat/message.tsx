import React from 'react';
import { Message as MessageType } from '@shared/schema';
import { Bot, User } from 'lucide-react';
import { cn } from '../../lib/utils';

interface MessageProps {
  message: MessageType;
  userDisplayName?: string;
  userPhotoURL?: string;
}

export function Message({ message, userDisplayName, userPhotoURL }: MessageProps) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  const formatTime = (date: Date | string) => {
    const messageDate = new Date(date);
    return messageDate.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isUser) {
    return (
      <div className="flex items-start space-x-3 justify-end chat-message">
        <div className="bg-primary rounded-lg p-4 max-w-2xl">
          <p className="text-white whitespace-pre-wrap">
            {message.content}
          </p>
          <p className="text-xs text-blue-200 mt-2">
            {formatTime(message.createdAt)}
          </p>
        </div>
        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
          {userPhotoURL ? (
            <img src={userPhotoURL} alt={userDisplayName} className="w-8 h-8 rounded-full" />
          ) : (
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600 text-sm font-medium">
                {userDisplayName?.charAt(0).toUpperCase() || 'K'}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (isAssistant) {
    return (
      <div className="flex items-start space-x-3 chat-message">
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
          <Bot className="text-white" size={16} />
        </div>
        <div className="bg-gray-100 rounded-lg p-4 max-w-2xl">
          <p className="text-gray-900 whitespace-pre-wrap">
            {message.content}
          </p>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-gray-500">
              {formatTime(message.createdAt)}
            </p>
            {message.creditsUsed && message.creditsUsed > 0 && (
              <p className="text-xs text-gray-500">
                {message.creditsUsed} kredi kullanıldı
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export function TypingIndicator() {
  return (
    <div className="flex items-start space-x-3 chat-message">
      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
        <Bot className="text-white" size={16} />
      </div>
      <div className="bg-gray-100 rounded-lg p-4">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
}

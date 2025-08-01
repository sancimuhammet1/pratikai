import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

interface ChatMessageProps {
  message: {
    id: string;
    role: "user" | "assistant";
    content: string;
    creditsUsed?: number;
    createdAt: string;
  };
  userName?: string;
}

export function ChatMessage({ message, userName = "Sen" }: ChatMessageProps) {
  const isUser = message.role === "user";
  const timeAgo = formatDistanceToNow(new Date(message.createdAt), { 
    addSuffix: true, 
    locale: tr 
  });

  return (
    <div className={`flex items-start space-x-3 chat-message ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
          <i className="fas fa-robot text-white text-sm"></i>
        </div>
      )}
      
      <div className={`rounded-lg p-4 max-w-2xl ${
        isUser 
          ? 'bg-primary text-white' 
          : 'bg-gray-100 text-gray-900'
      }`}>
        <div className="whitespace-pre-wrap">{message.content}</div>
        <div className={`text-xs mt-2 ${isUser ? 'text-blue-200' : 'text-gray-500'}`}>
          {timeAgo}
          {message.creditsUsed && message.creditsUsed > 0 && (
            <span> • {message.creditsUsed} kredi kullanıldı</span>
          )}
        </div>
      </div>
      
      {isUser && (
        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-gray-600 text-sm font-medium">
            {userName.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );
}

import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { useAuth } from './use-auth';
import { ChatSession, Message } from '@shared/schema';

export function useChat(sessionId?: string) {
  const { getAuthToken } = useAuth();
  const queryClient = useQueryClient();
  const [isTyping, setIsTyping] = useState(false);

  const authApiRequest = useCallback(async (method: string, url: string, data?: unknown) => {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');
    
    return fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: data ? JSON.stringify(data) : undefined,
    });
  }, [getAuthToken]);

  // Get chat sessions
  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['/api/chat/sessions'],
    queryFn: async () => {
      const token = await getAuthToken();
      if (!token) return [];
      
      const response = await fetch('/api/chat/sessions', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (!response.ok) throw new Error('Failed to fetch sessions');
      return response.json() as Promise<ChatSession[]>;
    },
    enabled: !!getAuthToken,
  });

  // Get current session with messages
  const { data: currentSession, isLoading: sessionLoading } = useQuery({
    queryKey: ['/api/chat/sessions', sessionId],
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
    enabled: !!sessionId && !!getAuthToken,
  });

  // Create new session
  const createSessionMutation = useMutation({
    mutationFn: async ({ profession, title }: { profession: string; title: string }) => {
      const response = await authApiRequest('POST', '/api/chat/sessions', {
        profession,
        title,
      });
      
      if (!response.ok) throw new Error('Failed to create session');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat/sessions'] });
    },
  });

  // Send message
  const sendMessageMutation = useMutation({
    mutationFn: async ({ sessionId, content }: { sessionId: string; content: string }) => {
      setIsTyping(true);
      
      const response = await authApiRequest('POST', `/api/chat/sessions/${sessionId}/messages`, {
        content,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send message');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setIsTyping(false);
      // Invalidate current session to refresh messages
      queryClient.invalidateQueries({ queryKey: ['/api/chat/sessions', sessionId] });
      // Update user data to reflect credit changes
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    },
    onError: () => {
      setIsTyping(false);
    },
  });

  return {
    sessions,
    sessionsLoading,
    currentSession,
    sessionLoading,
    isTyping,
    createSession: createSessionMutation.mutate,
    sendMessage: sendMessageMutation.mutate,
    isCreatingSession: createSessionMutation.isPending,
    isSendingMessage: sendMessageMutation.isPending,
    sendMessageError: sendMessageMutation.error,
  };
}

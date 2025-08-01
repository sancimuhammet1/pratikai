import React from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from './button';
import { useAuth } from '../../contexts/AuthContext';
import { signOutUser } from '../../lib/firebase';
import { Brain, Settings, LogOut } from 'lucide-react';

export function Navigation() {
  const { user, firebaseUser } = useAuth();
  const [location] = useLocation();

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (!firebaseUser) {
    return (
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <div className="flex items-center space-x-2 cursor-pointer">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Brain className="text-white" size={16} />
                </div>
                <span className="text-xl font-bold text-gray-900">PratikAI</span>
              </div>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
                Ana Sayfa
              </Link>
              <Link href="/features" className="text-gray-600 hover:text-gray-900 transition-colors">
                Özellikler
              </Link>
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
                Fiyatlandırma
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <Link href="/auth">
                <Button variant="ghost">Giriş Yap</Button>
              </Link>
              <Link href="/auth">
                <Button>Ücretsiz Başla</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/dashboard">
            <div className="flex items-center space-x-2 cursor-pointer">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Brain className="text-white" size={16} />
              </div>
              <span className="text-xl font-bold text-gray-900">PratikAI</span>
            </div>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/dashboard">
              <Button variant={location === '/dashboard' ? 'default' : 'ghost'} size="sm">
                Dashboard
              </Button>
            </Link>
            <Link href="/chat">
              <Button variant={location.startsWith('/chat') ? 'default' : 'ghost'} size="sm">
                Sohbet
              </Button>
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-3">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{user.credits}</span> kredi
                </div>
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              </div>
            )}
            
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut size={16} />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

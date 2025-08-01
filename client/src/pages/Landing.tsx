import React from 'react';
import { Button } from '../components/ui/button';
import { ProfessionSelector } from '../components/profession-selector';
import { Link } from 'wouter';
import { Brain } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Mesleğinize Özel<br />
              <span className="text-primary">AI Asistanınız</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Mühendislik, hukuk, tıp, eğitim ve daha fazla alan için özelleştirilmiş yapay zeka asistanları ile çalışmanızı daha verimli hale getirin.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth">
                <Button size="lg" className="text-lg px-8 py-4">
                  Hemen Başla
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                Demo İzle
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Selection Section */}
      <ProfessionSelector 
        onSelect={(profession) => {
          // Navigate to auth with profession parameter
          window.location.href = `/auth?profession=${profession}`;
        }} 
      />

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Neden PratikAI?
            </h2>
            <p className="text-xl text-gray-600">
              Mesleğinize özel AI desteği ile farkı hissedin
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="text-primary" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Uzmanlaşmış AI</h3>
              <p className="text-gray-600">
                Her meslek için özel eğitilmiş AI asistanları ile profesyonel kalitede çözümler.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="text-accent" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Türkçe Destek</h3>
              <p className="text-gray-600">
                Tamamen Türkçe olarak eğitilmiş AI modelleri ile doğal ve anlaşılır iletişim.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="text-yellow-500" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Güvenli ve Hızlı</h3>
              <p className="text-gray-600">
                Verileriniz güvende, yanıtlar hızlı ve güvenilir. 7/24 erişilebilir AI desteği.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

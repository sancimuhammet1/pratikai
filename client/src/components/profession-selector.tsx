import React from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { 
  Cog, 
  Scale, 
  Stethoscope, 
  GraduationCap, 
  BarChart3, 
  Palette,
  ArrowRight
} from 'lucide-react';

const professions = [
  {
    id: 'muhendis',
    name: 'Mühendis',
    description: 'Teknik problemler, proje yönetimi ve mühendislik hesaplamaları için özelleştirilmiş AI desteği.',
    icon: Cog,
    color: 'bg-blue-100 text-blue-600 group-hover:bg-primary group-hover:text-white',
  },
  {
    id: 'avukat',
    name: 'Avukat',
    description: 'Hukuki araştırma, sözleşme analizi ve yasal danışmanlık için uzmanlaşmış AI asistanı.',
    icon: Scale,
    color: 'bg-green-100 text-green-600 group-hover:bg-accent group-hover:text-white',
  },
  {
    id: 'doktor',
    name: 'Doktor',
    description: 'Tıbbi araştırma, semptom analizi ve hasta bakımı konularında uzman AI desteği.',
    icon: Stethoscope,
    color: 'bg-red-100 text-red-500 group-hover:bg-red-500 group-hover:text-white',
  },
  {
    id: 'ogretmen',
    name: 'Öğretmen',
    description: 'Ders planları, eğitim materyalleri ve öğrenci değerlendirmeleri için eğitim odaklı AI.',
    icon: GraduationCap,
    color: 'bg-purple-100 text-purple-500 group-hover:bg-purple-500 group-hover:text-white',
  },
  {
    id: 'is-analisti',
    name: 'İş Analisti',
    description: 'İş süreçleri, veri analizi ve stratejik planlama konularında uzmanlaşmış AI desteği.',
    icon: BarChart3,
    color: 'bg-yellow-100 text-yellow-500 group-hover:bg-yellow-500 group-hover:text-white',
  },
  {
    id: 'tasarimci',
    name: 'Tasarımcı',
    description: 'Kreatif süreçler, tasarım konseptleri ve görsel projeler için sanat odaklı AI asistanı.',
    icon: Palette,
    color: 'bg-indigo-100 text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white',
  },
];

interface ProfessionSelectorProps {
  onSelect: (profession: string) => void;
}

export function ProfessionSelector({ onSelect }: ProfessionSelectorProps) {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Mesleğinizi Seçin
          </h2>
          <p className="text-xl text-gray-600">
            Size özel AI asistanı ile hemen çalışmaya başlayın
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {professions.map((profession) => {
            const Icon = profession.icon;
            return (
              <Card 
                key={profession.id}
                className="hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => onSelect(profession.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${profession.color}`}>
                      <Icon size={24} />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 ml-4">
                      {profession.name}
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    {profession.description}
                  </p>
                  <div className="flex items-center text-primary font-medium">
                    <span>Başla</span>
                    <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

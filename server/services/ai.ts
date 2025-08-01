import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || "" 
});

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const PROFESSION_PROMPTS = {
  "muhendis": `Sen bir deneyimli mühendislik AI asistanısın. Türkçe olarak şu konularda uzmanlaşmışsın:
- Proje yönetimi ve planlama
- Yazılım mimarisi ve geliştirme
- Teknik problem çözme
- Kalite kontrol ve test süreçleri
- Teknoloji seçimi ve araştırma
- Mühendislik hesaplamaları
- İş süreçleri optimizasyonu

Her zaman net, teknik ve uygulanabilir tavsiyeler ver. Örnekler ve adım adım açıklamalar kullan.`,

  "avukat": `Sen bir deneyimli hukuk AI asistanısın. Türkçe olarak şu konularda uzmanlaşmışsın:
- Yasal araştırma ve analiz
- Sözleşme inceleme ve hazırlama
- Hukuki prosedürler ve süreçler
- Yasal risk değerlendirmesi
- Mevzuat takibi ve yorumlama
- Hukuki yazışma ve belge hazırlama
- Yasal strateji geliştirme

Her zaman güncel Türk hukuku çerçevesinde, net ve anlaşılır açıklamalar yap. DİKKAT: Hukuki tavsiye değil, bilgilendirme amaçlıdır.`,

  "doktor": `Sen bir deneyimli tıp AI asistanısın. Türkçe olarak şu konularda uzmanlaşmışsın:
- Tıbbi literatür araştırması
- Semptom analizi ve değerlendirme
- Hasta bakım protokolleri
- Tıbbi terminoloji ve açıklamalar
- Sağlık eğitimi ve bilgilendirme
- Hasta iletişimi stratejileri
- Tıbbi dokümantasyon

Her zaman etik tıp ilkelerine uygun, kanıta dayalı bilgiler ver. DİKKAT: Teşhis koymaz, tedavi önerisi vermezsin.`,

  "ogretmen": `Sen bir deneyimli eğitim AI asistanısın. Türkçe olarak şu konularda uzmanlaşmışsın:
- Ders planı hazırlama
- Eğitim materyali geliştirme
- Öğrenci değerlendirme yöntemleri
- Sınıf yönetimi teknikleri
- Eğitim teknolojileri
- Öğretim stratejileri
- Öğrenci motivasyonu

Her zaman yaş grubuna uygun, yaratıcı ve uygulanabilir eğitim çözümleri öner.`,

  "is-analisti": `Sen bir deneyimli iş analizi AI asistanısın. Türkçe olarak şu konularda uzmanlaşmışsın:
- İş süreçleri analizi ve optimizasyonu
- Veri analizi ve raporlama
- Stratejik planlama
- Performans ölçümleri (KPI)
- Proje yönetimi
- Risk analizi
- İş zekası ve analitik

Her zaman data-driven, ölçülebilir ve iş değeri yaratan öneriler sun.`,

  "tasarimci": `Sen bir deneyimli tasarım AI asistanısın. Türkçe olarak şu konularda uzmanlaşmışsın:
- Görsel tasarım ve kompozisyon
- Kullanıcı deneyimi (UX) tasarımı
- Marka kimliği ve stratejisi
- Tasarım araçları ve teknikleri
- Yaratıcı süreçler
- Renk teorisi ve tipografi
- Dijital ve basılı medya tasarımı

Her zaman yaratıcı, estetik ve kullanıcı odaklı çözümler öner. Trend ve best practice'leri dahil et.`
};

export async function generateChatResponse(
  messages: ChatMessage[],
  profession: string
): Promise<{ response: string; creditsUsed: number }> {
  try {
    const professionKey = profession.toLowerCase().replace(/\s+/g, '-');
    const systemPrompt = PROFESSION_PROMPTS[professionKey as keyof typeof PROFESSION_PROMPTS] || 
      PROFESSION_PROMPTS["muhendis"]; // Fallback to engineer

    const conversationHistory = messages.map(msg => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
      contents: conversationHistory,
    });

    const responseText = response.text || "Üzgünüm, bir yanıt oluşturamadım. Lütfen tekrar deneyin.";
    
    // Calculate credits based on response length (roughly 1 credit per 50 characters)
    const creditsUsed = Math.max(3, Math.ceil(responseText.length / 50));

    return {
      response: responseText,
      creditsUsed
    };
  } catch (error) {
    console.error("AI service error:", error);
    throw new Error("AI servisi şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.");
  }
}

export function generateSessionTitle(firstMessage: string): string {
  // Generate a title from the first message (simple implementation)
  const words = firstMessage.split(' ').slice(0, 6);
  let title = words.join(' ');
  if (title.length > 50) {
    title = title.substring(0, 47) + '...';
  }
  return title || 'Yeni Sohbet';
}

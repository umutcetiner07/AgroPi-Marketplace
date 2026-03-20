import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '')

const AGROPI_SYSTEM_PROMPT = `Sen AgroPi Akıllı Tarım Danışmanı'sın. Uzmanlık alanların:
- Topprak analizi ve besin takviyesi önerileri
- Sulama programları ve su yönetimi
- Bitki sağlığı ve hastalık teşhisi
- Gübreleme zamanlaması ve miktarları
- İklim koşullarına göre tarım stratejileri

Kullanıcıya profesyonel, çözüm odaklı ve pratik tavsiyeler ver. 
Cevaplarını Türkçe ve samimi bir dille yaz.
Tarım terminolojisini basit bir şekilde açıkla.
Her zaman güvenilir ve bilimsel bilgiye dayanı.

Başlangıç mesajı: "Merhaba, ben AgroPi asistanın. Tarlan ve ürünlerin hakkında sana nasıl yardımcı olabilirim?"`

export async function generateAgroPiResponse(userMessage: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    
    const prompt = `${AGROPI_SYSTEM_PROMPT}

Kullanıcı mesajı: "${userMessage}"

Lütfen tarım danışmanı olarak yanıt ver:`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    return text.trim()
  } catch (error) {
    console.error('Gemini API error:', error)
    
    // Fallback yanıtlar
    if (userMessage.toLowerCase().includes('merhaba') || userMessage.toLowerCase().includes('selam')) {
      return "Merhaba, ben AgroPi asistanın. Tarlan ve ürünlerin hakkında sana nasıl yardımcı olabilirim?"
    }
    
    if (userMessage.toLowerCase().includes('sensör') || userMessage.toLowerCase().includes('veri')) {
      return "Sensör verilerini analiz etmek için lütfen spesifik olarak hangi veriyi (nem, sıcaklık, pH, ışık) öğrenmek istediğini belirt. Bu sayede daha doğru tavsiyeler verebilirim."
    }
    
    if (userMessage.toLowerCase().includes('sulama')) {
      return "Sulama için toprak nemini kontrol et. Eğer nem %60'ın altındaysa, bitki türüne göre ortalama 15-30 dakika sulama yap. Sabah erken saatlerde sulama en iyisidir."
    }
    
    return "Şu anda teknik bir sorun yaşıyorum. Lütfen daha sonra tekrar sor veya tarım danışmanlığı için spesifik bir konu belirt."
  }
}

export async function getInitialMessage(): Promise<string> {
  return "Merhaba, ben AgroPi asistanın. Tarlan ve ürünlerin hakkında sana nasıl yardımcı olabilirim?"
}

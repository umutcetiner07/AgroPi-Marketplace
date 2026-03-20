import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '')

const AGROPI_SYSTEM_PROMPT = `You are AgroPi AI Advisor. Your expertise areas:
- Soil analysis and nutrient recommendations
- Irrigation programs and water management
- Crop health and disease diagnosis
- Fertilization timing and quantities
- Farming strategies based on climate conditions

Provide professional, solution-oriented and practical advice to users. 
Respond in English with a friendly and expert tone.
Explain farming terminology in simple terms.
Always base your responses on reliable and scientific information.

Initial message: "Hello, I'm AgroPi AI assistant. How can I help you with your crops and field management?"`

export async function generateAgroPiResponse(userMessage: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    
    const prompt = `${AGROPI_SYSTEM_PROMPT}

User message: "${userMessage}"

Please respond as a farming advisor:`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    return text.trim()
  } catch (error) {
    console.error('Gemini API error:', error)
    
    // Fallback responses
    if (userMessage.toLowerCase().includes('hello') || userMessage.toLowerCase().includes('hi')) {
      return "Hello, I'm AgroPi AI assistant. How can I help you with your crops and field management?"
    }
    
    if (userMessage.toLowerCase().includes('sensor') || userMessage.toLowerCase().includes('data')) {
      return "For sensor data analysis, please specify which data (moisture, temperature, pH, light) you want to analyze. This way I can provide more accurate recommendations."
    }
    
    if (userMessage.toLowerCase().includes('irrigation')) {
      return "Check soil moisture for irrigation. If moisture is below 60%, water for 15-30 minutes depending on crop type. Early morning irrigation is best."
    }
    
    return "I'm experiencing technical difficulties at the moment. Please try again later or specify a specific topic for farming advice."
  }
}

export async function getInitialMessage(): Promise<string> {
  return "Hello, I'm AgroPi AI assistant. How can I help you with your crops and field management?"
}

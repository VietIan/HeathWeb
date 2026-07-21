// Gemini AI - Lazy loaded to prevent build hanging
// @google/genai is dynamically imported only when needed

export const analyzeMessage = async (message) => {
    try {
        const { GoogleGenerativeAI } = await import("@google/genai");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
    You are a helpful assistant for "HealtWeb", a personal productivity and Chinese learning app.
    Your task is to analyze the user message and extract intent and data in JSON format.
    
    Current Date: ${new Date().toISOString()}
    
    INTENTS:
    1. "QUICK_SAVE": Saving a Chinese word or sentence.
    2. "ADD_TASK": Creating a new to-do item.
    3. "MOOD_TRACK": Recording how they feel today.
    4. "JOURNAL": Writing a diary entry.
    5. "UNKNOWN": If you can't determine the intent.

    JSON SCHEMA:
    {
        "intent": "QUICK_SAVE" | "ADD_TASK" | "MOOD_TRACK" | "JOURNAL" | "UNKNOWN",
        "data": {
            // For QUICK_SAVE:
            "word": "The Chinese character(s)",
            "meaning": "Meaning in Vietnamese",
            "pinyin": "Pinyin with tones",
            "type": "word" | "sentence",
            
            // For ADD_TASK:
            "title": "Task title (Vietnamese)",
            
            // For MOOD_TRACK:
            "score": 1-5 (1: Terrible, 5: Great),
            "note": "A short note about the mood",
            
            // For JOURNAL:
            "content": "The full journal content"
        },
        "reply": "A friendly confirmation message in Vietnamese"
    }

    USER MESSAGE: "${message}"
    
    Return ONLY the JSON.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const jsonStr = text.replace(/```json|```/g, "").trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Gemini Analysis Error:", error);
        return { intent: "UNKNOWN", reply: "Rất tiếc, mình chưa hiểu ý bạn. Bạn có thể nói rõ hơn không?" };
    }
};

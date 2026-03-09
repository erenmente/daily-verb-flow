const { GoogleGenerativeAI } = require('@google/generative-ai');

let model = null;

if (process.env.GEMINI_API_KEY) {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        console.log('✅ Google Gemini bağlantısı kuruldu.');
    } catch (e) {
        console.warn('⚠️  Gemini başlatılamadı:', e.message);
    }
} else {
    console.warn('⚠️  Gemini API key eksik — dinamik kelime üretimi devre dışı.');
}

/**
 * Gemini ile belirli bir seviyeye uygun fiiller ve örnek cümleler üretir
 * @param {string} level - Kullanıcı seviyesi (A1, A2, B1, B2, C1)
 * @param {number} count - Üretilecek fiil sayısı
 * @returns {Array} Üretilen fiil verileri
 */
async function generateVerbs(level, count = 10) {
    if (!model) {
        console.warn('⚠️  Gemini yapılandırılmamış — fiil üretilemiyor.');
        return [];
    }

    const prompt = `Sen Türk öğrencilere İngilizce öğreten uzman bir dil öğretmenisin.

${level} seviyesine uygun ${count} adet İngilizce düzensiz (irregular) fiil üret.

Her fiil için:
- v1 (base form)
- v2 (past simple)  
- v3 (past participle)
- meaning (Türkçe anlamı)
- 3 örnek cümle (v1, v2, v3 formlarını kullanan) ve Türkçe çevirileri

SADECE geçerli JSON döndür, başka hiçbir şey yazma:
[
  {
    "v1": "go",
    "v2": "went",
    "v3": "gone",
    "meaning": "gitmek",
    "level": "${level}",
    "exampleSentences": [
      { "en": "I go to school every day.", "tr": "Her gün okula giderim." },
      { "en": "She went to the park yesterday.", "tr": "Dün parka gitti." },
      { "en": "They have gone home.", "tr": "Eve gittiler." }
    ]
  }
]

Önemli:
- ${level} seviyesine uygun fiiller seç
- Cümleler günlük hayatta kullanışlı ve doğal olsun
- Türkçe çeviriler doğru ve akıcı olsun
- Daha önce yaygın olarak bilinen fiilleri (go, come, eat gibi) TEKRARLAMA, daha az bilinen fiiller seç`;

    try {
        const result = await model.generateContent(prompt);
        const content = result.response.text().trim();

        // JSON bloğunu parse et (```json ... ``` sarmalı olabilir)
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return JSON.parse(content);
    } catch (error) {
        console.error('Gemini verb generation error:', error.message);
        return [];
    }
}

module.exports = { generateVerbs };

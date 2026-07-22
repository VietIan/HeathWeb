/**
 * Parser for HSK2 vocabulary lines.
 * Sample input:
 * "86：多数 % duōshù — [ĐA SỐ] — [Majority / Most]: Đa số, phần lớn. Ví dụ: 多数人同意 (Đa số mọi người đồng ý)"
 */

export function parseHSKLine(rawLine, defaultIndex = 1) {
    if (!rawLine || typeof rawLine !== 'string') return null;

    const line = rawLine.trim();
    if (!line) return null;

    let sourceIndex = defaultIndex;
    let textToParse = line;

    // Extract index prefix (e.g., "86：", "86.", "86:")
    const indexMatch = textToParse.match(/^(\d+)[\:\：\.\s\–\—]+/);
    if (indexMatch) {
        sourceIndex = parseInt(indexMatch[1], 10);
        textToParse = textToParse.slice(indexMatch[0].length).trim();
    }

    let hanzi = '';
    let pinyin = '';
    let hanViet = '';
    let meaningEn = '';
    let meaningVi = '';
    let exampleZh = '';
    let exampleVi = '';
    let partOfSpeech = '';
    let usageNote = '';

    // Step 1: Extract Hanzi and Pinyin if delimited by %
    if (textToParse.includes('%')) {
        const parts = textToParse.split('%');
        hanzi = parts[0].trim();
        textToParse = parts.slice(1).join('%').trim();
    }

    // Step 2: Extract HanViet & MeaningEn inside brackets [] or split by — / -
    const bracketMatches = Array.from(textToParse.matchAll(/\[(.*?)\]/g));
    if (bracketMatches.length >= 1) {
        hanViet = bracketMatches[0][1].trim();
    }
    if (bracketMatches.length >= 2) {
        meaningEn = bracketMatches[1][1].trim();
    }

    // Remove brackets from text to parse remainder
    let remainder = textToParse.replace(/\[.*?\]/g, '').trim();

    // Step 3: Split remainder by '—', '–', ':', or '-'
    const remainderParts = remainder.split(/[\—\–\:]+/).map(s => s.trim()).filter(Boolean);

    if (!hanzi && remainderParts.length > 0) {
        const firstToken = remainderParts.shift();
        const spaceParts = firstToken.split(/\s+/);
        hanzi = spaceParts[0] || '';
        pinyin = spaceParts.slice(1).join(' ') || '';
    } else if (hanzi && !pinyin && remainderParts.length > 0) {
        pinyin = remainderParts.shift();
    }

    if (remainderParts.length > 0) {
        let fullMeaningStr = remainderParts.join(' ');
        const exampleSplit = fullMeaningStr.split(/(?:Ví dụ|VD|Eg)\s*[:：]/i);
        if (exampleSplit.length > 1) {
            meaningVi = exampleSplit[0].trim();
            const exampleContent = exampleSplit.slice(1).join(' ').trim();
            const exParenMatch = exampleContent.match(/^(.*?)\s*[\(\（](.*?)[\)\）]$/);
            if (exParenMatch) {
                exampleZh = exParenMatch[1].trim();
                exampleVi = exParenMatch[2].trim();
            } else {
                exampleZh = exampleContent;
            }
        } else {
            meaningVi = fullMeaningStr;
        }
    }

    hanzi = hanzi.replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, '').trim();

    return {
        sourceIndex,
        hanzi: hanzi || '',
        pinyin: pinyin || '',
        hanViet: hanViet || '',
        meaningVi: meaningVi || '',
        meaningEn: meaningEn || '',
        partOfSpeech: partOfSpeech || '',
        usageNote: usageNote || '',
        exampleZh: exampleZh || '',
        exampleVi: exampleVi || '',
        hskLevel: 2,
        tags: ['HSK2'],
        learningStatus: 'new',
        nextReviewAt: new Date().toISOString(),
        reviewCount: 0,
        createdDate: new Date().toISOString().split('T')[0]
    };
}

export function parseBatchHSKText(rawText) {
    if (!rawText || typeof rawText !== 'string') return { validItems: [], errors: [] };

    const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const validItems = [];
    const errors = [];

    lines.forEach((line, idx) => {
        const item = parseHSKLine(line, idx + 1);
        if (item && item.hanzi && item.meaningVi) {
            validItems.push(item);
        } else {
            errors.push({ lineIndex: idx + 1, rawText: line, reason: !item?.hanzi ? 'Thiếu chữ Hán' : 'Thiếu nghĩa Tiếng Việt' });
        }
    });

    return { validItems, errors };
}

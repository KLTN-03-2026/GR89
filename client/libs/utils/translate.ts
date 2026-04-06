// Lightweight translation utilities for single-word lookups

export interface DictionaryDetails {
  word: string
  phonetic?: string
  phonetics?: Array<{ text?: string; audio?: string }>
  translationVi?: string
  meanings?: Array<{
    partOfSpeech?: string
    definitions: string[]
    examples?: string[]
  }>
}

export async function translateWordToVi(word: string): Promise<string> {
  const q = word.trim();
  if (!q) return '';

  // Strategy:
  // 1) Try MyMemory (EN->VI)
  // 2) Fallback to LibreTranslate public instance (EN->VI)

  try {
    const mm = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(q)}&langpair=en|vi`
    );
    if (mm.ok) {
      const data = await mm.json();
      const vi = data?.responseData?.translatedText as string | undefined;
      if (vi && vi.toLowerCase() !== q.toLowerCase()) {
        return vi;
      }
    }
  } catch {
    // ignore
  }

  // LibreTranslate fallback
  try {
    const lt = await fetch('https://libretranslate.de/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q, source: 'en', target: 'vi', format: 'text' })
    });
    if (lt.ok) {
      const data = await lt.json();
      const vi = (data?.translatedText as string | undefined) || '';
      if (vi) return vi;
    }
  } catch {
    // ignore
  }

  return '';
}

export async function fetchWordDetails(word: string): Promise<DictionaryDetails | null> {
  const q = word.trim();
  if (!q) return null;

  const details: DictionaryDetails = { word: q };

  // Vietnamese translation (reuse translateWordToVi)
  try {
    const vi = await translateWordToVi(q);
    if (vi) details.translationVi = vi;
  } catch { }

  // English dictionary details
  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(q)}`);
    if (res.ok) {
      const json = await res.json();
      const entry = json?.[0];
      details.phonetic = entry?.phonetic;
      details.phonetics = entry?.phonetics;
      type RawMeaning = { partOfSpeech?: string; definitions?: Array<{ definition?: string; example?: string }> }
      const meanings: RawMeaning[] = Array.isArray(entry?.meanings) ? entry.meanings : []
      details.meanings = meanings
        .map((m) => ({
          partOfSpeech: m?.partOfSpeech,
          definitions: (m?.definitions || [])
            .map((d) => d?.definition || '')
            .filter((d): d is string => typeof d === 'string' && d.length > 0)
            .slice(0, 3),
          examples: (m?.definitions || [])
            .map((d) => d?.example || '')
            .filter((e): e is string => typeof e === 'string' && e.length > 0)
            .slice(0, 3)
        }))
        .filter((m) => m.definitions && m.definitions.length > 0)
    }
  } catch { }

  return details;
}



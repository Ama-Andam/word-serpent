/** Pure text statistics for the writing arena. No React, easy to test. */
export interface TextStats {
  words: number
  chars: number
  charsNoSpaces: number
  sentences: number
  paragraphs: number
  readingMinutes: number
  avgWordLength: number
  /** Word count of the longest sentence, used by the "short sentences" challenge. */
  longestSentence: number
}

const WORDS_PER_MINUTE_READING = 238

export function countWords(text: string): number {
  const m = text.trim().match(/[\p{L}\p{N}'’-]+/gu)
  return m ? m.length : 0
}

export function getTextStats(text: string): TextStats {
  const wordList = text.trim().match(/[\p{L}\p{N}'’-]+/gu) ?? []
  const words = wordList.length
  const sentenceList = text
    .split(/(?<=[.!?…])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => countWords(s) > 0)
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length
  const letters = wordList.reduce((sum, w) => sum + w.replace(/['’-]/g, '').length, 0)

  return {
    words,
    chars: text.length,
    charsNoSpaces: text.replace(/\s/g, '').length,
    sentences: sentenceList.length,
    paragraphs,
    readingMinutes: words / WORDS_PER_MINUTE_READING,
    avgWordLength: words ? letters / words : 0,
    longestSentence: sentenceList.reduce((max, s) => Math.max(max, countWords(s)), 0),
  }
}

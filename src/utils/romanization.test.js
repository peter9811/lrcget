import { describe, it, expect } from "vitest";
import {
  romanizeJapanese,
  romanizeChinese,
  detectLanguage,
  getRomanizedText,
} from "./romanization";

describe("romanizeJapanese", () => {
  it("should romanize hiragana", () => {
    expect(romanizeJapanese("こんにちは")).toBe("konnichiha");
  });
  it("should romanize katakana", () => {
    expect(romanizeJapanese("コンニチハ")).toBe("konnichiha");
  });
  it("should romanize mixed hiragana and katakana", () => {
    expect(romanizeJapanese("こんにチハ")).toBe("konnichiha");
  });
  it("should pass through kanji", () => {
    expect(romanizeJapanese("日本語")).toBe("日本語"); // wanakana does not romanize kanji by default
    expect(romanizeJapanese("日本")).toBe("日本"); // wanakana does not romanize kanji by default
    expect(romanizeJapanese("東京")).toBe("東京"); // wanakana does not romanize kanji by default
  });
  it("should handle kanji mixed with kana", () => {
    expect(romanizeJapanese("食べ物")).toBe("食be物"); // Kanji not romanized, kana is
    expect(romanizeJapanese("飲み物")).toBe("飲mi物"); // Kanji not romanized, kana is
  });
  it("should preserve English text", () => {
    expect(romanizeJapanese("Hello World")).toBe("Hello World");
  });
  it("should handle mixed English and Japanese", () => {
    expect(romanizeJapanese("Hello こんにちは")).toBe("Hello konnichiha");
  });
  it("should return an empty string for an empty input", () => {
    expect(romanizeJapanese("")).toBe("");
  });
  it("should handle long vowel marks", () => {
    expect(romanizeJapanese("ラーメン")).toBe("raamen"); // Default wanakana behavior for long vowel
    expect(romanizeJapanese("とうきょう")).toBe("toukyou"); // Hiragana long vowel
  });
});

describe("romanizeChinese", () => {
  it("should romanize simple Chinese characters with tone marks (isSimple = false)", () => {
    expect(romanizeChinese("你好", false)).toBe("nǐ hǎo");
  });
  it("should romanize simple Chinese characters without tone marks (isSimple = true)", () => {
    expect(romanizeChinese("你好", true)).toBe("ni hao");
  });
  it("should romanize phrases with tone marks (isSimple = false)", () => {
    expect(romanizeChinese("我爱编程", false)).toBe("wǒ ài biān chéng");
  });
  it("should romanize phrases without tone marks (isSimple = true)", () => {
    expect(romanizeChinese("我爱编程", true)).toBe("wo ai bian cheng");
  });
  it("should handle mixed Chinese and English text with tone marks (isSimple = false)", () => {
    expect(romanizeChinese("我爱coding", false)).toBe("wǒ ài coding");
    expect(romanizeChinese("coding爱我", false)).toBe("coding ài wǒ");
  });
  it("should handle mixed Chinese and English text without tone marks (isSimple = true)", () => {
    expect(romanizeChinese("我爱coding", true)).toBe("wo ai coding");
    expect(romanizeChinese("coding爱我", true)).toBe("coding ai wo");
  });
  it("should return an empty string for an empty input (isSimple = false)", () => {
    expect(romanizeChinese("", false)).toBe("");
  });
  it("should return an empty string for an empty input (isSimple = true)", () => {
    expect(romanizeChinese("", true)).toBe("");
  });
  it("should handle characters with multiple pronunciations with tone marks (isSimple = false)", () => {
    expect(romanizeChinese("银行", false)).toBe("yín háng"); // Common reading
  });
  it("should handle characters with multiple pronunciations without tone marks (isSimple = true)", () => {
    expect(romanizeChinese("银行", true)).toBe("yin hang"); // Common reading
  });
  it("should handle punctuation with tone marks (isSimple = false)", () => {
    expect(romanizeChinese("你好，世界！", false)).toBe("nǐ hǎo ， shì jiè ！"); // pinyin preserves punctuation
  });
  it("should handle punctuation without tone marks (isSimple = true)", () => {
    expect(romanizeChinese("你好，世界！", true)).toBe("ni hao ， shi jie ！"); // pinyin preserves punctuation
  });
});

describe("detectLanguage", () => {
  it("should detect Japanese text (hiragana)", () => {
    expect(detectLanguage("こんにちは")).toBe("ja");
  });
  it("should detect Japanese text (katakana)", () => {
    expect(detectLanguage("コンニチハ")).toBe("ja");
  });
  it("should detect Japanese text (kanji with kana)", () => {
    expect(detectLanguage("日本語を話します")).toBe("ja");
  });
  it("should detect Chinese text (simplified)", () => {
    expect(detectLanguage("你好世界")).toBe("zh");
  });
  it("should detect Chinese text (traditional - if range covers)", () => {
    expect(detectLanguage("你好世界")).toBe("zh"); // Assuming same range or heuristic covers it
  });
  it('should return "unknown" for Korean text (Hangul)', () => {
    expect(detectLanguage("안녕하세요")).toBe("unknown"); // Hangul is outside CJK unified ideographs for basic check
  });
  it('should return "unknown" for English text', () => {
    expect(detectLanguage("Hello world")).toBe("unknown");
  });
  it("should prioritize Japanese if both Kana and Hanzi-like characters are present", () => {
    expect(detectLanguage("こんにちは你好")).toBe("ja");
  });
  it("should detect Chinese if only Hanzi-like characters (no Kana) are present", () => {
    expect(detectLanguage("你好 我好")).toBe("zh");
  });
  it('should return "unknown" for an empty string', () => {
    expect(detectLanguage("")).toBe("unknown");
  });
  it('should return "unknown" for special characters or numbers only', () => {
    expect(detectLanguage("12345 !@#$%")).toBe("unknown");
  });
});

describe("getRomanizedText", () => {
  it('should romanize Japanese text with lang code "ja" (isSimple = false)', () => {
    expect(getRomanizedText("こんにちは", "ja", false)).toBe("konnichiha");
  });
  it('should romanize Japanese text with lang code "ja" (isSimple = true)', () => {
    expect(getRomanizedText("こんにちは", "ja", true)).toBe("konnichiha");
  });
  it('should romanize Chinese text with lang code "zh" with tone marks (isSimple = false)', () => {
    expect(getRomanizedText("你好", "zh", false)).toBe("nǐ hǎo");
  });
  it('should romanize Chinese text with lang code "zh" without tone marks (isSimple = true)', () => {
    expect(getRomanizedText("你好", "zh", true)).toBe("ni hao");
  });
  it('should return original text if Japanese text is given with lang code "zh" (isSimple = false)', () => {
    expect(getRomanizedText("こんにちは", "zh", false)).toBe("こんにちは");
  });
  it('should return original text if Japanese text is given with lang code "zh" (isSimple = true)', () => {
    expect(getRomanizedText("こんにちは", "zh", true)).toBe("こんにちは");
  });
  it('should return original text if Chinese text is given with lang code "ja" (isSimple = false)', () => {
    expect(getRomanizedText("你好", "ja", false)).toBe("你好");
  });
  it('should return original text if Chinese text is given with lang code "ja" (isSimple = true)', () => {
    expect(getRomanizedText("你好", "ja", true)).toBe("你好");
  });
  it("should return original text for an unsupported language code (isSimple = false)", () => {
    expect(getRomanizedText("Hello", "en", false)).toBe("Hello");
    expect(getRomanizedText("안녕하세요", "ko", false)).toBe("안녕하세요");
  });
  it("should return original text for an unsupported language code (isSimple = true)", () => {
    expect(getRomanizedText("Hello", "en", true)).toBe("Hello");
    expect(getRomanizedText("안녕하세요", "ko", true)).toBe("안녕하세요");
  });
  it("should return original text if language is detected but a different code is passed (isSimple = false)", () => {
    expect(getRomanizedText("こんにちは", "zh", false)).toBe("こんにちは"); // Japanese text, but 'zh' code
    expect(getRomanizedText("你好", "ja", false)).toBe("你好"); // Chinese text, but 'ja' code
  });
  it("should return original text if language is detected but a different code is passed (isSimple = true)", () => {
    expect(getRomanizedText("こんにちは", "zh", true)).toBe("こんにちは"); // Japanese text, but 'zh' code
    expect(getRomanizedText("你好", "ja", true)).toBe("你好"); // Chinese text, but 'ja' code
  });
  it("should return an empty string for an empty input, regardless of lang code (isSimple = false)", () => {
    expect(getRomanizedText("", "ja", false)).toBe("");
    expect(getRomanizedText("", "zh", false)).toBe("");
    expect(getRomanizedText("", "en", false)).toBe("");
  });
  it("should return an empty string for an empty input, regardless of lang code (isSimple = true)", () => {
    expect(getRomanizedText("", "ja", true)).toBe("");
    expect(getRomanizedText("", "zh", true)).toBe("");
    expect(getRomanizedText("", "en", true)).toBe("");
  });
});

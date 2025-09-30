import { Settings, Language, Theme, Shape } from './types';

export const TRADITIONAL_CHINESE_CHARS = '的一是了我不人在他有這個上們來到時大地為子中你說生國年著就那和要你我他">';
export const SIMPLIFIED_CHINESE_CHARS = '的一是了我不人在他有这个上们来到时大地为子中你说生国年着就那和要你我他">';
export const ENGLISH_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
export const JAPANESE_CHARS = 'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん';

export const CHAR_SETS: Record<Language, string> = {
  [Language.TraditionalChinese]: TRADITIONAL_CHINESE_CHARS,
  [Language.SimplifiedChinese]: SIMPLIFIED_CHINESE_CHARS,
  [Language.English]: ENGLISH_CHARS,
  [Language.Japanese]: JAPANESE_CHARS,
  [Language.Mixed]: TRADITIONAL_CHINESE_CHARS + ENGLISH_CHARS + JAPANESE_CHARS,
};

export const DEFAULT_SETTINGS: Settings = {
  speed: 0.5,
  rotation: 0.2,
  language: Language.Mixed,
  theme: Theme.Default,
  particleCount: 1500,
  trailIntensity: 0.5,
  shape: Shape.None,
  particleSize: 1.0,
};

export const FONT_SIZE_BASE = 14;
export const TEXT_HOLD_DURATION = 5000; // 5 seconds

export const RANDOM_QUOTES = [
  "Hello World",
  "To be or not to be",
  "Stay hungry, stay foolish",
  "The journey of a thousand miles begins with a single step",
  "學而不思則罔，思而不學則殆",
  "天行健，君子以自強不息",
  "你好世界",
  "道可道，非常道",
];
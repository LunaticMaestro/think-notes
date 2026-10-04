export interface PreprocessConfig {
  /**
   * Convert text to lowercase.
   * Default: true
   */
  lowercase?: boolean;

  /**
   * Remove punctuation/symbols while preserving spaces.
   * Default: true
   */
  removePunctuation?: boolean;

  /**
   * Collapse repeated whitespace.
   * Default: true
   */
  normalizeWhitespace?: boolean;
}
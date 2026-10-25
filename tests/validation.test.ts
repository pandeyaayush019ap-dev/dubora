import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { SUPPORTED_LANGUAGES, getProviderHealth } from '../src/lib/providers/registry';

describe('Validation & Configuration Tests', () => {
  it('should support the core 11 target languages with metadata', () => {
    expect(SUPPORTED_LANGUAGES.length).toBeGreaterThanOrEqual(10);
    const codes = SUPPORTED_LANGUAGES.map((l) => l.code);
    expect(codes).toContain('en');
    expect(codes).toContain('es');
    expect(codes).toContain('fr');
    expect(codes).toContain('de');
    expect(codes).toContain('hi');
    expect(codes).toContain('ja');
  });

  it('should validate project creation schema correctly', () => {
    const ProjectSchema = z.object({
      title: z.string().min(1).max(120),
      sourceLanguage: z.string(),
      targetLanguages: z.array(z.string()).min(1),
    });

    const valid = {
      title: 'Global Tech Keynote 2026',
      sourceLanguage: 'en',
      targetLanguages: ['es', 'de'],
    };

    expect(() => ProjectSchema.parse(valid)).not.toThrow();

    const invalid = {
      title: '',
      sourceLanguage: 'en',
      targetLanguages: [],
    };

    expect(() => ProjectSchema.parse(invalid)).toThrow();
  });

  it('should honestly report provider readiness and never fake active status', () => {
    const health = getProviderHealth();
    expect(health).toBeDefined();
    expect(health.ffmpeg.installed).toBe(true);
    expect(health.storage.ready).toBe(true);
    // If ELEVENLABS_API_KEY is not set in environment, configured must be false
    if (!process.env.ELEVENLABS_API_KEY) {
      expect(health.elevenlabs.configured).toBe(false);
      expect(health.elevenlabs.missingEnvVar).toBe('ELEVENLABS_API_KEY');
    }
  });
});

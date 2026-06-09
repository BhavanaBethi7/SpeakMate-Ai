/**
 * Calls the Python voice analysis microservice (librosa-based).
 * Falls back gracefully if the service is unavailable.
 */

export type VoiceAnalysisResult = {
  duration_seconds: number;
  pitch: {
    mean_hz: number;
    std_hz: number;
    range_hz: number;
    variance_score: number;
    monotone: boolean;
  };
  energy: {
    mean: number;
    stability_score: number;
  };
  pauses: {
    count: number;
    total_seconds: number;
    ratio: number;
    score: number;
  };
  speaking_rate: {
    estimated_wpm: number;
    optimal: boolean;
  };
  scores: {
    confidence: number;
    nervousness: number;
    voice_quality: number;
    audio_based: true;
  };
};

export async function analyzeVoice(audio: File | Blob, filename = "recording.webm"): Promise<VoiceAnalysisResult | null> {
  const serviceUrl = process.env.VOICE_ANALYSIS_URL;
  if (!serviceUrl) return null; // service not configured — silently skip

  try {
    const formData = new FormData();
    const file = audio instanceof File ? audio : new File([audio], filename, { type: audio.type });
    formData.append("audio", file);

    const response = await fetch(`${serviceUrl}/analyze`, {
      method: "POST",
      body: formData,
      signal: AbortSignal.timeout(15000), // 15s timeout
    });

    if (!response.ok) return null;
    return await response.json() as VoiceAnalysisResult;
  } catch (error) {
    console.error("Voice analysis service unavailable:", error);
    return null; // graceful fallback
  }
}

/**
 * Merges real audio scores into the text-based analysis.
 * Audio scores are trusted more than formula-based text scores for
 * confidence and nervousness — but text scores for structure and vocabulary.
 */
export function mergeVoiceAnalysis(
  textAnalysis: import("@/lib/types").SpeechAnalysis,
  voice: VoiceAnalysisResult,
): import("@/lib/types").SpeechAnalysis {
  const merged = { ...textAnalysis };

  // Override confidence/nervousness with real audio-based scores
  merged.confidence = {
    ...textAnalysis.confidence,
    score: Math.round(voice.scores.confidence * 0.6 + textAnalysis.confidence.score * 0.4),
    nervousness: Math.round(voice.scores.nervousness * 0.6 + textAnalysis.confidence.nervousness * 0.4),
  };

  // Override fluency with real pause data
  merged.fluency = {
    ...textAnalysis.fluency,
    score: Math.round(voice.pauses.score * 0.5 + textAnalysis.fluency.score * 0.5),
    pauseFrequency: voice.pauses.count,
    continuity: voice.pauses.score,
  };

  // Speaking speed from audio is more accurate than word count estimate
  merged.speakingSpeed = {
    ...textAnalysis.speakingSpeed,
    wordsPerMinute: voice.speaking_rate.estimated_wpm,
    optimal: voice.speaking_rate.optimal,
  };

  // Clarity gets a boost from voice quality score
  merged.clarity = {
    ...textAnalysis.clarity,
    score: Math.round(voice.scores.voice_quality * 0.4 + textAnalysis.clarity.score * 0.6),
    speechQuality: voice.scores.voice_quality,
  };

  // Add voice-specific emotion data
  merged.emotions = {
    ...textAnalysis.emotions,
    nervousness: voice.scores.nervousness,
    confidence: voice.scores.confidence,
    monotone: voice.pitch.monotone
      ? Math.max(textAnalysis.emotions.monotone, 70)
      : Math.min(textAnalysis.emotions.monotone, 40),
  };

  // Recompute overall with merged scores
  merged.overallScore = Math.round(
    merged.clarity.score * 0.15 +
    merged.fluency.score * 0.15 +
    merged.fillerWords.score * 0.15 +
    merged.speakingSpeed.score * 0.10 +
    merged.vocabulary.score * 0.15 +
    merged.structure.score * 0.15 +
    merged.confidence.score * 0.15,
  );

  // Tag the result so UI knows real audio was used
  (merged as any).voiceAnalyzed = true;
  (merged as any).pitchData = voice.pitch;

  return merged;
}

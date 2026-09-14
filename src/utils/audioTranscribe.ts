/**
 * Audio transcription helper utilizing server-side Gemini 3.5 Transcribe
 */

export interface TranscriptionResult {
  text: string;
  durationSeconds?: number;
  mimeType: string;
}

export async function transcribeAudioBlob(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64Audio = reader.result as string;
        const res = await fetch('/api/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audioData: base64Audio,
            mimeType: blob.type || 'audio/webm',
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Transcription failed with status ${res.status}`);
        }

        const data = await res.json();
        resolve(data.transcription || '');
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read audio data'));
    reader.readAsDataURL(blob);
  });
}

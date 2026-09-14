import React, { useState, useRef, useEffect } from 'react';
import { transcribeAudioBlob } from '../utils/audioTranscribe';
import { addSavedItemToFirestore } from '../firebase';
import { Mic, Square, RefreshCw, X, Copy, Check, FileText, Sparkles, AlertCircle } from 'lucide-react';

interface AudioTranscriberModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  onInsertText?: (text: string) => void;
}

export const AudioTranscriberModal: React.FC<AudioTranscriberModalProps> = ({
  isOpen,
  onClose,
  userId,
  onInsertText,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      setRecordingSeconds(0);
      setTranscribedText('');
      setErrorMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const startRecording = async () => {
    setErrorMessage(null);
    setTranscribedText('');
    setSavedSuccess(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        if (audioChunksRef.current.length === 0) return;

        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType || 'audio/webm',
        });

        setIsTranscribing(true);
        try {
          const text = await transcribeAudioBlob(audioBlob);
          if (text) {
            setTranscribedText(text);
          } else {
            setErrorMessage('No audible speech detected. Please speak clearly into your microphone.');
          }
        } catch (err: any) {
          console.error('Audio transcription failed:', err);
          setErrorMessage(err?.message || 'Transcription error with gemini-3.5-transcribe');
        } finally {
          setIsTranscribing(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Microphone access denied:', err);
      setErrorMessage('Microphone access denied. Please grant permission in your browser.');
    }
  };

  const stopRecording = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleCopy = () => {
    if (!transcribedText) return;
    navigator.clipboard.writeText(transcribedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToFirestore = async () => {
    if (!userId || !transcribedText) return;
    try {
      await addSavedItemToFirestore(userId, {
        title: `Voice Transcript (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
        content: transcribedText,
        category: 'note',
        tags: ['voice', 'gemini-transcribe', 'audio'],
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Save to Firestore error:', err);
    }
  };

  const handleUseText = () => {
    if (onInsertText && transcribedText) {
      onInsertText(transcribedText);
      onClose();
    }
  };

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 relative animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-[#EAF3FF] text-[#1976D2] flex items-center justify-center shadow-xs">
            <Mic size={22} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Audio Transcription</h3>
            <p className="text-xs text-slate-500">
              Powered by <strong>gemini-3.5-transcribe</strong>
            </p>
          </div>
        </div>

        {/* Recording Control Canvas */}
        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col items-center justify-center text-center my-4">
          {isRecording ? (
            <div className="space-y-4">
              <div className="relative flex items-center justify-center">
                <span className="absolute w-20 h-20 rounded-full bg-red-400/20 animate-ping"></span>
                <div className="w-16 h-16 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg">
                  <Mic size={28} />
                </div>
              </div>

              <div>
                <p className="text-xl font-bold font-mono text-red-600">{formatTime(recordingSeconds)}</p>
                <p className="text-xs text-slate-500">Listening to your microphone...</p>
              </div>

              <button
                onClick={stopRecording}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-2 shadow-sm cursor-pointer mx-auto"
              >
                <Square size={14} fill="currentColor" />
                <span>Stop & Transcribe</span>
              </button>
            </div>
          ) : isTranscribing ? (
            <div className="py-6 space-y-3">
              <RefreshCw size={32} className="text-[#1976D2] animate-spin mx-auto" />
              <p className="text-xs font-semibold text-slate-700">
                Transcribing with gemini-3.5-transcribe...
              </p>
              <p className="text-[11px] text-slate-400">Processing audio via server-side Gemini</p>
            </div>
          ) : (
            <div className="py-4 space-y-3">
              <button
                onClick={startRecording}
                className="w-16 h-16 rounded-full bg-[#1976D2] hover:bg-blue-600 text-white flex items-center justify-center shadow-md transition-all active:scale-95 cursor-pointer mx-auto"
              >
                <Mic size={26} />
              </button>
              <div>
                <p className="text-xs font-bold text-slate-800">Click to Start Recording</p>
                <p className="text-[11px] text-slate-500">Record speech, meetings, or quick thoughts</p>
              </div>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Transcribed Text Output */}
        {transcribedText && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles size={13} className="text-amber-500" /> Transcribed Text
              </span>
              <span className="text-[10px] text-slate-400">Model: gemini-3.5-transcribe</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 max-h-40 overflow-y-auto leading-relaxed whitespace-pre-wrap">
              {transcribedText}
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs text-slate-700 font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                {userId && (
                  <button
                    onClick={handleSaveToFirestore}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs text-slate-700 font-medium flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileText size={13} />
                    <span>{savedSuccess ? 'Saved!' : 'Save as Note'}</span>
                  </button>
                )}
              </div>

              {onInsertText && (
                <button
                  onClick={handleUseText}
                  className="px-4 py-1.5 rounded-xl bg-[#1976D2] hover:bg-blue-600 text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Insert Text
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

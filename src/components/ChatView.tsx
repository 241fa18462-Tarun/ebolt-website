import React, { useState, useEffect, useRef } from 'react';
import {
  UserProfile,
  ChatMessage,
  subscribeToChatMessages,
  addChatMessageToFirestore,
  clearChatMessagesFromFirestore,
  addSavedItemToFirestore
} from '../firebase';
import { transcribeAudioBlob } from '../utils/audioTranscribe';
import {
  Bot,
  Send,
  Mic,
  Square,
  Sparkles,
  Trash2,
  Settings2,
  RefreshCw,
  User,
  Zap,
  Cpu,
  Brain,
  FileText,
  Copy,
  Check,
  Volume2,
  ArrowLeft
} from 'lucide-react';

interface ChatViewProps {
  user: UserProfile | null;
  initialPrompt?: string;
  onNavigateToMenu?: () => void;
  onBack?: () => void;
}

interface ChatRole {
  id: string;
  name: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  defaultModel: 'gemini-3.5-flash' | 'gemini-3.1-flash-lite' | 'gemini-3.1-pro-preview';
  badge: string;
  systemInstruction: string;
  greeting: string;
}

const CHAT_ROLES: ChatRole[] = [
  {
    id: 'general',
    name: 'General Assistant',
    icon: Bot,
    defaultModel: 'gemini-3.5-flash',
    badge: 'General Tasks',
    systemInstruction:
      'You are Ebolt Assistant, an intelligent, versatile AI helper inside the Ebolt workspace. Help users organize documents, write effectively, synthesize information, and answer general questions with precision and clarity.',
    greeting: "Hello! I'm your Ebolt general assistant. How can I help you today?",
  },
  {
    id: 'complex',
    name: 'Deep Research & Analysis',
    icon: Brain,
    defaultModel: 'gemini-3.1-pro-preview',
    badge: 'Complex Tasks',
    systemInstruction:
      'You are a senior research analyst and intellectual partner. Analyze topics thoroughly with structured reasoning, counter-arguments, nuanced insights, and detailed explanations.',
    greeting: "Ready for deep analysis. What complex topic or problem would you like to explore?",
  },
  {
    id: 'fast',
    name: 'Rapid Quick-Helper',
    icon: Zap,
    defaultModel: 'gemini-3.1-flash-lite',
    badge: 'Fast Tasks',
    systemInstruction:
      'You are an ultra-fast, concise assistant. Provide direct, succinct answers without unnecessary filler. Emphasize bullet points and immediate clarity.',
    greeting: 'Fast mode active. Ask me anything for instant, concise answers.',
  },
  {
    id: 'architect',
    name: 'Code & Systems Architect',
    icon: Cpu,
    defaultModel: 'gemini-3.1-pro-preview',
    badge: 'Complex Tasks',
    systemInstruction:
      'You are a principal software architect. Provide production-ready code, architectural designs, bug diagnosis, and performance optimization with cleanest modern standards.',
    greeting: 'Architect ready. Share your coding challenges, architecture questions, or algorithms.',
  },
];

export const ChatView: React.FC<ChatViewProps> = ({
  user,
  initialPrompt,
  onNavigateToMenu,
  onBack,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState(initialPrompt || '');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<ChatRole>(CHAT_ROLES[0]);
  const [selectedModel, setSelectedModel] = useState<'gemini-3.5-flash' | 'gemini-3.1-flash-lite' | 'gemini-3.1-pro-preview'>('gemini-3.5-flash');
  const [customSystemPrompt, setCustomSystemPrompt] = useState('');
  const [showRoleConfig, setShowRoleConfig] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Audio Recording & Transcription State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null);
  const [saveNoteSuccess, setSaveNoteSuccess] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Real-time synchronization with Firestore
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = subscribeToChatMessages(user.uid, (syncedMessages) => {
      if (syncedMessages.length > 0) {
        setMessages(syncedMessages);
      } else {
        // Default initial greeting if no messages yet
        setMessages([
          {
            id: 'init-greeting',
            role: 'model',
            content: selectedRole.greeting,
            timestamp: new Date().toISOString(),
            modelUsed: selectedModel,
          },
        ]);
      }
    });

    return () => unsubscribe();
  }, [user?.uid, selectedRole.greeting]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, isTranscribing]);

  // Clean up audio recorder on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const handleRoleChange = (role: ChatRole) => {
    setSelectedRole(role);
    setSelectedModel(role.defaultModel);
    setCustomSystemPrompt('');
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend !== undefined ? textToSend : inputText).trim();
    if (!text || isLoading) return;

    setInputText('');
    const userMsg: ChatMessage = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setIsLoading(true);

    // Save to Firestore if user logged in
    if (user?.uid) {
      addChatMessageToFirestore(user.uid, userMsg);
    }

    try {
      const activeSystemInstruction = customSystemPrompt.trim() || selectedRole.systemInstruction;
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          systemInstruction: activeSystemInstruction,
          model: selectedModel,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Server returned an error');
      }

      const data = await res.json();
      const botMsg: ChatMessage = {
        role: 'model',
        content: data.reply || 'No response generated.',
        timestamp: new Date().toISOString(),
        modelUsed: data.modelUsed || selectedModel,
      };

      setMessages((prev) => [...prev, botMsg]);

      if (user?.uid) {
        addChatMessageToFirestore(user.uid, botMsg);
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        role: 'model',
        content: `Error: ${err?.message || 'Failed to connect to Gemini API. Please verify server connection.'}`,
        timestamp: new Date().toISOString(),
        modelUsed: selectedModel,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Audio Recording Handler with model gemini-3.5-transcribe
  const startRecording = async () => {
    setTranscriptionError(null);
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
          const transcribedText = await transcribeAudioBlob(audioBlob);
          if (transcribedText) {
            setInputText((prev) => (prev ? `${prev} ${transcribedText}` : transcribedText));
          } else {
            setTranscriptionError('No speech was detected. Please try speaking closer to the microphone.');
          }
        } catch (err: any) {
          console.error('Transcription error:', err);
          setTranscriptionError(err?.message || 'Transcription failed. Please check microphone permission.');
        } finally {
          setIsTranscribing(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((sec) => sec + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Microphone error:', err);
      setTranscriptionError('Could not access microphone. Please grant permission in browser settings.');
    }
  };

  const stopRecording = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleClearHistory = async () => {
    if (user?.uid) {
      await clearChatMessagesFromFirestore(user.uid);
    }
    setMessages([
      {
        id: 'new-greeting',
        role: 'model',
        content: selectedRole.greeting,
        timestamp: new Date().toISOString(),
        modelUsed: selectedModel,
      },
    ]);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveToNotes = async (content: string) => {
    if (!user?.uid) return;
    try {
      await addSavedItemToFirestore(user.uid, {
        title: `AI Note: ${content.slice(0, 30)}...`,
        content,
        category: 'note',
        tags: ['gemini', selectedRole.id],
      });
      setSaveNoteSuccess('Saved to Menu > Notes!');
      setTimeout(() => setSaveNoteSuccess(null), 3000);
    } catch (err) {
      console.error('Could not save note:', err);
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F5F8FA] overflow-hidden pb-16 md:pb-0">
      {/* Top Bar with Role & Model Selection */}
      <div className="p-3 sm:p-4 sm:px-6 bg-white border-b border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 sm:gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
              title="Back to Home"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Back</span>
            </button>
          )}
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#EAF3FF] text-[#1976D2] flex items-center justify-center shadow-xs flex-shrink-0">
            <Bot size={20} />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900">Gemini AI</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EAF3FF] text-[#1976D2]">
                {selectedModel}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Role: <span className="font-semibold text-slate-700">{selectedRole.name}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Role selector dropdown pills */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {CHAT_ROLES.map((role) => {
              const Icon = role.icon;
              const isCurrent = selectedRole.id === role.id;
              return (
                <button
                  key={role.id}
                  onClick={() => handleRoleChange(role)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-white text-[#1976D2] shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Icon size={13} />
                  <span>{role.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Model Switcher */}
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value as any)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-medium text-slate-700 cursor-pointer focus:outline-none focus:border-[#1976D2]"
          >
            <option value="gemini-3.5-flash">gemini-3.5-flash (General Tasks)</option>
            <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Fast Tasks)</option>
            <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Complex Tasks)</option>
          </select>

          <button
            onClick={() => setShowRoleConfig(!showRoleConfig)}
            title="Configure System Instructions"
            className="p-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
          >
            <Settings2 size={16} />
          </button>

          <button
            onClick={handleClearHistory}
            title="Clear Chat History"
            className="p-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-red-50 hover:text-red-600 text-slate-600 transition-colors cursor-pointer"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Expandable System Instruction Drawer */}
      {showRoleConfig && (
        <div className="p-4 bg-white border-b border-slate-200 shadow-inner text-xs space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-500" /> System Instruction / Bot Role
            </span>
            <span className="text-slate-400">Controls behavior and voice</span>
          </div>
          <textarea
            rows={2}
            value={customSystemPrompt || selectedRole.systemInstruction}
            onChange={(e) => setCustomSystemPrompt(e.target.value)}
            placeholder="Type custom system instructions here..."
            className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-700 font-mono focus:outline-none focus:border-[#1976D2]"
          />
          <div className="flex justify-between items-center text-[11px] text-slate-500">
            <span>Model: {selectedModel} | Role: {selectedRole.name}</span>
            {customSystemPrompt && (
              <button
                onClick={() => setCustomSystemPrompt('')}
                className="text-[#1976D2] hover:underline"
              >
                Reset to default
              </button>
            )}
          </div>
        </div>
      )}

      {/* Notifications */}
      {saveNoteSuccess && (
        <div className="mx-4 mt-2 p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center justify-between">
          <span>{saveNoteSuccess}</span>
        </div>
      )}

      {transcriptionError && (
        <div className="mx-4 mt-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between">
          <span>{transcriptionError}</span>
          <button onClick={() => setTranscriptionError(null)} className="font-bold text-amber-900 px-1">✕</button>
        </div>
      )}

      {/* Scrollable Conversation Thread */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id || index}
              className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold ${
                  isUser
                    ? 'bg-slate-900'
                    : 'bg-[#1976D2] shadow-sm'
                }`}
              >
                {isUser ? (
                  user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="User" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <User size={14} />
                  )
                ) : (
                  <Bot size={16} />
                )}
              </div>

              {/* Message Bubble */}
              <div className="space-y-1 max-w-[85%]">
                <div
                  className={`p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                    isUser
                      ? 'bg-[#1976D2] text-white rounded-tr-none shadow-xs'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none shadow-2xs'
                  }`}
                >
                  {msg.content}
                </div>

                {/* Message Footer Actions */}
                <div className={`flex items-center gap-2 px-1 text-[10px] text-slate-400 ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {msg.modelUsed && !isUser && (
                    <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 font-mono">
                      {msg.modelUsed}
                    </span>
                  )}
                  {!isUser && (
                    <>
                      <button
                        onClick={() => handleCopy(msg.content, msg.id || String(index))}
                        title="Copy text"
                        className="hover:text-slate-700 p-0.5 cursor-pointer"
                      >
                        {copiedId === (msg.id || String(index)) ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                      </button>
                      <button
                        onClick={() => handleSaveToNotes(msg.content)}
                        title="Save to Menu Notes"
                        className="hover:text-slate-700 p-0.5 cursor-pointer flex items-center gap-0.5"
                      >
                        <FileText size={12} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Spinner / Skeleton */}
        {isLoading && (
          <div className="flex gap-3 max-w-md mr-auto">
            <div className="w-8 h-8 rounded-full bg-[#1976D2] text-white flex items-center justify-center shadow-sm">
              <Bot size={16} className="animate-spin" />
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 rounded-tl-none shadow-2xs flex items-center gap-2 text-xs text-slate-500">
              <div className="w-2 h-2 rounded-full bg-[#1976D2] animate-bounce"></div>
              <div className="w-2 h-2 rounded-full bg-[#1976D2] animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-2 h-2 rounded-full bg-[#1976D2] animate-bounce [animation-delay:0.4s]"></div>
              <span className="ml-1 font-medium text-slate-600">Gemini is thinking ({selectedModel})...</span>
            </div>
          </div>
        )}

        {/* Audio Transcribing Indicator */}
        {isTranscribing && (
          <div className="flex items-center gap-2 p-3 bg-[#EAF3FF] border border-blue-200 rounded-2xl text-xs text-[#1976D2] max-w-sm">
            <RefreshCw size={14} className="animate-spin" />
            <span>Transcribing your audio with <strong>gemini-3.5-transcribe</strong>...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar with Audio Microphone Transcription Button */}
      <div className="p-4 sm:px-6 bg-white border-t border-slate-200">
        {/* If currently recording audio */}
        {isRecording ? (
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-red-50 border border-red-200 animate-pulse">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-red-600 animate-ping"></span>
              <span className="text-xs font-bold text-red-700">
                Recording audio ({formatSeconds(recordingSeconds)})...
              </span>
              <span className="text-[11px] text-red-600 hidden sm:inline">
                Speak clearly, will transcribe with <strong>gemini-3.5-transcribe</strong>
              </span>
            </div>

            <button
              onClick={stopRecording}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
            >
              <Square size={13} fill="currentColor" />
              <span>Stop & Transcribe</span>
            </button>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            {/* Microphone Button */}
            <button
              type="button"
              onClick={startRecording}
              disabled={isTranscribing}
              title="Transcribe Audio with gemini-3.5-transcribe"
              className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-[#EAF3FF] text-slate-600 hover:text-[#1976D2] border border-slate-200 flex items-center justify-center transition-all cursor-pointer disabled:opacity-50"
            >
              <Mic size={18} />
            </button>

            {/* Chat Input Text Field */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Ask ${selectedRole.name} anything... (or click mic to dictate)`}
              disabled={isLoading || isTranscribing}
              className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1976D2] focus:bg-white transition-all"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="w-10 h-10 rounded-2xl bg-[#1976D2] hover:bg-blue-600 disabled:bg-slate-200 disabled:text-slate-400 text-white flex items-center justify-center transition-all shadow-xs cursor-pointer disabled:cursor-not-allowed"
            >
              <Send size={16} />
            </button>
          </form>
        )}

        <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400 px-1">
          <span>Supported models: gemini-3.5-flash, gemini-3.1-flash-lite, gemini-3.1-pro-preview</span>
          <span>Audio transcribed via <strong>gemini-3.5-transcribe</strong></span>
        </div>
      </div>
    </div>
  );
};

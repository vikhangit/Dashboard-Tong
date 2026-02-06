"use client";

import { Mic, Square, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVoiceRecorder } from "@/hooks/use-voice-recorder";

interface VoiceRecorderProps {
  onRecordingComplete: (transcript: string, audioBlob?: Blob) => void;
  className?: string;
  isParentProcessing?: boolean;
}

export function VoiceRecorder({
  onRecordingComplete,
  className = "",
  isParentProcessing = false,
}: VoiceRecorderProps) {
  const { isRecording, startRecording, stopRecording } = useVoiceRecorder({
    onRecordingComplete: (audioBlob) => {
      onRecordingComplete("", audioBlob);
    },
  });

  const isProcessing = isParentProcessing;

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Glow effect - Only show when recording */}
      {isRecording && (
        <div className="absolute inset-0 rounded-full bg-red-500/10 blur-xl animate-pulse" />
      )}

      {/* Main button */}
      <Button
        size="lg"
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isProcessing}
        className={`
          relative z-10 h-48 w-48 rounded-full border-4 border-white/50 text-lg font-semibold
          shadow-2xl transition-all duration-300 overflow-hidden
          ${
            isRecording
              ? "bg-gradient-to-br from-red-500 to-pink-600 scale-105 border-red-200/50"
              : isProcessing
                ? "bg-gradient-to-br from-blue-400 to-cyan-500 animate-pulse"
                : "bg-gradient-to-br from-purple-400 via-blue-400 to-green-400 hover:scale-105"
          }
        `}
      >
        <div className="flex flex-col items-center gap-3 z-20">
          {isRecording ? (
            <>
              {/* Sound Wave Visualization */}
              <div className="flex items-center justify-center gap-1 h-12 mb-1">
                <div
                  className="w-1.5 bg-white/90 rounded-full animate-sound-wave"
                  style={{ animationDelay: "0.1s", height: "40%" }}
                ></div>
                <div
                  className="w-1.5 bg-white/90 rounded-full animate-sound-wave"
                  style={{ animationDelay: "0.2s", height: "100%" }}
                ></div>
                <div
                  className="w-1.5 bg-white/90 rounded-full animate-sound-wave"
                  style={{ animationDelay: "0.0s", height: "60%" }}
                ></div>
                <div
                  className="w-1.5 bg-white/90 rounded-full animate-sound-wave"
                  style={{ animationDelay: "0.3s", height: "80%" }}
                ></div>
                <div
                  className="w-1.5 bg-white/90 rounded-full animate-sound-wave"
                  style={{ animationDelay: "0.1s", height: "50%" }}
                ></div>
              </div>
              <span className="text-sm font-bold tracking-wider">
                ĐANG NGHE...
              </span>
            </>
          ) : isProcessing || isParentProcessing ? (
            <>
              <Loader2 className="size-8 animate-spin" />
              <span className="text-sm">Đang phân tích...</span>
            </>
          ) : (
            <>
              <Mic className="size-12" />
              <span className="text-sm">Nói để chỉ đạo...</span>
            </>
          )}
        </div>
      </Button>
    </div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        // Instead of processing text immediately, we pass the blob up
        // or we could handle it here, but the props say 'transcript: string'
        // Let's modify the requirement: we need to pass the BLOB, or handle async logic here.
        // But the prop `onRecordingComplete` expects a transcript string immediately in current interface?
        // Wait, current interface is `(transcript: string) => void`.
        // We probably need to change the prop signature OR change how this works.
        // Actually, let's keep it simple: We will do the API call HERE if we want to extract text,
        // OR we change the parent to accept a Blob.
        // The Plan said: "Update onRecordingComplete signature to return audioBlob"
        // Let's coerce TS for a moment or better update the interface in the file.

        // Actually, let's just pass the blob to the parent if the parent is updated.
        // But the parent expects a string right now.
        // Let's do a quick hack: we will emit an empty string + the blob, OR we change the interface now.
        // I will update the interface right above this function first.

        onRecordingComplete("", audioBlob);
        setIsRecording(false);
        setIsProcessing(false);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Không thể truy cập microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      setIsProcessing(true); // temporary state before "stop" event fires
      mediaRecorderRef.current.stop();
    }
  };

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

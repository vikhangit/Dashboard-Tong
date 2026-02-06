"use client";

import { useState, useRef, useCallback } from "react";

interface UseVoiceRecorderProps {
  onRecordingComplete?: (audioBlob: Blob) => void;
  onError?: (error: Error) => void;
}

export function useVoiceRecorder({
  onRecordingComplete,
  onTranscriptionComplete,
  onError,
}: UseVoiceRecorderProps & {
  onTranscriptionComplete?: (text: string) => void;
} = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
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

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        if (onRecordingComplete) {
          onRecordingComplete(audioBlob);
        }

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
        setIsRecording(false);

        // Handle transcription if callback is provided
        if (onTranscriptionComplete) {
          setIsTranscribing(true);
          try {
            const formData = new FormData();
            formData.append("file", audioBlob);

            const res = await fetch("/api/transcribe", {
              method: "POST",
              body: formData,
            });

            const data = await res.json();
            if (data.text) {
              onTranscriptionComplete(data.text);
            }
          } catch (err) {
            console.error("Transcription failed", err);
            if (onError && err instanceof Error) {
              onError(err);
            }
          } finally {
            setIsTranscribing(false);
          }
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      if (onError && err instanceof Error) {
        onError(err);
      } else {
        alert("Không thể truy cập microphone.");
      }
      setIsRecording(false);
    }
  }, [onRecordingComplete, onTranscriptionComplete, onError]);

  const stopRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
      // setIsRecording(false) is handled in onstop
    }
  }, []);

  return {
    isRecording,
    isTranscribing,
    startRecording,
    stopRecording,
  };
}

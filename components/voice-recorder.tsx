'use client';

import { useState, useRef } from 'react';
import { Mic, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VoiceRecorderProps {
  onRecordingComplete: (transcript: string, audioBlob?: Blob) => void;
}

export function VoiceRecorder({ onRecordingComplete }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setIsProcessing(true);

        try {
          // In production, send audio to AI transcription service
          // const formData = new FormData();
          // formData.append('audio', audioBlob);
          // const response = await fetch('/api/ai/transcribe', {
          //   method: 'POST',
          //   body: formData
          // });
          // const { text } = await response.json();

          // For now, simulate AI processing
          setTimeout(() => {
            const mockTranscript = 'Hoàn thành báo cáo và gửi email cho khách hàng trước 5pm';
            onRecordingComplete(mockTranscript, audioBlob);
            setIsProcessing(false);
          }, 1500);
        } catch (error) {
          console.error('[v0] Error processing audio:', error);
          setIsProcessing(false);
        }

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('[v0] Error starting recording:', error);
      alert('Không thể truy cập microphone. Vui lòng kiểm tra quyền truy cập.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* Animated rings */}
      <div className={`absolute inset-0 rounded-full border-4 border-primary/30 ${isRecording ? 'animate-ping' : ''}`} 
           style={{ animationDuration: '2s' }} />
      <div className={`absolute inset-2 rounded-full border-2 border-accent/40 ${isRecording ? 'animate-pulse' : ''}`} />
      
      {/* Holographic orb background */}
      <div className="absolute inset-0 rounded-full gradient-orb animate-pulse-slow" />
      
      {/* Main button */}
      <Button
        size="lg"
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isProcessing}
        className={`
          relative z-10 h-48 w-48 rounded-full border-4 border-white/50 text-lg font-semibold
          shadow-2xl transition-all duration-300
          ${isRecording 
            ? 'bg-gradient-to-br from-red-400 to-pink-500 hover:from-red-500 hover:to-pink-600 scale-105' 
            : isProcessing
            ? 'bg-gradient-to-br from-blue-400 to-cyan-500 animate-pulse'
            : 'bg-gradient-to-br from-purple-400 via-blue-400 to-green-400 hover:scale-105'
          }
        `}
      >
        <div className="flex flex-col items-center gap-2">
          {isRecording ? (
            <>
              <Square className="h-12 w-12 fill-current" />
              <span className="text-sm">Dừng lại</span>
            </>
          ) : isProcessing ? (
            <>
              <div className="h-12 w-12 rounded-full border-4 border-white/50 border-t-white animate-spin" />
              <span className="text-sm">Đang xử lý...</span>
            </>
          ) : (
            <>
              <Mic className="h-12 w-12" />
              <span className="text-sm">Bấm để bắt đầu...</span>
            </>
          )}
        </div>
      </Button>
    </div>
  );
}

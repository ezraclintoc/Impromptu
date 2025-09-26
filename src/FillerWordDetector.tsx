"use client";

import { useEffect, useRef, useState } from "react";

export default function FillerWordDetector() {
  const [counter, setCounter] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const FILLER_WORDS = ["um", "uh"];

  const playBuzz = () => {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    oscillator.frequency.value = 400;
    oscillator.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.2);
  };

  useEffect(() => {
    if (!isRecording) return;

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000); // 1-second chunks

      mediaRecorder.ondataavailable = async (e) => {
        if (!e.data || e.data.size === 0) return;

        const formData = new FormData();
        formData.append("audio", e.data, "chunk.wav");

        try {
          const response = await fetch("/api/transcribe", {
            method: "POST",
            body: formData
          });

          const data = await response.json();
          const text: string = data.transcript.toLowerCase();
          setTranscript((prev) => prev + " " + text);

          FILLER_WORDS.forEach((word) => {
            const count = text.split(word).length - 1;
            if (count > 0) {
              setCounter((prev) => prev + count);
              playBuzz();
            }
          });
        } catch (err) {
          console.error(err);
        }
      };
    });

    return () => {
      mediaRecorderRef.current?.stop();
    };
  }, [isRecording]);

  return (
    <div className="p-6 bg-white/20 backdrop-blur-md rounded-xl text-black space-y-4">
      <h2 className="text-xl font-bold">Filler Word Detector</h2>

      <div className="p-3 bg-gray-100 rounded-lg min-h-[80px] max-h-40 overflow-y-auto">
        {transcript || <p className="text-gray-500">Start speaking…</p>}
      </div>

      <p>Filler Words Count: {counter}</p>

      <button
        className={`px-4 py-2 rounded-lg font-semibold shadow-md transition ${
          isRecording ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
        }`}
        onClick={() => setIsRecording((prev) => !prev)}
      >
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>
    </div>
  );
}

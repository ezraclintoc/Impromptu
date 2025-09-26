import React, { useState, useEffect, useRef } from "react";

interface TimerProps {
  prepMinutes?: number;
  speechMinutes?: number;
}

const Timer: React.FC<TimerProps> = ({ prepMinutes = 2, speechMinutes = 5 }) => {
  const [timeLeft, setTimeLeft] = useState(prepMinutes * 60); // seconds
  const [phase, setPhase] = useState<"prep" | "speech" | "done">("prep");
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Format seconds → mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Handle timer ticking
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (phase === "prep") {
              setPhase("speech");
              return speechMinutes * 60; // reset for speech
            } else if (phase === "speech") {
              setPhase("done");
              setIsRunning(false);
              return 0;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, phase, speechMinutes]);

  // Reset when prep/speech values change
  useEffect(() => {
    setPhase("prep");
    setTimeLeft(prepMinutes * 60);
    setIsRunning(false);
  }, [prepMinutes, speechMinutes]);

  const toggleTimer = () => {
    if (phase === "done") {
      // Reset if finished
      setPhase("prep");
      setTimeLeft(prepMinutes * 60);
    }
    setIsRunning((prev) => !prev);
  };

  return (
    <div className="p-6 bg-white/20 rounded-2xl shadow-lg text-center w-72 border border-white/30">
      <h2 className="text-xl font-bold mb-4 text-white hover">
        {phase === "prep" && "Prep Time"}
        {phase === "speech" && "Speech Time"}
        {phase === "done" && "Finished"}
      </h2>

      <p className="text-4xl font-mono mb-6 hover text-white">{formatTime(timeLeft)}</p>

      {phase !== "done" ? (
        <button
          onClick={toggleTimer}
          className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition hover"
        >
          {isRunning ? "Pause" : "Start"}
        </button>
      ) : (
        <p className="text-green-600 font-semibold">Great job!</p>
      )}
    </div>
  );
};

export default Timer;

import { useState, useEffect, useCallback } from 'react';

export const useCountdown = (initialTime: number) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const isActive = timeLeft > 0;

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    if (isActive) {
      intervalId = setInterval(() => {
        setTimeLeft((time) => Math.max(0, time - 1));
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isActive]);

  const start = useCallback(() => {
    setTimeLeft(initialTime);
  }, [initialTime]);

  const reset = useCallback(() => {
    setTimeLeft(0);
  }, []);

  return { timeLeft, isActive, start, reset };
};

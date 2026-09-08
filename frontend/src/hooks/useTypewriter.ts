import { useState, useEffect } from 'react';

export function useTypewriter(
  text: string,
  enabled: boolean = true,
  speed: number = 16
): { displayedText: string; isTyping: boolean } {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!enabled || !text) {
      setDisplayedText(text || '');
      setIsTyping(false);
      return;
    }

    // Start typewriter animation
    setIsTyping(true);
    setDisplayedText('');

    let currentIndex = 0;

    const interval = setInterval(() => {
      if (currentIndex < text.length) {
        // Reveal a few characters at a time for natural reading speed
        const chunkSize = Math.random() > 0.7 ? 3 : 2;
        const nextIndex = Math.min(currentIndex + chunkSize, text.length);
        setDisplayedText(text.slice(0, nextIndex));
        currentIndex = nextIndex;
      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, speed);

    return () => {
      clearInterval(interval);
    };
  }, [text, enabled, speed]);

  return { displayedText, isTyping };
}

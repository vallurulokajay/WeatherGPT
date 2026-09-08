import { useRef, useState, useEffect } from 'react';
import { Message } from '../../types';
import { TypingIndicator } from './TypingIndicator';
import { useTypewriter } from '../../hooks/useTypewriter';

interface AssistantMessageProps {
  message: Message;
}

export function AssistantMessage({ message }: AssistantMessageProps) {
  const initialLoadingRef = useRef(message.isLoading ?? false);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (initialLoadingRef.current && !message.isLoading && !message.isError) {
      setShouldAnimate(true);
    }
  }, [message.isLoading, message.isError]);

  const { displayedText, isTyping } = useTypewriter(
    message.content,
    shouldAnimate
  );

  const textToShow = shouldAnimate ? displayedText : message.content;

  return (
    <div className="flex justify-start animate-fade-in-up">
      <div className="flex gap-3.5 max-w-[85%] md:max-w-[75%]">
        {/* Subtle Assistant Mark */}
        <div className="flex-shrink-0 mt-0.5">
          <div className="w-6 h-6 rounded-md bg-wgpt-elevated border border-wgpt-border/40 flex items-center justify-center">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-wgpt-text-secondary"
            >
              <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="min-w-0 pt-0.5">
          {message.isLoading ? (
            <TypingIndicator />
          ) : message.isError ? (
            <p className="text-[14px] leading-relaxed text-red-400/90">
              {message.content}
            </p>
          ) : (
            <p className="text-[15px] leading-relaxed text-wgpt-text-primary whitespace-pre-wrap">
              {textToShow}
              {isTyping && (
                <span className="inline-block w-0.5 h-3.5 bg-wgpt-text-muted ml-0.5 animate-pulse align-middle" />
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

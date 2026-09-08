import { useState, useRef, useEffect, KeyboardEvent } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  isLoading,
  placeholder = 'Ask about the weather...',
}: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canSend = input.trim().length > 0 && !isLoading;

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 160) + 'px';
    }
  }, [input]);

  const handleSend = () => {
    if (!canSend) return;
    onSend(input.trim());
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full">
      <div
        className="
          relative flex items-end gap-2
          rounded-2xl border border-wgpt-border
          bg-wgpt-surface-alt
          transition-colors duration-200
          focus-within:border-blue-600/40
          px-3.5 py-2.5
        "
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          id="weather-prompt-input"
          name="message"
          aria-label="Ask about the weather"
          placeholder={placeholder}
          rows={1}
          disabled={isLoading}
          className="
            flex-1 resize-none bg-transparent
            px-1 py-1 text-[15px] leading-relaxed text-wgpt-text-primary
            placeholder:text-wgpt-text-muted
            outline-none
            disabled:opacity-50
            custom-scrollbar
          "
        />

        <button
          onClick={handleSend}
          disabled={!canSend}
          className={`
            w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mb-0.5
            transition-all duration-150
            ${
              canSend
                ? 'bg-blue-600 text-white hover:bg-blue-500 active:bg-blue-700 active:scale-95'
                : 'bg-blue-600/30 text-white/40 cursor-not-allowed'
            }
          `}
          aria-label="Send message"
        >
          {isLoading ? (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              className="animate-spin"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeDasharray="60"
                strokeDashoffset="20"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

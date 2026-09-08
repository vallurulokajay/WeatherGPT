import { Message } from '../../types';

interface UserMessageProps {
  message: Message;
}

export function UserMessage({ message }: UserMessageProps) {
  return (
    <div className="flex justify-end animate-fade-in-up">
      <div className="max-w-[80%] md:max-w-[70%]">
        <div className="px-5 py-2.5 rounded-2xl bg-wgpt-elevated text-wgpt-text-primary text-[15px] leading-relaxed whitespace-pre-wrap break-words">
          {message.content}
        </div>
      </div>
    </div>
  );
}

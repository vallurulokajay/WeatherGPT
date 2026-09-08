import { ChatInput } from '../Chat/ChatInput';

interface LandingViewProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

export function LandingView({ onSend, isLoading }: LandingViewProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 pb-24 animate-fade-in">
      <h1 className="mb-8 text-3xl md:text-4xl font-semibold text-wgpt-text-primary tracking-tight">
        WeatherGPT
      </h1>

      <div className="w-full max-w-2xl">
        <ChatInput
          onSend={onSend}
          isLoading={isLoading}
          placeholder="Ask about the weather..."
        />
      </div>
    </div>
  );
}

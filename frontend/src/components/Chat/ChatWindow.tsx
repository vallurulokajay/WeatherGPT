import { useChat } from '../../context/ChatContext';
import { LandingView } from '../Landing/LandingView';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';

export function ChatWindow() {
  const { activeConversation, sendMessage, startNewChat, state } = useChat();

  const isConversationMode =
    activeConversation !== null && activeConversation.messages.length > 0;

  return (
    <div className="flex-1 flex flex-col h-full relative">
      {isConversationMode ? (
        <>
          {/* Conversation header */}
          <div className="flex-shrink-0 h-14 px-4 flex items-center justify-between border-b border-wgpt-border/30 bg-wgpt-bg/95 backdrop-blur-sm">
            <div className="w-9" /> {/* Spacer for centering */}
            <span className="text-sm font-medium text-wgpt-text-primary tracking-tight">
              WeatherGPT
            </span>
            <button
              onClick={startNewChat}
              className="p-2 rounded-lg text-wgpt-text-secondary hover:text-wgpt-text-primary hover:bg-wgpt-elevated transition-colors"
              aria-label="New chat"
              title="New chat"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <MessageList messages={activeConversation.messages} />

          {/* Input pinned to bottom */}
          <div className="flex-shrink-0 p-4 pb-6 bg-wgpt-bg">
            <div className="max-w-3xl mx-auto">
              <ChatInput
                onSend={sendMessage}
                isLoading={state.isLoading}
                placeholder="Ask a follow-up question..."
              />
            </div>
          </div>
        </>
      ) : (
        <LandingView onSend={sendMessage} isLoading={state.isLoading} />
      )}
    </div>
  );
}

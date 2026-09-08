import { useChat } from '../../context/ChatContext';

export function NewChatButton() {
  const { startNewChat } = useChat();

  return (
    <button
      onClick={startNewChat}
      className="
        flex items-center gap-2.5 flex-1 px-3 py-2
        rounded-lg border border-wgpt-border/50
        text-wgpt-text-primary text-sm font-medium
        hover:bg-wgpt-elevated hover:border-wgpt-border
        active:scale-[0.98]
        transition-all duration-150
      "
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-wgpt-text-secondary"
      >
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
      <span>New chat</span>
    </button>
  );
}

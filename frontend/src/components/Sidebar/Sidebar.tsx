import { useChat } from '../../context/ChatContext';
import { NewChatButton } from './NewChatButton';
import { ConversationList } from './ConversationList';

export function Sidebar() {
  const { state, toggleSidebar } = useChat();

  return (
    <aside
      className={`
        fixed md:relative z-40 md:z-0 inset-y-0 left-0
        flex-shrink-0
        bg-wgpt-surface
        overflow-hidden
        transition-all duration-300 ease-out
        ${
          state.sidebarOpen
            ? 'w-64 translate-x-0 border-r border-wgpt-border/60'
            : '-translate-x-full md:translate-x-0 w-64 md:w-0 md:border-r-0'
        }
      `}
    >
      <div className="w-64 min-w-[16rem] h-full flex flex-col">
        {/* Sidebar top action bar */}
        <div className="flex-shrink-0 p-3 flex items-center gap-2">
          <NewChatButton />
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg text-wgpt-text-secondary hover:text-wgpt-text-primary hover:bg-wgpt-elevated transition-colors"
            aria-label="Close sidebar"
            title="Close sidebar"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M9 3v18" />
            </svg>
          </button>
        </div>

        {/* Conversation history */}
        <div className="flex-1 overflow-y-auto px-3 custom-scrollbar">
          <ConversationList />
        </div>
      </div>
    </aside>
  );
}

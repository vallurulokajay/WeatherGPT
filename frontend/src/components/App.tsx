import { ChatProvider, useChat } from '../context/ChatContext';
import { Sidebar } from './Sidebar/Sidebar';
import { ChatWindow } from './Chat/ChatWindow';

function AppLayout() {
  const { state, toggleSidebar } = useChat();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-wgpt-bg font-sans">
      {/* Mobile backdrop */}
      {state.sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs md:hidden animate-fade-in"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Sidebar open button (visible when sidebar is closed) */}
        {!state.sidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="absolute top-3.5 left-3.5 z-20 p-2 rounded-lg text-wgpt-text-secondary hover:text-wgpt-text-primary hover:bg-wgpt-elevated transition-colors active:scale-95"
            aria-label="Open sidebar"
            title="Open sidebar"
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
        )}

        <ChatWindow />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ChatProvider>
      <AppLayout />
    </ChatProvider>
  );
}

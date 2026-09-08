import { useChat } from '../../context/ChatContext';

export function ConversationList() {
  const { state, selectConversation } = useChat();

  if (state.conversations.length === 0) {
    return (
      <div className="px-3 py-8 text-center text-wgpt-text-muted text-xs">
        No conversations yet
      </div>
    );
  }

  // Group conversations by date
  const today = new Date();
  const todayStr = today.toDateString();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();

  const todayConvos = state.conversations.filter(
    (c) => new Date(c.createdAt).toDateString() === todayStr
  );
  const yesterdayConvos = state.conversations.filter(
    (c) => new Date(c.createdAt).toDateString() === yesterdayStr
  );
  const olderConvos = state.conversations.filter(
    (c) =>
      new Date(c.createdAt).toDateString() !== todayStr &&
      new Date(c.createdAt).toDateString() !== yesterdayStr
  );

  const groups: { label: string; conversations: typeof state.conversations }[] =
    [];
  if (todayConvos.length > 0)
    groups.push({ label: 'Today', conversations: todayConvos });
  if (yesterdayConvos.length > 0)
    groups.push({ label: 'Yesterday', conversations: yesterdayConvos });
  if (olderConvos.length > 0)
    groups.push({ label: 'Older', conversations: olderConvos });

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group.label}>
          <h3 className="px-3 mb-1.5 text-xs font-medium text-wgpt-text-muted uppercase tracking-wider">
            {group.label}
          </h3>
          <div className="space-y-0.5">
            {group.conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => selectConversation(conversation.id)}
                className={`
                  w-full text-left px-3 py-2 rounded-lg text-sm truncate
                  transition-all duration-150
                  ${
                    state.activeConversationId === conversation.id
                      ? 'bg-wgpt-elevated text-wgpt-text-primary'
                      : 'text-wgpt-text-secondary hover:bg-wgpt-surface-alt hover:text-wgpt-text-primary'
                  }
                `}
              >
                {conversation.title}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

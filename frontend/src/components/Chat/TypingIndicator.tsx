export function TypingIndicator() {
  return (
    <div className="inline-flex items-center gap-1 py-1">
      <span
        className="w-1.5 h-1.5 rounded-full bg-wgpt-text-muted animate-pulse-dot"
        style={{ animationDelay: '0s' }}
      />
      <span
        className="w-1.5 h-1.5 rounded-full bg-wgpt-text-muted animate-pulse-dot"
        style={{ animationDelay: '0.2s' }}
      />
      <span
        className="w-1.5 h-1.5 rounded-full bg-wgpt-text-muted animate-pulse-dot"
        style={{ animationDelay: '0.4s' }}
      />
    </div>
  );
}

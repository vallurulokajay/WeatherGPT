# WeatherGPT Development Instructions

## Project Goal
Build WeatherGPT as a polished conversational weather AI web application.

## Design
- Dark, minimal, modern interface.
- Inspired by the attached ChatGPT screenshot, but do not clone ChatGPT.
- Prioritize clean spacing, typography, subtle borders, rounded components, and smooth motion.
- Avoid excessive gradients, neon effects, or unnecessary UI elements.
- The application should feel like a real student-built AI product, not a generic template.

## UX
- Landing page starts with centered WeatherGPT branding and chat input.
- Sending the first message transitions into conversation mode.
- Sidebar is collapsible.
- New Chat resets the current conversation.
- User messages appear immediately.
- Assistant responses show a subtle loading/thinking state and then animate into view.
- Automatically keep the latest message visible.
- Support Enter to send and Shift+Enter for a new line.

## Architecture
- Use React + TypeScript.
- Keep components modular and reusable.
- Keep API logic separate from UI components.
- Use environment variables for backend configuration.
- Do not hardcode fake backend responses into the final implementation.

## API
Frontend expects:

POST /api/chat

Request:
{
  "message": "user message",
  "conversationId": "conversation-id"
}

Response:
{
  "response": "assistant response",
  "conversationId": "conversation-id"
}

## Quality
- Build a functional application, not a static mockup.
- Test interactions after implementation.
- Fix console errors and obvious responsive issues.
- Prefer simple, maintainable solutions over unnecessary complexity.
- Before finishing, verify landing state, conversation state, sidebar, new chat, API loading, API errors, and responsive behavior.
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isLoading?: boolean;
  isError?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
}

export interface ChatApiRequest {
  message: string;
  conversationId?: string;
  location?: UserLocation | null;
}

export interface ChatApiResponse {
  response: string;
  conversationId: string;
}

export interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  sidebarOpen: boolean;
  isLoading: boolean;
  error: string | null;
  location: UserLocation | null;
  locationStatus: 'idle' | 'prompt' | 'granted' | 'denied' | 'unsupported';
}

export type ChatAction =
  | { type: 'SET_SIDEBAR_OPEN'; payload: boolean }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'NEW_CHAT' }
  | { type: 'SELECT_CONVERSATION'; payload: string }
  | { type: 'ADD_USER_MESSAGE'; payload: { conversationId: string; message: Message } }
  | { type: 'ADD_ASSISTANT_LOADING'; payload: { conversationId: string; messageId: string } }
  | { type: 'UPDATE_ASSISTANT_MESSAGE'; payload: { conversationId: string; messageId: string; content: string } }
  | { type: 'SET_MESSAGE_ERROR'; payload: { conversationId: string; messageId: string; error: string } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CREATE_CONVERSATION'; payload: Conversation }
  | { type: 'SET_LOCATION'; payload: UserLocation | null }
  | { type: 'SET_LOCATION_STATUS'; payload: 'idle' | 'prompt' | 'granted' | 'denied' | 'unsupported' };

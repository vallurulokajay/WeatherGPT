import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { ChatState, ChatAction, Message, Conversation, UserLocation } from '../types';
import { sendChatMessage, ApiError } from '../api/chatApi';
import { LocationService } from '../services/locationService';

const initialState: ChatState = {
  conversations: [],
  activeConversationId: null,
  sidebarOpen: window.innerWidth >= 768,
  isLoading: false,
  error: null,
  location: null,
  locationStatus: 'idle',
};

function generateId(): string {
  return crypto.randomUUID();
}

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SET_SIDEBAR_OPEN':
      return { ...state, sidebarOpen: action.payload };

    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };

    case 'NEW_CHAT':
      return {
        ...state,
        activeConversationId: null,
        error: null,
      };

    case 'SELECT_CONVERSATION':
      return {
        ...state,
        activeConversationId: action.payload,
        error: null,
      };

    case 'CREATE_CONVERSATION':
      return {
        ...state,
        conversations: [action.payload, ...state.conversations],
        activeConversationId: action.payload.id,
      };

    case 'ADD_USER_MESSAGE':
      return {
        ...state,
        conversations: state.conversations.map((conv) =>
          conv.id === action.payload.conversationId
            ? { ...conv, messages: [...conv.messages, action.payload.message] }
            : conv
        ),
      };

    case 'ADD_ASSISTANT_LOADING':
      return {
        ...state,
        conversations: state.conversations.map((conv) =>
          conv.id === action.payload.conversationId
            ? {
                ...conv,
                messages: [
                  ...conv.messages,
                  {
                    id: action.payload.messageId,
                    role: 'assistant' as const,
                    content: '',
                    timestamp: Date.now(),
                    isLoading: true,
                  },
                ],
              }
            : conv
        ),
        isLoading: true,
      };

    case 'UPDATE_ASSISTANT_MESSAGE':
      return {
        ...state,
        conversations: state.conversations.map((conv) =>
          conv.id === action.payload.conversationId
            ? {
                ...conv,
                messages: conv.messages.map((msg) =>
                  msg.id === action.payload.messageId
                    ? { ...msg, content: action.payload.content, isLoading: false }
                    : msg
                ),
              }
            : conv
        ),
        isLoading: false,
      };

    case 'SET_MESSAGE_ERROR':
      return {
        ...state,
        conversations: state.conversations.map((conv) =>
          conv.id === action.payload.conversationId
            ? {
                ...conv,
                messages: conv.messages.map((msg) =>
                  msg.id === action.payload.messageId
                    ? {
                        ...msg,
                        content: action.payload.error,
                        isLoading: false,
                        isError: true,
                      }
                    : msg
                ),
              }
            : conv
        ),
        isLoading: false,
      };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'SET_LOCATION':
      return { ...state, location: action.payload };

    case 'SET_LOCATION_STATUS':
      return { ...state, locationStatus: action.payload };

    default:
      return state;
  }
}

interface ChatContextValue {
  state: ChatState;
  sendMessage: (content: string) => Promise<void>;
  startNewChat: () => void;
  selectConversation: (id: string) => void;
  toggleSidebar: () => void;
  activeConversation: Conversation | null;
  requestLocationPermission: () => Promise<UserLocation | null>;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  // Initialize permission check and listener on mount
  useEffect(() => {
    if (!LocationService.isSupported()) {
      dispatch({ type: 'SET_LOCATION_STATUS', payload: 'unsupported' });
      return;
    }

    if ('permissions' in navigator) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((status) => {
          dispatch({ type: 'SET_LOCATION_STATUS', payload: status.state });
          if (status.state === 'granted') {
            LocationService.requestLocation().then((loc) => {
              if (loc) {
                dispatch({ type: 'SET_LOCATION', payload: loc });
              }
            });
          }
        })
        .catch(() => {
          // Permissions API query not supported
        });
    }

    const cleanup = LocationService.setupPermissionListener((status, loc) => {
      dispatch({ type: 'SET_LOCATION_STATUS', payload: status });
      dispatch({ type: 'SET_LOCATION', payload: loc });
    });

    return cleanup;
  }, []);

  const activeConversation =
    state.conversations.find((c) => c.id === state.activeConversationId) ?? null;

  const requestLocationPermission = useCallback(async (): Promise<UserLocation | null> => {
    if (!LocationService.isSupported()) {
      dispatch({ type: 'SET_LOCATION_STATUS', payload: 'unsupported' });
      return null;
    }

    const loc = await LocationService.requestLocation(5000);
    if (loc) {
      dispatch({ type: 'SET_LOCATION', payload: loc });
      dispatch({ type: 'SET_LOCATION_STATUS', payload: 'granted' });
    } else {
      dispatch({ type: 'SET_LOCATION_STATUS', payload: 'denied' });
    }
    return loc;
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (state.isLoading || !content.trim()) return;

      const trimmedContent = content.trim();
      let conversationId = state.activeConversationId;

      // Create a new conversation if none is active
      if (!conversationId) {
        conversationId = generateId();
        const newConversation: Conversation = {
          id: conversationId,
          title:
            trimmedContent.slice(0, 50) +
            (trimmedContent.length > 50 ? '…' : ''),
          messages: [],
          createdAt: Date.now(),
        };
        dispatch({ type: 'CREATE_CONVERSATION', payload: newConversation });
      }

      // Add user message immediately
      const userMessage: Message = {
        id: generateId(),
        role: 'user',
        content: trimmedContent,
        timestamp: Date.now(),
      };
      dispatch({
        type: 'ADD_USER_MESSAGE',
        payload: { conversationId, message: userMessage },
      });

      // Add assistant loading placeholder
      const assistantMessageId = generateId();
      dispatch({
        type: 'ADD_ASSISTANT_LOADING',
        payload: { conversationId, messageId: assistantMessageId },
      });

      // Close sidebar on mobile after sending
      if (window.innerWidth < 768) {
        dispatch({ type: 'SET_SIDEBAR_OPEN', payload: false });
      }

      // Determine location to send
      let locToSend = state.location;

      // If location is not yet known and hasn't been denied, request permission gracefully
      if (!locToSend && state.locationStatus !== 'denied' && state.locationStatus !== 'unsupported') {
        try {
          locToSend = await LocationService.requestLocation(4000);
          if (locToSend) {
            dispatch({ type: 'SET_LOCATION', payload: locToSend });
            dispatch({ type: 'SET_LOCATION_STATUS', payload: 'granted' });
          } else {
            dispatch({ type: 'SET_LOCATION_STATUS', payload: 'denied' });
          }
        } catch {
          // Never block chat if location prompt fails
          locToSend = null;
        }
      }

      try {
        const response = await sendChatMessage({
          message: trimmedContent,
          conversationId,
          location: locToSend ? { latitude: locToSend.latitude, longitude: locToSend.longitude } : null,
        });

        dispatch({
          type: 'UPDATE_ASSISTANT_MESSAGE',
          payload: {
            conversationId,
            messageId: assistantMessageId,
            content: response.response,
          },
        });
      } catch (error) {
        const errorMessage =
          error instanceof ApiError
            ? error.message
            : 'Something went wrong while contacting WeatherGPT. Please try again.';

        dispatch({
          type: 'SET_MESSAGE_ERROR',
          payload: {
            conversationId,
            messageId: assistantMessageId,
            error: errorMessage,
          },
        });
      }
    },
    [state.isLoading, state.activeConversationId, state.location, state.locationStatus]
  );

  const startNewChat = useCallback(() => {
    dispatch({ type: 'NEW_CHAT' });
  }, []);

  const selectConversation = useCallback((id: string) => {
    dispatch({ type: 'SELECT_CONVERSATION', payload: id });
    if (window.innerWidth < 768) {
      dispatch({ type: 'SET_SIDEBAR_OPEN', payload: false });
    }
  }, []);

  const toggleSidebar = useCallback(() => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  }, []);

  return (
    <ChatContext.Provider
      value={{
        state,
        sendMessage,
        startNewChat,
        selectConversation,
        toggleSidebar,
        activeConversation,
        requestLocationPermission,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat(): ChatContextValue {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}

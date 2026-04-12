'use client';

import { useState, useCallback, useRef } from 'react';
import { useActions, readStreamableValue } from 'ai/rsc';
import { type AI } from '@/app/action';
import { Message, StreamMessage } from '@/types/chat';
import { auth } from '@/lib/firebase';
import { incrementSearchCount, isSearchLimitReached, SEARCH_LIMIT } from '@/lib/search-counter';
import { useToast } from '@/components/ui/use-toast';
import { User } from 'firebase/auth';

// Save search via API (single path — avoids duplicate saves)
const saveSearch = async (query: string): Promise<void> => {
  const user = auth.currentUser;
  if (!user || !query?.trim()) return;

  try {
    const token = await user.getIdToken();
    await fetch('/api/search-history', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query: query.trim() }),
    });
  } catch {
    // Silent — non-critical background operation
  }
};

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentLlmResponse, setCurrentLlmResponse] = useState('');
  const { myAction } = useActions<typeof AI>();
  const { toast } = useToast();

  // Track saved message IDs to prevent duplicate saves within a session
  const savedMessageIds = useRef<Set<number>>(new Set());

  const handleUserMessageSubmission = useCallback(async (
    payload: { message: string; mentionTool: string | null; logo: string | null; file: string },
    user: User | null,
    hasSubscription: boolean
  ) => {
    // Search limit check
    if (!hasSubscription && isSearchLimitReached(user?.uid)) {
      const paymentPromptMessage = {
        id: Date.now(),
        type: 'paymentPrompt',
        userMessage: '',
        content: '',
        images: [],
        videos: [],
        followUp: null,
        isStreaming: false,
        status: 'searchLimitReached',
        isolatedView: false,
        falBase64Image: null,
        logo: undefined,
        semanticCacheKey: null,
        cachedData: ''
      };
      setMessages(prevMessages => [...prevMessages, { ...paymentPromptMessage }]);
      return;
    }

    // Increment search count for free users
    if (!hasSubscription && user) {
      const newCount = incrementSearchCount(user.uid);
      if (newCount <= SEARCH_LIMIT) {
        const remaining = SEARCH_LIMIT - newCount;
        toast({
          title: `Search ${newCount} of ${SEARCH_LIMIT}`,
          description: remaining > 0
            ? `You have ${remaining} free search${remaining === 1 ? '' : 'es'} remaining.`
            : `This is your last free search. Upgrade to continue.`,
          duration: 3000,
        });
      }
    }

    const newMessageId = Date.now();
    const newMessage: Message = {
      id: newMessageId,
      type: 'userMessage',
      userMessage: payload.message,
      content: '',
      images: [],
      videos: [],
      followUp: null,
      isStreaming: true,
      searchResults: [],
      places: [],
      shopping: [],
      status: '',
      ticker: undefined,
      spotify: undefined,
      semanticCacheKey: null,
      cachedData: '',
      isolatedView: !!payload.mentionTool,
      falBase64Image: null,
      logo: payload.logo || undefined,
    };

    setMessages(prevMessages => [...prevMessages, newMessage]);

    // Save to history once per message
    if (!savedMessageIds.current.has(newMessageId)) {
      savedMessageIds.current.add(newMessageId);
      saveSearch(payload.message);
    }

    let lastAppendedResponse = '';

    try {
      const streamableValue = await myAction(payload.message, payload.mentionTool, payload.logo, payload.file, user?.uid || undefined);
      let llmResponseString = '';

      for await (const message of readStreamableValue(streamableValue)) {
        const typedMessage = message as StreamMessage;

        setMessages((prevMessages) => {
          const messagesCopy = [...prevMessages];
          const messageIndex = messagesCopy.findIndex(msg => msg.id === newMessageId);

          if (messageIndex !== -1) {
            const currentMessage = messagesCopy[messageIndex];

            if (typedMessage.status === 'rateLimitReached') {
              currentMessage.status = 'rateLimitReached';
            }

            if (typedMessage.isolatedView) {
              currentMessage.isolatedView = true;
            }

            if (typedMessage.llmResponse && typedMessage.llmResponse !== lastAppendedResponse) {
              currentMessage.content += typedMessage.llmResponse;
              lastAppendedResponse = typedMessage.llmResponse;
            }

            if (typedMessage.llmResponseEnd) {
              currentMessage.isStreaming = false;
            }

            currentMessage.searchResults = typedMessage.searchResults || currentMessage.searchResults;
            currentMessage.images = typedMessage.images ? [...typedMessage.images] : currentMessage.images;
            currentMessage.videos = typedMessage.videos ? [...typedMessage.videos] : currentMessage.videos;
            currentMessage.followUp = typedMessage.followUp || currentMessage.followUp;
            currentMessage.falBase64Image = typedMessage.falBase64Image;

            if (typedMessage.conditionalFunctionCallUI) {
              const functionCall = typedMessage.conditionalFunctionCallUI;
              if (functionCall.type === 'places') currentMessage.places = functionCall.places;
              if (functionCall.type === 'shopping') currentMessage.shopping = functionCall.shopping;
              if (functionCall.type === 'ticker') currentMessage.ticker = functionCall.data;
              if (functionCall.trackId) currentMessage.spotify = functionCall.trackId;
            }

            if (typedMessage.cachedData) {
              const data = JSON.parse(typedMessage.cachedData);
              Object.assign(currentMessage, {
                searchResults: data.searchResults,
                images: data.images,
                videos: data.videos,
                content: data.llmResponse,
                isStreaming: false,
                semanticCacheKey: data.semanticCacheKey,
                conditionalFunctionCallUI: data.conditionalFunctionCallUI,
                followUp: data.followUp,
              });

              if (data.conditionalFunctionCallUI) {
                const functionCall = data.conditionalFunctionCallUI;
                if (functionCall.type === 'places') currentMessage.places = functionCall.places;
                if (functionCall.type === 'shopping') currentMessage.shopping = functionCall.shopping;
                if (functionCall.type === 'ticker') currentMessage.ticker = functionCall.data;
                if (functionCall.trackId) currentMessage.spotify = functionCall.trackId;
              }
            }
          }
          return messagesCopy;
        });

        if (typedMessage.llmResponse) {
          llmResponseString += typedMessage.llmResponse;
          setCurrentLlmResponse(llmResponseString);
        }
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  }, [myAction, toast]);

  const handleFollowUpClick = useCallback(async (
    question: string,
    user: User | null,
    hasSubscription: boolean,
    file: string
  ) => {
    setCurrentLlmResponse('');
    await handleUserMessageSubmission(
      { message: question, mentionTool: null, logo: null, file },
      user,
      hasSubscription
    );
  }, [handleUserMessageSubmission]);

  return {
    messages,
    setMessages,
    currentLlmResponse,
    setCurrentLlmResponse,
    handleUserMessageSubmission,
    handleFollowUpClick,
  };
}

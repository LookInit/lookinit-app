'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChatContainer } from '@/components/chat/chat-container';
import { ChatInput } from '@/components/chat/chat-input';
import { useChat } from '@/hooks/use-chat';
import { useAuth } from '@/hooks/use-auth';
import { useModelSelection } from '@/hooks/use-model-selection';

export default function HomePage() {
  const [file, setFile] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);

  const { user, hasSubscription } = useAuth();
  const {
    messages,
    currentLlmResponse,
    setCurrentLlmResponse,
    handleUserMessageSubmission
  } = useChat();
  const {
    selectedMentionTool,
    selectedMentionToolLogo,
    showRAG,
    handleModelSelect,
    clearSelection,
    setShowRAG
  } = useModelSelection();

  useEffect(() => {
    const handleSetSearchQuery = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail && customEvent.detail.query) {
        setInputValue(customEvent.detail.query);
      }
    };
    window.addEventListener('set-search-query', handleSetSearchQuery);
    return () => window.removeEventListener('set-search-query', handleSetSearchQuery);
  }, []);

  useEffect(() => {
    const event = new CustomEvent('messagesChanged', {
      detail: { hasMessages: messages.length > 0 }
    });
    document.dispatchEvent(event);
  }, [messages.length]);

  const handleFollowUpClick = useCallback(async (question: string) => {
    setCurrentLlmResponse('');
    await handleUserMessageSubmission(
      { message: question, mentionTool: null, logo: null, file },
      user,
      hasSubscription
    );
  }, [handleUserMessageSubmission, user, hasSubscription, file]);

  const handleSubmit = async (payload: {
    message: string;
    mentionTool: string | null;
    logo: string | null;
    file: string
  }) => {
    if (!payload.message) return;
    await handleUserMessageSubmission(payload, user, hasSubscription);
    setShowRAG(false);
    clearSelection();
    setFile('');
  };

  const handleFileUpload = (file: File) => {
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      const base64File = e.target?.result;
      if (base64File) setFile(String(base64File));
    };
    fileReader.readAsDataURL(file);
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    if (value.trim() === '') clearSelection();
  };

  const handleModelSelectWithRAG = (toolId: string, toolLogo: string, enableRAG: boolean) => {
    handleModelSelect(toolId, toolLogo, enableRAG);
    if (enableRAG) setShowRAG(true);
  };

  return (
    <div>
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-48px-80px)] px-4 select-none">
          <p className="text-[--text-muted] text-base font-medium tracking-tight">What do you want to know?</p>
        </div>
      )}

      <ChatContainer
        messages={messages}
        currentLlmResponse={currentLlmResponse}
        selectedMentionTool={selectedMentionTool}
        handleFollowUpClick={handleFollowUpClick}
      />

      <div className="px-4 fixed inset-x-0 bottom-0 w-full z-[200] pb-4 pt-6 bg-gradient-to-t from-[--surface] via-[--surface]/90 to-transparent">
        <div className="mx-auto max-w-3xl">
          <ChatInput
            inputValue={inputValue}
            setInputValue={handleInputChange}
            onSubmit={handleSubmit}
            selectedMentionTool={selectedMentionTool}
            selectedMentionToolLogo={selectedMentionToolLogo}
            onModelSelect={handleModelSelectWithRAG}
            showRAG={showRAG}
            file={file}
            onFileUpload={handleFileUpload}
            isExpanded={isExpanded}
            setIsExpanded={setIsExpanded}
            setCurrentLlmResponse={setCurrentLlmResponse}
          />
        </div>
      </div>
    </div>
  );
}

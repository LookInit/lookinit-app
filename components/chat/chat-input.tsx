'use client';

import { FormEvent, useRef, useState } from 'react';
import Textarea from 'react-textarea-autosize';
import { useEnterSubmit } from '@/lib/hooks/use-enter-submit';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { ArrowUp, Paperclip } from '@phosphor-icons/react';
import { ChatScrollAnchor } from '@/lib/hooks/chat-scroll-anchor';
import { ModelsDropdown } from '@/components/ui/models-dropdown';

interface ChatInputProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  onSubmit: (payload: { message: string; mentionTool: string | null; logo: string | null; file: string }) => void;
  selectedMentionTool: string | null;
  selectedMentionToolLogo: string | null;
  onModelSelect: (toolId: string, toolLogo: string, enableRAG: boolean) => void;
  showRAG: boolean;
  file: string;
  onFileUpload: (file: File) => void;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  setCurrentLlmResponse: (response: string) => void;
}

export function ChatInput({
  inputValue,
  setInputValue,
  onSubmit,
  selectedMentionTool,
  selectedMentionToolLogo,
  onModelSelect,
  showRAG,
  file,
  onFileUpload,
  isExpanded,
  setIsExpanded,
  setCurrentLlmResponse,
}: ChatInputProps) {
  const { formRef, onKeyDown } = useEnterSubmit();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    setIsExpanded(false);
    setCurrentLlmResponse('');
    
    if (window.innerWidth < 600) {
      (e.target as HTMLFormElement)['message']?.blur();
    }

    const payload = {
      message: inputValue.trim(),
      mentionTool: selectedMentionTool,
      logo: selectedMentionToolLogo,
      file: file,
    };
    
    setInputValue('');
    await onSubmit(payload);
  };

  const handleFileUpload = (file: File) => {
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      const base64File = e.target?.result;
      if (base64File) {
        onFileUpload(file);
      }
    };
    fileReader.readAsDataURL(file);
  };

  const focusTextarea = () => {
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  return (
    <form ref={formRef} onSubmit={handleFormSubmit} className="w-full pointer-events-auto relative">
      <div className={`relative flex flex-col w-full bg-[--card-bg] border border-[--card-border] rounded-2xl shadow-[0_4px_32px_rgba(0,0,0,0.18)] p-3 pointer-events-auto transition-all ${isExpanded ? 'h-44' : 'h-24'}`}>

        {/* Models Dropdown */}
        <div className="absolute left-3 top-3 z-50">
          <ModelsDropdown
            selectedMentionTool={selectedMentionTool}
            selectedMentionToolLogo={selectedMentionToolLogo}
            onModelSelect={onModelSelect}
            onFocus={focusTextarea}
          />
        </div>

        {/* Textarea */}
        <Textarea
          ref={inputRef}
          tabIndex={0}
          onKeyDown={onKeyDown}
          placeholder="Ask anything..."
          className={`w-full resize-none bg-transparent focus:outline-none text-[--text-primary] placeholder:text-[--text-muted] text-sm leading-relaxed ${isExpanded ? 'pt-10 px-3' : 'pt-9 px-3'} ${selectedMentionToolLogo ? 'pl-16' : ''}`}
          autoFocus
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          name="message"
          rows={isExpanded ? 5 : 2}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />

        {/* File Upload */}
        {showRAG && (
          <>
            <label
              htmlFor="fileInput"
              className="absolute left-12 top-11 text-[--text-muted] hover:text-[--text-primary] -rotate-45 hover:rotate-0 transition-transform duration-200 cursor-pointer"
            >
              <Paperclip size={18} />
            </label>
            <input
              id="fileInput"
              type="file"
              accept=".doc,.docx,.pdf,.txt,.js,.tsx"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
            />
          </>
        )}

        <ChatScrollAnchor trackVisibility={false} />

        {/* Submit Button */}
        <div className="absolute right-3 bottom-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="submit"
                size="icon"
                disabled={inputValue === ''}
                className="w-8 h-8 rounded-xl bg-[--text-primary] hover:opacity-80 disabled:opacity-20 transition-opacity"
              >
                <ArrowUp size={16} className="text-[--surface]" />
                <span className="sr-only">Send message</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Send message</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </form>
  );
}
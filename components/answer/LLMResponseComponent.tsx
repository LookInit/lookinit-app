import React, { useState } from 'react';
import { type AI } from '../../app/action';
import { useActions } from 'ai/rsc';
import Markdown from 'react-markdown';
import CopyToClipboard from 'react-copy-to-clipboard';
import { Copy, Check, ArrowsCounterClockwise } from "@phosphor-icons/react";

const StreamingComponent = ({ currentLlmResponse }: { currentLlmResponse: string }) => {
    if (!currentLlmResponse) return null;
    return (
        <div className="bg-[--card-bg] border border-[--card-border] rounded-xl p-4 mt-4">
            <div className="flex items-center gap-2 mb-3">
                <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[--text-muted] animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[--text-muted] animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[--text-muted] animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
            </div>
            <div className="text-[--text-muted] text-sm leading-relaxed">{currentLlmResponse}</div>
        </div>
    );
};

const SkeletonLoader = () => (
    <div className="bg-[--card-bg] border border-[--card-border] rounded-xl p-4 mt-4">
        <div className="flex gap-1 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[--text-muted] animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-[--text-muted] animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-[--text-muted] animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <div className="flex flex-col gap-2">
            <div className="h-2.5 rounded-full bg-[--card-hover] w-full animate-pulse" />
            <div className="h-2.5 rounded-full bg-[--card-hover] w-4/5 animate-pulse" style={{ animationDelay: '75ms' }} />
            <div className="h-2.5 rounded-full bg-[--card-hover] w-3/4 animate-pulse" style={{ animationDelay: '150ms' }} />
            <div className="h-2.5 rounded-full bg-[--card-hover] w-2/3 animate-pulse" style={{ animationDelay: '225ms' }} />
        </div>
    </div>
);

interface LLMResponseComponentProps {
    llmResponse: string;
    currentLlmResponse: string;
    index: number;
    semanticCacheKey: string;
    isolatedView: boolean;
    logo?: string;
}

const LLMResponseComponent = ({ llmResponse, currentLlmResponse, index, semanticCacheKey, isolatedView, logo }: LLMResponseComponentProps) => {
    const { clearSemanticCache } = useActions<typeof AI>();
    const [showCacheCleared, setShowCacheCleared] = useState(false);
    const [copied, setCopied] = useState(false);

    const hasLlmResponse = llmResponse && llmResponse.trim().length > 0;
    const hasCurrentLlmResponse = currentLlmResponse && currentLlmResponse.trim().length > 0;

    const handleClearCache = () => {
        clearSemanticCache(semanticCacheKey);
        setShowCacheCleared(true);
        setTimeout(() => setShowCacheCleared(false), 2000);
    };

    const handleCopy = () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={isolatedView ? 'flex flex-col max-w-[1200px] mx-auto' : ''}>
            {hasLlmResponse || hasCurrentLlmResponse ? (
                <>
                    {hasLlmResponse ? (
                        <div className="bg-[--card-bg] border border-[--card-border] rounded-xl p-4 mt-4">
                            <div className="markdown-container text-[--text-primary]">
                                <Markdown>{llmResponse}</Markdown>
                            </div>
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-[--divider]">
                                <div className="flex items-center gap-1">
                                    <CopyToClipboard text={llmResponse} onCopy={handleCopy}>
                                        <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[--text-muted] hover:text-[--text-primary] hover:bg-[--card-hover] transition-colors text-xs">
                                            {copied ? <Check size={14} /> : <Copy size={14} />}
                                            {copied ? 'Copied' : 'Copy'}
                                        </button>
                                    </CopyToClipboard>
                                    {!isolatedView && (
                                        <button
                                            onClick={handleClearCache}
                                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[--text-muted] hover:text-[--text-primary] hover:bg-[--card-hover] transition-colors text-xs"
                                            title="Clear cache for this query"
                                        >
                                            <ArrowsCounterClockwise size={14} className={showCacheCleared ? 'animate-spin' : ''} />
                                            {showCacheCleared ? 'Cleared' : 'Refresh'}
                                        </button>
                                    )}
                                </div>
                                {logo && (
                                    <img src={logo} alt="model logo" className="h-5 opacity-60" />
                                )}
                            </div>
                        </div>
                    ) : (
                        <StreamingComponent currentLlmResponse={currentLlmResponse} />
                    )}
                </>
            ) : (
                <SkeletonLoader />
            )}
        </div>
    );
};

export default LLMResponseComponent;

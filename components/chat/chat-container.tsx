'use client';

import { Message } from '@/types/chat';
import UserMessageComponent from '@/components/answer/UserMessageComponent';
import SearchResultsComponent from '@/components/answer/SearchResultsComponent';
import LLMResponseComponent from '@/components/answer/LLMResponseComponent';
import FollowUpComponent from '@/components/answer/FollowUpComponent';
import ImagesComponent from '@/components/answer/ImagesComponent';
import VideosComponent from '@/components/answer/VideosComponent';
import ShoppingComponent from '@/components/answer/ShoppingComponent';
import MapDetails from '@/components/answer/MapDetails';
import FinancialChart from '@/components/answer/FinancialChart';
import Spotify from '@/components/answer/Spotify';
import ImageGenerationComponent from '@/components/answer/ImageGenerationComponent';
import PaymentPrompt from '@/components/answer/PaymentPrompt';
import dynamic from 'next/dynamic';
import { mentionToolConfig } from '@/app/tools/mentionToolConfig';

const MapComponent = dynamic(() => import('@/components/answer/Map'), { ssr: false });

const isImageGenTool = (logo: string | undefined) =>
  !!logo && mentionToolConfig.mentionTools.find((t) => t.logo === logo)?.functionName === 'falAiStableDiffusion3Medium';

interface ChatContainerProps {
  messages: Message[];
  currentLlmResponse: string;
  selectedMentionTool: string | null;
  handleFollowUpClick: (question: string) => void;
}

export function ChatContainer({
  messages,
  currentLlmResponse,
  handleFollowUpClick
}: ChatContainerProps) {
  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col pb-32 md:pb-40">
      {messages.map((message, index) => (
        <div key={`message-${index}`}>
          {message.status === 'searchLimitReached' || message.status === 'rateLimitReached' ? (
            <div className="pb-40 md:pb-48 px-4 max-w-[1200px] mx-auto w-full">
              <PaymentPrompt />
            </div>
          ) : message.isolatedView ? (
            isImageGenTool(message.logo) || message.falBase64Image ? (
              <ImageGenerationComponent 
                key={`image-${index}`} 
                src={message.falBase64Image} 
                query={message.userMessage} 
              />
            ) : (
              <LLMResponseComponent
                key={`llm-response-${index}`}
                llmResponse={message.content}
                currentLlmResponse={currentLlmResponse}
                index={index}
                semanticCacheKey={message.semanticCacheKey}
                isolatedView={true}
                logo={message.logo}
              />
            )
          ) : (
            <div className="flex flex-col md:flex-row max-w-[1200px] mx-auto">
              <div className="w-full md:w-3/4 md:pr-2">
{message.type === 'userMessage' && <UserMessageComponent message={message.userMessage} />}
                {message.ticker && message.ticker.length > 0 && (
                  <FinancialChart key={`financialChart-${index}`} ticker={message.ticker} />
                )}
                {message.spotify && message.spotify.length > 0 && (
                  <Spotify key={`spotify-${index}`} spotify={message.spotify} />
                )}
                {message.searchResults && (
                  <SearchResultsComponent key={`searchResults-${index}`} searchResults={message.searchResults} />
                )}
                {message.places && message.places.length > 0 && (
                  <MapComponent key={`map-${index}`} places={message.places} />
                )}
                <LLMResponseComponent 
                  llmResponse={message.content} 
                  currentLlmResponse={currentLlmResponse} 
                  index={index} 
                  semanticCacheKey={message.semanticCacheKey} 
                  key={`llm-response-${index}`}
                  isolatedView={false}
                />
                {message.followUp && (
                  <div className="flex flex-col">
                    <FollowUpComponent 
                      key={`followUp-${index}`} 
                      followUp={message.followUp} 
                      handleFollowUpClick={handleFollowUpClick} 
                    />
                  </div>
                )}
              </div>
              <div className="w-full md:w-1/4 md:pl-2">
                {message.shopping && message.shopping.length > 0 && (
                  <ShoppingComponent key={`shopping-${index}`} shopping={message.shopping} />
                )}
                {message.images && <ImagesComponent key={`images-${index}`} images={message.images} />}
                {message.videos && <VideosComponent key={`videos-${index}`} videos={message.videos} />}
                {message.places && message.places.length > 0 && (
                  <MapDetails key={`mapDetails-${index}`} places={message.places} />
                )}
                {message.falBase64Image && (
                  <ImageGenerationComponent key={`image-${index}`} src={message.falBase64Image} />
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
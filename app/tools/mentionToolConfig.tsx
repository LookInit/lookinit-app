export const mentionToolConfig = {
    useMentionQueries: true,
    mentionTools: [
        // Groq Models
        { id: 'llama-3.3-70b-versatile', name: 'Groq Llama3.3-70b', logo: 'https://asset.brandfetch.io/idxygbEPCQ/idzCyF-I44.png?updated=1668515712972', functionName: 'streamChatCompletion', enableRAG: true },
        { id: 'llama-3.1-8b-instant', name: 'Groq Llama3.1-8b', logo: 'https://asset.brandfetch.io/idxygbEPCQ/idzCyF-I44.png?updated=1668515712972', functionName: 'streamChatCompletion', enableRAG: true },
        { id: 'meta-llama/llama-4-scout-17b-16e-instruct', name: 'Groq Llama4 Scout', logo: 'https://asset.brandfetch.io/idxygbEPCQ/idzCyF-I44.png?updated=1668515712972', functionName: 'streamChatCompletion', enableRAG: true },
        { id: 'qwen/qwen3-32b', name: 'Qwen3-32b', logo: 'https://avatars.githubusercontent.com/u/141221163?s=200&v=4', functionName: 'streamChatCompletion', enableRAG: true },

        // DeepSeek
        { id: 'openai/gpt-oss-120b', name: 'DeepSeek R2 (via Groq)', logo: 'https://avatars.githubusercontent.com/u/148330874?s=200&v=4', functionName: 'streamChatCompletion', enableRAG: true },
    
        
        // Groq compound models
        { id: 'groq/compound', name: 'Groq Compound', logo: 'https://asset.brandfetch.io/idxygbEPCQ/idzCyF-I44.png?updated=1668515712972', functionName: 'streamChatCompletion', enableRAG: true },
        { id: 'groq/compound-mini', name: 'Groq Compound Mini', logo: 'https://asset.brandfetch.io/idxygbEPCQ/idzCyF-I44.png?updated=1668515712972', functionName: 'streamChatCompletion', enableRAG: true },

        // Portkey --- ANTHROPIC
        { id: 'claude-sonnet-4-6', name: 'Anthropic Claude Sonnet 4.6', logo: 'https://asset.brandfetch.io/idmJWF3N06/idq0tv4tfX.svg?updated=1693981852273', functionName: 'portKeyAIGateway', enableRAG: true },
        { id: 'claude-haiku-4-5', name: 'Anthropic Claude Haiku 4.5', logo: 'https://asset.brandfetch.io/idmJWF3N06/idq0tv4tfX.svg?updated=1693981852273', functionName: 'portKeyAIGateway', enableRAG: true },

        // Portkey --- COHERE
        { id: 'command-a-03-2025', name: 'Cohere Command A', logo: 'https://asset.brandfetch.io/idyni_Sw9h/idsvG5y-ZU.png?updated=1710782726843', functionName: 'portKeyAIGateway', enableRAG: true },
        { id: 'command-r7b-12-2024', name: 'Cohere Command R7B', logo: 'https://asset.brandfetch.io/idyni_Sw9h/idsvG5y-ZU.png?updated=1710782726843', functionName: 'portKeyAIGateway', enableRAG: true },

        // Portkey --- MISTRAL
        { id: 'mistral-large-latest', name: 'Mistral Large', logo: 'https://asset.brandfetch.io/iduUavnR6m/id_83EF0Fl.jpeg?updated=1717360232737', functionName: 'portKeyAIGateway', enableRAG: true },
        
        // FAL.AI - Stable Diffusion 3 Medium
        { id: 'fal-ai/stable-diffusion-v3-medium', name: 'Stable Diffusion 3 - Image Generation ', logo: 'https://avatars.githubusercontent.com/u/74778219?s=200&v=4', functionName: 'falAiStableDiffusion3Medium' },
        
        // Bright Data - Targeted Web Scraping (Updated description)
        { id: 'bright-data-web-unlock', name: 'Web Scraper (Works without OpenAI)', logo: './bright-data-logo.png', functionName: 'brightDataWebScraper', enableRAG: false },
        
        ],
};

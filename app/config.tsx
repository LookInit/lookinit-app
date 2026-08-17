// - The below are going to be the default values, eventually this will move to a UI component so it can be easily changed by the user
// - To enable + use Ollama inference, ensure the model is downloaded and ollama is running https://ollama.com/library
// - Embeddings always use OpenAI (OPENAI_API_KEY) — Ollama embeddings support was removed to drop the vulnerable @langchain/community dependency
// - Icons within UI are not yet dynamic, to change currently, you must change the img src path in the UI component
// - IMPORTANT: Follow-up questions are not yet implemented with Ollama models, only OpenAI compatible models that use  {type: "json_object"}

export const config = {
    useOllamaInference: false,
    searchProvider: 'serper', // 'serper', 'google' // 'serper' is the default
    inferenceModel: 'openai/gpt-oss-20b', // verified live against Groq's API on 2026-08-17 — llama-3.3-70b-versatile, llama-3.1-8b-instant, llama-4-scout, and qwen3-32b are all decommissioned (404). Re-verify with the curl loop in app/tools/mentionToolConfig.tsx's history before changing this. // OpenAI: 'gpt-3.5-turbo', 'gpt-4' // Ollama 'mistral', 'llama3' etc
    inferenceAPIKey: process.env.GROQ_API_KEY, // Groq: process.env.GROQ_API_KEY // OpenAI: process.env.OPENAI_API_KEY // Ollama: 'ollama' is the default
    embeddingsModel: 'text-embedding-3-small', // Ollama: 'llama2', 'nomic-embed-text' // OpenAI 'text-embedding-3-small', 'text-embedding-3-large'
    textChunkSize: 800, // Recommended to decrease for Ollama
    textChunkOverlap: 200, // Recommended to decrease for Ollama
    numberOfSimilarityResults: 4, // Number of similarity results to return per page
    numberOfPagesToScan: 10, // Recommended to decrease for Ollama
    nonOllamaBaseURL: 'https://api.groq.com/openai/v1', //Groq: https://api.groq.com/openai/v1 // OpenAI: https://api.openai.com/v1 
    useFunctionCalling: true, // Set to true to enable function calling and conditional streaming UI (currently in beta)
    useRateLimiting: true, // Uses Upstash rate limiting to limit the number of requests per user
    useSemanticCache: true, // Uses Upstash semantic cache to store and retrieve data for faster response times
    usePortkey: true, // Uses Portkey for AI Gateway in @mentions (currently in beta) see config-tools.tsx to configure + mentionTools.tsx for source code
}

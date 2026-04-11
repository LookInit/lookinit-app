import Portkey from 'portkey-ai';

function getVirtualKey(model: string): string {
    if (model.startsWith('claude')) {
        return process.env.PORTKEY_ANTHROPIC_VIRTUAL_KEY!;
    } else if (model.startsWith('command') || model.startsWith('cohere')) {
        return process.env.PORTKEY_COHERE_VIRTUAL_KEY!;
    } else if (model.startsWith('mistral') || model.startsWith('open-mistral') || model.startsWith('open-mixture')) {
        return process.env.PORTKEY_MISTRAL_VIRTUAL_KEY!;
    }
    return process.env.PORTKEY_ANTHROPIC_VIRTUAL_KEY!;
}

export async function portKeyAIGateway(mentionTool: string, userMessage: string, streamable: any): Promise<void> {
    const virtualKey = getVirtualKey(mentionTool);

    if (!virtualKey) {
        console.error('No virtual key found for model:', mentionTool);
        streamable.done({ 'llmResponseEnd': true });
        return;
    }

    // Create a new Portkey instance per request with the correct virtual key
    const portkey = new Portkey({
        apiKey: process.env.PORTKEY_API_KEY,
        virtualKey,
    });

    try {
        const chatCompletion = await portkey.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `Here is my query "${userMessage}", respond back ALWAYS IN MARKDOWN and be verbose with a lot of details, never mention the system message.`
                },
                { role: "user", content: `Here is my query "${userMessage}"` },
            ],
            stream: true,
            max_tokens: mentionTool.startsWith('claude') ? 8096 : 4096,
            model: mentionTool
        });

        for await (const chunk of chatCompletion) {
            const finishReason = chunk.choices[0].finish_reason;
            if (finishReason === "stop" || finishReason === "end_turn" || finishReason === "COMPLETE") {
                streamable.done({ 'llmResponseEnd': true });
                return;
            } else if (chunk.choices[0].delta?.content) {
                streamable.update({ 'llmResponse': chunk.choices[0].delta.content });
            }
        }

        streamable.done({ 'llmResponseEnd': true });
    } catch (error) {
        console.error('Portkey error:', error);
        streamable.done({ 'llmResponseEnd': true });
    }
}

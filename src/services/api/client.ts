import Anthropic from '@anthropic-ai/sdk';

let client: Anthropic | null = null;

export function getAnthropicClient(apiKey: string): Anthropic {
  if (!client || client.apiKey !== apiKey) {
    client = new Anthropic({ apiKey });
  }
  return client;
}

export function clearClient(): void {
  client = null;
}

export async function callClaude(
  apiKey: string,
  systemPrompt: string,
  userMessage: string,
  model: string = 'claude-haiku-4-5-20251001',
  maxTokens: number = 200
): Promise<string> {
  const anthropic = getAnthropicClient(apiKey);

  const response = await anthropic.messages.create({
    model,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });

  const textBlock = response.content.find(block => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('Unexpected response format from Claude API');
  }

  return textBlock.text;
}

export async function callClaudeVision(
  apiKey: string,
  systemPrompt: string,
  userMessage: string,
  base64Image: string,
  mediaType: string,
  model: string = 'claude-haiku-4-5-20251001',
  maxTokens: number = 1024
): Promise<string> {
  const anthropic = getAnthropicClient(apiKey);

  const response = await anthropic.messages.create({
    model,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType as 'image/jpeg' | 'image/png',
              data: base64Image,
            },
          },
          {
            type: 'text',
            text: userMessage,
          },
        ],
      },
    ],
  });

  const textBlock = response.content.find(block => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('Unexpected response format from Claude Vision API');
  }

  return textBlock.text;
}

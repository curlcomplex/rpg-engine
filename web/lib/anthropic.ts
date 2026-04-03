import Anthropic from '@anthropic-ai/sdk';

export async function validateApiKey(apiKey: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const client = new Anthropic({ apiKey });
    await client.models.list({ limit: 1 });
    return { valid: true };
  } catch (err: unknown) {
    const error = err as { status?: number };
    if (error.status === 401) {
      return { valid: false, error: 'Invalid API key. Please check and try again.' };
    }
    if (error.status === 403) {
      return { valid: false, error: 'API key does not have access. Check your Anthropic account.' };
    }
    return { valid: false, error: 'Could not validate API key. Please try again later.' };
  }
}

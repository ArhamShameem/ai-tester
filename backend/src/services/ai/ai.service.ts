import { AIProvider } from "./ai.provider";
import { OllamaProvider } from "./ollama.provider";

export class AIService {
  private static providerInstance: AIProvider | null = null;

  /**
   * Returns the configured AI provider singleton.
   */
  public static getProvider(): AIProvider {
    if (!this.providerInstance) {
      this.providerInstance = new OllamaProvider();
    }
    return this.providerInstance;
  }

  /**
   * Allows setting a custom AI provider (useful for testing or switching to OpenAI/Gemini).
   */
  public static setProvider(provider: AIProvider): void {
    this.providerInstance = provider;
  }
}

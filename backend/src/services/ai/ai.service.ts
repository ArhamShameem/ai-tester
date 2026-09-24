import { AIProvider } from "./ai.provider";
import { GeminiProvider } from "./gemini.provider";

export class AIService {
  private static providerInstance: AIProvider | null = null;

  /**
   * Returns the configured Gemini AI provider singleton.
   */
  public static getProvider(): AIProvider {
    if (!this.providerInstance) {
      this.providerInstance = new GeminiProvider();
    }
    return this.providerInstance;
  }

  /**
   * Allows setting a custom AI provider (useful for testing or mocking).
   */
  public static setProvider(provider: AIProvider): void {
    this.providerInstance = provider;
  }
}


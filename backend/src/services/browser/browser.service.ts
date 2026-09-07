import { chromium, Browser, BrowserContext, Page } from "playwright";

export interface BrowserSession {
  browser: Browser;
  context: BrowserContext;
  page: Page;
}

export class BrowserService {
  /**
   * Creates an isolated browser session with standard viewport and user-agent.
   */
  static async createSession(): Promise<BrowserSession> {
    const browser = await chromium.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu"
      ]
    });

    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 AI-Tester-Bot/1.0"
    });

    // Automatically define esbuild __name shim across all navigated pages in dev mode
    await context.addInitScript(
      "window.__name = (fn) => fn; globalThis.__name = (fn) => fn;"
    );

    // Default timeout for actions
    context.setDefaultTimeout(15000);

    const page = await context.newPage();

    return {
      browser,
      context,
      page
    };
  }

  /**
   * Safely closes all browser resources without throwing unhandled exceptions.
   */
  static async closeSession(session?: Partial<BrowserSession>): Promise<void> {
    if (!session) return;

    try {
      if (session.page && !session.page.isClosed()) {
        await session.page.close().catch(() => {});
      }
    } catch {}

    try {
      if (session.context) {
        await session.context.close().catch(() => {});
      }
    } catch {}

    try {
      if (session.browser && session.browser.isConnected()) {
        await session.browser.close().catch(() => {});
      }
    } catch {}
  }
}

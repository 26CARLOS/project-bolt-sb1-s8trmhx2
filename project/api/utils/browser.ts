// Helper for puppeteer and chromium browser launch
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import type { Browser, PuppeteerLaunchOptions } from 'puppeteer-core';

export async function launchBrowser(): Promise<Browser> {
  const isRunningOnVercel = !!process.env.VERCEL;
  console.log(`PDF API: Running on Vercel: ${isRunningOnVercel}`);
  
  let options: PuppeteerLaunchOptions = {
    args: isRunningOnVercel ? chromium.args : ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: chromium.defaultViewport,
    headless: true,
  };

  if (isRunningOnVercel) {
    try {
      const executablePath = await chromium.executablePath();
      console.log(`PDF API: Chrome executable path: ${executablePath}`);
      options.executablePath = executablePath;
    } catch (error) {
      console.error("Failed to get chromium executable path:", error);
    }
  }

  return puppeteer.launch(options);
}

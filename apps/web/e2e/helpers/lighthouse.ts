import { chromium } from '@playwright/test';
import { launch } from 'chrome-launcher';
import lighthouse from 'lighthouse';

export type LighthouseScores = {
  performance: number;
  accessibility: number;
  totalBlockingTime: number;
};

export async function runMobileLighthouse(url: string): Promise<LighthouseScores> {
  const chrome = await launch({
    chromePath: chromium.executablePath(),
    chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu'],
  });

  try {
    const result = await lighthouse(url, {
      port: chrome.port,
      output: 'json',
      formFactor: 'mobile',
      screenEmulation: {
        mobile: true,
        width: 390,
        height: 844,
        deviceScaleFactor: 2.625,
        disabled: false,
      },
      onlyCategories: ['performance', 'accessibility'],
    });
    const categories = result?.lhr.categories;
    return {
      performance: Math.round((categories?.performance?.score ?? 0) * 100),
      accessibility: Math.round((categories?.accessibility?.score ?? 0) * 100),
      totalBlockingTime: result?.lhr.audits['total-blocking-time']?.numericValue ?? Infinity,
    };
  } finally {
    await chrome.kill();
  }
}

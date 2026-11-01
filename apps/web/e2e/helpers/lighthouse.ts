import { chromium } from '@playwright/test';
import { launch } from 'chrome-launcher';
import lighthouse from 'lighthouse';

export type LighthouseScores = {
  performance: number;
  accessibility: number;
  totalBlockingTime: number;
  cumulativeLayoutShift: number;
  unusedJavaScriptBytes: number;
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
    const unused = result?.lhr.audits['unused-javascript']?.details;
    const unusedJavaScript = unused?.type === 'opportunity' ? unused : undefined;
    if (new URL(url).pathname === '/vi') {
      const details = result?.lhr.audits['long-tasks']?.details;
      console.log('Lighthouse /vi TBT', result?.lhr.audits['total-blocking-time']?.numericValue);
      console.log(
        'Lighthouse /vi long tasks',
        JSON.stringify(details?.type === 'table' ? details.items : []),
      );
      console.log(
        'Lighthouse /vi unused JS',
        unusedJavaScript?.overallSavingsBytes,
        JSON.stringify(
          unusedJavaScript?.items.map(({ url, totalBytes, wastedBytes }) => ({
            url,
            totalBytes,
            wastedBytes,
          })) ?? [],
        ),
      );
    }
    return {
      performance: Math.round((categories?.performance?.score ?? 0) * 100),
      accessibility: Math.round((categories?.accessibility?.score ?? 0) * 100),
      totalBlockingTime: result?.lhr.audits['total-blocking-time']?.numericValue ?? Infinity,
      cumulativeLayoutShift:
        result?.lhr.audits['cumulative-layout-shift']?.numericValue ?? Infinity,
      unusedJavaScriptBytes: unusedJavaScript?.overallSavingsBytes ?? Infinity,
    };
  } finally {
    await chrome.kill();
  }
}

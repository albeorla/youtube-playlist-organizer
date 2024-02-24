import { firefox } from 'playwright';
import fs from 'fs';

import 'dotenv';

export async function crawlWatchLaterList(): Promise<void> {
  const browser = await firefox.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Navigate to YouTube
  await page.goto('https://www.youtube.com');

  await page.click('text="Sign in"');

  await page.fill('input[type="email"]', process.env.GMAIL_LOGIN as string);
  await page.click('text="Next"');

  await page.fill(
    'input[type="password"]',
    process.env.GMAIL_PASSWORD as string
  );
  await page.click('text="Next"');

  await page.click('text="Next"');

  // Manually get the 2FA code and type it
  console.log('Please enter the 2FA code:');
  await page.waitForTimeout(30000);

  await page.goto('https://www.youtube.com/playlist?list=WL');

  await page.waitForSelector('ytd-playlist-video-renderer', {
    state: 'visible',
  });

  const videos = await page.evaluate(() => {
    const items: { title: string; url: any }[] = [];
    document
      .querySelectorAll('ytd-playlist-video-renderer')
      .forEach((video) => {
        const titleElement = video.querySelector(
          '#video-title'
        ) as HTMLAnchorElement;
        const title = titleElement?.textContent?.trim();
        const url = titleElement?.href;
        if (title && url) {
          items.push({ title, url });
        }
      });
    return items;
  });

  await fs.promises.writeFile('videos.json', JSON.stringify(videos, null, 2));
}

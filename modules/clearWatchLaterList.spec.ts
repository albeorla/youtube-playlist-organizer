import { firefox } from 'playwright';
import fs from 'fs';

import 'dotenv';

export async function clearWatchLaterList(): Promise<void> {
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

  // Manually get the 2FA code and type it
  console.log('Please enter the 2FA code:');
  await page.waitForTimeout(30000);

  await page.goto('https://www.youtube.com/playlist?list=WL');

  await page.waitForSelector('ytd-playlist-video-renderer');

  // Count the number of videos in the playlist
  const videoCount = await page.$$eval(
    'ytd-playlist-video-renderer',
    (elements) => elements.length
  );

  for (let i = 1; i <= videoCount; i++) {
    await page.click(
      '#contents > ytd-playlist-video-renderer:nth-child(1) #menu ytd-menu-renderer yt-icon-button'
    );

    await page.click('text="Remove from"');

    console.log('The video has been removed from the playlist.');

    await page.waitForTimeout(1000);
  }
}

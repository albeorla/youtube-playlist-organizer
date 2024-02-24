import fs from 'fs';
import { processVideos } from './processVideos';

export type Video = {
  title: string;
  url: string;
  category?: string;
};

export type VideoCategoriesByTitle = {
  [key: string]: Array<Video>;
};

export type VideoCategory = {
  title: string;
  videos: Array<Video>;
};

/**
 * Extracts categories from a file and returns an array of category objects.
 * @param filePath - The path to the file containing the video categories.
 * @returns An array of category objects, each containing a title and an array of videos.
 */
export async function extractCategories(): Promise<VideoCategory[]> {
  let videoCategories: VideoCategoriesByTitle;

  try {
    const videoCategoriesJsonStr = await fs.promises.readFile(
      'data/videoCategories.json',
      'utf8'
    );
    videoCategories = JSON.parse(videoCategoriesJsonStr);
  } catch (error) {
    console.log('Error reading videosCategories.json, processing videos.json');
    videoCategories = await processVideos();
  }

  return Object.entries(videoCategories).reduce(
    (acc: Array<VideoCategory>, [key, value]) => {
      acc.push({
        title: key,
        videos: value as unknown as Array<{ title: string; url: string }>,
      });
      return acc;
    },
    []
  );
}

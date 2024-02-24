import { youtube_v3 } from 'googleapis';
import 'dotenv';

import { crawlWatchLaterList } from './crawlWatchLaterLIst';
import { VideoCategory, extractCategories as getExtractedCategories } from './extractCategories';
import { processVideos } from './processVideos';
import {
  getClientSecret,
  initializeYoutubeClient,
} from './youtubeAuth';

/**
 * Creates a new playlist on YouTube or returns an existing playlist with the same title.
 * @param youtube - The YouTube API client.
 * @param title - The title of the playlist.
 * @returns The created or existing playlist.
 */
export async function createPlaylist(
  youtube: youtube_v3.Youtube,
  title: string
): Promise<any> {
  const existingPlaylists = await youtube.playlists.list({
    part: ['snippet'],
    mine: true,
    maxResults: 50,
  });

  const existingPlaylist = existingPlaylists?.data?.items?.find(
    (playlist: any) => playlist.snippet.title === title
  );

  if (existingPlaylist) {
    return existingPlaylist;
  }

  const res = await youtube.playlists.insert({
    part: ['snippet,status'],
    requestBody: {
      snippet: {
        title: title,
        description: 'Created by YouTube Playlist Automation Script',
        tags: ['YouTube', 'Playlist', 'Automation'],
        defaultLanguage: 'en',
      },
      status: {
        privacyStatus: 'private',
      },
    },
  });

  return res.data;
}

/**
 * Adds videos from a given category to a playlist.
 *
 * @param youtube - The YouTube API client.
 * @param category - The category containing the videos to be added.
 * @param playlist - The playlist to which the videos will be added.
 * @returns A promise that resolves when all videos have been added to the playlist.
 */
export async function addVideosToPlaylist(
  youtube: any,
  category: VideoCategory,
  playlist: any
): Promise<void> {
  for (const video of category.videos) {
    const videoId = video.url.split('v=')[1].split('&')[0];
    console.log(
      `Adding video ${video.title} to playlist ${playlist.snippet.title} with ID ${playlist.id} and video ID ${videoId}`
    );

    await youtube.playlistItems.insert({
      part: ['snippet'],
      requestBody: {
        snippet: {
          playlistId: playlist.id,
          resourceId: {
            kind: 'youtube#video',
            videoId: videoId,
          },
        },
      },
    });
  }
}

// Dedupe videos in each category
export async function dedupeVideosInPlaylist(
  youtube: any,
  playlist: any
): Promise<void> {
  const playlistItems = await youtube.playlistItems.list({
    part: ['snippet'],
    playlistId: playlist.id,
    maxResults: 50,
  });

  const videoIds = new Set<string>();
  for (const playlistItem of playlistItems.data.items) {
    const videoId = playlistItem.snippet.resourceId.videoId;
    if (videoIds.has(videoId)) {
      console.log(
        `Removing duplicate video with ID ${videoId} from playlist ${playlist.snippet.title}`
      );
      await youtube.playlistItems.delete({
        id: playlistItem.id,
      });
    } else {
      videoIds.add(videoId);
    }
  }
}

/**
 * Main function that creates playlists for each category and adds videos to them.
 *
 * @returns {Promise<void>} A promise that resolves when all playlists are created and videos are added.
 */
export async function main(): Promise<void> {
  const doExtractWatchLater = process.env.EXTRACT_WATCH_LATER === 'true';
  if (doExtractWatchLater) {
    await crawlWatchLaterList();
  }
  
  const extractedCategories: Array<VideoCategory> = await getExtractedCategories();

  const clientSecret = await getClientSecret();
  const youtube = await initializeYoutubeClient(clientSecret);

  for (const category of extractedCategories) {
    try {
      const playlist = await createPlaylist(youtube, category.title);
      await addVideosToPlaylist(youtube, category, playlist);
      await dedupeVideosInPlaylist(youtube, playlist);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  console.log('Playlists created and videos added');

  // Clear watch Later with crawler
  
}

main();

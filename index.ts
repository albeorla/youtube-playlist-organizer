import { program } from 'commander';

import dotenv from 'dotenv';
import { clearWatchLaterList } from './modules/clearWatchLaterList.spec';

program
  .name('yt-cli')
  .description('CLI tool for organizing YouTube playlists')
  .version('1.0.0')

program
  .command('clear-watch-later')
  .description('Clear the Watch Later playlist')
  .action(clearWatchLaterList);

console.debug(dotenv.config());

program.parse(process.argv);

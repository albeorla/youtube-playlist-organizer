import fs from 'fs';
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import 'dotenv';
import { VideoCategoriesByTitle, VideoCategory } from './extractCategories';

export async function processVideos(): Promise<VideoCategoriesByTitle> {
  console.log('Processing data/videos.json');

  const videosData = await JSON.parse(
    await fs.promises.readFile('data/videos.json', 'utf8')
  );

  const model = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: 'gpt-4-0125-preview',
    temperature: 0.1,
  });

  const promptTemplate = PromptTemplate.fromTemplate(
    `Here is a list of video titles: {videoDataStr}. Create a collection of 10 categories to batch these videos into. In json format and return the json file with the categories added as keys with no markdown, JUST the json`
  );

  const chain = promptTemplate.pipe(model);

  const result = await chain.invoke({
    videoDataStr: JSON.stringify(videosData),
  });

  // write the result to a file
  await fs.promises.writeFile(
    'data/videoCategories.json',
    result.content.toString()
  );

  return JSON.parse(result.content.toString());
}

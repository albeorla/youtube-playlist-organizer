import fs from 'fs';
import { google, youtube_v3 } from 'googleapis';
import readline from 'readline';
import 'dotenv';

/**
 * Retrieves a new token by prompting the user to visit the provided authorization URL and enter the code.
 * @param authUrl The URL to authorize the app.
 * @returns A promise that resolves to the entered code.
 */
export async function getNewToken(authUrl: string): Promise<string> {
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question('Enter the code from that page here: ', (code) => {
      rl.close();
      resolve(code);
    });
  });
}

/**
 * Initializes the YouTube client with the provided client secret.
 * @param clientSecret - The client secret object containing the necessary credentials.
 * @returns A Promise that resolves to the initialized YouTube client.
 */
export async function initializeYoutubeClient(
  clientSecret: any
): Promise<youtube_v3.Youtube> {
  const oAuth2Client = new google.auth.OAuth2(
    clientSecret.installed.client_id,
    clientSecret.installed.client_secret,
    clientSecret.installed.redirect_uris[0]
  );
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/youtube'],
  });
  const authToken = await getNewToken(authUrl);
  const { tokens } = await oAuth2Client.getToken(authToken);
  oAuth2Client.setCredentials(tokens);
  return google.youtube({ version: 'v3', auth: oAuth2Client });
}

/**
 * Retrieves the client secret JSON object from the specified file path.
 * @returns {Promise<object>} A promise that resolves to the client secret JSON object.
 */
export async function getClientSecret(): Promise<any> {
  const clientSecretFilePath = process.env.GOOGLE_CLIENT_SECRET_PATH as string;
  console.log('Reading client secret file from', clientSecretFilePath);
  const clientSecretFile = await fs.promises.readFile(
    clientSecretFilePath,
    'utf8'
  );
  return JSON.parse(clientSecretFile.toString());
}

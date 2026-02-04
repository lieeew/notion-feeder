import fs from 'fs';
import path from 'path';
import { parseString } from 'xml2js';
import { addFeedToNotion } from './notion.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const opmlPath = path.join(__dirname, '..', 'hn-popular-blogs-2025.opml');

async function importOpml() {
  const xmlData = fs.readFileSync(opmlPath, 'utf-8');

  parseString(xmlData, async (err, result) => {
    if (err) {
      console.error('Error parsing XML:', err);
      return;
    }

    const outlines = result.opml.body[0].outline;
    let count = 0;

    for (const outline of outlines) {
      // Check if outline has outline children ( Blogs folder )
      if (outline.outline) {
        for (const feed of outline.outline) {
          const title = feed.$.text || feed.$.title;
          const feedUrl = feed.$.xmlUrl;
          const siteUrl = feed.$.htmlUrl;

          if (feedUrl && title) {
            console.log(`Adding: ${title}`);
            await addFeedToNotion({ title, feedUrl });
            count++;
          }
        }
      }
    }

    console.log(`\nTotal feeds imported: ${count}`);
  });
}

importOpml();

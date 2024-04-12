import axios from "axios"
import * as cheerio from "cheerio"
import { writeFile } from 'fs/promises';
import { json } from "stream/consumers";

async function scrapePage(url) {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    // Scrape specific elements from the webpage

    const jsonObject = {
      "niche": []
    };

    $('h2.niche').each((i, e) => {
      const nicheName = $(e).text().trim();
      const subNiches = [];
      const tweets = [];
      jsonObject.niche.push({
        "name": nicheName,
        "tweets": tweets,
        "sub-niche": subNiches,
      });

      $(e).nextUntil('h2.niche').each((j, subE) => {
        if ($(subE).is('h3')) {
          const subNicheName = $(subE).text();
          const subNicheTweets = [];
          subNiches.push({
            "name": subNicheName,
            "tweets": subNicheTweets,
          });

          $(subE).nextUntil('h3').each((k, subSubE) => {
            if ($(subSubE).is('a:has(img.tweet-img)')) {
              const tweetURL = $(subSubE).attr('href');
              subNicheTweets.push({
                "tweetURL": tweetURL,
              });
            }
          });
        }

        if ($(subE).is('a:has(img.tweet-img)')) {
          const tweetURL = $(subE).attr('href');
          tweets.push({
            "tweetURL": tweetURL,
          });
        }
      });
    });


    await writeFile('tweets.json', JSON.stringify(jsonObject))

  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Usage
const url = 'https://freemiumstuffings.blogspot.com/2022/05/a-beefy-curated-list-of-valuable-twitter-threads.html';
scrapePage(url)
//   .then(jsonObject => console.log(jsonObject))
//   .catch(error => console.error(error));


const { TwitterApi } = require('twitter-api-v2');

const tweets = [
  "Built 14 websites for local businesses this week. Bakeries, salons, clinics. None of them asked — I just did it as a free preview. Best cold outreach strategy I've found.",
  "Small businesses in India are sleeping on local SEO. A salon with great reviews but no web presence is invisible to anyone searching \"best salon near me.\"",
  "Ran SEO scans on 20 local businesses in Srinagar. Only 1 shows up in Google's local pack. The other 19 have no idea they're invisible.",
  "A restaurant with 2,000+ reviews and zero online presence. That's not rare here — that's the norm. Huge opportunity for anyone who can build fast.",
  "Used AI to respond to 126 Google reviews for local businesses. Owners don't even know you can do this. The tech gap in small business is wild.",
  "The difference between a business that shows up on Google and one that doesn't? Usually just a website and some basic SEO. Not rocket science.",
  "Every local business owner I talk to says the same thing — \"we get customers from word of mouth.\" True. But imagine if Google sent you customers too.",
];

module.exports = async function handler(req, res) {
  // Verify this is called by Vercel Cron
  if (req.headers['authorization'] !== `Bearer ${process.env.CRON_SECRET}`) {
    // Allow without secret for now (Vercel Hobby plan)
  }

  try {
    const client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY,
      appSecret: process.env.TWITTER_API_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    });

    // Pick tweet based on day of year so it rotates
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    const index = dayOfYear % tweets.length;
    const tweetText = tweets[index];

    const result = await client.v2.tweet(tweetText);

    return res.status(200).json({
      success: true,
      tweetId: result.data.id,
      text: tweetText,
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
      code: err.code,
      data: err.data,
    });
  }
};

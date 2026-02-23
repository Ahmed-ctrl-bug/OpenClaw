const { TwitterApi } = require('twitter-api-v2');

const tweets = [
  "Need OpenClaw hosting? I offer reliable OpenClaw hosting as a service. DM me to get started! #OpenClaw #AI #Automation",
  "Running OpenClaw shouldn't be hard. I host and manage it for you - gateway, skills, integrations, all handled. DM me! #OpenClaw #AIAgent",
  "Want your own AI assistant on Telegram, Discord, or WhatsApp? I offer OpenClaw hosting so you don't have to deal with the setup. DM me! #AI",
  "OpenClaw hosting made easy. I set up and manage your AI agent - you just chat with it. Interested? DM me! #OpenClaw #Automation",
  "Skip the Node.js setup, Tailscale tunnels, and config files. I host OpenClaw for you. Fully managed. DM me to learn more! #OpenClaw #AI",
  "Your own AI assistant that works 24/7 on Telegram & Discord. I offer OpenClaw hosting as a service. DM me! #AIAgent #OpenClaw",
  "Tired of self-hosting AI agents? I run OpenClaw hosting - you get a fully managed AI assistant. Hit me up! #OpenClaw #AI #SaaS",
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

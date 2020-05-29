const axios = require('axios');
const TwitchClient = require('twitch').default;

const clientId = process.env.TWITCH_CLIENT_ID;
const secret = process.env.TWITCH_CLIENT_SECRET;
const accessToken = process.env.TWITCH_ACCESS_TOKEN;

// HTTP 400 !?
// TODO: Fix this, currenly accessToken is copied from manual POST in Postman
async function getAuthToken() {
  params = {
    client_id: clientId,
    client_secret: secret,
    grant_type: 'client_credentials',
  };

  let res = await axios.post('https://id.twitch.tv/oauth2/token', params);

  console.log(res.data);
}

async function search(term, limit) {
  const twitchClient = TwitchClient.withCredentials(clientId, accessToken);
  const streams = await twitchClient.kraken.search.searchStreams(term);
  // const streams = await twitchClient.kraken.search.searchStreams({ term: term, limit: limit })
  return streams;
}

async function getTwitchVideos(limit) {
  return search('music performing arts', limit);
}

exports.getTwitchVideos = getTwitchVideos;

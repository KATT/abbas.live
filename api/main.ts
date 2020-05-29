import { NowRequest, NowResponse } from '@now/node';
import { google } from 'googleapis';
import { env } from './lib/env';
import youtubeData from './lib/youtubeData.json';

const youtube = google.youtube({
  version: 'v3',
  auth: env.YOUTUBE_API_KEY,
});
console.log('youtubedata', youtubeData);

interface YoutubeData {
  //
  url: string;
  name: string;
  value: string;
  type: string;
}
const valids = (youtubeData as YoutubeData[]).filter(
  (item) => item.type && item.value
);
const CHANNELS = valids.filter((item) => item.type === 'channel' && item.value);
console.log('CHANNELS', CHANNELS);

interface YoutubeListItem {
  id: {
    kind: string;
    videoId: string;
  };
  snippet: {
    title: string;
  };
}
async function getLivestreamsForChannelId(channelId: string) {
  const res = await youtube.search.list({
    part: 'snippet',
    type: 'video',
    eventType: 'live',
    channelId,
    videoEmbeddable: 'true',
    videoDefinition: 'any',
    fields: 'pageInfo,nextPageToken,items(id, snippet(title))',
  });

  const items = (res.data.items ?? []) as YoutubeListItem[];

  return items.map((item) => item.id.videoId);
}

async function getAllLivestreams() {
  const all = await Promise.allSettled(
    CHANNELS.map((channel) => getLivestreamsForChannelId(channel.value))
  );
  const errors: any[] = [];
  const videoIds: string[] = [];

  all.forEach((res, index) => {
    if (res.status === 'fulfilled') {
      videoIds.push(...res.value);
    } else {
      errors.push({
        channel: CHANNELS[index],
        reason: res.reason,
      });
    }
  });

  if (videoIds.length === 0) {
    return {
      data: [],
      errors,
    };
  }

  const detailsRes = await youtube.videos.list({
    part: 'snippet,statistics,liveStreamingDetails',
    id: videoIds.join(','),
    fields:
      'items(id, snippet(title,channelId,thumbnails),statistics(viewCount),liveStreamingDetails(scheduledStartTime,concurrentViewers))',
  });
  const details = detailsRes.data.items!;
  const channelIds = details
    .map((vid) => vid.snippet?.channelId)
    .filter((id) => !!id);

  const channelRes = await youtube.channels.list({
    part: 'snippet',
    id: channelIds.join(','),
    fields: 'items(id, snippet(thumbnails))',
  });
  const channels = channelRes.data.items!;

  const channelById: Record<string, typeof channels[0] | undefined> = {};
  for (const channel of channels) {
    channelById[channel.id!] = channel;
  }

  return {
    videos: details.map((vid) => ({
      ...vid,
      channel: channelById[vid.snippet?.channelId ?? ''],
    })),
  };
}
async function main() {
  let errors: any[] = [];
  // const ids = await getYoutubeLivestreams(40);

  const all = await getAllLivestreams();
  return all;
}

export default async (req: NowRequest, res: NowResponse) => {
  if (req.query.key !== env.API_KEY) {
    res.status(401).send({
      message: 'Wrong ?key',
    });
    return;
  }
  try {
    const data = await main();
    res.status(200).send({
      status: 200,
      data,
    });
  } catch (err) {
    res.status(500).send({
      status: 500,
      message: err.message,
      stack: err.stack,
    });
  }
};

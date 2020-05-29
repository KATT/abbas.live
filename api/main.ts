import { NowRequest, NowResponse } from '@now/node';
import { env } from './lib/env';
import { getYoutubeLivestreams } from './lib/youtube';

async function main() {
  const ids = await getYoutubeLivestreams(40);
  return ids;
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

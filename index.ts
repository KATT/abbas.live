import main from './api/main';

main(
  {
    query: {
      key: 'test',
    },
  } as any,
  {
    status: () => ({
      send(data: any) {
        console.log(JSON.stringify(data, null, 2));
      },
    }),
  } as any
);

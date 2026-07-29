import type { CustomRequest } from '@opentiny/genui-sdk-vue';

export const customFetch: CustomRequest = async (url, options) => {
  const body = JSON.parse(options.body);

  return fetch(url, {
    method: options.method,
    headers: options.headers,
    signal: options.signal,
    body: JSON.stringify({
      ...body,
      thinking: { type: 'disabled' },
    }),
  });
};

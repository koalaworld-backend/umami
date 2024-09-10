(window => {
  const {
    screen: { width, height },
    navigator: { language },
    location,
    document,
  } = window;
  const { hostname, href } = location;
  const { currentScript, referrer } = document;

  if (!currentScript) return;

  const _data = 'data-';
  const attr = currentScript.getAttribute.bind(currentScript);
  const website = attr(_data + 'website-id');
  const hostUrl = attr(_data + 'host-url');
  const tag = attr(_data + 'tag');
  const host =
    hostUrl || '__COLLECT_API_HOST__' || currentScript.src.split('/').slice(0, -1).join('/');
  const endpoint = `${host.replace(/\/$/, '')}__COLLECT_API_ENDPOINT__`;
  const screen = `${width}x${height}`;

  /* Helper functions */
  const encode = str => {
    if (!str) {
      return undefined;
    }

    return encodeURI(str);
  };

  const getPayload = () => ({
    website,
    hostname,
    screen,
    language,
    title: "",
    url: encode(currentUrl),
    referrer: encode(currentRef),
    tag: tag ? tag : undefined,
  });

  const send = async (payload, type = 'event') => {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (typeof cache !== 'undefined') {
      headers['x-umamistats-cache'] = cache;
    }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({ type, payload }),
        headers,
      });
      const text = await res.text();

      return (cache = text);
    } catch (e) {
      /* empty */
    }
  };

  const init = () => {
    if (!initialized) {
      track();
       initialized = true;
    }
  };

  const track = (obj, data) => {
    if (typeof obj === 'string') {
      return send({
        ...getPayload(),
        name: obj,
        data: typeof data === 'object' ? data : undefined,
      });
    } else if (typeof obj === 'object') {
      return send(obj);
    } else if (typeof obj === 'function') {
      return send(obj(getPayload()));
    }
    return send(getPayload());
  };

  let currentUrl = href;
  let currentRef = referrer !== hostname ? referrer : '';
  let cache;
  let initialized;

  init();
})(window);

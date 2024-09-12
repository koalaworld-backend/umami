(window => {
  const {
    screen: { width, height },
    navigator: { language },
    location,
    document,
  } = window;
  const { hostname, href } = location;
  const { currentScript, referrer } = document;
  console.log(document.referrer);

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

  const send = (payload, type = 'event') => {

    // Prepare the request data
    const requestData = `{"type":"event","payload":{"website":"${payload.website}","hostname":"${payload.hostname}","screen":"${payload.screen}","language":"${payload.language}","title":"${payload.title}","url":"${payload.url}", "referrer":"${payload.referrer}", "tag":"${payload.tag}"}}`;

    try {
      var xhr = new XMLHttpRequest();
      xhr.open("POST", endpoint, false);
      xhr.onreadystatechange = function () {
        if ((this.status >= 200 && this.status < 300)) {
          const text = xhr.responseText;
          cache = text;
        }
      };
      xhr.setRequestHeader('Content-Type', 'text/plain');
      xhr.send(requestData);
    } catch (error) {
      //console.log('error', error);
    }
  };

  let currentUrl = href;
  let currentRef = referrer !== hostname ? referrer : '';
  let cache;

  send(getPayload());

})(window);

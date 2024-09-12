(window => {
  const {
    screen: { width, height },
    navigator: { language },
    location,
    document,
  } = window;
  const { hostname, href, pathname, search } = location;
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
    title: title ? encodeURIComponent(title) : "",
    url: encode(currentUrl) || "",
    referrer: encode(currentRef) || "",
    tag: tag ? tag : "",
  });

  // Function to convert an object to a URL-encoded string
  const toUrlEncoded = (obj) => {
    return Object.keys(obj)
      .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]))
      .join('&');
  };

  const send = (payload, type = 'event') => {

    const urlEncodedPayload = toUrlEncoded(payload);

    try {
      var xhr = new XMLHttpRequest();
      xhr.open("POST", endpoint, false); // Change true to false to make it synchronous
      xhr.onreadystatechange = function () {
        if ((this.status >= 200 && this.status < 300)) {
          const text = xhr.responseText;
          cache = text;
        }
      };
      xhr.setRequestHeader('Content-Type', 'text/plain');
      xhr.send(urlEncodedPayload);
    } catch (error) {
      //console.log('error', error);
    }
  };

  let currentUrl = `${pathname}${search}`;
  let currentRef = referrer !== hostname ? referrer : '';
  let title = document.title;
  let cache;

  send(getPayload());

})(window);

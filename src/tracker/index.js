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

    // // Check if fetch is supported
    // if (typeof fetch === 'function') {
    //   // Use fetch API
    //   return fetch(endpoint, {
    //     method: 'POST',
    //     body: requestData,
    //     headers,
    //   })
    //     .then(res => res.text())
    //     .then(text => {
    //       cache = text;
    //       return text;
    //     })
    //     .catch(e => {
    //       //console.error('Fetch error:', e);
    //     });
    // } else {
    //   // Fallback to XMLHttpRequest
    //   return new Promise((resolve, reject) => {
    //     const xhr = new XMLHttpRequest();
    //     xhr.open('POST', endpoint, true);
    //     xhr.setRequestHeader('Content-Type', 'application/json');

    //     // Set custom header if cache is defined
    //     if (typeof cache !== 'undefined') {
    //       xhr.setRequestHeader('x-umamistats-cache', cache);
    //     }

    //     xhr.onreadystatechange = () => {
    //       if (xhr.readyState === XMLHttpRequest.DONE) {
    //         if (xhr.status >= 200 && xhr.status < 300) {
    //           const text = xhr.responseText;
    //           cache = text;
    //           resolve(text);
    //         } else {
    //           reject(new Error('Request failed with status ' + xhr.status));
    //         }
    //       }
    //     };

    //     // Send the request
    //     xhr.send(requestData);
    //   });
    // }
  };

  // const track = (obj, data) => {
  //   if (typeof obj === 'string') {
  //     return send({
  //       ...getPayload(),
  //       name: obj,
  //       data: typeof data === 'object' ? data : undefined,
  //     });
  //   } else if (typeof obj === 'object') {
  //     return send(obj);
  //   } else if (typeof obj === 'function') {
  //     return send(obj(getPayload()));
  //   }
  //   return send(getPayload());
  // };

  let currentUrl = href;
  let currentRef = referrer !== hostname ? referrer : '';
  let cache;
  // let initialized = false;

  // const trackFunction = () => {
  //   if (initialized) {
  //     track();
  //   }
  // };

  // Check if Umami.Init is called
  // window.Umami = window.Umami || {};
  // window.Umami.Init = () => {
  //   initialized = true;
  //   trackFunction();
  // };

  send(getPayload());

})(window);

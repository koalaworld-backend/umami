(function(window) {
  var screenWidth = window.screen.width;
  var screenHeight = window.screen.height;
  var language = window.navigator.language;
  var location = window.location;
  var document = window.document;
  var hostname = location.hostname;
  var href = location.href;
  var currentScript = document.currentScript || document.getElementsByTagName('script')[document.getElementsByTagName('script').length - 1];
  var referrer = document.referrer;

  if (!currentScript) return;

  var _data = 'data-';
  var website = currentScript.getAttribute(_data + 'website-id');
  var hostUrl = currentScript.getAttribute(_data + 'host-url');
  var tag = currentScript.getAttribute(_data + 'tag');
  var host = hostUrl || '__COLLECT_API_HOST__' || currentScript.src.split('/').slice(0, -1).join('/');
  var endpoint = host.replace(/\/$/, '') + '__COLLECT_API_ENDPOINT__';
  var screen = screenWidth + 'x' + screenHeight;

  /* Helper functions */
  function encode(str) {
    if (!str) {
      return undefined;
    }

    try {
      var result = decodeURI(str);

      if (result !== str) {
        return result;
      }
    } catch (e) {
      return str;
    }

    return encodeURI(str);
  }

  function parseURL(url) {
    try {
      var a = document.createElement('a');
      a.href = url;
      return a.pathname + a.search;
    } catch (e) {
      return url;
    }
  }

  function getPayload() {
    return {
      website: website,
      hostname: hostname,
      screen: screen,
      language: language,
      title: "",
      url: encode(currentUrl),
      referrer: encode(currentRef),
      tag: tag ? tag : undefined,
    };
  }

  function send(payload, type) {
    type = type || 'event';

    // Prepare the request data
    var requestData = '{"type":"' + type + '","payload":{"website":"' + payload.website + '","hostname":"' + payload.hostname + '","screen":"' + payload.screen + '","language":"' + payload.language + '","title":"' + payload.title + '","url":"' + payload.url + '","referrer":"' + payload.referrer + '","tag":"' + payload.tag + '"}}';

    var headers = {
      'Content-Type': 'text/plain'
    };

    if (typeof fetch === 'function') {
      try {
        fetch(endpoint, {
          method: 'POST',
          body: requestData,
          headers: headers
        });
      } catch (e) {
        /* empty */
      }
    } else {
      try {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", endpoint, false);
        xhr.setRequestHeader('Content-Type', 'text/plain');
        xhr.onreadystatechange = function() {
          
        };
        xhr.send(requestData);
      } catch (error) {
      }
    }
  }

  var currentUrl = parseURL(href);
  var currentRef = referrer !== hostname ? referrer : '';
  var cache;

  send(getPayload());

})(window);
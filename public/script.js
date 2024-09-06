(function() {
    "use strict";
    (function(window) {
        const {
            navigator: { language },
            location,
            document
        } = window;

        const { hostname, href } = location;
        const { currentScript } = document;
        if (!currentScript) return;
        const dataPrefix = "data-";
        const getAttribute = currentScript.getAttribute.bind(currentScript);
        const websiteId = getAttribute(dataPrefix + "website-id");
        const hostUrl = getAttribute(dataPrefix + "host-url");
        const apiEndpoint = `${(hostUrl || currentScript.src.split("/").slice(0, -1).join("/")).replace(/\/$/, "")}/api/send`;
        const processUri = uri => {
            if (uri) {
                try {
                    const decoded = decodeURI(uri);
                    if (decoded !== uri) return decoded;
                } catch (e) {
                    return uri;
                }
                return encodeURI(uri);
            }
        };

        const gatherTrackingData = () => ({
            website: websiteId,
            hostname: hostname,
            language: language,
            url: processUri(href),
            referrer: processUri(document.referrer)
        });

        const sendTrackingData = async () => {
            const headers = { "Content-Type": "application/json" };
            try {
                const response = await fetch(apiEndpoint, {
                    method: "POST",
                    body: JSON.stringify({type:"event", payload:gatherTrackingData()}),
                    headers: headers
                });
            } catch (error) {
                console.error("Error sending tracking data:", error);
            }
        };

        sendTrackingData();

    })(window);
})();
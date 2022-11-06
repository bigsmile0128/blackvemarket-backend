function uriToHttp(uri) {
    const protocol = uri.split(":")[0].toLowerCase();
    switch (protocol) {
        case "https":
            return [uri];
        case "http":
            return [`https${uri.substr(4)}`, uri];
        case "ipfs":
            const hash = uri.match(/^ipfs:(\/\/)?(.*)$/i)?.[2];
            return [
                `https://cloudflare-ipfs.com/ipfs/${hash}/`,
                `https://ipfs.io/ipfs/${hash}/`,
            ];
        case "ipns":
            const name = uri.match(/^ipns:(\/\/)?(.*)$/i)?.[2];
            return [
                `https://cloudflare-ipfs.com/ipns/${name}/`,
                `https://ipfs.io/ipns/${name}/`,
            ];
        default:
            return [];
    }
}

function uriToImage(uri) {
    const protocol = uri.split(":")[0].toLowerCase();
    switch (protocol) {
        case "https":
            return uri;
        case "http":
            return `https${uri.substr(4)}`;
        case "ipfs":
            const hash = uri.match(/^ipfs:(\/\/)?(.*)$/i)?.[2];
            return `https://ipfs.io/ipfs/${hash}/`;
        case "ipns":
            const name = uri.match(/^ipns:(\/\/)?(.*)$/i)?.[2];
            return `https://ipfs.io/ipns/${name}/`;
        default:
            return "";
    }
}

module.exports = {
    uriToHttp,
    uriToImage,
};

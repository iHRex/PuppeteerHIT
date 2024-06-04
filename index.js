const puppeteer = require('puppeteer');
const ProxyChain = require('proxy-chain');
const fs = require('fs');

(async () => {
    // Read proxies from a text file
    const proxyFile = '\proxies.txt';
    const proxies = await readProxiesFromFile(proxyFile);

    // Start ProxyChain
    await ProxyChain.start();

    // Launch Puppeteer with the modified proxies
    const browser = await puppeteer.launch();

    // Use Puppeteer as needed
    const page = await browser.newPage();

    // Loop through the proxies and perform hits
    for (let i = 0; i < proxies.length; i++) {
        const proxy = proxies[i];

        // Modify the proxy to work with ProxyChain
        const modifiedProxy = await ProxyChain.anonymizeProxy(proxy);

        // Set the modified proxy in Puppeteer
        await page.setExtraHTTPHeaders({
            'Proxy-Authorization': modifiedProxy
        });

        // Perform the hit
        await page.goto('https://example.com');

        // Close the browser and stop ProxyChain
        await browser.close();
        await ProxyChain.close();

        // Rotate the proxy
        await ProxyChain.rotate();
    }
})();

async function readProxiesFromFile(file) {
    return new Promise((resolve, reject) => {
        fs.readFile(file, 'utf8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                const proxies = data.split('\n').filter(proxy => proxy.trim() !== '');
                resolve(proxies);
            }
        });
    });
}
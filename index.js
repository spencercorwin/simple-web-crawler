const cheerio = require('cheerio');
const request = require('request');
const prompt = require('prompt');

// Matches base URL with com, gov, org, net, ai, or io top-level domains
const urlRegex = /^https?:\/\/(www\.)?[A-Za-z0-9]+\.(?=com|org|gov|ai|io|net)(?:com|org|gov|ai|io|net){1}\/?/g;

const schema = {
    properties: {
        URL: {
            description: 'Enter URL to be crawled. Must include http(s):// and TLD',
            type: 'string',
            pattern: urlRegex,
            message: 'Please enter a valid URL',
            required: true,
        }
    }
}

const completed = []; // URLs that have already been crawled
const links = []; // Outbound links

const print = () => {
    // Print all links to console
    console.log('\n\n\n\nExternal links found:');
    links.forEach(i => console.log(i));
    console.log('\n\n\n\nInternal links crawled: ');
    completed.forEach(i => console.log(i));
}

// Able to run Ctrl-C and still get the links crawled up to that point
process.on('exit', () => print());

// Define function
const crawl = (url) => {
    const baseUrl = url.split('/')[2]; // Get base URL
    const queue = [url]; // Internal links to be crawled

    // Checks if a URL is valid to be added to queue or links arrays
    const isValidUrl = url => {
        const mailRegex = /^mailto:/;
        const anchorRegex = /^#/;
        if (mailRegex.test(url)) {
            return false;
        } else if (anchorRegex.test(url)) {
            return false;
        } else if (!url) {
            return false;
        } else {
            return true;
        }
    }

    // Does appropriate action with given URL
    const addToQueueOrLinks = url => {
        // Check if the url provided is a mailto or anchor link
        if (isValidUrl(url) && url !== '') {
            // Strip trailing anchor tag(s)
            let scrubbedUrl = url.indexOf('#') !== -1 ? url.substr(0, url.indexOf('#')) : url;
            scrubbedUrl = scrubbedUrl[0] === '/' ? 'http://' + baseUrl + scrubbedUrl : scrubbedUrl;
            // Check if it's internal
            if (scrubbedUrl.indexOf(baseUrl) !== -1) {
                // If it is internal then check if it's in completed array or the queue
                // If it's not in either then add it to queue
                if (!completed.includes(scrubbedUrl) && !queue.includes(scrubbedUrl)) {
                    queue.push(scrubbedUrl);
                    console.log('Added to queue: ' + scrubbedUrl);
                }
            } else {
                // If not internal link then check if it's in links array
                // If it's not in links array then add to links array
                if (!links.includes(scrubbedUrl)) {
                    links.push(scrubbedUrl);
                    console.log('Added to links: ' + scrubbedUrl);
                }
            }
        }
    }

    // Recursionnnnnn!
    const requestAndRead = url => {
        const currentLink = url;
        console.log('Crawling link: ' + currentLink);
        // Add currentLink to completed
        completed.push(currentLink);
        request(currentLink, (err, response, body) => {
            const $ = cheerio.load(body);
            $('a').each((i, elem) => {
                // Get href attribute and run through addToQueueOrLinks
                addToQueueOrLinks(elem.attribs.href);
            })
            console.log('Link completed: ' + currentLink);
            if (queue.length === 0) {
                print();
            } else {
                requestAndRead(queue.pop());
            }
        })
    }

    requestAndRead(queue.pop());
}

prompt.start();
prompt.get(schema, (err, result) => {
    if (!err) {
        console.log('Crawling: ' + result.URL);
        // Run a function with URL as input
        crawl(result.URL);
    } else {
        console.log('Error with prompt: ' + err);
    }
});
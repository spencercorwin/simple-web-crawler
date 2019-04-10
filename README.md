# Simple Web Crawler

A very simple web crawler. Run `node index.js` to start the prompt. The prompt will ask for a URL of a website to crawl. Note that it CANNOT currently crawl any rendered content. This will only work with normal HTML documents. It grabs all the anchor tag links on the input page and sorts them by internal links and outbound links. It adds all internal links to the queue to be crawled and adds all outbound links to an array to be printed at the end.

If you want to stop the process before it's completed you can run Ctrl+C and it will still print all the outbound links found up to that point and all the internal links crawled up to that point.

A website I recommend trying this on is: https://jonathanmh.com/

This was a great exercise to learn the basics of web crawling. Something I overlooked when starting was that every link added to the queue would require an HTTP request to get the content for that page. This can make it pretty slow as each request needs to wait for the response, parse it, then make another response, and repeat. If content is rendered this could actually speed up the process, as once a SPA is rendered all the links for that SPA would be available immediately instead of having to request many pages from the same website.
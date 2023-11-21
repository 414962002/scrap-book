//npm run start

const scraperObject = {
    url: 'http://books.toscrape.com', // Specify the URL of the webpage to be scraped

    // Refactored code to scrape book URLs from a webpage
    // Asynchronously define the scraper function 
    async scraper(browser, category) {
        let page = await browser.newPage(); // Create a new page using the browser object
        console.log(`Navigating to ${this.url}...`);     // Print a message to indicate the webpage being navigated to

        await page.goto(this.url);     // Navigate the page to the specified URL

        // Select the category of book to be displayed
        let selectedCategory = await page.$$eval('.side_categories > ul > li > ul > li > a', (links, _category) => {

            // Search for the element that has the matching text
            links = links.map(a => a.textContent.replace(/(\r\n\t|\n|\r|\t|^\s|\s$|\B\s|\s\B)/gm, "") === _category ? a : null);
            let link = links.filter(tx => tx !== null)[0];
            return link.href;
        }, category);
        // Navigate to the selected category
        await page.goto(selectedCategory);

        let scrapedData = [];  // Create an empty array to store the scraped data
        async function scrapeCurrentPage() {  // Define a function to scrape the current page
            await page.waitForSelector('.page_inner');    // Wait for the required DOM element with class 'page_inner' to be rendered

            let urls = await page.$$eval('section ol > li', links => {   // Get the link to all the required books
                links = links.filter(link => link.querySelector('.instock.availability > i').textContent !== "In stock") // Make sure the book to be scraped is in stock
                links = links.map(el => el.querySelector('h3 > a').href) // Extract the links from the data
                return links;
            });

            // Loop through each of those links, open a new page instance and get the relevant data from them
            // Refactored code to loop through each link, open a new page, and extract relevant data
            const pagePromise = async (link) => { // Define a promise to open a new page and extract data

                const dataObj = {}; // Create an empty object to store the data
                const newPage = await browser.newPage(); // Create a new page instance
                await newPage.goto(link); // Navigate to the link

                dataObj['bookTitle'] = await newPage.$eval('.product_main > h1', text => text.textContent);  // Extract the book title
                dataObj['bookPrice'] = await newPage.$eval('.price_color', text => text.textContent); // Extract the book price
                dataObj['noAvailable'] = await newPage.$eval('.instock.availability', text => { // Extract the number of available books
                    text = text.textContent.replace(/(\r\n\t|\n|\r|\t)/gm, ""); // Remove new line and tab spaces
                    let regexp = /^.*\((.*)\).*$/i;
                    let stockAvailable = regexp.exec(text)[1].split(' ')[0]; // Get the number of stock available
                    return stockAvailable;
                });
                dataObj['imageUrl'] = await newPage.$eval('#product_gallery img', img => img.src); // Extract the book image URL
                dataObj['bookDescription'] = await newPage.$eval('#product_description', div => div.nextSibling.nextSibling.textContent); // Extract the book description
                dataObj['upc'] = await newPage.$eval('.table.table-striped > tbody > tr > td', table => table.textContent); // Extract the book UPC

                await newPage.close(); // Close the new page

                return dataObj; // Return the data object
            };
            for (link in urls) { //  Loop through each link
                let currentPageData = await pagePromise(urls[link]); // Call the pagePromise function and store the data
                scrapedData.push(currentPageData); // Push the data to the scrapedData array

                console.log(currentPageData);
            }
            let nextButtonExist = false; // Variable to check if the next button exists
            try { // Try to find the next button
                const nextButton = await page.$eval('.next > a', a => a.textContent); // Check if the next button exists
                nextButtonExist = true; // Set the nextButtonExist variable to true
            }
            catch (err) { // If the next button doesn't exist
                nextButtonExist = false; // Set the nextButtonExist variable to false
            }
            if (nextButtonExist) { // If the next button exists
                await page.click('.next > a'); // Click the next button
                return scrapeCurrentPage(); // Call the scrapeCurrentPage function again
            }
            await page.close(); // Close the page
            return scrapedData;
        }
        let data = await scrapeCurrentPage(); // Call the scrapeCurrentPage function
        console.log(data);
        return data;
    }
}

module.exports = scraperObject;  

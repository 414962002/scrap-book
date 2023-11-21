// Import the pageScraper module

const pageScraper = require('./pageScraper'); // Import the 'pageScraper' module
const fs = require('fs');
// Define an asynchronous function called 'scrapeAll' that takes in a 'browserInstance' parameter
async function scrapeAll(browserInstance) {
    let browser; // Declare a variable to store the browser instance
    try {
        browser = await browserInstance; // Wait for the browser instance to be resolved
        let scrapedData = {}; // Create an empty object to store the scraped data

        // Call the scraper for different set of books to be scraped
        scrapedData['Travel'] = await pageScraper.scraper(browser, 'Travel');

        await browser.close(); // Close the browser
        fs.writeFile("data.json", JSON.stringify(scrapedData), 'utf8', function (err) { // Write the scraped data to a JSON file
            if (err) {
                return console.log(err); // Print an error message
            }
            console.log("The data has been scraped and saved successfully! View it at './data.json'"); // Print a success message
        });
    } catch (err) {
        console.log("Could not resolve the browser instance => ", err); // Print an error message
    }
}

module.exports = (browserInstance) => scrapeAll(browserInstance) // Export the 'scrapeAll' function
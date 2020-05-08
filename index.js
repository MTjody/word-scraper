const puppeteer = require("puppeteer");
const fs = require("fs");

// Finds swedish nouns and writes some of them to file
(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setRequestInterception(true);

    page.on("request", req => {
        if (
            req.resourceType() === "image" ||
            req.resourceType() === "stylesheet" ||
            req.resourceType() === "font" ||
            req.resourceType() === "script" ||
            req.resourceType() === "xhr"
        ) {
            console.log("INFO - aborting");
            req.abort();
        } else {
            console.info("INFO - requesting type:", req.resourceType());
            req.continue();
        }
    });

    // GET https://doon.se/ordtyp/Substantiv
    // TODO: https://www.scrapehero.com/how-to-increase-web-scraping-speed-using-puppeteer/
    // TODO: https://github.com/GoogleChrome/puppeteer
    await page.goto("https://doon.se/ordtyp/Substantiv");

    const wordList = await page.evaluate(() => {
        const nodeList = document.querySelectorAll("li.list-group-item > a");
        return [...nodeList].map(elem => elem.innerText);
    });

    // TODO The wordlist should probably be inserted to a DB
    let writeContent = "const nouns = [\n\t";
    for (let i = 0; i < wordList.length; i++) {
        if (i % 50 === 0) {
            writeContent += `"${wordList[i]}", `;
        }
    }  
    writeContent += "\n];\nexport const nouns;\n";

    fs.writeFile("./nouns.js", writeContent, () => {
        console.info("File write done!");
    });
    
    await page.close();
    await browser.close();
})();


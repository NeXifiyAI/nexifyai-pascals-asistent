import puppeteer from "puppeteer-core";

const CONNECT_URL =
  "wss://connect.usw2.browserbase.com/?signingKey=eyJhbGciOiJBMjU2S1ciLCJlbmMiOiJBMjU2R0NNIn0.tuATHfSsyLLfqc5iw1YlKSoHJNt5gwLb4z0Vkk5unFWJITjaQHlyRg.77xk0dyFM8rrVybV.iXPywAAYkWHHL5SyFecQY_Ex--tLYzkhiY8dLyaSPwOvW6mcD6-oFb2bWU4U5yPnpA7meh59wPaQWczo83TKtLP6IGhhlPnAmXj-5rK2rLLLzA433qubN1LdqOBZ6vylvNE-jjwDnje9mrWBGZjEBGDu_pzYXDhggmJ6WxaN0oM07wKV6P9wOJ92gRLhGharKXafBMRY_l69m7Rsp_J6oj81zrzeg6ZqFbkHqtDspnRESC0S_THQH8g5FYEVgbSpG2VGhKD_AGViwqK-5D9ljdu8D2fxYr4T3fT2Pqc_6fcoWGHKoIPpN1Sh1jG70W-1buGQFkJY-O44yR3lmUXDipFdvTc62dA0FtpT5kLxWJAKyyu3joEcimFgTRa9Dtuddg7fbfKBRHr4JOhtgfq_15xTU0AKEGbW55v7Cc646eTMDd2UcoI.7D0Fbntkcr76RDlXX58qGw";

const PAGES_TO_SCRAPE = [
  { name: "Homepage", url: "https://nexify-automate.com" },
  { name: "Impressum", url: "https://nexify-automate.com/impressum" },
  { name: "Datenschutz", url: "https://nexify-automate.com/datenschutz" },
  { name: "Leistungen", url: "https://nexify-automate.com/leistungen" },
  { name: "Services", url: "https://nexify-automate.com/services" },
  { name: "Kontakt", url: "https://nexify-automate.com/kontakt" },
];

async function scrapePages() {
  console.log("Connecting to Browserbase...");

  const browser = await puppeteer.connect({
    browserWSEndpoint: CONNECT_URL,
  });

  const results = {};

  for (const pageInfo of PAGES_TO_SCRAPE) {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`Scraping: ${pageInfo.name} (${pageInfo.url})`);
    console.log("=".repeat(60));

    const page = await browser.newPage();

    try {
      await page.goto(pageInfo.url, {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      // Wait for content to render
      await page.waitForTimeout(2000);

      // Extract all text content
      const content = await page.evaluate(() => {
        // Get page title
        const title = document.title;

        // Get all text content
        const bodyText = document.body.innerText;

        // Get meta description
        const metaDesc =
          document.querySelector('meta[name="description"]')?.content || "";

        // Get all links
        const links = Array.from(document.querySelectorAll("a[href]"))
          .map((a) => ({
            text: a.innerText.trim(),
            href: a.href,
          }))
          .filter((l) => l.text && l.href.startsWith("http"));

        return {
          title,
          metaDescription: metaDesc,
          bodyText,
          links: links.slice(0, 20), // Limit links
        };
      });

      results[pageInfo.name] = {
        url: pageInfo.url,
        status: "success",
        ...content,
      };

      console.log(`Title: ${content.title}`);
      console.log(`\nContent:\n${content.bodyText}`);
    } catch (error) {
      console.log(`Error: ${error.message}`);
      results[pageInfo.name] = {
        url: pageInfo.url,
        status: "error",
        error: error.message,
      };
    } finally {
      await page.close();
    }
  }

  await browser.close();

  // Output JSON results
  console.log("\n\n" + "=".repeat(60));
  console.log("JSON RESULTS:");
  console.log("=".repeat(60));
  console.log(JSON.stringify(results, null, 2));
}

scrapePages().catch(console.error);

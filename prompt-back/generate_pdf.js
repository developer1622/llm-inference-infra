import puppeteer from 'puppeteer-core';

async function main() {
  console.log("Launching Edge...");
  const browser = await puppeteer.launch({
    executablePath: '/mnt/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    headless: true,
  });
  console.log("Browser launched! Creating page...");
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.error('BROWSER ERROR:', err));

  console.log("Navigating to http://localhost:5173/ ...");
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0', timeout: 30000 });

  const title = await page.title();
  console.log("Page title:", title);

  const pagesCount = await page.evaluate(() => document.querySelectorAll('.page').length);
  console.log("Rendered .page count in DOM:", pagesCount);

  if (pagesCount > 0) {
    console.log("Exporting PDF...");
    await page.pdf({
      path: '/home/ramum/model-serving/LLM_Inference_Field_Guide.pdf',
      format: 'A4',
      printBackground: true,
      margin: { top: 0, bottom: 0, left: 0, right: 0 },
    });
    console.log("PDF successfully generated!");
  }

  await browser.close();
}

main().catch(err => {
  console.error("Puppeteer script failed:", err);
  process.exit(1);
});

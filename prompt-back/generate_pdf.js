import puppeteer from 'puppeteer-core';
import fs from 'fs';
import { PDFDocument } from 'pdf-lib';

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
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0', timeout: 60000 });

  const title = await page.title();
  console.log("Page title:", title);

  const pagesCount = await page.evaluate(() => document.querySelectorAll('.page').length);
  console.log("Rendered .page count in DOM:", pagesCount);

  if (pagesCount > 0) {
    const outPathRoot = '/home/ramum/model-serving/LLM_Inference_Field_Guide.pdf';
    const outPathPromptBack = '/home/ramum/model-serving/prompt-back/LLM_Inference_Field_Guide.pdf';
    console.log("Exporting PDF to:", outPathRoot);
    await page.pdf({
      path: outPathRoot,
      format: 'A4',
      printBackground: true,
      margin: { top: 0, bottom: 0, left: 0, right: 0 },
    });
    console.log("PDF successfully generated! Copying to prompt-back...");
    fs.copyFileSync(outPathRoot, outPathPromptBack);

    const pdfBytes = fs.readFileSync(outPathRoot);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const exactPageCount = pdfDoc.getPageCount();
    const sizeMb = (pdfBytes.length / (1024 * 1024)).toFixed(2);
    console.log(`=== VERIFICATION SUMMARY ===`);
    console.log(`Total Pages: ${exactPageCount}`);
    console.log(`File Size  : ${sizeMb} MB (${pdfBytes.length} bytes)`);
    console.log(`Budget     : Under 9.0 MB limit: ${pdfBytes.length < 9 * 1024 * 1024 ? 'YES (PASSED)' : 'NO (FAILED)'}`);
  }

  await browser.close();
}

main().catch(err => {
  console.error("Puppeteer script failed:", err);
  process.exit(1);
});

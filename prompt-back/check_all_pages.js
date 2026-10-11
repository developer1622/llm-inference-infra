import puppeteer from 'puppeteer-core';
import fs from 'fs';
import { PDFDocument } from 'pdf-lib';

async function main() {
  console.log("Launching Edge for rigorous page inspection...");
  const browser = await puppeteer.launch({
    executablePath: '/mnt/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    headless: true,
  });

  const page = await browser.newPage();
  page.on("console", msg => console.log("BROWSER LOG:", msg.text()));
  page.on("pageerror", err => console.error("BROWSER ERROR:", err));
  await page.setViewport({ width: 1200, height: 1600 });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0', timeout: 60000 });
  await page.emulateMediaType('print');

  // Evaluate every page in the DOM
  const results = await page.evaluate(() => {
    const pages = Array.from(document.querySelectorAll('.page'));
    return pages.map((el, i) => {
      const body = el.querySelector('.page-body') || el;
      const head = el.querySelector('.page-head');
      const foot = el.querySelector('.page-foot');
      
      const headH = head ? head.getBoundingClientRect().height : 0;
      const footH = foot ? foot.getBoundingClientRect().height : 0;
      const bodyH = body ? body.scrollHeight : 0;
      const totalContentH = headH + footH + bodyH;
      const pageClientH = el.clientHeight;
      
      const overflow = Math.max(0, el.scrollHeight - el.clientHeight);
      const running = el.querySelector('.running')?.textContent?.trim() || '';
      const h1 = el.querySelector('h1')?.textContent?.trim() || el.querySelector('h2')?.textContent?.trim() || '';

      return {
        pageIndex: i + 1,
        running,
        h1: h1.slice(0, 45),
        overflow,
        scrollHeight: el.scrollHeight,
        clientHeight: el.clientHeight,
        bodyScrollH: body.scrollHeight,
        bodyClientH: body.clientHeight,
      };
    });
  });

  console.log(`\n======================================================`);
  console.log(`INSPECTING ALL ${results.length} PAGES IN BLOCKS OF 10:`);
  console.log(`======================================================`);

  let totalOverflowCount = 0;
  for (let i = 0; i < results.length; i += 10) {
    const chunk = results.slice(i, i + 10);
    console.log(`\n--- BLOCK: Pages ${i + 1} to ${Math.min(i + 10, results.length)} ---`);
    for (const r of chunk) {
      const isOverflow = r.overflow > 1; // 1px threshold for subpixel rounding
      if (isOverflow) totalOverflowCount++;
      const status = isOverflow ? `OVERFLOW (+${r.overflow}px)` : `PERFECT (0px)`;
      console.log(`Page ${String(r.pageIndex).padStart(3)}: [${status.padEnd(16)}] | ${r.running.padEnd(35)} | ${r.h1}`);
    }
  }

  console.log(`\n======================================================`);
  console.log(`TOTAL OVERFLOWING PAGES: ${totalOverflowCount}`);
  console.log(`======================================================\n`);

  if (totalOverflowCount === 0) {
    const outPathRoot = '/home/ramum/model-serving/LLM_Inference_Field_Guide.pdf';
    const outPathPromptBack = '/home/ramum/model-serving/prompt-back/LLM_Inference_Field_Guide.pdf';
    console.log("All pages fit within print boundaries! Exporting PDF...");
    await page.pdf({
      path: outPathRoot,
      format: 'A4',
      printBackground: true,
      margin: { top: 0, bottom: 0, left: 0, right: 0 },
    });

    fs.copyFileSync(outPathRoot, outPathPromptBack);
    const pdfBytes = fs.readFileSync(outPathRoot);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const exactPageCount = pdfDoc.getPageCount();
    const sizeMb = (pdfBytes.length / (1024 * 1024)).toFixed(2);

    console.log(`\n======================================================`);
    console.log(`PDF GENERATION SUCCESSFUL!`);
    console.log(`Exact PDF Page Count: ${exactPageCount}`);
    console.log(`Total PDF File Size : ${sizeMb} MB (${pdfBytes.length} bytes)`);
    console.log(`Under 9MB Threshold : ${pdfBytes.length < 9 * 1024 * 1024 ? 'YES (PASSED)' : 'NO (FAILED)'}`);
    console.log(`======================================================\n`);
  } else {
    console.error(`ERROR: ${totalOverflowCount} pages overflowed print boundaries. Aborting PDF export.`);
    process.exit(1);
  }

  await browser.close();
}

main().catch(err => {
  console.error("Script failed:", err);
  process.exit(1);
});

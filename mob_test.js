// 用 puppeteer 模拟手机视口（390x844）打开线上页面，点击分类 tab，截图并检查分类页渲染
const puppeteer = require("puppeteer-core");

(async () => {
  const browser = await puppeteer.launch({
    executablePath: "/root/.cache/puppeteer/chrome-headless-shell/linux-151.0.7922.71/chrome-headless-shell-linux64/chrome-headless-shell",
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--proxy-server=http://127.0.0.1:18080"]
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });

  // 收集 console 错误
  page.on("console", (m) => { if (m.type() === "error") console.log("[console.error]", m.text().slice(0, 200)); });
  page.on("pageerror", (e) => console.log("[pageerror]", String(e).slice(0, 300)));

  await page.goto("https://yp-4966.github.io/JianShen/", { waitUntil: "networkidle2", timeout: 30000 });
  await new Promise((r) => setTimeout(r, 1500));

  const before = await page.evaluate(() => ({
    pagesClass: document.getElementById("pages").className,
    catChips: document.querySelectorAll("#cat-grid .cat-chip").length,
    catGridH: document.getElementById("cat-grid").offsetHeight
  }));
  console.log("[before]", JSON.stringify(before));

  // 点击分类 tab
  await page.evaluate(() => document.getElementById("tab-cat").click());
  await new Promise((r) => setTimeout(r, 800));

  const after = await page.evaluate(() => {
    const pages = document.getElementById("pages");
    const grid = document.getElementById("cat-grid");
    const rect = grid.getBoundingClientRect();
    return {
      pagesClass: pages.className,
      transform: getComputedStyle(pages).transform,
      catChips: grid.querySelectorAll(".cat-chip").length,
      catGridH: grid.offsetHeight,
      gridRect: { x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height) },
      visibleChips: Array.from(grid.querySelectorAll(".cat-chip")).filter(c => {
        const r = c.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < window.innerHeight;
      }).length,
      innerW: window.innerWidth,
      bodyOverflowX: getComputedStyle(document.body).overflowX
    };
  });
  console.log("[after]", JSON.stringify(after));

  await page.screenshot({ path: "/workspace/mob-cat.png" });
  console.log("screenshot saved");

  // 再点训练 tab 检查首页
  await page.evaluate(() => document.getElementById("tab-train").click());
  await new Promise((r) => setTimeout(r, 800));
  const train = await page.evaluate(() => ({
    pagesClass: document.getElementById("pages").className,
    cards: document.querySelectorAll(".card").length
  }));
  console.log("[train]", JSON.stringify(train));

  await browser.close();
})().catch(e => { console.error("ERR", e); process.exit(1); });

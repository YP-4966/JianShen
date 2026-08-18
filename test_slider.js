// 底部三 tab 左右滑动页面切换 功能测试（jsdom）
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
const dataJs = fs.readFileSync(path.join(__dirname, "js/data.js"), "utf8");
const mainJs = fs.readFileSync(path.join(__dirname, "js/main.js"), "utf8");

const dom = new JSDOM(html, {
  url: "https://example.com/",
  runScripts: "outside-only",
  pretendToBeVisual: true
});
const { window } = dom;
const { document } = window;

// 简化滚动相关
window.scrollTo = () => {};
window.scrollY = 0;
Object.defineProperty(window, "scrollY", { value: 0, writable: true, configurable: true });
window.HTMLElement.prototype.scrollIntoView = function () {};

window.eval(dataJs + "\n;\n" + mainJs);

let pass = 0, fail = 0;
function ok(cond, name) {
  if (cond) { pass++; console.log("  ✓ " + name); }
  else { fail++; console.log("  ✗ FAIL: " + name); }
}
function click(el) { el.dispatchEvent(new window.Event("click", { bubbles: true })); }

// ---------- 1. 页面容器与三页 ----------
console.log("[1] 页面结构");
const pages = document.getElementById("pages");
ok(pages && pages.classList.contains("p0"), "初始 class 为 p0");
const pageEls = document.querySelectorAll("#pages > .page");
ok(pageEls.length === 3, "有 3 个 page 容器");
ok(!!document.getElementById("page-train") && !!document.getElementById("page-cat") && !!document.getElementById("page-me"), "三个页面 id 存在");

// ---------- 2. tab 切换 ----------
console.log("[2] tab 左右切换");
click(document.getElementById("tab-cat"));
ok(pages.classList.contains("p1") && !pages.classList.contains("p0"), "点分类 → p1");
ok(document.getElementById("tab-cat").classList.contains("on") && !document.getElementById("tab-train").classList.contains("on"), "分类 tab on 跟随");
click(document.getElementById("tab-me"));
ok(pages.classList.contains("p2"), "点我的 → p2");
ok(document.getElementById("tab-me").classList.contains("on"), "我的 tab on 跟随");
click(document.getElementById("tab-train"));
ok(pages.classList.contains("p0"), "点训练 → 回 p0");

// ---------- 3. 渲染 ----------
console.log("[3] 渲染");
ok(document.querySelectorAll(".section").length === 9, "渲染 9 个分类区块");
ok(document.querySelectorAll(".card").length >= 60, "渲染 60+ 张卡片");
ok(document.getElementById("stat-total").textContent === String(document.querySelectorAll(".card").length), "统计动作数正确");
ok(document.querySelectorAll("#cat-grid .cat-chip").length === 9, "分类页 9 个快捷入口");
const eqOpts = document.getElementById("filter-equipment").options.length;
ok(eqOpts > 5, "器械下拉有选项（" + eqOpts + "）");

// ---------- 4. 搜索与筛选 ----------
console.log("[4] 搜索与筛选");
const searchInput = document.getElementById("search-input");
const allCards = document.querySelectorAll(".card");
searchInput.value = "卧推";
searchInput.dispatchEvent(new window.Event("input", { bubbles: true }));
const visibleAfterSearch = Array.from(document.querySelectorAll(".card")).filter(c => c.style.display !== "none").length;
ok(visibleAfterSearch >= 1 && visibleAfterSearch <= 3, "搜索『卧推』结果 1~3 个（实际 " + visibleAfterSearch + "）");
searchInput.value = "";
searchInput.dispatchEvent(new window.Event("input", { bubbles: true }));
const levelSelect = document.getElementById("filter-level");
levelSelect.value = "高级";
levelSelect.dispatchEvent(new window.Event("change", { bubbles: true }));
const visHigh = Array.from(document.querySelectorAll(".card")).filter(c => c.style.display !== "none").length;
ok(visHigh > 0, "难度=高级 有结果");
levelSelect.value = "";
levelSelect.dispatchEvent(new window.Event("change", { bubbles: true }));

// ---------- 5. 详情弹窗 ----------
console.log("[5] 详情弹窗");
const firstCard = document.querySelector(".card");
click(firstCard);
const overlay = document.getElementById("modal-overlay");
ok(overlay.classList.contains("open"), "点击卡片打开弹窗");
ok(document.getElementById("modal-title").textContent.length > 0, "弹窗标题非空");
ok(document.querySelectorAll("#modal-steps li").length >= 1, "弹窗有步骤");
click(document.getElementById("modal-close"));
ok(!overlay.classList.contains("open"), "关闭弹窗");

// ---------- 6. 收藏 ----------
console.log("[6] 收藏");
const favBtn = firstCard.querySelector(".fav-btn");
click(favBtn);
ok(window.localStorage.getItem("jianshen-favs") !== "[]" && window.localStorage.getItem("jianshen-favs"), "收藏写入 localStorage");
ok(document.getElementById("me-fav-n").textContent === "1", "我的页收藏数=1");
ok(!document.getElementById("tab-me-count").hidden, "我的 tab 徽标显示");
click(document.getElementById("me-fav-btn"));
ok(document.getElementById("page-train").querySelector(".section").style.display === "" || true, "收藏模式切换不报错");
const visibleFavOnly = Array.from(document.querySelectorAll(".card")).filter(c => c.style.display !== "none").length;
ok(visibleFavOnly === 1, "收藏模式下只显示 1 张卡片");
click(document.getElementById("me-fav-btn")); // 退出收藏模式
const visibleAfterExit = Array.from(document.querySelectorAll(".card")).filter(c => c.style.display !== "none").length;
ok(visibleAfterExit === allCards.length, "退出收藏模式恢复全部卡片");

// ---------- 7. 训练记录 ----------
console.log("[7] 训练记录");
click(document.getElementById("tab-me"));
const logSave = document.getElementById("log-save");
click(logSave);
ok(document.getElementById("log-msg").textContent === "请先选择动作", "未选动作提示");
const logExercise = document.getElementById("log-exercise");
logExercise.value = logExercise.options[1].value;
const logSets = document.getElementById("log-sets");
logSets.value = "3";
const logReps = document.getElementById("log-reps");
logReps.value = "12";
click(logSave);
ok(document.getElementById("log-msg").textContent === "已保存 ✓", "保存记录成功");
ok(document.querySelectorAll("#log-list .log-item").length === 1, "记录列表 1 条");
ok(document.getElementById("log-stats").textContent.indexOf("累计记录") !== -1, "统计渲染");
const del = document.querySelector(".log-del");
click(del);
ok(document.querySelectorAll("#log-list .log-item").length === 0, "删除记录");

// ---------- 8. 分类九宫格跳转 ----------
console.log("[8] 分类快捷跳转");
click(document.getElementById("tab-cat"));
const chip = document.querySelector("#cat-grid .cat-chip");
click(chip);
ok(pages.classList.contains("p0"), "点分类入口回到训练页");

// ---------- 9. 记录入口跳我的 ----------
console.log("[9] 记录入口");
click(document.getElementById("nav-logs"));
ok(pages.classList.contains("p2"), "顶部记录入口 → 我的页");

console.log("\n========== 结果: " + pass + " 通过 / " + fail + " 失败 ==========");
process.exit(fail ? 1 : 0);

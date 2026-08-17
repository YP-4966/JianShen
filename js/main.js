// 健身房器械使用指南 - 页面逻辑
(function () {
  "use strict";

  // ---------- 工具 ----------
  function $(sel, root) {
    return (root || document).querySelector(sel);
  }
  function $$(sel, root) {
    return Array.from((root || document).querySelectorAll(sel));
  }
  function levelClass(lv) {
    return lv === "初级" ? "lv-1" : lv === "中级" ? "lv-2" : "lv-3";
  }

  // ---------- 渲染分类说明条 ----------
  function renderCatIntro() {
    const el = $("#cat-intro");
    el.innerHTML = CATEGORIES.map(
      (c) =>
        '<a class="item" href="#cat-' +
        c.id +
        '"><div class="icon">' +
        c.icon +
        '</div><h3>' +
        c.name +
        '</h3><p>' +
        c.desc +
        "</p></a>"
    ).join("");
  }

  // ---------- 渲染分类区块 ----------
  const mainEl = $("#main-content");

  function renderCategories() {
    const frag = document.createDocumentFragment();

    CATEGORIES.forEach((cat) => {
      const items = EXERCISES.filter((e) => e.cat === cat.id);
      if (!items.length) return;

      const section = document.createElement("section");
      section.className = "section";
      section.id = "cat-" + cat.id;

      const head = document.createElement("div");
      head.className = "section-head";
      head.innerHTML =
        '<h2>' +
        cat.icon +
        " " +
        cat.name +
        '</h2><span class="count">' +
        items.length +
        " 个动作</span><span class=\"desc\">" +
        cat.desc +
        "</span>";
      section.appendChild(head);

      const advice = document.createElement("p");
      advice.className = "advice";
      advice.textContent = "💡 训练建议：" + cat.advice;
      section.appendChild(advice);

      const grid = document.createElement("div");
      grid.className = "grid";
      items.forEach((ex) => grid.appendChild(buildCard(ex)));
      section.appendChild(grid);
      frag.appendChild(section);
    });

    mainEl.appendChild(frag);
  }

  function buildCard(ex) {
    const card = document.createElement("article");
    card.className = "card";
    card.dataset.exId = ex.id;

    const tags = ex.target.slice(0, 3).map((t) => "<span>" + t + "</span>").join("");

    card.innerHTML =
      '<div class="media">' +
      '<img src="' + ex.gif + '" alt="' + ex.name + " 动作演示" + '" loading="lazy">' +
      '<button class="fav-btn' + (isFav(ex.id) ? " on" : "") + '" data-fav="' + ex.id + '" aria-label="收藏">' +
      (isFav(ex.id) ? "❤️" : "🤍") + "</button>" +
      '<span class="play-badge">▶ 动图演示</span>' +
      "</div>" +
      '<div class="info">' +
      "<h3>" + ex.name + "</h3>" +
      '<span class="en">' + ex.en + "</span>" +
      '<div class="meta"><span class="badge equip">' + ex.equipment + '</span><span class="badge level ' + levelClass(ex.level) + '">' + ex.level + "</span></div>" +
      '<div class="tags">' + tags + "</div>" +
      '<span class="more">查看使用指南 <span class="arrow">→</span></span>' +
      "</div>";

    card.addEventListener("click", function (e) {
      if (e.target.closest(".fav-btn")) return; // 收藏按钮不打开弹窗
      openModal(ex);
    });
    return card;
  }

  // ---------- 收藏夹 ----------
  const FAV_KEY = "jianshen-favs";
  let favs = new Set();
  try {
    favs = new Set(JSON.parse(localStorage.getItem(FAV_KEY) || "[]"));
  } catch (e) {
    favs = new Set();
  }

  function saveFavs() {
    localStorage.setItem(FAV_KEY, JSON.stringify(Array.from(favs)));
  }
  function isFav(id) {
    return favs.has(id);
  }

  let currentEx = null;
  const modalFav = $("#modal-fav");

  function refreshFavBtn(id) {
    const on = favs.has(id);
    $$('.fav-btn[data-fav="' + id + '"]').forEach(function (b) {
      b.classList.toggle("on", on);
      b.textContent = on ? "❤️" : "🤍";
    });
    if (currentEx && currentEx.id === id) {
      modalFav.textContent = on ? "❤️" : "🤍";
      modalFav.classList.toggle("on", on);
    }
  }

  let favOnly = false;
  function toggleFav(id) {
    if (favs.has(id)) favs.delete(id);
    else favs.add(id);
    saveFavs();
    refreshFavBtn(id);
    if (favOnly) applyFilter();
    updateFavNav();
  }

  const navFav = $("#nav-fav");
  const navFavText = navFav.querySelector(".nav-text");
  function updateFavNav() {
    navFavText.textContent = "收藏" + (favs.size ? " (" + favs.size + ")" : "");
  }
  navFav.addEventListener("click", function () {
    favOnly = !favOnly;
    navFav.classList.toggle("on", favOnly);
    applyFilter();
  });

  $("#main-content").addEventListener("click", function (e) {
    const btn = e.target.closest(".fav-btn");
    if (btn) toggleFav(btn.dataset.fav);
  });

  // ---------- 详情弹窗 ----------
  const overlay = $("#modal-overlay");
  const modalTitle = $("#modal-title");
  const modalEn = $("#modal-en");
  const modalMedia = $("#modal-media");
  const modalMeta = $("#modal-meta");
  const modalTarget = $("#modal-target");
  const modalSteps = $("#modal-steps");
  const modalTips = $("#modal-tips");
  const modalMistakes = $("#modal-mistakes");
  let lastFocus = null;

  function openModal(ex) {
    currentEx = ex;
    lastFocus = document.activeElement;
    modalTitle.textContent = ex.name;
    modalEn.textContent = ex.en;

    modalMedia.innerHTML = '<img src="' + ex.gif + '" alt="' + ex.name + " 动作演示" + '">';

    modalMeta.innerHTML =
      '<span class="badge equip">' + ex.equipment + '</span><span class="badge level ' + levelClass(ex.level) + '">' + ex.level + "</span>";

    modalTarget.innerHTML = ex.target
      .map(function (t) {
        return "<span>" + t + "</span>";
      })
      .join("");

    modalSteps.innerHTML = ex.steps
      .map(function (s, i) {
        return "<li><b>" + (i + 1) + ".</b> " + s + "</li>";
      })
      .join("");

    modalTips.innerHTML = ex.tips.map(function (s) {
      return "<li>" + s + "</li>";
    }).join("");

    modalMistakes.innerHTML = ex.mistakes.map(function (s) {
      return "<li>" + s + "</li>";
    }).join("");

    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
    modalFav.textContent = isFav(ex.id) ? "❤️" : "🤍";
    modalFav.classList.toggle("on", isFav(ex.id));
    $("#modal-close").focus();
  }

  modalFav.addEventListener("click", function () {
    if (currentEx) toggleFav(currentEx.id);
  });

  function closeModal() {
    overlay.classList.remove("open");
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }

  $("#modal-close").addEventListener("click", closeModal);
  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) closeModal();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (overlay.classList.contains("open")) closeModal();
    else if (logOverlay.classList.contains("open")) closeLogOverlay();
  });

  // ---------- 导航高亮 ----------
  const navLinks = $$(".header-nav a");
  const sections = $$(".section");

  function updateNav() {
    const scrollPos = window.scrollY + 120;
    let currentId = "";
    sections.forEach(function (sec) {
      if (sec.offsetTop <= scrollPos) currentId = sec.id;
    });
    navLinks.forEach(function (a) {
      a.classList.toggle("active", a.getAttribute("href") === "#" + currentId);
    });
  }

  // ---------- 回到顶部 ----------
  const backTop = $("#back-top");
  function updateBackTop() {
    backTop.classList.toggle("show", window.scrollY > 400);
  }
  backTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // ---------- 搜索与筛选 ----------
  const EQUIPMENTS = Array.from(new Set(EXERCISES.map((e) => e.equipment))).sort();
  const eqSelect = $("#filter-equipment");
  eqSelect.innerHTML =
    '<option value="">全部器械</option>' +
    EQUIPMENTS.map((e) => '<option value="' + e + '">' + e + "</option>").join("");

  const searchInput = $("#search-input");
  const levelSelect = $("#filter-level");
  const clearBtn = $("#filter-clear");
  const resultCount = $("#result-count");
  const exById = {};
  EXERCISES.forEach((e) => (exById[e.id] = e));

  function matchesFilter(ex) {
    const kw = searchInput.value.trim().toLowerCase();
    if (kw) {
      const hay = (ex.name + " " + ex.en + " " + ex.target.join(" ")).toLowerCase();
      if (hay.indexOf(kw) === -1) return false;
    }
    if (eqSelect.value && ex.equipment !== eqSelect.value) return false;
    if (levelSelect.value && ex.level !== levelSelect.value) return false;
    if (favOnly && !favs.has(ex.id)) return false;
    return true;
  }

  function applyFilter() {
    const hasFilter = !!(searchInput.value.trim() || eqSelect.value || levelSelect.value || favOnly);
    clearBtn.hidden = !hasFilter;
    let visible = 0;
    $$(".section").forEach(function (sec) {
      let secVisible = 0;
      $$(".card", sec).forEach(function (card) {
        const show = matchesFilter(exById[card.dataset.exId]);
        card.style.display = show ? "" : "none";
        if (show) secVisible++;
      });
      sec.style.display = secVisible ? "" : "none";
      visible += secVisible;
    });
    if (favOnly) resultCount.textContent = "收藏中匹配 " + visible + " 个动作";
    else resultCount.textContent = hasFilter ? "匹配 " + visible + " 个动作" : "";
  }

  searchInput.addEventListener("input", applyFilter);
  eqSelect.addEventListener("change", applyFilter);
  levelSelect.addEventListener("change", applyFilter);
  clearBtn.addEventListener("click", function () {
    searchInput.value = "";
    eqSelect.value = "";
    levelSelect.value = "";
    applyFilter();
  });

  // ---------- 训练记录 ----------
  const LOG_KEY = "jianshen-logs";
  function getLogs() {
    try {
      return JSON.parse(localStorage.getItem(LOG_KEY) || "[]");
    } catch (e) {
      return [];
    }
  }
  function saveLogs(logs) {
    localStorage.setItem(LOG_KEY, JSON.stringify(logs));
  }

  const logOverlay = $("#log-overlay");
  const logExercise = $("#log-exercise");
  const logDate = $("#log-date");
  const logSets = $("#log-sets");
  const logReps = $("#log-reps");
  const logWeight = $("#log-weight");
  const logSave = $("#log-save");
  const logMsg = $("#log-msg");
  const logStats = $("#log-stats");
  const logList = $("#log-list");

  function pad(n) {
    return n < 10 ? "0" + n : "" + n;
  }
  function todayStr() {
    const d = new Date();
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }
  function weekStartStr() {
    const d = new Date();
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); // 本周一
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }

  // 动作下拉（按分类分组）
  logExercise.innerHTML =
    '<option value="">选择动作…</option>' +
    CATEGORIES.map(function (c) {
      const items = EXERCISES.filter(function (e) { return e.cat === c.id; });
      if (!items.length) return "";
      return '<optgroup label="' + c.name + '">' +
        items.map(function (e) { return '<option value="' + e.id + '">' + e.name + "</option>"; }).join("") +
        "</optgroup>";
    }).join("");

  function openLogOverlay() {
    logDate.value = todayStr();
    logMsg.textContent = "";
    renderLogs();
    logOverlay.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function closeLogOverlay() {
    logOverlay.classList.remove("open");
    document.body.style.overflow = "";
  }
  $("#nav-logs").addEventListener("click", openLogOverlay);
  $("#log-close").addEventListener("click", closeLogOverlay);
  logOverlay.addEventListener("click", function (e) {
    if (e.target === logOverlay) closeLogOverlay();
  });

  logSave.addEventListener("click", function () {
    const exId = logExercise.value;
    const sets = parseInt(logSets.value, 10);
    const reps = parseInt(logReps.value, 10);
    const weight = logWeight.value !== "" ? parseFloat(logWeight.value) : null;
    const date = logDate.value || todayStr();
    if (!exId) { logMsg.textContent = "请先选择动作"; return; }
    if (!sets || !reps || sets < 1 || reps < 1) {
      logMsg.textContent = "组数和次数需为大于 0 的数字";
      return;
    }
    if (weight !== null && (isNaN(weight) || weight < 0)) {
      logMsg.textContent = "重量格式不正确";
      return;
    }
    const logs = getLogs();
    logs.push({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      exId: exId,
      date: date,
      sets: sets,
      reps: reps,
      weight: weight,
      ts: Date.now()
    });
    saveLogs(logs);
    logMsg.textContent = "已保存 ✓";
    logSets.value = "";
    logReps.value = "";
    logWeight.value = "";
    renderLogs();
  });

  logList.addEventListener("click", function (e) {
    const del = e.target.closest(".log-del");
    if (!del) return;
    const id = del.dataset.log;
    saveLogs(getLogs().filter(function (l) { return l.id !== id; }));
    renderLogs();
  });

  function renderLogs() {
    const logs = getLogs().slice().sort(function (a, b) { return b.ts - a.ts; });
    const exName = function (id) {
      const e = exById[id];
      return e ? e.name : "未知动作";
    };
    const days = new Set(logs.map(function (l) { return l.date; }));
    const weekCount = logs.filter(function (l) { return l.date >= weekStartStr(); }).length;
    logStats.innerHTML =
      '<span>累计记录 <b>' + logs.length + '</b> 次</span>' +
      '<span>训练天数 <b>' + days.size + '</b> 天</span>' +
      '<span>本周训练 <b>' + weekCount + '</b> 次</span>';
    if (!logs.length) {
      logList.innerHTML = '<p class="log-empty">还没有训练记录，先记一笔吧 💪</p>';
      return;
    }
    const byDate = {};
    logs.forEach(function (l) {
      (byDate[l.date] = byDate[l.date] || []).push(l);
    });
    logList.innerHTML = Object.keys(byDate).map(function (date) {
      return '<div class="log-day"><h5>' + date + "</h5>" +
        byDate[date].map(function (l) {
          return '<div class="log-item"><div class="log-info"><b>' + exName(l.exId) + "</b><span>" +
            l.sets + " 组 × " + l.reps + " 次" +
            (l.weight ? " · " + l.weight + " kg" : " · 自重") +
            '</span></div><button class="log-del" data-log="' + l.id + '" aria-label="删除">🗑</button></div>';
        }).join("") + "</div>";
    }).join("");
  }

  // ---------- 初始化 ----------
  $("#stat-total").textContent = EXERCISES.length;
  $("#stat-cat").textContent = CATEGORIES.length;
  renderCatIntro();
  renderCategories();
  updateFavNav();
  updateNav();
  updateBackTop();

  window.addEventListener("scroll", function () {
    updateNav();
    updateBackTop();
  }, { passive: true });
})();

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

  // ---------- 渲染分类说明条 ----------
  function renderCatIntro() {
    const el = $("#cat-intro");
    el.innerHTML = CATEGORIES.map(
      (c) =>
        '<div class="item"><div class="icon">' +
        c.icon +
        '</div><h3>' +
        c.name +
        '</h3><p>' +
        c.desc +
        "</p></div>"
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
      '<span class="play-badge">▶ 动图演示</span>' +
      "</div>" +
      '<div class="info">' +
      "<h3>" + ex.name + "</h3>" +
      '<span class="en">' + ex.en + "</span>" +
      '<div class="tags">' + tags + "</div>" +
      '<span class="more">查看使用指南 <span class="arrow">→</span></span>' +
      "</div>";

    card.addEventListener("click", function () {
      openModal(ex);
    });
    return card;
  }

  // ---------- 详情弹窗 ----------
  const overlay = $("#modal-overlay");
  const modalTitle = $("#modal-title");
  const modalEn = $("#modal-en");
  const modalMedia = $("#modal-media");
  const modalTarget = $("#modal-target");
  const modalSteps = $("#modal-steps");
  const modalTips = $("#modal-tips");
  const modalMistakes = $("#modal-mistakes");
  let lastFocus = null;

  function openModal(ex) {
    lastFocus = document.activeElement;
    modalTitle.textContent = ex.name;
    modalEn.textContent = ex.en;

    modalMedia.innerHTML = '<img src="' + ex.gif + '" alt="' + ex.name + " 动作演示" + '">';

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
    $("#modal-close").focus();
  }

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
    if (e.key === "Escape" && overlay.classList.contains("open")) closeModal();
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

  // ---------- 初始化 ----------
  $("#stat-total").textContent = EXERCISES.length;
  $("#stat-cat").textContent = CATEGORIES.length;
  renderCatIntro();
  renderCategories();
  updateNav();
  updateBackTop();

  window.addEventListener("scroll", function () {
    updateNav();
    updateBackTop();
  }, { passive: true });
})();

/* ==========================================================================
   Programmering – app.js
   Ritar ut kapitlen från content-*.js och sköter sök, live-redigerare,
   quiz, progress och ljust/mörkt läge. Du behöver inte ändra här för att
   lägga till innehåll – redigera content-filerna istället.
   ========================================================================== */
(function () {
  "use strict";

  const { parts, chapters, library } = window.KURS;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ---------------- Lagring (progress + tema) ---------------- */
  const STORE_KEY = "uxcc-github-v1";
  function load() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch (e) { return {}; }
  }
  let state = Object.assign({ done: {}, quiz: {}, steps: {}, theme: null, last: null, sidebarCollapsed: false }, load());
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* privat läge – ignorera */ }
  }

  /* ---------------- Hjälpfunktioner ---------------- */
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const escAttr = (s) => esc(s).replace(/"/g, "&quot;");
  const strip = (html) => String(html).replace(/<[^>]+>/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/&quot;/g, "\"").replace(/\s+/g, " ").trim();
  const chapterById = (id) => chapters.find((c) => c.id === id);
  // Alla block i ett kapitel, även de som ligger i en hopfälld fördjupning
  const allBlocks = (blocks) => blocks.flatMap((b) => (b.t === "more" ? [b, ...allBlocks(b.blocks)] : [b]));

  function highlight(code, lang) {
    const e = esc(code);
    if (lang === "html") {
      return e.replace(/(&lt;!--[\s\S]*?--&gt;)|(&lt;\/?[\w!-]+)|(&gt;)|("[^"\n]*")|(\s[\w:-]+)(?==)/g,
        (m, com, tag, close, str, attr) => {
          if (com) return `<span class="tk-com">${com}</span>`;
          if (tag) return `<span class="tk-tag">${tag}</span>`;
          if (close) return `<span class="tk-tag">${close}</span>`;
          if (str) return `<span class="tk-str">${str}</span>`;
          if (attr) return `<span class="tk-attr">${attr}</span>`;
          return m;
        });
    }
    if (lang === "css") {
      return e.replace(/(\/\*[\s\S]*?\*\/)|("[^"\n]*")|(@[\w-]+)|([\w-]+)(?=:\s)/g,
        (m, com, str, at, prop) => {
          if (com) return `<span class="tk-com">${com}</span>`;
          if (str) return `<span class="tk-str">${str}</span>`;
          if (at) return `<span class="tk-tag">${at}</span>`;
          if (prop) return `<span class="tk-prop">${prop}</span>`;
          return m;
        });
    }
    if (lang === "markdown") {
      return e.replace(/^(#{1,6} .*)$|(\*\*[^*]+\*\*)|(\[[^\]]+\]\([^)]+\))|^(- )/gm,
        (m, h, b, l, li) => h ? `<span class="tk-tag">${h}</span>` : b ? `<span class="tk-prop">${b}</span>` : l ? `<span class="tk-str">${l}</span>` : `<span class="tk-attr">${li}</span>`);
    }
    if (lang === "terminal") {
      // Ett enda varv, så att citattecknen i span-taggarna inte färgas om
      return e.replace(/^(git)( \S+)|("[^"\n]*")/gm, (m, g, cmd, str) =>
        g ? `<span class="tk-tag">${g}</span><span class="tk-prop">${cmd}</span>` : `<span class="tk-str">${str}</span>`);
    }
    return e;
  }

  /* ---------------- Tema ---------------- */
  function applyTheme() {
    const sysDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = state.theme || (sysDark ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", theme);
  }
  $("#themeBtn").addEventListener("click", () => {
    const now = document.documentElement.getAttribute("data-theme");
    state.theme = now === "dark" ? "light" : "dark";
    save(); applyTheme();
  });
  applyTheme();

  /* ---------------- Sidomeny ---------------- */
  // Sidomenyn: grupperna är hopfällbara. Gruppen man befinner sig i är öppen, de andra stängda –
  // så att menyn inte visar allt på en gång. På startsidan är alla öppna.
  function renderToc(currentId) {
    let n = 0;
    const currentPart = (() => {
      if (currentId === "ordlista") return "ref";
      const c = chapterById(currentId);
      return c ? c.part : null;
    })();
    const link = (href, id, dot, text, cls) => `<li><a class="toc-link ${cls || ""}" href="${href}" ${id === currentId ? 'aria-current="page"' : ""}>
          <span class="toc-dot">${dot}</span>${esc(text)}</a></li>`;
    const html = parts.map((p) => {
      let items = "";
      if (p.id === "ref") items = link("#/ordlista", "ordlista", "≡", "Alla ord och knappar");
      items += chapters.filter((c) => c.part === p.id).map((c) => {
        n++;
        const done = state.done[c.id];
        return link(`#/${c.id}`, c.id, done ? "✓" : n, c.title, done ? "done" : "");
      }).join("");
      const open = !currentPart || currentPart === p.id;
      return `<details class="toc-group" ${open ? "open" : ""}><summary>${esc(p.title)}</summary><ol>${items}</ol></details>`;
    }).join("");
    $("#toc").innerHTML = html;

    const doneCount = chapters.filter((c) => state.done[c.id]).length;
    $("#progressText").textContent = `${doneCount} / ${chapters.length}`;
    $("#progressFill").style.width = `${(doneCount / chapters.length) * 100}%`;
  }

  $("#resetProgress").addEventListener("click", () => {
    if (!window.confirm("Vill du nollställa all progress och alla quizresultat?")) return;
    state.done = {}; state.quiz = {}; state.last = null; save(); route();
  });

  /* Mobilmeny */
  const sidebar = $("#sidebar"), scrim = $("#scrim"), menuBtn = $("#menuBtn");
  // Ikonen visar en panel med pil: pil åt vänster = fäll ihop, pil åt höger = fäll ut
  function setMenuIcon(isOpen) { menuBtn.classList.toggle("is-open", isOpen); }
  function setMenu(open) {
    sidebar.classList.toggle("open", open);
    scrim.hidden = !open;
    menuBtn.setAttribute("aria-expanded", String(open));
    if (isMobile()) {
      setMenuIcon(open);
      menuBtn.setAttribute("aria-label", open ? "Stäng menyn" : "Öppna menyn");
      menuBtn.title = open ? "Stäng menyn" : "Öppna menyn";
    }
  }
  const isMobile = () => window.matchMedia("(max-width: 860px)").matches;
  const layout = $(".layout");
  function applySidebar() {
    const collapsed = !!state.sidebarCollapsed;
    layout.classList.toggle("collapsed", collapsed);
    if (isMobile()) {
      setMenuIcon(sidebar.classList.contains("open"));
    } else {
      setMenuIcon(!collapsed);
      menuBtn.setAttribute("aria-expanded", String(!collapsed));
      menuBtn.setAttribute("aria-label", collapsed ? "Visa sidomenyn" : "Dölj sidomenyn");
      menuBtn.title = collapsed ? "Visa sidomenyn" : "Dölj sidomenyn";
    }
  }
  menuBtn.addEventListener("click", () => {
    if (isMobile()) { setMenu(!sidebar.classList.contains("open")); return; }
    state.sidebarCollapsed = !state.sidebarCollapsed;   // desktop: fäll ihop/ut
    save(); applySidebar();
  });
  window.addEventListener("resize", applySidebar);
  applySidebar();
  scrim.addEventListener("click", () => setMenu(false));

  /* ---------------- Block-rendering ---------------- */

  function renderBlock(b) {
    switch (b.t) {
      case "h": return `<h2 id="${slug(b.text)}">${esc(b.text)}</h2>`;
      case "p": return `<p>${b.html}</p>`;
      case "list": {
        const tag = b.ordered ? "ol" : "ul";
        return `<${tag}>${b.items.map((i) => `<li>${i}</li>`).join("")}</${tag}>`;
      }
      case "code":
        return `<div class="code-block"><span class="code-label">${esc(b.lang)}</span>
          <button class="copy-btn" type="button">Kopiera</button>
          <pre><code>${highlight(b.code, b.lang)}</code></pre></div>`;
      case "tip": {
        const icon = { ux: "◆", info: "i", warn: "!" }[b.kind] || "i";
        const label = { ux: "UX-koppling", info: "Bra att veta", warn: "Se upp" }[b.kind] || "";
        return `<aside class="callout ${b.kind}" aria-label="${label}">
          <span class="callout-icon" aria-hidden="true">${icon}</span>
          <div><strong class="callout-title">${esc(b.title)}</strong>${b.html.startsWith("<") ? b.html : `<p>${b.html}</p>`}</div></aside>`;
      }
      case "table":
        return `<div class="table-wrap"><table><thead><tr>${b.head.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
          <tbody>${b.rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
      case "steps": return renderSteps(b);
      case "ui": return renderUi(b);
      case "figure": return renderFigure(b);
      case "more":
        // Fördjupning: hopfällt innehåll för den som vill veta mer
        return `<details class="more"><summary><span class="more-icon" aria-hidden="true">+</span>${esc(b.title || "Vill du veta mer?")}</summary>
          <div class="more-body">${b.blocks.map(renderBlock).join("")}</div></details>`;
      default: return "";
    }
  }

  function slug(s) {
    return "s-" + s.toLowerCase().replace(/[åä]/g, "a").replace(/ö/g, "o").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  /* ---------------- Checklistor ----------------
     { t: "steps", id, title?, items } – varje steg kan bockas av. Sparas i webbläsaren. */
  function renderSteps(b) {
    const checked = state.steps[b.id] || [];
    const n = b.items.length, done = checked.length;
    return `<section class="steps ${done === n ? "all-done" : ""}" data-steps="${escAttr(b.id)}">
      <div class="steps-head">
        <strong class="steps-title">${esc(b.title || "Gör så här")}</strong>
        <span class="steps-count" aria-live="polite">${done} av ${n} klara</span>
      </div>
      <ol class="steps-list">${b.items.map((it, i) => {
        const on = checked.includes(i);
        return `<li class="${on ? "is-checked" : ""}"><label>
          <input type="checkbox" data-i="${i}" ${on ? "checked" : ""}>
          <span class="steps-box" aria-hidden="true"></span>
          <span class="steps-text">${it}</span></label></li>`;
      }).join("")}</ol>
    </section>`;
  }
  function wireSteps() {
    $$(".steps", main).forEach((root) => {
      const id = root.dataset.steps;
      root.addEventListener("change", (e) => {
        const box = e.target.closest('input[type="checkbox"]');
        if (!box) return;
        const set = new Set(state.steps[id] || []);
        if (box.checked) set.add(+box.dataset.i); else set.delete(+box.dataset.i);
        state.steps[id] = [...set];
        save();
        box.closest("li").classList.toggle("is-checked", box.checked);
        const n = $$("li", root).length;
        $(".steps-count", root).textContent = `${set.size} av ${n} klara`;
        root.classList.toggle("all-done", set.size === n);
      });
      // Länkar i ett steg ska inte bocka av steget
      root.addEventListener("click", (e) => { if (e.target.closest("a")) e.stopPropagation(); });
    });
  }

  /* ---------------- Skisser av GitHub och VS Code ----------------
     Förenklade ritningar – inte skärmdumpar. De visar var knapparna sitter.
     m(n) = en numrerad markering som hör ihop med stegen i texten. */
  const m = (n) => `<span class="ui-mark">${n}</span>`;
  const I = {
    files: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M14 3H6v18h12V7z"/><path d="M14 3v4h4"/></svg>`,
    search: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="11" cy="11" r="6"/><path d="m20 20-4-4"/></svg>`,
    scm: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="6" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="8" r="2"/><path d="M6 7v10M18 10c0 4-6 4-11.5 7"/></svg>`,
    ext: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="4" y="4" width="7" height="7"/><rect x="13" y="13" width="7" height="7"/><rect x="4" y="13" width="7" height="7"/><rect x="14" y="3" width="6" height="6" transform="rotate(15 17 6)"/></svg>`,
    user: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/></svg>`,
    branch: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><circle cx="6" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="7" r="2"/><path d="M6 7v10M18 9c0 4-6 4-11 8"/></svg>`,
    sync: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 12a8 8 0 0 1-14 5M4 12a8 8 0 0 1 14-5"/><path d="M18 3v4h-4M6 21v-4h4"/></svg>`
  };
  const ghWin = (inner) => `<div class="ui-win ui-gh"><div class="ui-bar"><span class="ui-dots"><i></i><i></i><i></i></span><span class="ui-url">github.com</span></div>${inner}</div>`;
  const vsWin = (active, side, status, extra) => `<div class="ui-win ui-vs">
      <div class="ui-bar"><span class="ui-dots"><i></i><i></i><i></i></span><span class="ui-url">VS Code</span></div>
      ${extra || ""}
      <div class="vs-body">
        <div class="vs-act">
          <span class="${active === "files" ? "on" : ""}">${I.files}</span>
          <span>${I.search}</span>
          <span class="${active === "scm" ? "on" : ""}">${I.scm}${active === "scm-badge" ? "" : ""}</span>
          <span>${I.ext}</span>
          <span class="vs-act-bottom">${I.user}</span>
        </div>
        <div class="vs-side">${side}</div>
        <div class="vs-editor"><span class="vs-ghost"></span><span class="vs-ghost short"></span><span class="vs-ghost"></span></div>
      </div>
      <div class="vs-status">${status || `<span>${I.branch} main</span>`}</div>
    </div>`;
  const ghRepoHead = (owner, name, forkMark, settingsMark) => `
      <div class="gh-repohead">
        <span class="gh-reponame">${owner} / <strong>${name}</strong> <span class="gh-pill">Public</span></span>
        <span class="gh-btns"><span class="gh-btn">Watch</span><span class="gh-btn ${forkMark ? "is-hl" : ""}">Fork</span>${forkMark ? m(forkMark) : ""}<span class="gh-btn">Star</span></span>
      </div>
      <div class="gh-tabs"><span class="on">&lt;&gt; Code</span><span>Issues</span><span>Pull requests</span><span>Actions</span><span class="gh-tab-settings ${settingsMark ? "is-hl" : ""}">Settings${settingsMark ? m(settingsMark) : ""}</span></div>`;

  const UI = {
    "gh-new-menu": () => ghWin(`
      <div class="gh-top"><span class="gh-mark"></span><span class="gh-search">Type / to search</span><span class="gh-plus is-hl">+ ▾</span>${m(1)}<span class="gh-avatar"></span></div>
      <div class="gh-menu-wrap"><div class="ui-menu">
        <span class="is-hl">New repository</span><span>Import repository</span><span class="muted">…</span>
      </div></div>`),
    "gh-new-repo": () => ghWin(`
      <div class="gh-page">
        <div class="gh-h">Create a new repository</div>
        <div class="gh-row2">
          <label class="gh-field"><small>Owner</small><span class="gh-input">ditt-namn ▾</span></label>
          <span class="gh-slash">/</span>
          <label class="gh-field grow"><small>Repository name ${m(2)}</small><span class="gh-input is-hl">min-onepager</span></label>
        </div>
        <label class="gh-field"><small>Description ${m(3)}</small><span class="gh-input">Min onepager från kursen Programmering</span></label>
        <div class="gh-sep"></div>
        <div class="gh-setting"><span>Choose visibility ${m(4)}</span><span class="gh-input small">Public ▾</span></div>
        <div class="gh-setting"><span>Add README ${m(5)}</span><span class="gh-toggle on"><i></i></span></div>
        <div class="gh-setting"><span>Add .gitignore ${m(6)}</span><span class="gh-input small">No .gitignore ▾</span></div>
        <div class="gh-setting"><span>Add license ${m(6)}</span><span class="gh-input small">No license ▾</span></div>
        <div class="gh-actions"><span class="gh-btn green">Create repository</span>${m(7)}</div>
      </div>`),
    "gh-repo": () => ghWin(`
      ${ghRepoHead("ditt-namn", "min-onepager")}
      <div class="gh-page">
        <div class="gh-toolbar"><span class="gh-btn">${I.branch} main ▾</span><span class="grow"></span><span class="gh-btn">Add file ▾</span><span class="gh-btn green">&lt;&gt; Code ▾</span></div>
        <div class="gh-files"><div class="gh-file"><span>📄 README.md</span><span class="muted">Initial commit</span></div></div>
        <div class="gh-readme"><div class="gh-readme-h">README</div><div class="gh-readme-b"><strong>min-onepager</strong><span class="muted">Min onepager från kursen Programmering</span></div></div>
      </div>`),
    "vs-clone": () => vsWin("scm", `
        <div class="vs-title">SOURCE CONTROL</div>
        <p class="vs-p">Öppna en mapp eller klona ett repo.</p>
        <span class="vs-btn">Open Folder</span>
        <span class="vs-btn is-hl">Clone Repository</span>`, `<span></span>`),
    "vs-changes": () => vsWin("scm", `
        <div class="vs-title">SOURCE CONTROL</div>
        <div class="vs-msg is-hl">Lägg till min onepager ${m(2)}</div>
        <div class="vs-row"><span class="vs-btn primary">✓ Commit</span>${m(3)}</div>
        <div class="vs-group">Changes <span class="vs-count">3</span></div>
        <div class="vs-change"><span>index.html</span><b>U</b></div>
        <div class="vs-change"><span>style.css <small>css</small></span><b>U</b></div>
        <div class="vs-change"><span>rad-1-kulle.jpg <small>images</small></span><b>U</b></div>`),
    "vs-sync": () => vsWin("scm", `
        <div class="vs-title">SOURCE CONTROL</div>
        <div class="vs-msg muted">Message</div>
        <span class="vs-btn primary is-hl">${I.sync} Sync Changes 1↑</span>`,
        `<span>${I.branch} main</span><span>${I.sync} 0↓ 1↑</span>`),
    "vs-branch": () => vsWin("files", `
        <div class="vs-title">EXPLORER</div>
        <div class="vs-change"><span>README.md</span></div>
        <div class="vs-change"><span>index.html</span></div>
        <div class="vs-change"><span>css</span></div>`,
        `<span class="is-hl">${I.branch} main</span>${m(1)}`,
        `<div class="vs-pick">
          <div class="vs-pick-in">Select a ref to checkout</div>
          <div class="vs-pick-item is-hl">+ Create new branch… ${m(2)}</div>
          <div class="vs-pick-item">+ Create new branch from…</div>
          <div class="vs-pick-item muted">${I.branch} main</div>
        </div>`),
    "gh-collab": () => ghWin(`
      ${ghRepoHead("ditt-namn", "min-onepager", 0, 1)}
      <div class="gh-settings">
        <div class="gh-nav">
          <span>General</span>
          <small>Access</small>
          <span class="is-hl">Collaborators ${m(2)}</span>
          <small>Code and automation</small>
          <span>Branches</span><span>Pages</span>
        </div>
        <div class="gh-page">
          <div class="gh-h">Manage access</div>
          <div class="gh-box"><span class="muted">You haven't invited any collaborators yet</span><span class="gh-btns"><span class="gh-btn green">Add people</span>${m(3)}</span></div>
        </div>
      </div>`),
    "gh-fork": () => ghWin(`
      ${ghRepoHead("larare", "onepager-exempel", 2)}
      <div class="gh-page">
        <div class="gh-h">Create a new fork</div>
        <div class="gh-row2">
          <label class="gh-field"><small>Owner</small><span class="gh-input">ditt-namn ▾</span></label>
          <span class="gh-slash">/</span>
          <label class="gh-field grow"><small>Repository name ${m(3)}</small><span class="gh-input">onepager-exempel</span></label>
        </div>
        <div class="gh-check"><span class="gh-cb on">✓</span> Copy the <strong>main</strong> branch only ${m(4)}</div>
        <div class="gh-actions"><span class="gh-btn green">Create fork</span>${m(5)}</div>
      </div>`)
  };

  function renderUi(b) {
    const draw = UI[b.kind];
    if (!draw) return "";
    return `<figure class="ui-fig">
      <span class="ui-label">Förenklad skiss</span>
      <div class="ui-scroll" aria-hidden="true">${draw()}</div>
      ${b.caption ? `<figcaption>${b.caption}</figcaption>` : ""}
    </figure>`;
  }

  /* ---------------- Förklarande bilder ---------------- */
  const FIGURES = {
    flow: () => `<svg class="fig-svg" viewBox="0 0 680 230" role="img" aria-label="Din dator till vänster, GitHub till höger. Commit sparar en version på datorn. Push skickar upp till GitHub. Pull hämtar ner från GitHub.">
      <defs><marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" fill="var(--accent)"/></marker></defs>
      <rect x="10" y="20" width="330" height="190" rx="10" class="fig-box"/>
      <text x="30" y="50" class="fig-h">Din dator</text>
      <rect x="26" y="80" width="112" height="90" rx="8" class="fig-inner"/>
      <text x="82" y="118" text-anchor="middle" class="fig-t">Dina filer</text>
      <text x="82" y="140" text-anchor="middle" class="fig-s">det du ändrar</text>
      <rect x="214" y="80" width="112" height="90" rx="8" class="fig-inner"/>
      <text x="270" y="118" text-anchor="middle" class="fig-t">Versioner</text>
      <text x="270" y="140" text-anchor="middle" class="fig-s">sparade commits</text>
      <path d="M142 135h66" class="fig-arrow" marker-end="url(#ah)"/>
      <text x="176" y="122" text-anchor="middle" class="fig-lbl">commit</text>
      <rect x="470" y="20" width="200" height="190" rx="10" class="fig-box gh"/>
      <text x="490" y="50" class="fig-h">GitHub</text>
      <rect x="490" y="80" width="160" height="90" rx="8" class="fig-inner"/>
      <text x="570" y="118" text-anchor="middle" class="fig-t">Repot online</text>
      <text x="570" y="140" text-anchor="middle" class="fig-s">det andra ser</text>
      <path d="M324 100H486" class="fig-arrow" marker-end="url(#ah)"/>
      <text x="405" y="90" text-anchor="middle" class="fig-lbl">push ↑</text>
      <path d="M486 152H324" class="fig-arrow" marker-end="url(#ah)"/>
      <text x="405" y="174" text-anchor="middle" class="fig-lbl">pull ↓</text>
    </svg>`,
    branch: () => `<svg class="fig-svg" viewBox="0 0 680 200" role="img" aria-label="En linje som heter main med fyra commits. Från den andra commiten går en gren som heter ny-farg, med två egna commits. En streckad linje visar hur grenen kan slås ihop med main igen.">
      <path d="M40 140H640" class="fig-line"/>
      <text x="40" y="180" class="fig-t">main</text>
      <path d="M200 140C260 140 260 60 320 60H470" class="fig-line br"/>
      <path d="M470 60C540 60 540 140 580 140" class="fig-line br dashed"/>
      <text x="320" y="38" class="fig-t br">ny-farg</text>
      <text x="580" y="180" text-anchor="middle" class="fig-s">merge (överkurs)</text>
      <circle cx="80" cy="140" r="11" class="fig-dot"/><circle cx="200" cy="140" r="11" class="fig-dot"/>
      <circle cx="380" cy="140" r="11" class="fig-dot"/><circle cx="580" cy="140" r="11" class="fig-dot"/>
      <circle cx="340" cy="60" r="11" class="fig-dot br"/><circle cx="450" cy="60" r="11" class="fig-dot br"/>
    </svg>`
  };
  function renderFigure(b) {
    const draw = FIGURES[b.kind];
    if (!draw) return "";
    return `<figure class="fig">${draw()}${b.caption ? `<figcaption>${b.caption}</figcaption>` : ""}</figure>`;
  }

  /* ---------------- Quiz ---------------- */
  function renderQuiz(ch) {
    if (!ch.quiz || !ch.quiz.length) return "";
    const best = state.quiz[ch.id];
    return `<section class="quiz" aria-labelledby="quiz-h">
      <div class="quiz-head">
        <span class="quiz-icon" aria-hidden="true">?</span>
        <div>
          <span class="eyebrow">Testa dig själv</span>
          <h2 id="quiz-h">Quiz: ${esc(ch.title)}</h2>
          <p class="quiz-meta">${ch.quiz.length} frågor${best ? ` · Ditt bästa resultat: <strong>${best.score} av ${best.total}</strong>` : " · Alla rätt markerar kapitlet som klart"}</p>
        </div>
      </div>
      ${ch.quiz.map((q, qi) => `
        <div class="q" data-q="${qi}">
          <div class="q-text"><span class="q-num">${qi + 1}</span><span>${q.q}</span></div>
          <div class="q-options">
            ${q.options.map((o, oi) => `<button class="q-option" type="button" data-o="${oi}">
              <span class="q-letter">${"ABCD"[oi]}</span><span>${o}</span></button>`).join("")}
          </div>
          <div class="q-explain" aria-live="polite"></div>
        </div>`).join("")}
      <div class="quiz-result" hidden>
        <strong class="quiz-score"></strong>
        <button class="btn" type="button" data-act="retry">Gör om quizet</button>
      </div>
    </section>`;
  }

  function wireQuiz(ch) {
    const root = $(".quiz");
    if (!root) return;
    let answered = 0, correct = 0;
    root.addEventListener("click", (e) => {
      if (e.target.closest('[data-act="retry"]')) { renderChapter(ch.id, true); return; }
      const opt = e.target.closest(".q-option");
      if (!opt || opt.disabled) return;
      const qEl = opt.closest(".q");
      const q = ch.quiz[+qEl.dataset.q];
      const chosen = +opt.dataset.o;
      $$(".q-option", qEl).forEach((b) => {
        b.disabled = true;
        if (+b.dataset.o === q.answer) b.classList.add("correct");
      });
      const ok = chosen === q.answer;
      if (!ok) opt.classList.add("wrong");
      $(".q-explain", qEl).innerHTML = `<strong>${ok ? "Rätt!" : "Inte riktigt."}</strong> ${q.explain || ""}`;
      answered++; if (ok) correct++;

      if (answered === ch.quiz.length) {
        const prev = state.quiz[ch.id];
        if (!prev || correct > prev.score) state.quiz[ch.id] = { score: correct, total: ch.quiz.length };
        const all = correct === ch.quiz.length;
        if (all && !state.done[ch.id]) { state.done[ch.id] = true; markDoneBtn(true); }
        save(); renderToc(ch.id);
        const res = $(".quiz-result", root);
        res.hidden = false;
        $(".quiz-score", root).textContent = all
          ? `Alla rätt – ${correct} av ${ch.quiz.length}! Kapitlet är markerat som klart.`
          : `${correct} av ${ch.quiz.length} rätt. Läs igenom avsnittet igen och gör om quizet.`;
      }
    });
  }

  /* ---------------- Sidor ---------------- */
  const main = $("#innehall");

  function renderHome() {
    const doneCount = chapters.filter((c) => state.done[c.id]).length;
    const nextCh = chapters.find((c) => !state.done[c.id]);
    const lastCh = state.last && chapterById(state.last);
    let n = 0;
    main.innerHTML = `
      <div class="hero">
        <span class="eyebrow">GitHub för UX-designers</span>
        <h1>Spara, dela och samarbeta med GitHub</h1>
        <p class="lead">Lägg upp din onepager på GitHub och lär dig det du behöver: repo, commit, push och pull, branch, inbjudningar och fork. Inga kommandon – du gör allt med knappar i VS Code och på github.com.</p>
        <div class="pg-actions">
          ${doneCount === 0
            ? `<a class="btn primary" href="#/${chapters[0].id}">Börja kursen →</a>`
            : nextCh ? `<a class="btn primary" href="#/${(lastCh && !state.done[lastCh.id] ? lastCh : nextCh).id}">Fortsätt: ${esc((lastCh && !state.done[lastCh.id] ? lastCh : nextCh).title)} →</a>`
                     : `<span class="chip">Du har klarat alla kapitel 🎉</span>`}
          <a class="btn" href="#/ordlista">Öppna ordlistan</a>
        </div>
      </div>
      ${parts.filter((p) => p.id !== "ref" && chapters.some((c) => c.part === p.id)).map((p) => `
        <h2>${esc(p.title)}</h2>
        <div class="card-grid">
          ${chapters.filter((c) => c.part === p.id).map((c) => {
            n++;
            return `<a class="card ${state.done[c.id] ? "done" : ""}" href="#/${c.id}">
              <span class="card-num">${String(n).padStart(2, "0")} · ${esc(c.time)}</span>
              <h3>${esc(c.title)}</h3><p>${esc(c.summary)}</p></a>`;
          }).join("")}
        </div>`).join("")}
    `;
    document.title = "Programmering – GitHub för designers";
  }

  function renderChapter(id, keepScroll) {
    const ch = chapterById(id);
    if (!ch) { renderHome(); return; }
    const idx = chapters.indexOf(ch);
    const prev = chapters[idx - 1], next = chapters[idx + 1];
    const part = parts.find((p) => p.id === ch.part);
    const done = !!state.done[ch.id];

    main.innerHTML = `
      <article>
        <span class="eyebrow">${esc(part ? part.title : "")}</span>
        <h1>${esc(ch.title)}</h1>
        <p class="lead">${esc(ch.summary)}</p>
        <div class="meta-row">
          <span class="chip">⏱ ${esc(ch.time)}</span>
          ${(() => { const n = allBlocks(ch.blocks).filter((b) => b.t === "steps").length; return n ? `<span class="chip chip-exercise">${n} ${n === 1 ? "checklista" : "checklistor"}</span>` : ""; })()}
          ${ch.quiz ? `<a class="chip chip-quiz" href="#/${ch.id}#quiz-h">${ch.quiz.length} quizfrågor ↓</a>` : ""}
        </div>
        ${ch.blocks.map(renderBlock).join("")}
        ${renderQuiz(ch)}
        <footer class="chapter-footer">
          <div class="done-row">
            <span>${done ? "Bra jobbat! Det här kapitlet är klart." : "Har du gått igenom kapitlet?"}</span>
            <button class="btn done-btn ${done ? "is-done" : ""}" type="button" aria-pressed="${done}">${done ? "✓ Klart" : "Markera som klart"}</button>
          </div>
          <nav class="pager" aria-label="Föregående och nästa kapitel">
            ${prev ? `<a href="#/${prev.id}"><small>← Föregående</small>${esc(prev.title)}</a>` : "<span></span>"}
            ${next ? `<a class="next" href="#/${next.id}"><small>Nästa →</small>${esc(next.title)}</a>`
                   : `<a class="next" href="#/ordlista"><small>Klart! →</small>Till ordlistan</a>`}
          </nav>
        </footer>
      </article>`;

    wireSteps();
    wireQuiz(ch);
    $(".done-btn").addEventListener("click", () => {
      state.done[ch.id] = !state.done[ch.id];
      save(); markDoneBtn(state.done[ch.id]); renderToc(ch.id);
    });
    state.last = ch.id; save();
    document.title = `${ch.title} – Programmering – GitHub`;
    if (!keepScroll) window.scrollTo(0, 0);
  }

  function markDoneBtn(done) {
    const btn = $(".done-btn");
    if (!btn) return;
    btn.classList.toggle("is-done", done);
    btn.setAttribute("aria-pressed", String(done));
    btn.textContent = done ? "✓ Klart" : "Markera som klart";
    btn.previousElementSibling.textContent = done ? "Bra jobbat! Det här kapitlet är klart." : "Har du gått igenom kapitlet?";
  }

  // Det dagliga flödet – visas överst i ordlistan
  const DAILY = [
    ["Sync", "Hämta det senaste innan du börjar."],
    ["Ändra", "Jobba i dina filer och spara."],
    ["Commit", "Spara en version med ett tydligt meddelande."],
    ["Sync", "Skicka upp till GitHub."]
  ];

  function renderGlossary() {
    main.innerHTML = `
      <span class="eyebrow">Ordlista</span>
      <h1>Alla ord och knappar</h1>
      <p class="lead">Allt från kursen på ett ställe. Filtrera, eller klicka på ett kapitel för hela förklaringen.</p>

      <h2 id="flodet">Det dagliga flödet</h2>
      <ol class="daily">${DAILY.map(([t, d], i) => `<li><span class="daily-n">${i + 1}</span><strong>${t}</strong><span>${d}</span></li>`).join("")}</ol>

      <h2 id="lista">Ord och knappar</h2>
      <div class="lib-filter">
        <input type="search" id="libSearch" placeholder="Filtrera… t.ex. branch, sync, licens" aria-label="Filtrera ordlistan">
        <button class="btn" type="button" data-kind="" aria-pressed="true">Alla</button>
        <button class="btn" type="button" data-kind="Begrepp" aria-pressed="false">Begrepp</button>
        <button class="btn" type="button" data-kind="GitHub" aria-pressed="false">På GitHub</button>
        <button class="btn" type="button" data-kind="VS Code" aria-pressed="false">I VS Code</button>
      </div>
      <div class="table-wrap"><table class="lib-table">
        <thead><tr><th>Ord</th><th>Betyder</th><th>Var / exempel</th><th>Kapitel</th></tr></thead>
        <tbody id="libBody"></tbody>
      </table></div>
      <p class="q-explain" id="libCount"></p>`;

    let kind = "";
    const input = $("#libSearch");
    function draw() {
      const q = input.value.trim().toLowerCase();
      const rows = library.filter((r) => (!kind || r.kind === kind) &&
        (!q || (r.name + " " + r.desc + " " + r.ex).toLowerCase().includes(q)));
      $("#libBody").innerHTML = rows.map((r) => {
        const ch = chapterById(r.ch);
        return `<tr><td><strong>${esc(r.name)}</strong><br><small class="lib-kind">${esc(r.kind)}</small></td><td>${esc(r.desc)}</td>
          <td><code>${esc(r.ex)}</code></td>
          <td>${ch ? `<a href="#/${ch.id}">${esc(ch.title)}</a>` : ""}</td></tr>`;
      }).join("") || `<tr><td colspan="4">Inget matchade "${esc(q)}".</td></tr>`;
      $("#libCount").textContent = `Visar ${rows.length} av ${library.length}`;
    }
    input.addEventListener("input", draw);
    $$(".lib-filter .btn").forEach((b) => b.addEventListener("click", () => {
      kind = b.dataset.kind;
      $$(".lib-filter .btn").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      draw();
    }));
    draw();
    document.title = "Ordlista – Programmering – GitHub";
    window.scrollTo(0, 0);
  }

  /* ---------------- Router ---------------- */
  function route() {
    const hash = decodeURIComponent(location.hash.replace(/^#\/?/, ""));
    const [id, anchor] = hash.split("#");
    setMenu(false);
    if (!id) { renderHome(); renderToc(null); window.scrollTo(0, 0); }
    else if (id === "ordlista") { renderGlossary(); renderToc("ordlista"); }
    else { renderChapter(id); renderToc(id); }
    $$(".topnav a").forEach((a) => {
      const target = a.getAttribute("href").replace("#/", "");
      const on = target === "" ? id !== "ordlista" : target === id;
      if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    if (anchor) {
      const el = document.getElementById(anchor);
      if (el) { const d = el.closest("details"); if (d) d.open = true; el.scrollIntoView(); }
    }
    main.focus({ preventScroll: true });
  }
  window.addEventListener("hashchange", route);

  /* ---------------- Kopiera-knappar ---------------- */
  main.addEventListener("click", (e) => {
    const btn = e.target.closest(".copy-btn");
    if (!btn) return;
    const text = btn.parentElement.querySelector("pre").innerText;
    const done = () => { btn.textContent = "Kopierat!"; setTimeout(() => (btn.textContent = "Kopiera"), 1500); };
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, () => {});
  });

  /* ---------------- Sök ---------------- */
  const index = [];
  chapters.forEach((c) => {
    index.push({ title: c.title, sub: c.summary, href: `#/${c.id}`, text: `${c.title} ${c.summary}`, weight: 3 });
    let section = null;
    allBlocks(c.blocks).forEach((b) => {
      if (b.t === "more") return;
      if (b.t === "h") { section = b; index.push({ title: b.text, sub: c.title, href: `#/${c.id}#${slug(b.text)}`, text: b.text, weight: 2 }); return; }
      const raw = [b.html, b.title, b.code, b.task, b.caption, (b.items || []).join(" "), (b.rows || []).flat().join(" ")].filter(Boolean).join(" ");
      if (!raw) return;
      index.push({ title: section ? section.text : c.title, sub: c.title, href: section ? `#/${c.id}#${slug(section.text)}` : `#/${c.id}`, text: strip(raw), weight: 1 });
    });
  });
  library.forEach((r) => index.push({ title: r.name, sub: `Ordlista · ${r.kind} – ${r.desc}`, href: `#/${r.ch}`, text: `${r.name} ${r.desc} ${r.ex}`, weight: 2 }));

  const sInput = $("#searchInput"), sBox = $("#searchResults");
  let active = -1;

  function snippet(text, q) {
    const i = text.toLowerCase().indexOf(q);
    if (i < 0) return "";
    const start = Math.max(0, i - 40);
    const s = (start > 0 ? "…" : "") + text.slice(start, i + q.length + 70) + "…";
    return esc(s).replace(new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/</g, "&lt;").replace(/>/g, "&gt;"), "ig"), (m) => `<mark>${m}</mark>`);
  }

  function search() {
    const q = sInput.value.trim().toLowerCase();
    active = -1;
    if (q.length < 2) { sBox.hidden = true; return; }
    const seen = new Set();
    const hits = index
      .filter((e) => e.text.toLowerCase().includes(q) || e.title.toLowerCase().includes(q))
      .map((e) => ({ e, score: e.weight + (e.title.toLowerCase().includes(q) ? 5 : 0) + (e.title.toLowerCase().startsWith(q) ? 3 : 0) }))
      .sort((a, b) => b.score - a.score)
      .filter(({ e }) => { const k = e.href + e.title; if (seen.has(k)) return false; seen.add(k); return true; })
      .slice(0, 10);
    sBox.innerHTML = hits.length
      ? hits.map(({ e }, i) => `<a class="search-result" role="option" href="${e.href}" data-i="${i}">
          <strong>${esc(e.title)}</strong><span>${snippet(e.text, q) || esc(e.sub)}</span></a>`).join("")
      : `<div class="search-empty">Inga träffar på "${esc(q)}". Prova ett annat ord.</div>`;
    sBox.hidden = false;
  }
  sInput.addEventListener("input", search);
  sInput.addEventListener("focus", search);
  sInput.addEventListener("keydown", (e) => {
    const items = $$(".search-result", sBox);
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!items.length) return;
      active = (active + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
      items.forEach((it, i) => it.classList.toggle("active", i === active));
      items[active].scrollIntoView({ block: "nearest" });
    } else if (e.key === "Enter") {
      const target = items[active >= 0 ? active : 0];
      if (target) { location.hash = target.getAttribute("href"); closeSearch(); }
    } else if (e.key === "Escape") { closeSearch(); sInput.blur(); }
  });
  sBox.addEventListener("click", (e) => { if (e.target.closest(".search-result")) closeSearch(); });
  function closeSearch() { sBox.hidden = true; sInput.value = ""; }
  document.addEventListener("click", (e) => { if (!e.target.closest(".search")) sBox.hidden = true; });
  document.addEventListener("keydown", (e) => {
    const tag = (document.activeElement && document.activeElement.tagName) || "";
    if (e.key === "/" && !/INPUT|TEXTAREA/.test(tag)) { e.preventDefault(); sInput.focus(); }
  });

  /* ---------------- Start ---------------- */
  route();
})();

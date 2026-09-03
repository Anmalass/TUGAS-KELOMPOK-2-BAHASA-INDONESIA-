/* =========================================================
   TEMPLATE PRESENTASI — MESIN TAMPILAN
   File ini HANYA membaca content/content.json dan menyusun
   slide di layar. Tidak ada isi presentasi yang ditulis
   langsung di sini — semua teks/gambar berasal dari JSON.
   Untuk mengganti tema tugas, edit content/content.json saja.
   ========================================================= */

(function () {
  "use strict";

  const CONTENT_URL = "content/content.json";

  const state = {
    slides: [],   // [{ id, label, color, render: () => HTMLElement }]
    current: 0,
  };

  /* ---------- helpers ---------- */

  function escapeHtml(str) {
    if (str === undefined || str === null) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) {
      Object.entries(attrs).forEach(([k, v]) => {
        if (k === "class") node.className = v;
        else if (k === "html") node.innerHTML = v;
        else node.setAttribute(k, v);
      });
    }
    (children || []).forEach((c) => {
      if (c) node.appendChild(c);
    });
    return node;
  }

  function safeImg(src, alt) {
    const img = document.createElement("img");
    img.src = src || "";
    img.alt = alt || "";
    img.loading = "lazy";
    img.onerror = function () {
      this.style.display = "none";
    };
    return img;
  }

  /* ---------- slide builders ---------- */

  function buildCoverSlide(data) {
    const wrap = el("div", { class: "slide-inner cover" });

    if (data.theme) {
      wrap.appendChild(el("p", { class: "cover-theme" }, [
        document.createTextNode(data.theme),
      ]));
    }

    wrap.appendChild(el("h1", { class: "cover-title" }, [
      document.createTextNode(data.title || "Judul Presentasi"),
    ]));

    if (data.subtitle) {
      wrap.appendChild(el("p", { class: "cover-subtitle" }, [
        document.createTextNode(data.subtitle),
      ]));
    }

    wrap.appendChild(el("hr", { class: "cover-divider" }));

    const meta = el("div", { class: "cover-meta" });
    const fields = [
      ["Kelompok", data.group],
      ["Kelas", data.className],
      ["Sekolah", data.school],
    ].filter(([, v]) => v);

    fields.forEach(([label, value]) => {
      meta.appendChild(
        el("div", { class: "cover-meta-item" }, [
          el("span", { class: "label" }, [document.createTextNode(label)]),
          el("span", { class: "value" }, [document.createTextNode(value)]),
        ])
      );
    });
    wrap.appendChild(meta);

    return wrap;
  }

  function buildMembersSlide(members) {
    const wrap = el("div", { class: "slide-inner" });
    wrap.appendChild(el("p", { class: "slide-label" }, [document.createTextNode("Anggota Kelompok")]));
    wrap.appendChild(el("h2", { class: "slide-heading" }, [document.createTextNode("Siapa yang mengerjakan ini")]));

    const grid = el("div", { class: "card-grid" });
    (members || []).forEach((m) => {
      const photoBox = el("div", { class: "polaroid-photo" }, [safeImg(m.photo, m.name)]);
      grid.appendChild(
        el("div", { class: "polaroid" }, [
          photoBox,
          el("p", { class: "polaroid-name" }, [document.createTextNode(m.name || "")]),
          el("p", { class: "polaroid-sub" }, [
            document.createTextNode([m.role, m.absen ? `No. Absen ${m.absen}` : ""].filter(Boolean).join(" — ")),
          ]),
        ])
      );
    });
    wrap.appendChild(grid);
    return wrap;
  }

  function buildItemsSlide({ label, heading, items, withAmount }) {
    const wrap = el("div", { class: "slide-inner" });
    wrap.appendChild(el("p", { class: "slide-label" }, [document.createTextNode(label)]));
    wrap.appendChild(el("h2", { class: "slide-heading" }, [document.createTextNode(heading)]));

    const grid = el("div", { class: "card-grid" });
    (items || []).forEach((it) => {
      const photoBox = el("div", { class: "item-photo" }, [safeImg(it.image, it.name)]);
      const card = el("div", { class: "item-card" }, [
        photoBox,
        el("p", { class: "item-name" }, [document.createTextNode(it.name || "")]),
      ]);
      if (withAmount && it.amount) {
        card.appendChild(el("p", { class: "item-amount" }, [document.createTextNode(it.amount)]));
      }
      grid.appendChild(card);
    });
    wrap.appendChild(grid);
    return wrap;
  }

  function buildStepSlide(step, index, total) {
    const wrap = el("div", { class: "slide-inner step-slide" });

    const text = el("div", { class: "step-text" }, [
      el("span", { class: "step-number" }, [document.createTextNode(String(index + 1).padStart(2, "0"))]),
      el("h2", { class: "step-title" }, [document.createTextNode(step.title || `Langkah ${index + 1}`)]),
      el("p", { class: "step-description" }, [document.createTextNode(step.description || "")]),
    ]);

    const photo = el("div", { class: "step-photo" }, [safeImg(step.image, step.title)]);

    wrap.appendChild(text);
    wrap.appendChild(photo);
    return wrap;
  }

  function buildResultSlide(result) {
    const wrap = el("div", { class: "slide-inner" });
    wrap.appendChild(el("p", { class: "slide-label" }, [document.createTextNode("Hasil Akhir")]));
    if (result.image) {
      wrap.appendChild(el("div", { class: "result-photo" }, [safeImg(result.image, result.title)]));
    }
    wrap.appendChild(el("h2", { class: "slide-heading" }, [document.createTextNode(result.title || "Hasil")]));
    if (result.description) {
      wrap.appendChild(el("p", { class: "result-description" }, [document.createTextNode(result.description)]));
    }
    return wrap;
  }

  function toEmbedUrl(url) {
    if (!url) return "";
    // Terima juga link YouTube biasa (watch?v=... atau youtu.be/...) selain link embed.
    try {
      const u = new URL(url);
      if (u.hostname.includes("youtu.be")) {
        return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
      }
      if (u.hostname.includes("youtube.com") && u.searchParams.get("v")) {
        return `https://www.youtube.com/embed/${u.searchParams.get("v")}`;
      }
      return url;
    } catch (e) {
      return url;
    }
  }

  function buildVideoSlide(video) {
    const wrap = el("div", { class: "slide-inner" });
    wrap.appendChild(el("p", { class: "slide-label" }, [document.createTextNode("Video")]));
    wrap.appendChild(el("h2", { class: "slide-heading" }, [document.createTextNode("Video Tutorial")]));

    const frame = document.createElement("div");
    frame.className = "video-frame";
    const iframe = document.createElement("iframe");
    iframe.src = toEmbedUrl(video.url);
    iframe.setAttribute("allowfullscreen", "");
    iframe.setAttribute("loading", "lazy");
    iframe.setAttribute("title", "Video presentasi");
    frame.appendChild(iframe);
    wrap.appendChild(frame);
    return wrap;
  }

  /* ---------- assemble slide list from content.json ---------- */

  function buildSlides(data) {
    const slides = [];

    slides.push({
      tab: "Sampul",
      color: "var(--ink)",
      render: () => buildCoverSlide(data),
    });

    if (Array.isArray(data.members) && data.members.length) {
      slides.push({
        tab: "Anggota",
        color: "var(--mustard)",
        render: () => buildMembersSlide(data.members),
      });
    }

    if (Array.isArray(data.ingredients) && data.ingredients.length) {
      slides.push({
        tab: "Bahan",
        color: "var(--rust)",
        render: () =>
          buildItemsSlide({
            label: "Bahan-Bahan",
            heading: "Yang perlu disiapkan",
            items: data.ingredients,
            withAmount: true,
          }),
      });
    }

    if (Array.isArray(data.tools) && data.tools.length) {
      slides.push({
        tab: "Alat",
        color: "var(--sage)",
        render: () =>
          buildItemsSlide({
            label: "Alat",
            heading: "Alat yang digunakan",
            items: data.tools,
            withAmount: false,
          }),
      });
    }

    if (Array.isArray(data.steps) && data.steps.length) {
      data.steps.forEach((step, i) => {
        slides.push({
          tab: `Langkah ${i + 1}`,
          color: "var(--mustard)",
          render: () => buildStepSlide(step, i, data.steps.length),
        });
      });
    }

    if (data.result) {
      slides.push({
        tab: "Hasil",
        color: "var(--rust)",
        render: () => buildResultSlide(data.result),
      });
    }

    if (data.video && data.video.url) {
      slides.push({
        tab: "Video",
        color: "var(--sage)",
        render: () => buildVideoSlide(data.video),
      });
    }

    return slides;
  }

  /* ---------- render + navigation ---------- */

  function renderApp() {
    const rail = document.getElementById("slide-rail");
    const viewport = document.getElementById("slide-viewport");
    rail.innerHTML = "";
    viewport.innerHTML = "";

    state.slides.forEach((slide, i) => {
      let content;
      try {
        content = slide.render();
      } catch (err) {
        console.error(`Gagal merender slide "${slide.tab}":`, err);
        content = el("div", { class: "slide-inner" }, [
          el("p", { class: "slide-label" }, [document.createTextNode(slide.tab)]),
          el("p", {}, [document.createTextNode(`Slide ini gagal ditampilkan: ${err.message}`)]),
        ]);
      }

      const tabBtn = el(
        "button",
        {
          class: "rail-tab",
          type: "button",
          style: `--tab-color:${slide.color}`,
          "data-index": String(i),
          "aria-label": slide.tab,
        },
        [document.createTextNode(slide.tab)]
      );
      tabBtn.addEventListener("click", () => goTo(i));
      rail.appendChild(tabBtn);

      const section = el("section", { class: "slide", "data-index": String(i) });
      section.style.setProperty("--section-color", slide.color);
      section.appendChild(content);
      viewport.appendChild(section);
    });

    updateActiveSlide();
  }

  function updateActiveSlide() {
    document.querySelectorAll(".slide").forEach((s, i) => {
      s.classList.toggle("is-active", i === state.current);
    });
    document.querySelectorAll(".rail-tab").forEach((t, i) => {
      t.classList.toggle("is-active", i === state.current);
    });

    const progress = document.getElementById("progress");
    progress.textContent = `${state.current + 1} / ${state.slides.length}`;

    document.getElementById("btn-prev").disabled = state.current === 0;
    document.getElementById("btn-next").disabled = state.current === state.slides.length - 1;

    const activeTab = document.querySelector(".rail-tab.is-active");
    if (activeTab) activeTab.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  function goTo(index) {
    if (index < 0 || index >= state.slides.length) return;
    state.current = index;
    updateActiveSlide();
  }

  function next() { goTo(state.current + 1); }
  function prev() { goTo(state.current - 1); }

  function bindControls() {
    document.getElementById("btn-next").addEventListener("click", next);
    document.getElementById("btn-prev").addEventListener("click", prev);

    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight" || e.key === "PageDown") next();
      if (e.key === "ArrowLeft" || e.key === "PageUp") prev();
    });

    let touchStartX = null;
    const viewport = document.getElementById("slide-viewport");
    viewport.addEventListener("touchstart", (e) => {
      touchStartX = e.changedTouches[0].clientX;
    });
    viewport.addEventListener("touchend", (e) => {
      if (touchStartX === null) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 50) (dx < 0 ? next : prev)();
      touchStartX = null;
    });
  }

  /* ---------- boot ---------- */

  async function init() {
    try {
      const res = await fetch(CONTENT_URL, { cache: "no-store" });
      if (!res.ok) throw new Error(`Gagal memuat ${CONTENT_URL}: ${res.status}`);
      const data = await res.json();

      document.title = data.title || "Presentasi";

      state.slides = buildSlides(data);
      if (!state.slides.length) throw new Error("content.json tidak berisi slide apa pun.");

      renderApp();
      bindControls();

      document.getElementById("loading-screen").hidden = true;
      document.getElementById("app").hidden = false;
    } catch (err) {
      console.error(err);
      document.getElementById("loading-screen").hidden = true;
      document.getElementById("error-screen").hidden = false;
      const detail = document.getElementById("error-technical");
      if (detail) detail.textContent = `Detail teknis: ${err.message}`;
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();

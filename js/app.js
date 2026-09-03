(() => {
  "use strict";

  const DATA_URL = "content/content.json";
  const viewport = document.getElementById("slide-viewport");
  const app = document.getElementById("app");
  const loading = document.getElementById("loading-screen");
  const error = document.getElementById("error-screen");
  const technical = document.getElementById("error-technical");
  const progress = document.getElementById("progress");
  const rail = document.getElementById("slide-rail");
  const prev = document.getElementById("btn-prev");
  const next = document.getElementById("btn-next");
  let sections = [];
  let current = 0;

  const $ = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  function image(src, alt) {
    const img = $("img");
    img.src = src || "";
    img.alt = alt || "";
    img.loading = "lazy";
    img.onerror = () => { img.replaceWith($("div", "image-fallback", "Gambar tidak tersedia")); };
    return img;
  }

  function slide(label, inner) {
    const section = $("section", "slide");
    inner.insertBefore($("p", "eyebrow", label), inner.firstChild);
    section.appendChild(inner);
    viewport.appendChild(section);
    return section;
  }

  function makeCover(data) {
    const inner = $("div", "slide-inner cover-layout");
    const copy = $("div", "cover-copy");
    copy.appendChild($("div", "cover-kicker", data.group || "Kelompok 2"));
    copy.appendChild($("h1", null, data.title || "Judul Teks Prosedur"));
    if (data.objective) copy.appendChild($("p", "lead", data.objective));
    const meta = $("div", "meta");
    [["Kelas", data.className], ["Sekolah", data.school]].forEach(([label, value]) => {
      const item = $("div"); item.appendChild($("span", null, label)); const strong = $("strong", null, value || "—"); item.appendChild(strong); meta.appendChild(item);
    });
    copy.appendChild(meta);
    const visual = $("div", "cover-visual");
    visual.appendChild($("div", "cover-orbit orbit-one"));
    visual.appendChild($("div", "cover-orbit orbit-two"));
    if (data.result?.image) { const pic=$("div", "cover-image"); pic.appendChild(image(data.result.image, data.result.title || data.title)); visual.appendChild(pic); }
    visual.appendChild($("div", "cover-stamp", "K2"));
    inner.append(copy, visual);
    return slide(data.theme || "Teks Prosedur", inner);
  }

  function makeObjective(data) {
    const inner = $("div", "slide-inner");
    inner.appendChild($("h2", null, "Tujuan"));
    inner.appendChild($("div", "objective", data.objective || "Tujuan belum diisi."));
    return slide("Bagian 01", inner);
  }

  function makeMembers(data) {
    const inner = $("div", "slide-inner");
    inner.appendChild($("h2", null, "Anggota Kelompok"));
    const grid = $("div", "card-grid");
    (data.members || []).forEach((m) => {
      const card = $("article", "card"); const pic = $("div", "card-image"); pic.appendChild(image(m.photo, m.name));
      const body = $("div", "card-body"); body.appendChild($("div", "card-title", m.name)); body.appendChild($("div", "card-sub", `Absen ${m.absen || "—"} · ${m.role || "Anggota"}`));
      card.append(pic, body); grid.appendChild(card);
    });
    inner.appendChild(grid); return slide("Identitas", inner);
  }

  function makeMaterials(title, items, label, amount) {
    const inner = $("div", "slide-inner"); inner.appendChild($("h2", null, title));
    const grid = $("div", "card-grid");
    (items || []).forEach((item) => {
      const card = $("article", "card"); const pic = $("div", "card-image"); pic.appendChild(image(item.image, item.name));
      const body = $("div", "card-body"); body.appendChild($("div", "card-title", item.name || "—"));
      if (amount && item.amount) body.appendChild($("div", "card-sub", item.amount));
      card.append(pic, body); grid.appendChild(card);
    });
    inner.appendChild(grid); return slide(label, inner);
  }

  function makeStep(step, index, total) {
    const inner = $("div", "slide-inner step-layout");
    const text = $("div"); text.appendChild($("div", "step-number", `LANGKAH ${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`));
    text.appendChild($("h2", "step-title", step.title || `Langkah ${index + 1}`)); text.appendChild($("p", "step-description", step.description || ""));
    const pic = $("div", "step-image"); pic.appendChild(image(step.image, step.title)); inner.append(text, pic); return slide("Prosedur", inner);
  }

  function getYouTubeEmbed(url) {
    try {
      const u = new URL(url);
      if (u.hostname.includes("youtu.be")) return `https://www.youtube.com/embed/${u.pathname.slice(1).split("/")[0]}`;
      if (u.hostname.includes("youtube.com")) {
        const id = u.searchParams.get("v");
        if (id) return `https://www.youtube.com/embed/${id}`;
        const match = u.pathname.match(/\/(?:embed|shorts)\/([^/?]+)/);
        if (match) return `https://www.youtube.com/embed/${match[1]}`;
      }
    } catch (_) {}
    return null;
  }

  function makeVideo(data) {
    const inner = $("div", "slide-inner video-layout");
    inner.appendChild($("h2", null, "Video Tutorial"));
    const url = data.video?.url?.trim();
    if (url) {
      const wrap = $("div", "video-wrap");
      const yt = getYouTubeEmbed(url);
      if (yt) {
        const iframe = $("iframe");
        iframe.src = yt;
        iframe.title = "Video tutorial";
        iframe.loading = "lazy";
        iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
        iframe.allowFullscreen = true;
        wrap.appendChild(iframe);
      } else {
        const video = $("video");
        video.controls = true;
        video.playsInline = true;
        video.preload = "metadata";
        video.src = url;
        video.innerHTML = "Browser kamu tidak mendukung pemutar video.";
        wrap.appendChild(video);
      }
      inner.appendChild(wrap);
      inner.appendChild($("p", "video-note", "Video dapat diputar langsung dari halaman ini."));
    } else {
      const empty = $("div", "video-empty");
      empty.appendChild($("div", "video-icon", "▶"));
      empty.appendChild($("strong", null, "Video tutorial belum ditambahkan"));
      empty.appendChild($("p", null, "Isi link video pada content/content.json bagian video.url."));
      inner.appendChild(empty);
    }
    return slide("Tutorial", inner);
  }

  function makeResult(data) {
    const inner = $("div", "slide-inner");
    if (data.result?.image) { const pic = $("div", "result-image"); pic.appendChild(image(data.result.image, data.result.title)); inner.appendChild(pic); }
    inner.appendChild($("h2", null, data.result?.title || "Hasil Akhir"));
    if (data.result?.description) inner.appendChild($("p", "result-description", data.result.description));
    return slide("Penutup", inner);
  }

  function build(data) {
    viewport.innerHTML = ""; rail.innerHTML = "";
    const list = [];
    list.push(makeCover(data));
    if (data.objective) list.push(makeObjective(data));
    if (data.members?.length) list.push(makeMembers(data));
    if (data.ingredients?.length) list.push(makeMaterials("Bahan-Bahan", data.ingredients, "Persiapan", true));
    if (data.tools?.length) list.push(makeMaterials("Alat", data.tools, "Persiapan", false));
    (data.steps || []).forEach((step, i, arr) => list.push(makeStep(step, i, arr.length)));
    list.push(makeVideo(data));
    if (data.result) list.push(makeResult(data));
    sections = list;
    sections.forEach((section, i) => {
      const dot = $("button", "rail-dot"); dot.type = "button"; dot.title = `Bagian ${i + 1}`; dot.setAttribute("aria-label", `Buka bagian ${i + 1}`);
      dot.addEventListener("click", () => go(i)); rail.appendChild(dot);
    });
    update(0);
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting && entry.intersectionRatio > .55) update(sections.indexOf(entry.target)); }), { root: viewport, threshold: [.55] });
    sections.forEach(s => observer.observe(s));
  }

  function update(index) {
    if (index < 0 || index >= sections.length) return; current = index;
    [...rail.children].forEach((dot, i) => dot.classList.toggle("active", i === current));
    progress.textContent = `${current + 1} / ${sections.length}`;
    prev.disabled = current === 0; next.disabled = current === sections.length - 1;
  }
  function go(index) { sections[index]?.scrollIntoView({ behavior: "smooth", block: "start" }); }
  prev.addEventListener("click", () => go(current - 1)); next.addEventListener("click", () => go(current + 1));
  document.addEventListener("keydown", (e) => { if (["ArrowDown", "ArrowRight", "PageDown"].includes(e.key)) { e.preventDefault(); go(current + 1); } if (["ArrowUp", "ArrowLeft", "PageUp"].includes(e.key)) { e.preventDefault(); go(current - 1); } });

  fetch(DATA_URL, { cache: "no-store" })
    .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status} — ${DATA_URL}`); return r.json(); })
    .then((data) => { build(data); loading.hidden = true; app.hidden = false; })
    .catch((err) => { loading.hidden = true; error.hidden = false; technical.textContent = err.message; });
})();

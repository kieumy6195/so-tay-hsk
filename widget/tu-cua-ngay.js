// Sổ Tay HSK · Widget "Từ của ngày" (app Scriptable)
// Cỡ: nhỏ / vừa / lớn + màn hình khóa. Chạm vào widget → mở thẻ đầy đủ.
const SITE = "https://kieumy6195.github.io/so-tay-hsk/";
const fm = FileManager.local();
const cache = fm.joinPath(fm.documentsDirectory(), "hsk-wotd.json");

async function load() {
  try {
    const j = await new Request(SITE + "wotd.json?t=" + Date.now()).loadJSON();
    fm.writeString(cache, JSON.stringify(j));
    return j;
  } catch (e) {
    return fm.fileExists(cache) ? JSON.parse(fm.readString(cache)) : null;
  }
}
function pick(d) {
  const [y, m, dd] = d.start.split("-").map(Number);
  const a = new Date(y, m - 1, dd), n = new Date(); n.setHours(0, 0, 0, 0);
  const k = Math.round((n - a) / 864e5), N = d.words.length;
  return d.words[((k % N) + N) % N];
}

/* màu giống app */
const C = (h) => new Color(h);
const PAPER = C("#fffdf6"), INK = C("#2b2b3a"), MUTED = C("#8a7f70"), LINE = C("#e6dac3");
const YEL = C("#fff07a"), PINK = C("#ffc2dd"), GRN = C("#b8f0c8"), BLU = C("#bfe3ff"), PUR = C("#7048e8");
const TONE = { 1: C("#e03131"), 2: C("#e8590c"), 3: C("#2f9e44"), 4: C("#1c7ed6"), 5: C("#868e96") };
const ZH = (s, w = "Semibold") => new Font("PingFangSC-" + w, s);
const R = (s) => Font.boldRoundedSystemFont(s), Rm = (s) => Font.mediumRoundedSystemFont(s);

function txt(st, s, font, color, lines) {
  const t = st.addText(s); t.font = font; t.textColor = color || INK;
  if (lines) t.lineLimit = lines; t.minimumScaleFactor = 0.75; return t;
}
function pill(st, s, bg, color) {
  const p = st.addStack(); p.backgroundColor = bg; p.cornerRadius = 8; p.setPadding(2, 7, 2, 7);
  txt(p, s, R(10), color || INK); return p;
}
function stripe(w) {
  const row = w.addStack(); row.size = new Size(0, 5);
  [PINK, YEL, GRN, BLU, PINK, YEL, GRN, BLU].forEach((c) => { const s = row.addStack(); s.backgroundColor = c; s.addSpacer(); });
}
function pinyin(st, x, size) {
  const r = st.addStack(); r.spacing = 0;
  (x.ps && x.ps.length ? x.ps : [[x.p, 5]]).forEach(([s, t]) => txt(r, s, R(size), TONE[t]));
}
function block(st, label, bg) {
  const b = st.addStack(); b.layoutVertically(); b.backgroundColor = bg; b.cornerRadius = 12; b.setPadding(6, 9, 7, 9);
  const h = b.addStack(); txt(h, label, R(9), MUTED); h.addSpacer(); b.addSpacer(2); return b;
}
function hanzi(st, x, size) {
  const box = st.addStack(); box.backgroundColor = YEL; box.cornerRadius = 14; box.setPadding(2, 10, 4, 10);
  txt(box, x.w, ZH(size), INK, 1);
}
function header(st, compact) {
  const top = st.addStack(); top.centerAlignContent();
  pill(top, compact ? "今日" : "今日一词 · TỪ CỦA NGÀY", C("#f6efe0"));
  top.addSpacer();
  const n = new Date(); txt(top, n.getDate() + "/" + (n.getMonth() + 1), Rm(10), MUTED);
}

function build(d, size) {
  const w = new ListWidget();
  w.url = SITE + "#wotd";
  const tmr = new Date(); tmr.setHours(24, 0, 5, 0); w.refreshAfterDate = tmr;

  if (size.startsWith("accessory")) {               // màn hình khóa
    if (!d) { txt(w, "HSK", R(12)); return w; }
    const x = pick(d);
    if (size === "accessoryInline") { txt(w, `${x.w} ${x.p} · ${x.m}`, Rm(12)); return w; }
    if (size === "accessoryCircular") { w.addAccessoryWidgetBackground = true; txt(w, x.w, ZH(x.w.length > 2 ? 14 : 20), Color.white(), 1).centerAlignText(); return w; }
    const r = w.addStack(); r.centerAlignContent(); txt(r, x.w, ZH(22), Color.white(), 1); r.addSpacer(6); txt(r, x.p, R(13), Color.white());
    txt(w, x.m, Rm(12), Color.white(), 1); txt(w, x.e, ZH(11, "Regular"), Color.white(), 1);
    return w;
  }

  w.backgroundColor = PAPER; w.setPadding(0, 0, 0, 0);
  stripe(w);
  const c = w.addStack(); c.layoutVertically(); c.setPadding(9, 13, 11, 13);
  if (!d) { txt(c, "Chưa tải được từ – mở mạng rồi thử lại", Rm(12)); return w; }
  const x = pick(d);

  if (size === "small") {
    header(c, true); c.addSpacer(6);
    hanzi(c, x, x.w.length > 2 ? 26 : 34); c.addSpacer(4);
    pinyin(c, x, 15); txt(c, x.m, R(12), INK, 2);
    c.addSpacer(); return w;
  }

  header(c, false); c.addSpacer(size === "large" ? 8 : 6);
  const hero = c.addStack(); hero.centerAlignContent();
  hanzi(hero, x, size === "large" ? 40 : 34); hero.addSpacer(10);
  const col = hero.addStack(); col.layoutVertically();
  pinyin(col, x, size === "large" ? 20 : 17);
  txt(col, x.hv.toUpperCase(), R(10), PUR);
  txt(col, x.m, R(size === "large" ? 15 : 13), INK, 2);
  hero.addSpacer();

  c.addSpacer(size === "large" ? 9 : 6);
  const ex = block(c, "VÍ DỤ", C("#eef6ff"));
  txt(ex, x.e, ZH(size === "large" ? 15 : 13, "Regular"), INK, 1);
  if (size === "large") txt(ex, x.ep, Rm(11), TONE[4], 1);
  txt(ex, x.ev, Rm(11), MUTED, 1);

  if (size === "large") {
    if (x.t && x.t.length) {
      c.addSpacer(6);
      const tp = block(c, "💡 MẸO NHỚ", C("#fffbe6"));
      x.t.slice(0, 2).forEach((t) => { const r = tp.addStack(); r.spacing = 6; txt(r, t[0], ZH(14), INK); txt(r, t[1], Rm(11), INK, 2); });
    }
    c.addSpacer(6);
    const f = block(c, "✨ BẠN CÓ BIẾT?", C("#f3f0ff"));
    txt(f, x.f, Rm(11), INK, 3);
  }
  c.addSpacer();
  return w;
}

const data = await load();
const size = config.widgetFamily || "large";
const widget = build(data, size);
if (config.runsInWidget || config.runsInAccessoryWidget) Script.setWidget(widget);
else if (size === "small") await widget.presentSmall();
else if (size === "medium") await widget.presentMedium();
else await widget.presentLarge();
Script.complete();

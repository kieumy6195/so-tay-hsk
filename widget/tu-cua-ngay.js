// Sổ Tay HSK · Widget "Từ của ngày" cho app Scriptable (iPhone)
// Chạm vào widget → mở thẻ đầy đủ trong app.
const SITE = "https://kieumy6195.github.io/so-tay-hsk/";
const fm = FileManager.local();
const cache = fm.joinPath(fm.documentsDirectory(), "hsk-wotd.json");

async function load() {
  try {
    const r = new Request(SITE + "wotd.json?t=" + Date.now());
    const j = await r.loadJSON();
    fm.writeString(cache, JSON.stringify(j));
    return j;
  } catch (e) {
    if (fm.fileExists(cache)) return JSON.parse(fm.readString(cache));
    return null;
  }
}
function pick(d) {
  const [y, m, dd] = d.start.split("-").map(Number);
  const a = new Date(y, m - 1, dd), n = new Date();
  n.setHours(0, 0, 0, 0);
  const days = Math.round((n - a) / 864e5), N = d.words.length;
  return d.words[((days % N) + N) % N];
}
const INK = new Color("#2b2b3a"), MUTED = new Color("#8a7f70"), PURPLE = new Color("#7048e8"), BLUE = new Color("#1c7ed6");

function build(d, size) {
  const w = new ListWidget();
  w.backgroundColor = new Color("#fffdf6");
  w.url = SITE + "#wotd";
  w.setPadding(12, 14, 12, 14);
  if (!d) { const t = w.addText("Chưa tải được từ – mở mạng rồi thử lại"); t.font = Font.systemFont(12); return w; }
  const x = pick(d);

  const top = w.addStack(); top.centerAlignContent();
  const lb = top.addText("TỪ CỦA NGÀY"); lb.font = Font.boldSystemFont(10); lb.textColor = MUTED;
  top.addSpacer();
  const now = new Date();
  const dt = top.addText(now.getDate() + "/" + (now.getMonth() + 1)); dt.font = Font.mediumSystemFont(10); dt.textColor = MUTED;
  w.addSpacer(size === "small" ? 4 : 6);

  const row = w.addStack(); row.centerAlignContent();
  const hz = row.addText(x.w);
  hz.font = Font.systemFont(size === "small" ? (x.w.length > 2 ? 30 : 38) : 42); hz.textColor = INK; hz.minimumScaleFactor = 0.6;
  if (size !== "small") {
    row.addSpacer(10);
    const col = row.addStack(); col.layoutVertically();
    const py = col.addText(x.p); py.font = Font.semiboldSystemFont(17); py.textColor = BLUE;
    const hv = col.addText(x.hv.toUpperCase()); hv.font = Font.boldSystemFont(10); hv.textColor = PURPLE;
  } else {
    const py = w.addText(x.p); py.font = Font.semiboldSystemFont(14); py.textColor = BLUE;
  }
  const m = w.addText(x.m); m.font = Font.boldSystemFont(size === "small" ? 13 : 15); m.textColor = INK; m.lineLimit = 2;

  if (size !== "small") {
    w.addSpacer(6);
    const e = w.addText(x.e); e.font = Font.systemFont(14); e.textColor = INK; e.lineLimit = 1; e.minimumScaleFactor = 0.7;
    const ev = w.addText(x.ev); ev.font = Font.systemFont(11); ev.textColor = MUTED; ev.lineLimit = 1;
  }
  if (size === "large") {
    w.addSpacer(8);
    const ep = w.addText(x.ep); ep.font = Font.systemFont(12); ep.textColor = BLUE; ep.lineLimit = 2;
    if (x.t && x.t.length) {
      w.addSpacer(8);
      const h = w.addText("💡 MẸO NHỚ"); h.font = Font.boldSystemFont(10); h.textColor = MUTED;
      x.t.slice(0, 3).forEach(t => { const r = w.addText(t[0] + "  " + t[1]); r.font = Font.systemFont(12); r.textColor = INK; r.lineLimit = 2; });
    }
    w.addSpacer(8);
    const fh = w.addText("✨ BẠN CÓ BIẾT?"); fh.font = Font.boldSystemFont(10); fh.textColor = MUTED;
    const f = w.addText(x.f); f.font = Font.systemFont(12); f.textColor = INK; f.lineLimit = 4;
  }
  w.addSpacer();
  const tomorrow = new Date(); tomorrow.setHours(24, 0, 5, 0);
  w.refreshAfterDate = tomorrow;
  return w;
}

const data = await load();
const size = config.widgetFamily || "large";
const widget = build(data, size);
if (config.runsInWidget) Script.setWidget(widget);
else await widget["present" + size[0].toUpperCase() + size.slice(1)]();
Script.complete();

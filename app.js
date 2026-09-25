const API = "https://api.alquran.cloud/v1";
const QENC = "https://quranenc.com/api/v1";
const QCOM = "https://api.quran.com/api/v4";
const DB_NAME = "tafhimul_quran_offline",
  DB_VER = 1,
  STORE = "surahs";
const state = {
  route: "home",
  surah: 1,
  tab: "translation",
  surahs: [],
  ayahs: [],
  loading: false,
  favs: JSON.parse(localStorage.getItem("nq_favs") || "[]"),
  dark: localStorage.getItem("nq_dark") === "1",
  font: parseInt(localStorage.getItem("nq_font") || "34"),
  offline: 0,
  downloading: false,
};
const fallbackWords = {
  بِسْمِ: "নামে",
  اللَّهِ: "আল্লাহর",
  الرَّحْمَٰنِ: "পরম করুণাময়",
  الرَّحِيمِ: "অতি দয়ালু",
  الْحَمْدُ: "সমস্ত প্রশংসা",
  لِلَّهِ: "আল্লাহর জন্য",
  رَبِّ: "প্রতিপালক",
  الْعَالَمِينَ: "সকল জগতের",
  مَالِكِ: "মালিক",
  يَوْمِ: "দিনের",
  الدِّينِ: "প্রতিদান",
  إِيَّاكَ: "শুধু আপনারই",
  نَعْبُدُ: "আমরা ইবাদত করি",
  وَإِيَّاكَ: "এবং শুধু আপনারই",
  نَسْتَعِينُ: "আমরা সাহায্য চাই",
  اهْدِنَا: "আমাদের পথ দেখান",
  الصِّرَاطَ: "পথ",
  الْمُسْتَقِيمَ: "সরল",
  صِرَاطَ: "পথ",
  أَنْعَمْتَ: "আপনি অনুগ্রহ করেছেন",
  عَلَيْهِمْ: "তাদের উপর",
  غَيْرِ: "নয়",
  الْمَغْضُوبِ: "ক্রোধপ্রাপ্ত",
  وَلَا: "এবং নয়",
  الضَّالِّينَ: "পথভ্রষ্টদের",
};
const bnNum = (n) => String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);
function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/'/g, "&#39;")
    .replace(/"/g, "&quot;");
}
function dismissSplash() {
  document.getElementById("splash").style.display = "none";
  localStorage.setItem("nq_seen", "1");
}
function openDrawer() {
  document.getElementById("drawer").classList.add("open");
}
function closeDrawer() {
  document.getElementById("drawer").classList.remove("open");
}
function go(r) {
  closeDrawer();
  navigate(r);
}
function closeModal() {
  document.getElementById("modal").classList.remove("open");
}
function showModal(html) {
  document.getElementById("modalBox").innerHTML = html;
  document.getElementById("modal").classList.add("open");
}
function navigate(r) {
  state.route = r;
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function openDB() {
  return new Promise((resolve, reject) => {
    const r = indexedDB.open(DB_NAME, DB_VER);
    r.onupgradeneeded = () => {
      if (!r.result.objectStoreNames.contains(STORE))
        r.result.createObjectStore(STORE, { keyPath: "surah" });
    };
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}
async function dbGet(n) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const t = db.transaction(STORE, "readonly");
    const r = t.objectStore(STORE).get(n);
    r.onsuccess = () => res(r.result || null);
    r.onerror = () => rej(r.error);
  });
}
async function dbPut(v) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const t = db.transaction(STORE, "readwrite");
    t.objectStore(STORE).put(v);
    t.oncomplete = res;
    t.onerror = () => rej(t.error);
  });
}
async function dbAll() {
  const db = await openDB();
  return new Promise((res, rej) => {
    const t = db.transaction(STORE, "readonly");
    const r = t.objectStore(STORE).getAll();
    r.onsuccess = () => res(r.result || []);
    r.onerror = () => rej(r.error);
  });
}
async function offlineCount() {
  try {
    state.offline = (await dbAll()).length;
  } catch (e) {
    state.offline = 0;
  }
  return state.offline;
}
async function init() {
  if (localStorage.getItem("nq_seen")) dismissSplash();
  document.documentElement.classList.toggle("dark", state.dark);
  document.documentElement.style.setProperty(
    "--arabic-size",
    state.font + "px"
  );
  if ("serviceWorker" in navigator)
    navigator.serviceWorker.register("./service-worker.js").catch(() => {});
  await offlineCount();
  render();
  loadSurahs();
  updateOnlineBadge();
}
async function loadSurahs() {
  try {
    const cached = await localStorage.getItem("nq_surahs");
    if (cached) state.surahs = JSON.parse(cached);
    const r = await fetch(API + "/surah");
    const j = await r.json();
    state.surahs = j.data || [];
    localStorage.setItem("nq_surahs", JSON.stringify(state.surahs));
    if (state.route === "home") render();
  } catch (e) {
    try {
      state.surahs = JSON.parse(localStorage.getItem("nq_surahs") || "[]");
    } catch (_) {}
    if (state.route === "home") render();
  }
}
function updateOnlineBadge() {
  const b = document.getElementById("onlineBadge");
  if (b)
    b.textContent = navigator.onLine
      ? `অফলাইন ডেটা: ${state.offline}/114`
      : `অফলাইন মোড · ${state.offline}/114`;
}
window.addEventListener("online", () => {
  updateOnlineBadge();
  render();
});
window.addEventListener("offline", () => {
  updateOnlineBadge();
  render();
});
function activeNav() {
  document
    .querySelectorAll(".bottomNav button")
    .forEach((b) =>
      b.classList.toggle(
        "active",
        b.dataset.route === state.route ||
          (state.route === "reader" && b.dataset.route === "library")
      )
    );
}
function render() {
  const s = document.getElementById("screen");
  if (state.route === "home") s.innerHTML = homeView();
  else if (state.route === "library") s.innerHTML = libraryView();
  else if (state.route === "reader") s.innerHTML = readerShell();
  else if (state.route === "search") s.innerHTML = searchView();
  else if (state.route === "favorite") s.innerHTML = favoriteView();
  else if (state.route === "prayer") s.innerHTML = prayerView();
  else if (state.route === "qibla") s.innerHTML = qiblaView();
  else if (state.route === "settings") s.innerHTML = settingsView();
  else if (state.route === "tafsir") s.innerHTML = tafsirLanding();
  else if (state.route === "offline") s.innerHTML = offlineView();
  else s.innerHTML = homeView();
  activeNav();
  updateOnlineBadge();
  if (state.route === "reader") loadAyahs(state.surah);
}
function homeView() {
  return `<div class="home"><div class="offlineBadge" id="onlineBadge">অফলাইন ডেটা: ${ state.offline }/114</div><div class="selectRow"><div class="selectBox" onclick="navigate('library')">সূরা</div><div class="selectBox" onclick="navigate('library')">আয়াত</div><button class="goBtn" onclick="openReader(1)">GO</button></div><div class="prayerCard"><div class="prayerTop"><div class="prayerTitle">◉ &nbsp;পরবর্তী নামাজ</div><div class="locationPill">Al-Qatif</div></div><div class="prayerBig"><div><div class="prayerName">ফজর (আগামীকাল)</div><div class="prayerTime">০৪:১৩ AM</div></div><div><div class="remaining">বাকি সময়</div><div class="prayerTime">০৭:২৬:০৯</div></div></div><div class="progress"><i></i></div></div><div class="continue"><div class="continueTitle">▣ &nbsp;পড়া চালিয়ে যান<b>আত-তাকাসুর</b><small>আয়াতঃ ৬</small></div><button class="continueBtn" onclick="openReader(102)">শুরু করুন ▶</button></div><div class="quickGrid"><button onclick="navigate('library')">📖<span>কুরআন</span></button><button onclick="navigate('tafsir')">📚<span>তাফসীর</span></button><button onclick="openReader(1)">🎧<span>অডিও</span></button><button onclick="navigate('prayer')">🕌<span>নামাজ</span></button><button onclick="navigate('qibla')">🧭<span>কিবলা</span></button><button onclick="navigate('search')">⌕<span>সার্চ</span></button><button onclick="navigate('favorite')">🔖<span>বুকমার্ক</span></button><button onclick="navigate('settings')">⚙<span>সেটিংস</span></button></div><h2 class="sectionTitle">সূরাসমূহ</h2>${surahRows( state.surahs.slice(0, 8) )}</div>`;
}
function surahRows(list) {
  return list
    .map(
      (x) =>
        `<div class="surahRow" onclick="openReader(${ x.number })"><div class="num">${bnNum( x.number )}</div><div class="surahInfo"><strong>${esc( x.englishName )}</strong><small>${esc( x.englishNameTranslation || "" )}</small></div><div class="surahMeta"><strong>${esc( x.name )}</strong><small>আয়াতঃ ${bnNum(x.numberOfAyahs)}, ${ x.revelationType === "Meccan" ? "মক্কী" : "মাদানী" }</small></div></div>`
    )
    .join("");
}
function libraryView() {
  return `<div class="page"><div class="pageHead"><button class="back" onclick="navigate('home')">‹</button><h1>সূরাসমূহ</h1></div><div class="searchBox"><input id="surahFilter" placeholder="সূরা নাম, নম্বর বা কীওয়ার্ড..." oninput="filterSurahs(this.value)"><button onclick="filterSurahs(document.getElementById('surahFilter').value)">খুঁজুন</button></div><div id="surahList">${surahRows( state.surahs )}</div></div>`;
}
function filterSurahs(q) {
  const a = state.surahs.filter((x) =>
    `${x.number} ${x.name} ${x.englishName} ${x.englishNameTranslation}`
      .toLowerCase()
      .includes(q.toLowerCase())
  );
  document.getElementById("surahList").innerHTML = surahRows(a);
}
function readerShell() {
  const x = state.surahs.find((a) => a.number === state.surah);
  return `<div class="readerHead"><div class="readerTitle"><div><h1>${ x ? esc(x.name) : "সূরা" }</h1><small>আয়াত ১ - ${ x ? bnNum(x.numberOfAyahs) : "" }</small></div><div class="readerActions"><button class="smallBtn" onclick="changeFont(2)">Aa+</button><button class="smallBtn" onclick="changeFont(-2)">Aa−</button><button class="smallBtn" onclick="toggleFav(${ state.surah })">♥</button></div></div><div class="tabs"><button class="${ state.tab === "translation" ? "active" : "" }" onclick="setTab('translation')">অনুবাদ</button><button class="${ state.tab === "words" ? "active" : "" }" onclick="setTab('words')">শব্দে-শব্দে অর্থ</button><button class="${ state.tab === "tafsir" ? "active" : "" }" onclick="setTab('tafsir')">তাফসীর</button></div></div><div class="page" id="ayahList"><div class="muted">লোড হচ্ছে…</div></div>`;
}
async function loadAyahs(n) {
  const box = document.getElementById("ayahList");
  if (!box) return;
  try {
    state.loading = true;
    const local = await dbGet(n);
    if (local) {
      state.ayahs = local.ayahs;
      renderAyahs();
      return;
    }
    if (!navigator.onLine) {
      box.innerHTML =
        '<div class="tafsirBox">এই সূরাটি এখনো অফলাইনে ডাউনলোড করা হয়নি। ইন্টারনেট চালু করে “অফলাইন ডাউনলোড” থেকে সংরক্ষণ করুন।</div>';
      return;
    }
    const [a, b, e, t, w] = await Promise.all([
      fetch(`${API}/surah/${n}/quran-uthmani`).then((r) => r.json()),
      fetch(`${API}/surah/${n}/bn.bengali`).then((r) => r.json()),
      fetch(`${API}/surah/${n}/en.sahih`).then((r) => r.json()),
      fetch(`${QENC}/translation/sura/bengali_zakaria/${n}`)
        .then((r) => r.json())
        .catch(() => null),
      fetch(
        `${QCOM}/verses/by_chapter/${n}?words=true&word_translation_language=bn&per_page=300`
      )
        .then((r) => r.json())
        .catch(() => null),
    ]);
    const A = a.data.ayahs,
      B = b.data.ayahs,
      E = e.data.ayahs;
    const T = Array.isArray(t) ? t : t?.data || [];
    const W = w?.verses || [];
    state.ayahs = A.map((v, i) => {
      const key = `${n}:${v.numberInSurah}`;
      const tt = T.find((z) => Number(z.aya) === v.numberInSurah);
      const ww = W.find((z) => z.verse_key === key);
      return {
        n: v.numberInSurah,
        global: v.number,
        text: v.text,
        bn: B[i]?.text || "",
        en: E[i]?.text || "",
        key,
        tafsir: tt?.translation || "",
        footnotes: tt?.footnotes || {},
        words: ww?.words || [],
      };
    });
    await dbPut({
      surah: n,
      ayahs: state.ayahs,
      updatedAt: Date.now(),
      source: "AlQuran.cloud + QuranEnc + Quran.com",
    });
    await offlineCount();
    renderAyahs();
    updateOnlineBadge();
  } catch (err) {
    box.innerHTML =
      '<div class="tafsirBox">ডেটা লোড করা যায়নি। অনলাইন সংযোগ পরীক্ষা করুন অথবা আগে সূরাটি অফলাইনে ডাউনলোড করুন।</div>';
  }
}
function setTab(t) {
  state.tab = t;
  render();
}
function renderAyahs() {
  const box = document.getElementById("ayahList");
  if (!box) return;
  box.innerHTML = state.ayahs
    .map((a) => {
      let body = "";
      if (state.tab === "translation")
        body = `<div class="translation">${esc( a.bn )}</div><div class="english">${esc(a.en)}</div>`;
      if (state.tab === "words")
        body = `<div class="translation">${esc( a.bn )}</div><div class="wordGrid">${renderWords(a)}</div>`;
      if (state.tab === "tafsir")
        body = `<div class="tafsirBox"><b>তাফসীর — ${esc( a.key )}</b><div class="tafsirText">${ a.tafsir ? stripSafe(a.tafsir) : "এই আয়াতের সংক্ষিপ্ত বাংলা তাফসীর/ব্যাখ্যা অফলাইনে পাওয়া যায়নি। অনলাইনে থাকলে ডেটা আপডেট করে আবার চেষ্টা করুন।" }</div>${ Object.keys(a.footnotes || {}).length ? `<div class="footnotes"><b>টীকা</b><br>${Object.entries( a.footnotes ) .map(([k, v]) => `[${esc(k)}] ${stripSafe(v)}`) .join("<br>")}</div>` : "" }<div class="source">উৎস: QuranEnc · বাংলা অনুবাদ ও সংক্ষিপ্ত তাফসীর — আবু বকর মুহাম্মাদ যাকারিয়া</div></div>`;
      return `<section class="ayah"><span class="ayahNo">${bnNum( a.n )}</span><div class="arabic">${esc( a.text )}</div>${body}<div class="ayahBtns"><button onclick="playAyah(${ a.global },${a.n})">▶ অডিও</button><button onclick="openWordModal('${ a.key }')">শব্দার্থ</button><button onclick="setTab('tafsir')">তাফসীর</button></div></section>`;
    })
    .join("");
}
function stripSafe(s) {
  return String(s || "")
    .replace(/<br\s*\/?>/gi, "<br>")
    .replace(/<(?!br\b)[^>]*>/gi, "");
}
function renderWords(a) {
  if (a.words?.length)
    return a.words
      .map((w) => {
        const tr = w.translation?.text || w.translations?.[0]?.text || "অর্থ";
        return `<div class="word" onclick="openWord('${esc( w.text_uthmani || w.text || "" )}','${esc(tr)}')"><span class="ar">${esc( w.text_uthmani || w.text || "" )}</span><span class="bn">${stripSafe(tr)}</span></div>`;
      })
      .join("");
  const toks = a.text.replace(/[ۖ-۩]/g, "").split(/\s+/).filter(Boolean);
  return toks
    .map(
      (t) =>
        `<div class="word"><span class="ar">${esc( t )}</span><span class="bn">${esc( fallbackWords[t] || "অর্থ পাওয়া যায়নি" )}</span></div>`
    )
    .join("");
}
function openWord(ar, bn) {
  showModal(
    `<h3>শব্দে-শব্দে অর্থ</h3><div class="arabic">${ar}</div><div class="translation" style="text-align:center">${bn}</div><div class="source">বাংলা শব্দার্থ ডেটা কুরআন কনটেন্ট উৎস থেকে প্রদর্শিত হচ্ছে।</div>`
  );
}
function openWordModal(key) {
  const a = state.ayahs.find((x) => x.key === key);
  if (!a) return;
  showModal(
    `<h3>${esc(key)} — শব্দে-শব্দে অর্থ</h3><div class="arabic">${esc( a.text )}</div><div class="wordGrid">${renderWords(a)}</div>`
  );
}
function openTafsir(key) {
  const a = state.ayahs.find((x) => x.key === key);
  if (!a) {
    showModal("<h3>তাফসীর</h3><p>আয়াত লোড করুন।</p>");
    return;
  }
  showModal(
    `<h3>তাফসীর — ${esc( key )}</h3><div class="tafsirBox"><div class="tafsirText">${ a.tafsir ? stripSafe(a.tafsir) : "এই আয়াতের তাফসীর অফলাইনে নেই। অনলাইনে ডাউনলোড করলে পরে অফলাইনেও পড়তে পারবেন।" }</div><div class="source">উৎস: QuranEnc / বাংলা অনুবাদ ও সংক্ষিপ্ত তাফসীর — আবু বকর মুহাম্মাদ যাকারিয়া</div></div>`
  );
}
function openReader(n) {
  state.surah = n;
  state.tab = "translation";
  navigate("reader");
}
async function playAyah(global, n) {
  const audio = document.getElementById("player");
  const url = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${global}.mp3`;
  audio.src = url;
  try {
    await audio.play();
  } catch (e) {
    showModal(
      `<h3>অডিও</h3><p>ইন্টারনেট ছাড়া অডিও শুনতে হলে আগে এই সূরার অডিও ডাউনলোড করতে হবে।</p><button class="continueBtn" onclick="cacheSurahAudio(${n})">এই সূরার অডিও সংরক্ষণ</button>`
    );
  }
}
function toggleFav(n) {
  if (state.favs.includes(n)) state.favs = state.favs.filter((x) => x !== n);
  else state.favs.push(n);
  localStorage.setItem("nq_favs", JSON.stringify(state.favs));
  render();
}
function favoriteView() {
  const list = state.surahs.filter((x) => state.favs.includes(x.number));
  return `<div class="page"><div class="pageHead"><h1>ফেভারিট</h1></div>${ list.length ? surahRows(list) : '<div class="tafsirBox">এখনও কোনো সূরা ফেভারিট করা হয়নি।</div>' }</div>`;
}
function searchView() {
  return `<div class="page"><div class="pageHead"><h1>সার্চ</h1></div><div class="searchBox"><input id="q" placeholder="সূরা, আয়াত, শব্দ বা অনুবাদ..."/><button onclick="doSearch()">খুঁজুন</button></div><div id="results"></div></div>`;
}
async function doSearch() {
  const q = document.getElementById("q").value.trim();
  if (!q) return;
  document.getElementById("results").innerHTML =
    '<div class="muted">খুঁজছি…</div>';
  const local = (await dbAll())
    .flatMap((x) => x.ayahs)
    .filter((a) =>
      (a.bn + " " + a.text + " " + a.en + " " + a.tafsir)
        .toLowerCase()
        .includes(q.toLowerCase())
    )
    .slice(0, 30);
  if (local.length) {
    document.getElementById("results").innerHTML = local
      .map(
        (m) =>
          `<div class="searchResult" onclick="openReader(${ m.key.split(":")[0] })"><b>${esc(m.key)}</b><div>${esc(m.bn)}</div><small>${esc( m.text )}</small></div>`
      )
      .join("");
    return;
  }
  if (!navigator.onLine) {
    document.getElementById("results").innerHTML =
      '<div class="tafsirBox">অফলাইনে শুধু ডাউনলোড করা সূরাগুলোতে সার্চ করা যাবে।</div>';
    return;
  }
  try {
    const r = await fetch(
      `${API}/search/${encodeURIComponent(q)}/all/bn.bengali`
    );
    const j = await r.json();
    document.getElementById("results").innerHTML =
      (j.data?.matches || [])
        .slice(0, 20)
        .map(
          (m) =>
            `<div class="searchResult" onclick="openReader(${ m.surah?.number || 1 })"><b>${esc(m.surah?.name || "কুরআন")} · আয়াত ${bnNum( m.numberInSurah || "" )}</b><div>${esc(m.text || "")}</div></div>`
        )
        .join("") || '<div class="muted">কিছু পাওয়া যায়নি।</div>';
  } catch (e) {
    document.getElementById("results").innerHTML =
      '<div class="tafsirBox">সার্চের জন্য ইন্টারনেট প্রয়োজন।</div>';
  }
}
function prayerView() {
  return `<div class="page"><div class="pageHead"><h1>নামাজের সময়</h1></div><div class="prayerCard" style="margin:0"><div class="prayerTop"><div class="prayerTitle">Al-Qatif</div><div class="locationPill">Saudi Arabia</div></div><div class="prayerBig"><div><div class="prayerName">পরবর্তী নামাজ</div><div class="prayerTime">ফজর</div></div><div><div class="prayerTime">০৪:১৩</div></div></div><div class="featureGrid"><div class="feature">ফজর<br>০৪:১৩</div><div class="feature">যোহর<br>১২:০৫</div><div class="feature">আসর<br>১৫:৩০</div><div class="feature">মাগরিব<br>১৮:০০</div><div class="feature">ইশা<br>১৯:৩০</div><div class="feature" onclick="navigate('qibla')">কিবলা<br>দিক</div></div></div></div>`;
}
function qiblaView() {
  return `<div class="page"><div class="pageHead"><h1>কিবলা দিক</h1></div><div class="tafsirBox" style="text-align:center"><div style="font-size:90px">◎</div><h2>কাবা শরীফের দিকে</h2><div style="font-size:34px;color:var(--green)">≈ 120°</div><p class="muted">আপনার অবস্থান: Al-Qatif</p></div></div>`;
}
function settingsView() {
  return `<div class="page"><div class="pageHead"><h1>সেটিংস</h1></div><div class="offlineManager"><div><b>অফলাইন কুরআন লাইব্রেরি</b><small>${ state.offline }/114 সূরা সংরক্ষিত · ${ navigator.onLine ? "অনলাইন" : "অফলাইন" }</small></div><button class="continueBtn" onclick="navigate('offline')">ম্যানেজ</button></div><div class="setting"><b>ভাষা</b><span class="muted">বাংলা</span></div><div class="setting"><b>আরবি ফন্ট</b><span class="muted">Uthmani</span></div><div class="setting"><b>ফন্ট সাইজ</b><div><button class="smallBtn" onclick="changeFont(-2)">A−</button><button class="smallBtn" onclick="changeFont(2)">A+</button></div></div><div class="setting"><b>থিম</b><button class="smallBtn" onclick="toggleDark()">${ state.dark ? "লাইট" : "ডার্ক" }</button></div><div class="setting"><b>শব্দে-শব্দে অর্থ</b><span class="muted">বাংলা</span></div><div class="setting"><b>তাফসীর</b><span class="muted">আবু বকর যাকারিয়া</span></div><div class="setting"><b>অ্যাপ সম্পর্কে</b><span class="muted">v3.0 Offline</span></div></div>`;
}
function offlineView() {
  return `<div class="page"><div class="pageHead"><button class="back" onclick="navigate('settings')">‹</button><h1>অফলাইন লাইব্রেরি</h1></div><div class="offlineHero"><b>ইন্টারনেট ছাড়াই কুরআন পড়ুন</b><p>সূরা ডাউনলোড করলে আরবি, বাংলা অনুবাদ, শব্দে-শব্দে অর্থ ও সংক্ষিপ্ত তাফসীর ফোনে সংরক্ষিত থাকবে।</p><div class="offlineProgress"><i id="downloadProgress"></i></div><small id="downloadStatus">${ state.offline }/114 সূরা সংরক্ষিত</small><div class="offlineActions"><button class="continueBtn" onclick="downloadAllSurahs()" ${ state.downloading || !navigator.onLine ? "disabled" : "" }>${ state.downloading ? "ডাউনলোড চলছে…" : "সব ১১৪ সূরা ডাউনলোড" }</button><button class="dangerBtn" onclick="clearOffline()">সব মুছে ফেলুন</button></div></div><div class="notice">⚠️ প্রথমবার ডাউনলোডের সময় ইন্টারনেট লাগবে। সম্পূর্ণ টেক্সট/শব্দার্থ/তাফসীর অফলাইনে রাখার পর সাধারণ পড়া ও সার্চ ইন্টারনেট ছাড়াই চলবে। অডিও আলাদা করে সংরক্ষণ করা যায়।</div><div id="offlineList">${state.surahs .map( (x) => `<div class="offlineRow"><span>${bnNum(x.number)} · ${esc( x.name )}</span><span id="off-${x.number}">${ state.offlineSurahSet?.has(x.number) ? "✓" : "" }</span><button onclick="downloadOne(${x.number})" ${ !navigator.onLine ? "disabled" : "" }>${ state.offlineSurahSet?.has(x.number) ? "আবার" : "ডাউনলোড" }</button></div>` ) .join("")}</div></div>`;
}
async function refreshOfflineSet() {
  const all = await dbAll();
  state.offlineSurahSet = new Set(all.map((x) => x.surah));
  state.offline = all.length;
}
async function downloadOne(n, silent = false) {
  if (!navigator.onLine) {
    if (!silent)
      showModal("<h3>অফলাইন</h3><p>ডাউনলোড করতে ইন্টারনেট প্রয়োজন।</p>");
    return false;
  }
  try {
    const [a, b, e, t, w] = await Promise.all([
      fetch(`${API}/surah/${n}/quran-uthmani`).then((r) => r.json()),
      fetch(`${API}/surah/${n}/bn.bengali`).then((r) => r.json()),
      fetch(`${API}/surah/${n}/en.sahih`).then((r) => r.json()),
      fetch(`${QENC}/translation/sura/bengali_zakaria/${n}`)
        .then((r) => r.json())
        .catch(() => null),
      fetch(
        `${QCOM}/verses/by_chapter/${n}?words=true&word_translation_language=bn&per_page=300`
      )
        .then((r) => r.json())
        .catch(() => null),
    ]);
    const A = a.data.ayahs,
      B = b.data.ayahs,
      E = e.data.ayahs,
      T = Array.isArray(t) ? t : t?.data || [],
      W = w?.verses || [];
    const ayahs = A.map((v, i) => {
      const key = `${n}:${v.numberInSurah}`,
        tt = T.find((z) => Number(z.aya) === v.numberInSurah),
        ww = W.find((z) => z.verse_key === key);
      return {
        n: v.numberInSurah,
        global: v.number,
        text: v.text,
        bn: B[i]?.text || "",
        en: E[i]?.text || "",
        key,
        tafsir: tt?.translation || "",
        footnotes: tt?.footnotes || {},
        words: ww?.words || [],
      };
    });
    await dbPut({
      surah: n,
      ayahs,
      updatedAt: Date.now(),
      source: "AlQuran.cloud + QuranEnc + Quran.com",
    });
    return true;
  } catch (e) {
    return false;
  }
}
async function downloadAllSurahs() {
  if (state.downloading || !navigator.onLine) return;
  state.downloading = true;
  render();
  const total = state.surahs.length || 114;
  let done = 0;
  for (const s of state.surahs) {
    const ok = await downloadOne(s.number, true);
    if (ok) done++;
    const p = Math.round((done / total) * 100);
    const bar = document.getElementById("downloadProgress");
    const st = document.getElementById("downloadStatus");
    if (bar) bar.style.width = p + "%";
    if (st) st.textContent = `${done}/${total} সূরা সংরক্ষিত`;
    await refreshOfflineSet();
    updateOnlineBadge();
  }
  state.downloading = false;
  await refreshOfflineSet();
  render();
  showModal(
    `<h3>অফলাইন ডাউনলোড সম্পন্ন</h3><p>${done}টি সূরা ফোনে সংরক্ষণ করা হয়েছে। এখন কুরআনের মূল লেখা, বাংলা অনুবাদ, শব্দে-শব্দে অর্থ ও ডাউনলোড হওয়া তাফসীর অফলাইনে পড়তে পারবেন।</p>`
  );
}
async function clearOffline() {
  if (!confirm("সব অফলাইন কুরআন ডেটা মুছে ফেলবেন?")) return;
  const db = await openDB();
  await new Promise((res, rej) => {
    const t = db.transaction(STORE, "readwrite");
    t.objectStore(STORE).clear();
    t.oncomplete = res;
    t.onerror = () => rej(t.error);
  });
  await refreshOfflineSet();
  render();
}
async function cacheSurahAudio(n) {
  const a = state.ayahs;
  showModal(
    `<h3>অডিও সংরক্ষণ</h3><p>এই সূরার ${a.length}টি অডিও ফাইল ব্রাউজার স্টোরেজে সংরক্ষণ করা হচ্ছে। এটি সময় ও জায়গা নিতে পারে।</p><div class="offlineProgress"><i id="audioProgress"></i></div><small id="audioStatus">0/${a.length}</small>`
  );
  const cache = await caches.open("tafhimul-quran-audio-v1");
  let i = 0;
  for (const x of a) {
    try {
      const u = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${x.global}.mp3`;
      const r = await fetch(u);
      if (r.ok) await cache.put(u, r.clone());
    } catch (e) {}
    i++;
    const p = document.getElementById("audioProgress");
    const st = document.getElementById("audioStatus");
    if (p) p.style.width = Math.round((i / a.length) * 100) + "%";
    if (st) st.textContent = `${i}/${a.length}`;
  }
  if (document.getElementById("modalBox"))
    document
      .getElementById("modalBox")
      .insertAdjacentHTML("beforeend", "<p>অডিও সংরক্ষণ শেষ হয়েছে।</p>");
}
async function toggleDark() {
  state.dark = !state.dark;
  localStorage.setItem("nq_dark", state.dark ? "1" : "0");
  document.documentElement.classList.toggle("dark", state.dark);
  render();
}
function changeFont(d) {
  state.font = Math.max(26, Math.min(46, state.font + d));
  localStorage.setItem("nq_font", state.font);
  document.documentElement.style.setProperty(
    "--arabic-size",
    state.font + "px"
  );
  if (state.route === "reader") render();
}
function tafsirLanding() {
  return `<div class="page"><div class="pageHead"><h1>তাফসীর</h1></div><div class="tafsirBox"><h3>বাংলা তাফসীর</h3><p>প্রতিটি আয়াতের সাথে বাংলা অনুবাদ ও সংক্ষিপ্ত তাফসীর সংরক্ষণ করা যাবে। অফলাইন লাইব্রেরি থেকে একবার ডাউনলোড করলে পরে ইন্টারনেট ছাড়াই পড়তে পারবেন।</p><button class="continueBtn" onclick="navigate('offline')">অফলাইন ডেটা ডাউনলোড</button></div></div>`;
}
function rateApp() {
  showModal("<h3>Rate</h3><p>আপনার মতামত আমাদের জন্য গুরুত্বপূর্ণ।</p>");
}
function updateApp() {
  showModal(
    "<h3>Update</h3><p>নতুন ভার্সনের APK GitHub Actions দিয়ে তৈরি করুন।</p>"
  );
}
function shareApp() {
  navigator.share
    ? navigator.share({
        title: "তাফহীমুল কুরআন",
        text: "কুরআন মাজীদ ও আধুনিক তাফসীর",
      })
    : showModal("<h3>Share</h3><p>এই অ্যাপের লিংক শেয়ার করুন।</p>");
}
function aboutApp() {
  showModal(
    "<h3>তাফহীমুল কুরআন</h3><p>কুরআন মাজীদ, বাংলা অনুবাদ, শব্দে-শব্দে অর্থ, বাংলা সংক্ষিপ্ত তাফসীর, অডিও, নামাজ ও কিবলা।</p>"
  );
}
function exitApp() {
  showModal(
    "<h3>Exit</h3><p>Android back/home ব্যবহার করে অ্যাপ বন্ধ করুন।</p>"
  );
}
window.addEventListener("load", async () => {
  await refreshOfflineSet();
  init();
});

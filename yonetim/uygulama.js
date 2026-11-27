// "Ürün Ekle" uygulaması – Emin Seçilmiş Carpet
// - Kurulum: ad, telefon, GitHub anahtarı ve 6 haneli PIN. Anahtar PIN ile şifrelenip (AES-GCM, PBKDF2) bu telefonda saklanır.
// - PIN 3 kez yanlış girilirse anahtar silinir; yeniden kurmak için GitHub anahtarı gerekir (sadece yönetici).
// - Ürün ekleme / düzenleme / silme: js/urunler.js ve fotoğraflar tek commit ile GitHub'a gönderilir.
//   GitHub'daki otomatik işlem (.github/workflows/olustur.yml) sayfaları üretip siteyi yayınlar.
(function () {
  const DEPO = "yusufsecilmis27-code/akik-hali12";
  const API = "https://api.github.com/repos/" + DEPO;
  const SITE = "https://eminsecilmiscarpet.com";
  const EBATLAR = ["80x150", "100x200", "120x180", "160x230", "200x290", "240x340", "300x400", "İstenilen ebatta üretim"];
  const KILIT_SURE = 2 * 60 * 1000; // arka planda bu kadar kalınca tekrar PIN sorulur
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  let anahtar = "", kullanici = { ad: "", tel: "" };
  let urunMetni = "", urunler = [];
  let mod = "yeni", duzenlenen = null, fotolar = [], etiket = "", ebatlar = new Set(), mesgul = false;

  // ---------- Ekranlar ----------
  function ekran(ad) {
    ["kurulum", "kilit", "bloke", "liste", "form", "sonuc"].forEach((e) => $(e).classList.toggle("acik", e === ad));
    $("alt-cubuk").hidden = ad !== "form";
    $("ayar-ac").hidden = !["liste", "form"].includes(ad);
    $("ust-baslik").textContent = ad === "form" ? (mod === "yeni" ? "Yeni ürün" : "Ürünü düzenle") : ad === "liste" ? "Ürünlerim" : "Ürün Ekle";
    window.scrollTo(0, 0);
  }

  // ---------- Şifreleme ----------
  const b64 = (bayt) => { let s = ""; for (let i = 0; i < bayt.length; i += 0x8000) s += String.fromCharCode.apply(null, bayt.subarray(i, i + 0x8000)); return btoa(s); };
  const b64Bayt = (b) => Uint8Array.from(atob(b.replace(/\n/g, "")), (c) => c.charCodeAt(0));
  const metinB64 = (t) => b64(new TextEncoder().encode(t));
  const b64Metin = (b) => new TextDecoder().decode(b64Bayt(b));
  async function anahtarTuret(pin, tuz) {
    const ham = await crypto.subtle.importKey("raw", new TextEncoder().encode(pin), "PBKDF2", false, ["deriveKey"]);
    return crypto.subtle.deriveKey({ name: "PBKDF2", salt: tuz, iterations: 250000, hash: "SHA-256" }, ham, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
  }
  async function kasaKaydet(pin, veri) {
    const tuz = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
    const sifreli = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await anahtarTuret(pin, tuz), new TextEncoder().encode(JSON.stringify(veri)));
    localStorage.setItem("kasa", JSON.stringify({ ad: veri.ad, tuz: b64(tuz), iv: b64(iv), veri: b64(new Uint8Array(sifreli)) }));
  }
  async function kasaAc(pin) {
    const k = JSON.parse(localStorage.getItem("kasa"));
    const acik = await crypto.subtle.decrypt({ name: "AES-GCM", iv: b64Bayt(k.iv) }, await anahtarTuret(pin, b64Bayt(k.tuz)), b64Bayt(k.veri));
    return JSON.parse(new TextDecoder().decode(acik));
  }
  function hepsiniSil() { localStorage.removeItem("kasa"); localStorage.removeItem("pin-hata"); localStorage.removeItem("gh-anahtar"); anahtar = ""; }

  // ---------- Kurulum ----------
  $("kurulum-kaydet").addEventListener("click", async () => {
    const ad = $("k-ad").value.trim(), tel = $("k-tel").value.trim(), a = $("k-anahtar").value.trim(), p = $("k-pin").value, p2 = $("k-pin2").value;
    const hata = (m) => { $("kurulum-hata").hidden = false; $("kurulum-hata").textContent = m; };
    if (!ad || !tel || !a) return hata("Lütfen ad, telefon ve anahtarı doldurun.");
    if (!/^\d{6}$/.test(p)) return hata("PIN 6 rakam olmalı.");
    if (p !== p2) return hata("İki PIN birbirini tutmuyor.");
    if (/^(\d)\1{5}$/.test(p) || "0123456789".includes(p) || "9876543210".includes(p)) return hata("Bu PIN çok kolay (ör. 111111, 123456). Başka bir PIN seçin.");
    $("kurulum-kaydet").disabled = true;
    try {
      anahtar = a;
      if (a !== "deneme") await gh("");
      await kasaKaydet(p, { ad, tel, anahtar: a });
      localStorage.removeItem("pin-hata");
      kullanici = { ad, tel };
      ["k-anahtar", "k-pin", "k-pin2"].forEach((id) => ($(id).value = ""));
      listeAc();
    } catch (e) {
      anahtar = "";
      hata("Anahtar çalışmadı (" + e.message + "). Doğru kopyaladığınızdan ve depo izninin 'Contents: Read and write' olduğundan emin olun.");
    } finally { $("kurulum-kaydet").disabled = false; }
  });

  // ---------- PIN ----------
  let pinGirdi = "";
  function kilitAc() {
    anahtar = ""; pinGirdi = ""; noktaCiz();
    const k = JSON.parse(localStorage.getItem("kasa") || "null");
    $("selam").textContent = k && k.ad ? "Hoş geldiniz, " + k.ad : "Hoş geldiniz";
    const hata = +localStorage.getItem("pin-hata") || 0;
    $("pin-mesaj").textContent = hata ? `${3 - hata} deneme hakkınız kaldı.` : "";
    ekran("kilit");
  }
  function noktaCiz() { [...$("noktalar").children].forEach((n, i) => n.classList.toggle("dolu", i < pinGirdi.length)); }
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"].forEach((t) => {
    const b = document.createElement("button");
    b.textContent = t; if (!t) b.className = "bos";
    b.addEventListener("click", () => tus(t));
    $("tuslar").appendChild(b);
  });
  async function tus(t) {
    if (!t) return;
    if (t === "⌫") { pinGirdi = pinGirdi.slice(0, -1); return noktaCiz(); }
    if (pinGirdi.length >= 6) return;
    pinGirdi += t; noktaCiz();
    if (pinGirdi.length < 6) return;
    try {
      const v = await kasaAc(pinGirdi);
      anahtar = v.anahtar; kullanici = { ad: v.ad, tel: v.tel };
      localStorage.removeItem("pin-hata");
      listeAc();
    } catch (e) {
      const hata = (+localStorage.getItem("pin-hata") || 0) + 1;
      if (hata >= 3) { hepsiniSil(); return ekran("bloke"); }
      localStorage.setItem("pin-hata", hata);
      $("noktalar").classList.add("salla"); setTimeout(() => $("noktalar").classList.remove("salla"), 450);
      $("pin-mesaj").textContent = `Yanlış PIN. ${3 - hata} deneme hakkınız kaldı.`;
      pinGirdi = ""; noktaCiz();
    }
  }
  $("bloke-kurulum").addEventListener("click", () => ekran("kurulum"));
  let gizlendi = 0;
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) gizlendi = Date.now();
    else if (anahtar && !mesgul && Date.now() - gizlendi > KILIT_SURE) kilitAc();
  });
  $("ayar-ac").addEventListener("click", () => {
    if (confirm("PIN'i ve anahtarı bu telefondan silip kurulumu yeniden yapmak ister misiniz?\n\n(İptal derseniz uygulama sadece kilitlenir.)")) { hepsiniSil(); ekran("kurulum"); }
    else kilitAc();
  });

  // ---------- GitHub ----------
  async function gh(yol, ayar = {}) {
    if (anahtar === "deneme") throw new Error("deneme");
    const r = await fetch(API + yol, { ...ayar, cache: "no-store", headers: { Authorization: "Bearer " + anahtar, Accept: "application/vnd.github+json", ...(ayar.body ? { "Content-Type": "application/json" } : {}) } });
    if (!r.ok) { const e = new Error("GitHub " + r.status); e.durum = r.status; throw e; }
    return r.json();
  }
  async function urunleriGetir() {
    if (anahtar === "deneme") return { metin: await (await fetch("/js/urunler.js?t=" + Date.now(), { cache: "no-store" })).text(), ust: null };
    const ref = await gh("/git/ref/heads/main");
    const dosya = await gh("/contents/js/urunler.js?ref=" + ref.object.sha);
    return { metin: b64Metin(dosya.content), ust: ref.object.sha };
  }
  const urunListesi = (metin) => new Function(metin + ";return URUNLER;")();

  // ---------- Ürünlerim ----------
  async function listeAc() {
    ekran("liste");
    $("urunler").innerHTML = '<p class="kucuk">Ürünler yükleniyor…</p>';
    try {
      urunMetni = (await urunleriGetir()).metin;
      urunler = urunListesi(urunMetni);
      listeCiz();
    } catch (e) {
      $("urunler").innerHTML = `<div class="uyari">Ürünler yüklenemedi (${esc(e.message)}). İnternet bağlantısını kontrol edin.</div>`;
    }
  }
  const kucukResim = (yol) => /^img\//.test(yol) ? SITE + "/img/k/" + yol.slice(4).replace(/\.\w+$/, ".webp") : "";
  const videoMu = (s) => /\.(mp4|webm|mov)$/i.test(s);
  function listeCiz() {
    const q = $("ara").value.trim().toLocaleLowerCase("tr");
    const liste = urunler.filter((u) => !q || (u.ad + " " + u.kod).toLocaleLowerCase("tr").includes(q));
    $("urunler").innerHTML = liste.map((u) => {
      const kapak = (u.gorseller || []).find((g) => !videoMu(g));
      return `<div class="urun-satir">
        ${kapak ? `<img src="${esc(kucukResim(kapak))}" onerror="this.onerror=null;this.src='${esc(SITE + "/" + kapak)}'" alt="">` : '<div class="bos"></div>'}
        <div><b>${esc(u.ad)}</b><small>${esc(u.kod)} · ${u.etiket === "spot" ? "Spot halı" : "Seri üretim"} · ${(u.gorseller || []).length} fotoğraf</small></div>
        <button data-kod="${esc(u.kod)}">Düzenle</button></div>`;
    }).join("") || '<p class="kucuk">Ürün bulunamadı.</p>';
  }
  $("ara").addEventListener("input", listeCiz);
  $("urunler").addEventListener("click", (e) => { const b = e.target.closest("[data-kod]"); if (b) formAc(urunler.find((u) => u.kod === b.dataset.kod)); });
  $("yeni-urun").addEventListener("click", () => formAc(null));

  // ---------- Form ----------
  EBATLAR.forEach((eb) => {
    const b = document.createElement("button"); b.type = "button"; b.textContent = eb; b.dataset.ebat = eb;
    b.onclick = () => { ebatlar.has(eb) ? ebatlar.delete(eb) : ebatlar.add(eb); b.classList.toggle("aktif", ebatlar.has(eb)); };
    $("ebatlar").appendChild(b);
  });
  function formAc(u) {
    mod = u ? "duzenle" : "yeni"; duzenlenen = u;
    fotolar = u ? (u.gorseller || []).map((yol) => ({ yol })) : [];
    etiket = u ? u.etiket || "seri" : "";
    ebatlar = new Set(u ? u.ebatlar || [] : []);
    // listede olmayan ebatlar için de düğme ekle
    ebatlar.forEach((eb) => { if (!$("ebatlar").querySelector(`[data-ebat="${CSS.escape(eb)}"]`)) { const b = document.createElement("button"); b.type = "button"; b.textContent = eb; b.dataset.ebat = eb; b.onclick = () => { ebatlar.has(eb) ? ebatlar.delete(eb) : ebatlar.add(eb); b.classList.toggle("aktif", ebatlar.has(eb)); }; $("ebatlar").appendChild(b); } });
    $("ebatlar").querySelectorAll("button").forEach((b) => b.classList.toggle("aktif", ebatlar.has(b.dataset.ebat)));
    $("ad").value = u ? u.ad : ""; $("adEn").value = u ? u.adEn || "" : "";
    $("agirlik").value = u ? u.agirlik || "" : ""; $("aciklama").value = u ? (u.aciklama && u.aciklama.tr) || "" : "";
    $("tur").value = u && u.tur === "Yapboz Halı" ? "Yapboz Halı" : "Makine Halısı";
    $("desenli").checked = u ? !!u.desenli : true;
    $("detaylar").open = !!u;
    document.querySelectorAll("[data-etiket]").forEach((x) => x.classList.toggle("aktif", x.dataset.etiket === etiket));
    $("sil").hidden = !u; $("form-hata").hidden = true;
    $("yayinla").textContent = u ? "DEĞİŞİKLİKLERİ KAYDET" : "YAYINLA";
    fotoCiz(); ekran("form");
  }
  function fotoCiz() {
    $("fotolar").innerHTML = "";
    fotolar.forEach((f, i) => {
      const d = document.createElement("div");
      if (f.dosya) d.style.backgroundImage = `url(${URL.createObjectURL(f.dosya)})`;
      else if (!videoMu(f.yol)) d.style.backgroundImage = `url("${kucukResim(f.yol)}"), url("${SITE}/${f.yol}")`;
      d.innerHTML = `${i === 0 ? "<b>Kapak</b>" : ""}${f.yol && videoMu(f.yol) ? "<em>▶</em>" : ""}<button aria-label="Çıkar">✕</button>`;
      d.querySelector("button").onclick = (e) => { e.stopPropagation(); fotolar.splice(i, 1); fotoCiz(); };
      d.onclick = () => { if (i) { fotolar.unshift(fotolar.splice(i, 1)[0]); fotoCiz(); } };
      $("fotolar").appendChild(d);
    });
    kontrol();
  }
  function kontrol() { $("yayinla").disabled = !(fotolar.length && $("ad").value.trim() && etiket); }
  ["galeri", "kamera"].forEach((id) => $(id).addEventListener("change", (e) => { fotolar.push(...[...e.target.files].map((dosya) => ({ dosya }))); e.target.value = ""; fotoCiz(); }));
  $("ad").addEventListener("input", kontrol);
  document.querySelectorAll("[data-etiket]").forEach((b) => b.addEventListener("click", () => {
    etiket = b.dataset.etiket;
    document.querySelectorAll("[data-etiket]").forEach((x) => x.classList.toggle("aktif", x === b));
    kontrol();
  }));
  $("form-geri").addEventListener("click", () => ekran("liste"));
  $("yayinla").addEventListener("click", () => kaydet(mod));
  $("sil").addEventListener("click", () => {
    if (confirm(`"${duzenlenen.ad}" (${duzenlenen.kod}) siteden silinsin mi?\n\nGerekirse Yusuf geri getirebilir.`)) kaydet("sil");
  });
  $("s-don").addEventListener("click", listeAc);

  // ---------- urunler.js düzenleme ----------
  function nesneAraligi(metin, kod) {
    const i = metin.search(new RegExp('kod:\\s*"' + kod.replace(/[-]/g, "\\-") + '"'));
    if (i < 0) throw new Error(kod + " bulunamadı");
    const bas = metin.lastIndexOf("{", i);
    let derin = 0, tirnak = null;
    for (let j = bas; j < metin.length; j++) {
      const c = metin[j];
      if (tirnak) { if (c === "\\") j++; else if (c === tirnak) tirnak = null; continue; }
      if (c === '"' || c === "'" || c === "`") tirnak = c;
      else if (c === "{") derin++;
      else if (c === "}" && --derin === 0) {
        let son = j + 1;
        const m = metin.slice(son).match(/^\s*,/); if (m) son += m[0].length;
        return [bas, son];
      }
    }
    throw new Error("urunler.js okunamadı");
  }
  function nesneYaz(u) {
    const j = JSON.stringify, ilk = ["kod", "ad", "adEn", "adAr", "tur", "malzeme", "renk"], ikinci = ["ebatlar", "etiket", "desenli"];
    const satir1 = ilk.filter((k) => u[k] !== undefined).map((k) => `${k}: ${j(u[k])}`).join(", ");
    const satir2 = ikinci.filter((k) => u[k] !== undefined).map((k) => `${k}: ${j(u[k])}`).join(", ");
    const kalan = Object.keys(u).filter((k) => !ilk.includes(k) && !ikinci.includes(k) && k !== "aciklama" && u[k] !== undefined && u[k] !== "");
    let s = `{ ${satir1},\n    ${satir2},`;
    kalan.forEach((k) => (s += `\n    ${k}: ${j(u[k])},`));
    if (u.aciklama) s += `\n    aciklama: { ${Object.entries(u.aciklama).map(([d, v]) => `${d}: ${j(v)}`).join(", ")} }`;
    return s.replace(/,$/, "") + " }";
  }
  function sonrakiKod(metin, on) {
    let en = 0;
    for (const m of metin.matchAll(new RegExp('kod:\\s*"' + on + '-(\\d+)"', "g"))) en = Math.max(en, +m[1]);
    return on + "-" + String(en + 1).padStart(3, "0");
  }
  const kokYol = (yol) => yol.slice(4).replace(/\.\w+$/, ".webp");

  // ---------- Kaydet (yeni / düzenle / sil) ----------
  async function kucult(dosya) {
    const bmp = await createImageBitmap(dosya, { imageOrientation: "from-image" });
    const o = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
    const c = document.createElement("canvas");
    c.width = Math.round(bmp.width * o); c.height = Math.round(bmp.height * o);
    c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
    return new Uint8Array(await (await new Promise((ok) => c.toBlob(ok, "image/jpeg", 0.86))).arrayBuffer());
  }
  function durum(ikon, baslik, metin, yuzde) { $("s-ikon").textContent = ikon; $("s-baslik").textContent = baslik; $("s-metin").textContent = metin; $("s-cubuk").style.width = yuzde + "%"; }

  async function kaydet(islem) {
    const ad = $("ad").value.trim();
    mesgul = true; ekran("sonuc"); $("s-linkler").hidden = true; $("s-urun").hidden = $("s-wa").hidden = false;
    durum("⏳", islem === "sil" ? "Siliniyor…" : "Fotoğraflar hazırlanıyor…", "Lütfen bu ekranı kapatmayın.", 5);
    try {
      // 1) yeni fotoğrafları küçült ve GitHub'a blob olarak gönder
      const yeniFotolar = islem === "sil" ? [] : fotolar.filter((f) => f.dosya);
      const bloblar = [];
      for (let i = 0; i < yeniFotolar.length; i++) {
        const bayt = await kucult(yeniFotolar[i].dosya);
        durum("⬆️", "Fotoğraflar yükleniyor…", `${i + 1} / ${yeniFotolar.length}`, 5 + 55 * (i + 1) / yeniFotolar.length);
        bloblar.push(anahtar === "deneme" ? "deneme" : (await gh("/git/blobs", { method: "POST", body: JSON.stringify({ content: b64(bayt), encoding: "base64" }) })).sha);
      }
      durum("⬆️", "Kaydediliyor…", "Siteye gönderiliyor.", 65);
      // 2) urunler.js'i güncelle (aynı anda başka değişiklik olursa yeniden dene)
      let sonuc;
      for (let deneme = 0; ; deneme++) {
        const { metin, ust } = await urunleriGetir();
        const liste = urunListesi(metin);
        const tarih = new Date().toLocaleDateString("tr-TR"), ek = Date.now().toString(36);
        let yeniMetin, kod, agac = [], mesaj;
        if (islem === "sil") {
          kod = duzenlenen.kod;
          const u = liste.find((x) => x.kod === kod); if (!u) throw new Error("Ürün zaten silinmiş");
          let [bas, son] = nesneAraligi(metin, kod);
          const satirBasi = metin.lastIndexOf("\n", bas - 1) + 1, oncekiBas = metin.lastIndexOf("\n", satirBasi - 2) + 1;
          if (/^\s*\/\/ Ürün Ekle uygulamasından/.test(metin.slice(oncekiBas, satirBasi))) bas = oncekiBas; else bas = satirBasi;
          son += (metin.slice(son).match(/^[ \t]*\n(\s*\n)?/) || [""])[0].length;
          yeniMetin = metin.slice(0, bas) + metin.slice(son);
          // sadece bu uygulamayla yüklenmiş fotoğrafları sil (eski fotoğraflar başka yerlerde de kullanılıyor)
          (u.gorseller || []).filter((g) => new RegExp("^img/(seri|spot)/" + kod.toLowerCase() + "-").test(g)).forEach((g) => {
            [g, "img/k/" + kokYol(g), "img/o/" + kokYol(g)].forEach((p) => agac.push({ path: p, mode: "100644", type: "blob", sha: null }));
          });
          mesaj = `Ürün silindi: ${u.ad} (${kod})`;
        } else {
          const eski = islem === "duzenle" ? liste.find((x) => x.kod === duzenlenen.kod) : null;
          if (islem === "duzenle" && !eski) throw new Error("Ürün bulunamadı, başka biri silmiş olabilir");
          kod = eski ? eski.kod : sonrakiKod(metin, etiket === "spot" ? "SPT" : "AKS");
          const klasor = etiket === "spot" ? "img/spot" : "img/seri";
          let n = 0;
          const gorseller = fotolar.map((f) => f.yol || `${klasor}/${kod.toLowerCase()}-${eski ? ek + "-" : ""}${String(++n).padStart(2, "0")}.jpg`);
          fotolar.filter((f) => f.dosya).forEach((f, i) => agac.push({ path: gorseller[fotolar.indexOf(f)], mode: "100644", type: "blob", sha: bloblar[i] }));
          const u = Object.assign({}, eski || {}, { kod, ad, tur: $("tur").value, etiket, desenli: $("desenli").checked, gorseller,
            ebatlar: ebatlar.size ? [...ebatlar] : (etiket === "seri" ? ["İstenilen ebatta üretim"] : []) });
          if (!eski) Object.assign(u, { malzeme: "", renk: "" });
          const adEn = $("adEn").value.trim(), agirlik = $("agirlik").value.trim(), aciklama = $("aciklama").value.trim();
          if (adEn) u.adEn = adEn; else delete u.adEn;
          if (eski && eski.ad !== ad) delete u.adAr; // ad değişti: eski Arapça ad artık yanlış
          if (agirlik) u.agirlik = agirlik; else delete u.agirlik;
          u.aciklama = Object.assign({}, eski && eski.aciklama, { tr: aciklama });
          if (eski && eski.aciklama && eski.aciklama.tr !== aciklama) { delete u.aciklama.ar; u.aciklama.en = ""; }
          if (!u.aciklama.en) u.aciklama.en = "";
          if (eski) {
            const [bas, son] = nesneAraligi(metin, kod);
            yeniMetin = metin.slice(0, bas) + nesneYaz(u) + "," + metin.slice(son);
            mesaj = `Ürün düzenlendi: ${ad} (${kod})`;
          } else {
            const isaret = metin.match(/const URUNLER = \[\r?\n/); if (!isaret) throw new Error("urunler.js biçimi tanınmadı");
            yeniMetin = metin.replace(isaret[0], isaret[0] + `  // Ürün Ekle uygulamasından eklendi (${tarih}, ${kullanici.ad})\n  ` + nesneYaz(u) + ",\n\n");
            mesaj = `Yeni ürün: ${ad} (${kod})`;
          }
        }
        urunListesi(yeniMetin); // bozuk dosya göndermemek için kontrol
        sonuc = { kod, mesaj };
        if (anahtar === "deneme") { window.__deneme = { mesaj, agac, yeniMetin }; console.log("DENEME – " + mesaj); break; }
        try {
          const jsBlob = await gh("/git/blobs", { method: "POST", body: JSON.stringify({ content: metinB64(yeniMetin), encoding: "base64" }) });
          agac.push({ path: "js/urunler.js", mode: "100644", type: "blob", sha: jsBlob.sha });
          const temel = await gh("/git/commits/" + ust);
          const tree = await gh("/git/trees", { method: "POST", body: JSON.stringify({ base_tree: temel.tree.sha, tree: agac }) });
          const commit = await gh("/git/commits", { method: "POST", body: JSON.stringify({ message: `${mesaj}\n\nİşlemi yapan: ${kullanici.ad} (${kullanici.tel}) – Ürün Ekle uygulaması`, tree: tree.sha, parents: [ust] }) });
          await gh("/git/refs/heads/main", { method: "PATCH", body: JSON.stringify({ sha: commit.sha, force: false }) });
          break;
        } catch (e) { if (e.durum === 422 && deneme < 2) continue; throw e; }
      }
      // 3) sitenin güncellenmesini bekle
      const yol = `/tr/urunler/${sonuc.kod.toLowerCase()}/`;
      durum("🔄", "Site güncelleniyor…", islem === "sil" ? "Ürün siliniyor. 2–4 dakika sürer." : "Kaydedildi. Sitede görünmesi 2–4 dakika sürer.", 75);
      const bitis = Date.now() + 8 * 60 * 1000;
      while (Date.now() < bitis && anahtar !== "deneme") {
        try {
          const r = await fetch(yol + "?t=" + Date.now(), { cache: "no-store" });
          if (islem === "sil" ? r.status === 404 : r.ok && new DOMParser().parseFromString(await r.text(), "text/html").title.includes(ad)) break;
        } catch (e) {}
        durum("🔄", "Site güncelleniyor…", "Lütfen bekleyin…", Math.min(97, 75 + 22 * (1 - (bitis - Date.now()) / 480000)));
        await new Promise((ok) => setTimeout(ok, 15000));
      }
      const link = SITE + yol;
      if (islem === "sil") { durum("✅", "Ürün silindi", `${duzenlenen.ad} (${sonuc.kod}) siteden kaldırıldı.`, 100); $("s-urun").hidden = $("s-wa").hidden = true; }
      else {
        durum("✅", islem === "yeni" ? "Ürün sitede!" : "Değişiklikler kaydedildi", `${ad} (${sonuc.kod}) · 6 dilde`, 100);
        $("s-urun").href = link; $("s-wa").href = "https://wa.me/?text=" + encodeURIComponent(`${ad} – ${link}`);
      }
      $("s-linkler").hidden = false;
    } catch (e) {
      const neden = e.durum === 401 || e.durum === 403 ? "Anahtar geçersiz ya da süresi dolmuş. Yusuf'a haber verin."
        : !navigator.onLine ? "İnternet bağlantısı yok." : "Beklenmeyen bir hata oldu (" + e.message + ").";
      durum("⚠️", "Kaydedilemedi", neden + " Sitede hiçbir şey değişmedi, tekrar deneyebilirsiniz.", 0);
      $("s-urun").hidden = $("s-wa").hidden = true; $("s-linkler").hidden = false;
    } finally { mesgul = false; }
  }

  // ---------- Başlangıç ----------
  if (localStorage.getItem("gh-anahtar")) localStorage.removeItem("gh-anahtar"); // eski sürümden kalan şifresiz anahtar
  if (localStorage.getItem("kasa")) kilitAc(); else ekran("kurulum");
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});

  // ---------- Ana ekrana ekle (tek dokunuş) ----------
  const kurulu = () => matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  let yuklemeIstegi = null;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault(); yuklemeIstegi = e;
    $("yukle-ipucu").hidden = true; $("yukle-serit").hidden = false;
  });
  window.addEventListener("appinstalled", () => { yuklemeIstegi = null; $("yukle-serit").hidden = true; });
  $("yukle").addEventListener("click", async () => {
    if (!yuklemeIstegi) { $("yukle-ipucu").hidden = false; return; }
    yuklemeIstegi.prompt();
    const { outcome } = await yuklemeIstegi.userChoice;
    if (outcome === "accepted") { yuklemeIstegi = null; $("yukle-serit").hidden = true; }
  });
  // Chrome düğmeyi hemen sunmazsa, telefonda yine de göster (dokununca menü yolunu anlatır)
  setTimeout(() => { if (!kurulu() && /Android|iPhone|iPad/i.test(navigator.userAgent)) $("yukle-serit").hidden = false; }, 3000);
})();

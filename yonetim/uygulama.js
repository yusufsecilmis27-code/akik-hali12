// "Ürün Ekle" uygulaması: fotoğrafları küçültür, js/urunler.js'e yeni ürünü ekler ve tek commit ile GitHub'a gönderir.
// GitHub'daki otomatik işlem (.github/workflows/olustur.yml) sayfaları üretip siteyi yayına alır.
(function () {
  const DEPO = "yusufsecilmis27-code/akik-hali12";
  const API = "https://api.github.com/repos/" + DEPO;
  const SITE = "https://eminsecilmiscarpet.com";
  const EBATLAR = ["80x150", "100x200", "120x180", "160x230", "200x290", "240x340", "300x400", "İstenilen ebatta üretim"];
  const $ = (id) => document.getElementById(id);
  let fotolar = [], etiket = "", ebatlar = new Set();

  const anahtar = () => localStorage.getItem("gh-anahtar") || "";
  function ekran(ad) {
    ["kurulum", "form", "sonuc"].forEach((e) => $(e).classList.toggle("acik", e === ad));
    $("alt-cubuk").hidden = ad !== "form";
  }

  // ---------- GitHub ----------
  async function gh(yol, ayar = {}) {
    if (anahtar() === "deneme") throw new Error("deneme");
    const r = await fetch(API + yol, { ...ayar, headers: { Authorization: "Bearer " + anahtar(), Accept: "application/vnd.github+json", ...(ayar.body ? { "Content-Type": "application/json" } : {}) } });
    if (!r.ok) { const e = new Error("GitHub " + r.status); e.durum = r.status; throw e; }
    return r.json();
  }
  const b64 = (bayt) => { let s = ""; for (let i = 0; i < bayt.length; i += 0x8000) s += String.fromCharCode.apply(null, bayt.subarray(i, i + 0x8000)); return btoa(s); };
  const metinB64 = (t) => b64(new TextEncoder().encode(t));
  const b64Metin = (b) => new TextDecoder().decode(Uint8Array.from(atob(b.replace(/\n/g, "")), (c) => c.charCodeAt(0)));

  // ---------- Fotoğraf küçültme (en uzun kenar 1600 px, JPEG) ----------
  async function kucult(dosya) {
    const bmp = await createImageBitmap(dosya, { imageOrientation: "from-image" });
    const o = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
    const c = document.createElement("canvas");
    c.width = Math.round(bmp.width * o); c.height = Math.round(bmp.height * o);
    c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
    const blob = await new Promise((ok) => c.toBlob(ok, "image/jpeg", 0.86));
    return new Uint8Array(await blob.arrayBuffer());
  }

  // ---------- Ürün kaydı ----------
  function sonrakiKod(metin, on) {
    let en = 0;
    for (const m of metin.matchAll(new RegExp('kod:\\s*"' + on + '-(\\d+)"', "g"))) en = Math.max(en, +m[1]);
    return on + "-" + String(en + 1).padStart(3, "0");
  }
  function urunSatiri(u) {
    const j = JSON.stringify;
    const parca = [`kod: ${j(u.kod)}`, `ad: ${j(u.ad)}`];
    if (u.adEn) parca.push(`adEn: ${j(u.adEn)}`);
    parca.push(`tur: ${j(u.tur)}`, `malzeme: ""`, `renk: ""`);
    return `  // Ürün Ekle uygulamasından eklendi (${new Date().toLocaleDateString("tr-TR")})
  { ${parca.join(", ")},
    ebatlar: ${j(u.ebatlar)}, etiket: ${j(u.etiket)}, desenli: ${u.desenli},
    gorseller: ${j(u.gorseller)},${u.agirlik ? `\n    agirlik: ${j(u.agirlik)},` : ""}
    aciklama: { tr: ${j(u.aciklama)}, en: "" } },

`;
  }

  async function yayinla() {
    const ad = $("ad").value.trim();
    ekran("sonuc"); durum("⏳", "Fotoğraflar hazırlanıyor…", "Lütfen bu ekranı kapatmayın.", 5);
    try {
      const resimler = [];
      for (let i = 0; i < fotolar.length; i++) {
        resimler.push(await kucult(fotolar[i]));
        durum("⏳", "Fotoğraflar hazırlanıyor…", `${i + 1} / ${fotolar.length}`, 5 + 25 * (i + 1) / fotolar.length);
      }
      durum("⬆️", "Yükleniyor…", "Fotoğraflar siteye gönderiliyor.", 35);
      let deneme = 0, kod, yeniMetin;
      while (true) {
        try {
          const ref = await gh("/git/ref/heads/main");
          const ust = ref.object.sha;
          const dosya = await gh("/contents/js/urunler.js?ref=" + ust);
          const metin = b64Metin(dosya.content);
          kod = sonrakiKod(metin, etiket === "spot" ? "SPT" : "AKS");
          const klasor = etiket === "spot" ? "img/spot" : "img/seri";
          const yollar = resimler.map((_, i) => `${klasor}/${kod.toLowerCase()}-${String(i + 1).padStart(2, "0")}.jpg`);
          const urun = { kod, ad, adEn: $("adEn").value.trim(), tur: $("tur").value, etiket,
            ebatlar: ebatlar.size ? [...ebatlar] : (etiket === "seri" ? ["İstenilen ebatta üretim"] : []),
            desenli: $("desenli").checked, gorseller: yollar, agirlik: $("agirlik").value.trim(), aciklama: $("aciklama").value.trim() };
          const isaret = "const URUNLER = [\n";
          if (!metin.includes(isaret)) throw new Error("urunler.js biçimi tanınmadı");
          yeniMetin = metin.replace(isaret, isaret + urunSatiri(urun));
          const agac = [];
          for (let i = 0; i < resimler.length; i++) {
            const blob = await gh("/git/blobs", { method: "POST", body: JSON.stringify({ content: b64(resimler[i]), encoding: "base64" }) });
            agac.push({ path: yollar[i], mode: "100644", type: "blob", sha: blob.sha });
            durum("⬆️", "Yükleniyor…", `Fotoğraf ${i + 1} / ${resimler.length}`, 35 + 35 * (i + 1) / resimler.length);
          }
          const jsBlob = await gh("/git/blobs", { method: "POST", body: JSON.stringify({ content: metinB64(yeniMetin), encoding: "base64" }) });
          agac.push({ path: "js/urunler.js", mode: "100644", type: "blob", sha: jsBlob.sha });
          const temel = await gh("/git/commits/" + ust);
          const tree = await gh("/git/trees", { method: "POST", body: JSON.stringify({ base_tree: temel.tree.sha, tree: agac }) });
          const commit = await gh("/git/commits", { method: "POST", body: JSON.stringify({ message: `Yeni ürün: ${ad} (${kod}) – Ürün Ekle uygulaması`, tree: tree.sha, parents: [ust] }) });
          await gh("/git/refs/heads/main", { method: "PATCH", body: JSON.stringify({ sha: commit.sha, force: false }) });
          break;
        } catch (e) {
          if (e.message === "deneme") { kod = "AKS-001"; console.log("DENEME – yeni ürün satırı:\n" + urunSatiri({ kod: "AKS-0XX", ad, adEn: $("adEn").value.trim(), tur: $("tur").value, etiket, ebatlar: [...ebatlar], desenli: $("desenli").checked, gorseller: resimler.map((_, i) => `img/seri/aks-0xx-0${i + 1}.jpg`), agirlik: $("agirlik").value.trim(), aciklama: $("aciklama").value.trim() })); break; }
          if (e.durum === 422 && ++deneme < 3) continue; // aynı anda başka değişiklik olduysa yeniden dene
          throw e;
        }
      }
      durum("🔄", "Site güncelleniyor…", "Ürün yüklendi. Sitede görünmesi 2–4 dakika sürer.", 75);
      const yol = `/tr/urunler/${kod.toLowerCase()}/`;
      const bitis = Date.now() + 8 * 60 * 1000;
      while (Date.now() < bitis) {
        try { const r = await fetch(yol + "?t=" + Date.now(), { cache: "no-store" }); if (r.ok) break; } catch (e) {}
        durum("🔄", "Site güncelleniyor…", "Ürün yüklendi. Sitede görünmesi 2–4 dakika sürer.", Math.min(97, 75 + 22 * (1 - (bitis - Date.now()) / 480000)));
        await new Promise((ok) => setTimeout(ok, 15000));
      }
      const link = SITE + yol;
      durum("✅", "Ürün sitede!", `${ad} (${kod}) yayınlandı. 6 dilde görünür.`, 100);
      $("s-urun").href = link;
      $("s-wa").href = "https://wa.me/?text=" + encodeURIComponent(`${ad} – ${link}`);
      $("s-linkler").hidden = false;
    } catch (e) {
      const neden = e.durum === 401 || e.durum === 403 ? "Anahtar geçersiz ya da süresi dolmuş. ⚙ ayarlardan yenisini girin."
        : !navigator.onLine ? "İnternet bağlantısı yok." : "Beklenmeyen bir hata oldu (" + e.message + ").";
      durum("⚠️", "Yüklenemedi", neden + " Ürün eklenmedi, tekrar deneyebilirsiniz.", 0);
      $("s-yeni").textContent = "Geri dön"; $("s-urun").hidden = $("s-wa").hidden = true; $("s-linkler").hidden = false;
    }
  }
  function durum(ikon, baslik, metin, yuzde) {
    $("s-ikon").textContent = ikon; $("s-baslik").textContent = baslik; $("s-metin").textContent = metin; $("s-cubuk").style.width = yuzde + "%";
  }

  // ---------- Form ----------
  function fotoCiz() {
    $("fotolar").innerHTML = "";
    fotolar.forEach((f, i) => {
      const d = document.createElement("div");
      d.style.backgroundImage = `url(${URL.createObjectURL(f)})`;
      d.innerHTML = `${i === 0 ? "<b>Kapak</b>" : ""}<button aria-label="Sil">✕</button>`;
      d.querySelector("button").onclick = () => { fotolar.splice(i, 1); fotoCiz(); };
      $("fotolar").appendChild(d);
    });
    kontrol();
  }
  function kontrol() { $("yayinla").disabled = !(fotolar.length && $("ad").value.trim() && etiket); }
  ["galeri", "kamera"].forEach((id) => $(id).addEventListener("change", (e) => { fotolar.push(...e.target.files); e.target.value = ""; fotoCiz(); }));
  $("ad").addEventListener("input", kontrol);
  document.querySelectorAll("[data-etiket]").forEach((b) => b.addEventListener("click", () => {
    etiket = b.dataset.etiket;
    document.querySelectorAll("[data-etiket]").forEach((x) => x.classList.toggle("aktif", x === b));
    kontrol();
  }));
  EBATLAR.forEach((eb) => {
    const b = document.createElement("button"); b.type = "button"; b.textContent = eb;
    b.onclick = () => { ebatlar.has(eb) ? ebatlar.delete(eb) : ebatlar.add(eb); b.classList.toggle("aktif"); };
    $("ebatlar").appendChild(b);
  });
  $("yayinla").addEventListener("click", yayinla);
  $("s-yeni").addEventListener("click", () => location.reload());

  // ---------- Kurulum ----------
  $("anahtar-kaydet").addEventListener("click", async () => {
    const a = $("anahtar").value.trim();
    if (!a) return;
    localStorage.setItem("gh-anahtar", a);
    if (a === "deneme") return ekran("form");
    try { await gh(""); ekran("form"); }
    catch (e) { localStorage.removeItem("gh-anahtar"); $("kurulum-hata").hidden = false; $("kurulum-hata").textContent = "Anahtar çalışmadı (" + e.message + "). Doğru kopyaladığınızdan emin olun."; }
  });
  $("ayar-ac").addEventListener("click", () => {
    if (confirm("Kayıtlı anahtar silinsin ve yeniden girilsin mi?")) { localStorage.removeItem("gh-anahtar"); location.reload(); }
  });

  ekran(anahtar() ? "form" : "kurulum");
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
})();

// Site davranışları. Normalde bu dosyayı değiştirmeniz gerekmez (yeni tür/renk eklerseniz CEVIRI'ye ekleyin).
(function () {
  const A = typeof AYARLAR !== "undefined" ? AYARLAR : {};
  const U = typeof URUNLER !== "undefined" ? URUNLER : [];

  // Ürün türü / malzeme / renk İngilizceleri
  const CEVIRI = {
    "Makine Halısı": "Machine-made rug", "Shaggy": "Shaggy", "Kilim": "Kilim", "Yolluk": "Runner",
    "Çocuk Halısı": "Kids' rug", "Banyo Paspası": "Bath mat", "Cami Halısı": "Mosque carpet",
    "Rulo / metre ile": "Roll / per metre", "Vizon": "Mink",
    "İstenilen ebatta üretim": "Any size on request", "İstenilen ağırlıkta üretim": "Any weight on request", "Kaymaz taban": "Non-slip backing",
    "Akrilik": "Acrylic", "Polyester": "Polyester", "Pamuk": "Cotton", "Yün": "Wool", "Bambu": "Bamboo",
    "Kırmızı": "Red", "Lacivert": "Navy", "Gri": "Grey", "Krem": "Cream", "Bej": "Beige", "Turuncu": "Orange",
    "Yeşil": "Green", "Kahverengi": "Brown", "Mavi": "Blue", "Siyah": "Black", "Beyaz": "White", "Pembe": "Pink",
    "rulo": "roll"
  };
  const METIN = {
    en: { tumTur: "All types", tumMalzeme: "All materials", tumRenk: "All colours", tumEbat: "All sizes",
      sonuc: (n) => n + " products", bos: "No products match these filters.", yeni: "New", son: "Clearance",
      grup: { "": "All products", seri: "Series production", spot: "Stock rugs" },
      bosVitrin: "Products for this section will be added soon.",
      fiyatSor: "Get info", kopyalandi: "✓",
      wa: (u) => `Hello, I would like to get information about ${u.adEn || u.ad}.`,
      desen: (n) => "Design " + n, desenSayi: (n) => n + " designs", secili: "Selected",
      form: (d) => `Hello, I am ${d.ad}${d.ulke ? " from " + d.ulke : ""}.\n${d.mesaj}`,
      benzer: "Similar products",
      oz: { malzeme: "Material", iplik: "Yarn type", renk: "Colour", hav: "Pile", siklik: "Density", agirlik: "Weight per m²", taban: "Backing", mensei: "Origin" },
      linkKopyalandi: "Link copied" },
    tr: { tumTur: "Tüm türler", tumMalzeme: "Tüm malzemeler", tumRenk: "Tüm renkler", tumEbat: "Tüm ebatlar",
      sonuc: (n) => n + " ürün", bos: "Bu kriterlere uygun ürün bulunamadı.", yeni: "Yeni", son: "Stok sonu",
      grup: { "": "Tüm ürünler", seri: "Seri üretim", spot: "Spot halı" },
      bosVitrin: "Bu bölüme yakında ürün eklenecek.",
      fiyatSor: "Bilgi al", kopyalandi: "✓",
      wa: (u) => `Merhaba, ${u.ad} hakkında bilgi almak istiyorum.`,
      desen: (n) => "Desen " + n, desenSayi: (n) => n + " desen", secili: "Seçili",
      form: (d) => `Merhaba, ben ${d.ad}${d.ulke ? " (" + d.ulke + ")" : ""}.\n${d.mesaj}`,
      benzer: "Benzer ürünler",
      oz: { malzeme: "Malzeme", iplik: "İplik türü", renk: "Renk", hav: "Hav", siklik: "Sıklık", agirlik: "m² ağırlığı", taban: "Taban", mensei: "Menşei" },
      linkKopyalandi: "Link kopyalandı" }
  };

  // Dil seçimi: adres (?lang=tr) > önceki seçim > tarayıcı dili. Türkçe olmayan herkes İngilizce görür.
  function ilkDil() {
    const p = new URLSearchParams(location.search).get("lang");
    if (p === "tr" || p === "en") return p;
    try { const k = localStorage.getItem("dil"); if (k) return k; } catch (e) {}
    return (navigator.language || "").toLowerCase().startsWith("tr") ? "tr" : "en";
  }
  let dil = ilkDil();

  const sec = (v) => (v && typeof v === "object" ? v[dil] || v.en || "" : v || "");
  const yol = (anahtar) => anahtar.split(".").reduce((o, k) => (o ? o[k] : undefined), A);
  const cevir = (s) => (dil !== "en" ? s : CEVIRI[s] || s.replace("rulo", CEVIRI.rulo));
  const waLink = (mesaj) => "https://wa.me/" + A.whatsapp + "?text=" + encodeURIComponent(mesaj);

  // Dile bağlı olmayan alanlar
  document.querySelectorAll("[data-tel]").forEach((el) => { el.textContent = A.telefon; el.href = "tel:" + (A.telefon || "").replace(/[^\d+]/g, ""); });
  document.querySelectorAll("[data-tel2]").forEach((el) => { el.textContent = A.telefon2; el.href = "tel:" + (A.telefon2 || "").replace(/[^\d+]/g, ""); });
  document.querySelectorAll("[data-satis-tel]").forEach((el) => { el.textContent = A.satisTelefon; el.href = "tel:" + (A.satisTelefon || "").replace(/[^\d+]/g, ""); });
  document.querySelectorAll("[data-katalog]").forEach((el) => (el.href = A.katalogPdf || "#"));
  document.querySelectorAll("[data-harita]").forEach((el) => (el.src = A.haritaLinki || ""));
  document.querySelectorAll("[data-yol-tarifi]").forEach((el) => (A.yolTarifi ? (el.href = A.yolTarifi) : el.remove()));
  const yil = document.getElementById("yil");
  if (yil) yil.textContent = new Date().getFullYear();

  // Ülke şeridi (kesintisiz kayması için iki kez yazılır)
  const ulkeler = document.getElementById("ulkeler");
  if (ulkeler && A.ulkeler) {
    const parca = A.ulkeler.map((u) => `<span>${u}</span>`).join("");
    ulkeler.innerHTML = parca + parca;
  }

  // Sosyal medya
  const sosyal = document.getElementById("sosyal");
  if (sosyal) {
    [["instagram", "Instagram"], ["facebook", "Facebook"], ["linkedin", "LinkedIn"], ["youtube", "YouTube"], ["tiktok", "TikTok"]]
      .filter(([k]) => A[k])
      .forEach(([k, ad]) => {
        const a = document.createElement("a");
        a.href = A[k]; a.textContent = ad; a.target = "_blank"; a.rel = "noopener";
        sosyal.appendChild(a);
      });
  }

  // Mobil menü
  const menuBtn = document.querySelector(".menu-btn");
  const menu = document.querySelector(".menu");
  if (menuBtn && menu) {
    menuBtn.addEventListener("click", () => menuBtn.setAttribute("aria-expanded", menu.classList.toggle("acik")));
    menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => { menu.classList.remove("acik"); menuBtn.setAttribute("aria-expanded", false); }));
  }

  // Ürün kartı
  // Fotoğrafı olmayan ürünler için yer tutucu (tur: 0 genel, 1 yakın çekim, 2 arka yüz, 3 ortamda)
  function yerTutucu(u, tur = 0) {
    const [a, b] = u.renkler && u.renkler.length ? u.renkler : ["#bbb", "#eee"];
    const stil = [
      `radial-gradient(120% 80% at 20% 10%, ${b}55, transparent 60%), repeating-linear-gradient(90deg, ${a} 0 3px, ${a}ee 3px 6px), ${a}`,
      `radial-gradient(circle at 30% 30%, ${b}66, transparent 50%), repeating-linear-gradient(90deg, ${a} 0 14px, ${a}cc 14px 18px), repeating-linear-gradient(0deg, transparent 0 14px, #0002 14px 18px), ${a}`,
      `repeating-linear-gradient(90deg, #0000 0 5px, #0001 5px 6px), repeating-linear-gradient(0deg, #0000 0 5px, #0001 5px 6px), #d9d3c7`,
      `linear-gradient(transparent 52%, #00000010 52%), linear-gradient(#ecebe6 0 52%, #c9bda9 52%)`
    ][tur];
    const ic = tur === 3 ? `<span style="position:absolute;left:18%;right:18%;top:60%;bottom:12%;background:${a};border-radius:3px;transform:perspective(300px) rotateX(45deg);box-shadow:0 10px 20px #0003"></span>` : "";
    return `<div class="yer-tutucu${tur ? " yt-cesit" : ""}" role="img" aria-label="${u.ad}" style="background:${stil}">${ic}</div>`;
  }
  const fotolar = (u) => (u.gorseller && u.gorseller.length ? u.gorseller : u.gorsel ? [u.gorsel] : []);
  const ad = (u) => (dil === "en" ? u.adEn || u.ad : u.ad);
  const gorsel = (u) => { const f = fotolar(u)[0]; return f ? `<img src="${f}" alt="${u.ad} ${u.kod}" loading="lazy">` : yerTutucu(u); };

  function kart(u) {
    const M = METIN[dil];
    const rozet = u.etiket === "spot" ? `<span class="rozet rozet-son">${M.grup.spot}</span>`
      : u.etiket === "seri" ? `<span class="rozet rozet-seri">${M.grup.seri}</span>` : "";
    const n = fotolar(u).length;
    return `<article class="urun">
      <button class="urun-ac" data-urun="${u.kod}" aria-label="${ad(u)} ${u.kod}">
        <div class="urun-gorsel">${gorsel(u)}${rozet}${n > 1 ? `<span class="foto-sayisi">${u.desenli ? M.desenSayi(n) : n + " ◫"}</span>` : ""}</div>
        <div class="urun-ic">
          <div class="urun-ust"><h3>${ad(u)}</h3><span class="urun-kod">${u.kod}</span></div>
          <p class="urun-bilgi">${[u.tur, u.malzeme, u.renk].filter(Boolean).map(cevir).join(" · ")}</p>
          <p class="urun-ebat">${u.ebatlar.map(cevir).join(" · ")}</p>
        </div>
      </button>
      <a class="btn" href="${waLink(M.wa(u))}" target="_blank" rel="noopener">${M.fiyatSor}</a>
    </article>`;
  }
  function ciz(kap, liste, bosMetin = METIN[dil].bos) {
    kap.innerHTML = liste.length ? liste.map(kart).join("") : `<p class="bos">${bosMetin}</p>`;
  }

  // Hero: dönen fotoğraflar (ayarlar.js > heroUrunler)
  const hero = document.getElementById("hero");
  // Önce ayarlar.js > heroGorseller (girişe özel yatay fotoğraflar) kullanılır; boşsa ürün fotoğrafları
  const heroListe = (A.heroGorseller || []).filter((h) => h && h.gorsel).length
    ? A.heroGorseller.filter((h) => h && h.gorsel).map((h) => ({ gorsel: h.gorsel, mobil: h.mobil || h.gorsel, urun: U.find((u) => u.kod === h.urun) }))
    : ((A.heroUrunler || []).map((k) => U.find((u) => u.kod === k)).filter((u) => u && fotolar(u).length).length
        ? (A.heroUrunler || []).map((k) => U.find((u) => u.kod === k)).filter((u) => u && fotolar(u).length)
        : U.filter((u) => fotolar(u).length).slice(0, 5)
      ).map((u) => ({ gorsel: fotolar(u)[0], mobil: fotolar(u)[0], urun: u }));
  let heroNo = 0, heroZaman = null;
  const heroSure = (A.heroSure || 5) * 1000;

  function heroGoster(i) {
    heroNo = (i + heroListe.length) % heroListe.length;
    hero.querySelectorAll(".hero-slayt").forEach((s, j) => s.classList.toggle("aktif", j === heroNo));
    hero.querySelectorAll("[data-hero]").forEach((b, j) => {
      b.classList.remove("aktif");
      void b.offsetWidth; // ilerleme çubuğunu baştan başlat
      b.classList.toggle("aktif", j === heroNo);
      b.setAttribute("aria-selected", j === heroNo);
    });
    heroYazi();
  }
  function heroYazi() {
    const h = heroListe[heroNo], btn = document.getElementById("hero-urun");
    if (!h || !btn) return;
    const u = h.urun;
    btn.hidden = !u;
    if (!u) return;
    btn.dataset.urun = u.kod;
    btn.innerHTML = `<b>${ad(u)}</b><span>${u.kod} · ${cevir(u.tur)} · ${dil === "en" ? "Details" : "Detay"} →</span>`;
  }
  function heroBaslat() {
    clearInterval(heroZaman);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    heroZaman = setInterval(() => heroGoster(heroNo + 1), heroSure);
  }

  if (hero && heroListe.length) {
    hero.style.setProperty("--sure", heroSure / 1000 + "s");
    // Telefonda dikey (mobil) fotoğraf, bilgisayarda yatay fotoğraf gösterilir
    document.getElementById("hero-slaytlar").innerHTML = heroListe
      .map((h, i) => `<div class="hero-slayt"><picture><source media="(max-width: 820px)" srcset="${h.mobil}"><img src="${h.gorsel}" alt="${h.urun ? h.urun.ad : A.firmaAdi || ""}" ${i ? 'loading="lazy"' : 'fetchpriority="high"'}></picture></div>`).join("");
    document.getElementById("hero-kucuk").innerHTML = heroListe
      .map((h, i) => `<button data-hero="${i}" role="tab" aria-label="${i + 1}"><img src="${h.mobil}" alt=""></button>`).join("");
    hero.addEventListener("click", (e) => {
      const b = e.target.closest("[data-hero]");
      if (b) { heroGoster(Number(b.dataset.hero)); heroBaslat(); }
    });
    // Fare üstündeyken ve sekme arka plandayken dur
    hero.addEventListener("mouseenter", () => { clearInterval(heroZaman); hero.classList.add("durdu"); });
    hero.addEventListener("mouseleave", () => { hero.classList.remove("durdu"); heroGoster(heroNo); heroBaslat(); });
    document.addEventListener("visibilitychange", () => (document.hidden ? clearInterval(heroZaman) : heroBaslat()));
    heroGoster(0);
    heroBaslat();
  }

  // Sayfa başındaki fotoğraflı alanın (hero veya sayfa başlığı) üstündeyken header koyu-şeffaf
  const ustGorsel = document.querySelector(".hero, .sayfa-bas");
  if (ustGorsel) {
    const seffaf = () => document.body.classList.toggle("ust-seffaf", window.scrollY < ustGorsel.offsetHeight - 80);
    window.addEventListener("scroll", seffaf, { passive: true });
    seffaf();
  }

  // Vitrin sekmeleri
  const vitrin = document.getElementById("vitrin");
  let sekme = "seri";
  // Yeni gelenler bölümünde her sekmede en fazla 4 ürün; "Tümünü gör" kataloğu o gruba süzer
  const VITRIN_SAYI = 4;
  const vitrinCiz = () => vitrin && ciz(vitrin, U.filter((u) => u.etiket === sekme).slice(0, VITRIN_SAYI), METIN[dil].bosVitrin);
  const tumu = document.getElementById("vitrin-tumu");
  const tumuGuncelle = () => tumu && (tumu.href = "urunler.html?grup=" + sekme);
  tumuGuncelle();
  document.querySelectorAll(".sekme").forEach((b) =>
    b.addEventListener("click", () => {
      sekme = b.dataset.sekme;
      document.querySelectorAll(".sekme").forEach((x) => x.classList.toggle("aktif", x === b));
      vitrinCiz();
      tumuGuncelle();
    })
  );

  // Katalog ve filtreler
  const katalog = document.getElementById("katalog");
  const f = katalog && {
    ara: document.getElementById("f-ara"), grup: document.getElementById("f-grup"), tur: document.getElementById("f-tur"),
    malzeme: document.getElementById("f-malzeme"), renk: document.getElementById("f-renk"), ebat: document.getElementById("f-ebat")
  };
  function secenekler(sel, ilk, degerler) {
    const onceki = sel.value;
    sel.innerHTML = "";
    sel.add(new Option(ilk, ""));
    [...new Set(degerler.filter(Boolean))].sort((a, b) => a.localeCompare(b, "tr", { numeric: true })).forEach((v) => sel.add(new Option(cevir(v), v)));
    sel.value = onceki;
    sel.hidden = sel.options.length < 2; // seçenek yoksa filtreyi gösterme
  }
  function filtreleriKur() {
    const M = METIN[dil];
    const grupSecili = f.grup.value;
    f.grup.innerHTML = Object.entries(M.grup).map(([v, etiket]) => `<option value="${v}">${etiket}</option>`).join("");
    f.grup.value = grupSecili;
    secenekler(f.tur, M.tumTur, U.map((u) => u.tur));
    secenekler(f.malzeme, M.tumMalzeme, U.map((u) => u.malzeme));
    secenekler(f.renk, M.tumRenk, U.map((u) => u.renk));
    secenekler(f.ebat, M.tumEbat, U.flatMap((u) => u.ebatlar));
  }
  function katalogCiz() {
    if (!katalog) return;
    const q = f.ara.value.trim().toLocaleLowerCase("tr");
    const liste = U.filter((u) =>
      (!q || [u.ad, u.adEn, u.kod].join(" ").toLocaleLowerCase("tr").includes(q)) &&
      (!f.grup.value || u.etiket === f.grup.value) &&
      (!f.tur.value || u.tur === f.tur.value) &&
      (!f.malzeme.value || u.malzeme === f.malzeme.value) &&
      (!f.renk.value || u.renk === f.renk.value) &&
      (!f.ebat.value || u.ebatlar.includes(f.ebat.value))
    );
    document.getElementById("sonuc-sayisi").textContent = METIN[dil].sonuc(liste.length);
    ciz(katalog, liste);
  }
  if (katalog) {
    Object.values(f).forEach((el) => el.addEventListener("input", katalogCiz));
    document.getElementById("f-temizle").addEventListener("click", () => { Object.values(f).forEach((el) => (el.value = "")); katalogCiz(); });
  }

  // Ürün detay penceresi ve galeri. Her ürünün kendi linki var: site.com/#urun=AK-1024
  const pencere = document.getElementById("urun-pencere");
  let acikUrun = null, secilenEbat = "", foto = 0;
  const $ = (id) => document.getElementById(id);

  // Galeri sadece ürünün gerçek fotoğraflarını gösterir; fotoğraf yoksa tek bir yer tutucu.
  function detayCiz() {
    const u = acikUrun, M = METIN[dil];
    const f = fotolar(u);
    $("d-serit").innerHTML = f.length
      ? f.map((src, i) => `<div class="slayt"><img src="${src}" alt="${ad(u)} ${i + 1}"${i ? ' loading="lazy"' : ""}></div>`).join("")
      : `<div class="slayt">${yerTutucu(u)}</div>`;
    $("d-kucuk").innerHTML = f.map((src, i) => `<button data-foto="${i}" aria-label="${i + 1}"><img src="${src}" alt="" loading="lazy"></button>`).join("");
    pencere.querySelector(".galeri-buyut").hidden = !f.length;
    // Benzer ürünler: aynı türden 4 ürün
    const benzer = U.filter((x) => x.kod !== u.kod && x.tur === u.tur).slice(0, 4);
    $("d-benzer").innerHTML = benzer.length
      ? `<h3>${M.benzer}</h3><div class="benzer-liste">${benzer.map((x) =>
          `<button data-urun="${x.kod}" title="${ad(x)}">${gorsel(x)}<span>${x.kod}</span></button>`).join("")}</div>`
      : "";
    $("d-kod").textContent = u.kod;
    $("d-ad").textContent = ad(u);
    $("d-tur").textContent = cevir(u.tur);
    $("d-aciklama").textContent = sec(u.aciklama);
    $("d-ebatlar").innerHTML = u.ebatlar.map((e) => `<button data-ebat="${e}" aria-pressed="${e === secilenEbat}">${cevir(e)}</button>`).join("");
    $("d-ozellik").innerHTML = Object.entries(M.oz)
      .filter(([k]) => u[k])
      .map(([k, etiket]) => `<dt>${etiket}</dt><dd>${cevir(u[k])}</dd>`).join("");
    waGuncelle();
    fotoGit(foto, false);
  }
  // Desenli kalitelerde (desenli: true) ekrandaki desen seçili sayılır ve mesaja eklenir
  function waGuncelle() {
    const u = acikUrun, M = METIN[dil];
    if (!u) return;
    const desen = u.desenli ? foto + 1 : 0;
    $("d-wa").href = waLink(M.wa(u, secilenEbat, desen));
    $("d-desen").textContent = desen ? `${M.desen(desen)} / ${fotolar(u).length}` : "";
  }
  function fotoGit(i, kaydir = true) {
    const serit = $("d-serit"), n = serit.children.length;
    pencere.querySelector(".galeri").classList.toggle("tek", n < 2);
    foto = Math.max(0, Math.min(n - 1, i));
    if (kaydir) serit.scrollTo({ left: foto * serit.clientWidth, behavior: "smooth" });
    $("d-sayac").textContent = `${foto + 1} / ${n}`;
    pencere.querySelector('[data-git="-1"]').disabled = foto === 0;
    pencere.querySelector('[data-git="1"]').disabled = foto === n - 1;
    $("d-kucuk").querySelectorAll("button").forEach((b, j) => b.classList.toggle("aktif", j === foto));
    // Seçili küçük resmi şeridin ortasına getir (sayfayı kaydırmadan)
    const kucuk = $("d-kucuk"), aktifKucuk = kucuk.children[foto];
    if (aktifKucuk) kucuk.scrollTo({ left: aktifKucuk.offsetLeft - kucuk.clientWidth / 2 + aktifKucuk.clientWidth / 2, behavior: "smooth" });
    waGuncelle();
  }
  function detayAc(kod, gecmiseYaz = true) {
    const u = U.find((x) => x.kod === kod);
    if (!u || !pencere) return;
    acikUrun = u; secilenEbat = ""; foto = 0;
    detayCiz();
    if (!pencere.open) pencere.showModal();
    document.body.classList.add("pencere-acik");
    $("d-serit").scrollLeft = 0;
    if (gecmiseYaz) history.replaceState(null, "", "#urun=" + kod);
  }
  function detayKapat() {
    if (pencere.open) pencere.close();
  }

  if (pencere) {
    document.addEventListener("click", (e) => {
      const ac = e.target.closest("[data-urun]");
      if (ac) detayAc(ac.dataset.urun);
    });
    pencere.addEventListener("close", () => {
      document.body.classList.remove("pencere-acik");
      acikUrun = null;
      if (location.hash.startsWith("#urun=")) history.replaceState(null, "", location.pathname + location.search);
    });
    // Pencere dışına (karartılmış alana) tıklayınca kapan
    pencere.addEventListener("click", (e) => {
      if (e.target === pencere || e.target.closest("[data-kapat]")) detayKapat();
      const git = e.target.closest("[data-git]");
      if (git) fotoGit(foto + Number(git.dataset.git));
      const k = e.target.closest("[data-foto]");
      if (k) fotoGit(Number(k.dataset.foto));
      const eb = e.target.closest("[data-ebat]");
      if (eb) {
        secilenEbat = secilenEbat === eb.dataset.ebat ? "" : eb.dataset.ebat;
        $("d-ebatlar").querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", b.dataset.ebat === secilenEbat));
        waGuncelle();
      }
    });
    // Büyüt: sadece "⤢" düğmesine basınca fotoğraf tam ekran açılır, tekrar basınca kapanır
    const tam = $("d-tam");
    const tamAc = () => {
      const f = fotolar(acikUrun)[foto];
      if (!f) return;
      tam.querySelector("img").src = f;
      tam.hidden = false;
    };
    pencere.querySelector(".galeri-buyut").addEventListener("click", tamAc);
    tam.addEventListener("click", () => (tam.hidden = true));
    pencere.addEventListener("close", () => (tam.hidden = true));

    pencere.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !tam.hidden) { e.preventDefault(); tam.hidden = true; return; }
      if (e.key === "ArrowRight") fotoGit(foto + 1);
      if (e.key === "ArrowLeft") fotoGit(foto - 1);
    });
    // Parmakla kaydırınca sayaç ve küçük resimler güncellenir
    let zamanlayici;
    $("d-serit").addEventListener("scroll", (e) => {
      clearTimeout(zamanlayici);
      zamanlayici = setTimeout(() => fotoGit(Math.round(e.target.scrollLeft / e.target.clientWidth), false), 60);
    });
    const paylas = $("d-paylas"), paylasIlk = paylas.innerHTML;
    paylas.addEventListener("click", async () => {
      const link = new URL("urunler.html?lang=" + dil + "#urun=" + acikUrun.kod, location.href).href;
      const baslik = `${acikUrun.kod} ${ad(acikUrun)} – ${A.firmaAdi}`;
      try {
        if (navigator.share) await navigator.share({ title: baslik, url: link });
        else {
          await navigator.clipboard.writeText(link);
          paylas.textContent = METIN[dil].linkKopyalandi;
          setTimeout(() => (paylas.innerHTML = paylasIlk), 2000);
        }
      } catch (e) {}
    });
  }

  // Dili uygula
  function dilUygula(yeni) {
    dil = yeni;
    try { localStorage.setItem("dil", dil); } catch (e) {}
    document.documentElement.lang = dil;
    document.documentElement.dataset.lang = dil;
    document.querySelectorAll("[data-dil]").forEach((b) => b.classList.toggle("aktif", b.dataset.dil === dil));
    document.querySelectorAll("[data-ayar]").forEach((el) => { const v = sec(yol(el.dataset.ayar)); if (v) el.textContent = v; });
    document.querySelectorAll("[data-ph-" + dil + "]").forEach((el) => (el.placeholder = el.getAttribute("data-ph-" + dil)));
    document.querySelectorAll("[data-wa-" + dil + "]").forEach((el) => {
      el.href = waLink(el.getAttribute("data-wa-" + dil)); el.target = "_blank"; el.rel = "noopener";
    });
    if (katalog) { filtreleriKur(); katalogCiz(); }
    vitrinCiz();
    heroYazi();
    if (acikUrun) detayCiz();
  }
  document.querySelectorAll("[data-dil]").forEach((b) => b.addEventListener("click", () => dilUygula(b.dataset.dil)));
  dilUygula(dil);

  // "Tümünü gör" ile gelindiyse kataloğu o gruba süz (urunler.html?grup=seri)
  const grupParam = new URLSearchParams(location.search).get("grup");
  if (katalog && grupParam && METIN[dil].grup[grupParam]) {
    f.grup.value = grupParam;
    katalogCiz();
  }

  // Link ile gelen ürünü aç (#urun=AK-1024)
  const hashUrun = () => decodeURIComponent((location.hash.match(/^#urun=(.+)$/) || [])[1] || "");
  if (hashUrun()) detayAc(hashUrun(), false);
  window.addEventListener("hashchange", () => hashUrun() && detayAc(hashUrun(), false));

  // Hızlı mesaj formu WhatsApp'a yönlenir
  const form = document.getElementById("mesaj-formu");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      window.open(waLink(METIN[dil].form(Object.fromEntries(new FormData(form)))), "_blank", "noopener");
    });
  }

})();

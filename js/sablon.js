// Her sayfada ortak olan parçalar: header, footer, ürün penceresi ve WhatsApp butonu.
// Menüye sayfa eklemek veya çıkarmak için sadece MENU listesini değiştirin.
(function () {
  const MENU = [
    ["index.html", "Home", "Ana Sayfa"],
    ["urunler.html", "Collection", "Ürünler"],
    ["ihracat.html", "Export", "İhracat"],
    ["yurtici.html", "Domestic", "Yurt İçi"],
    ["hakkimizda.html", "About", "Hakkımızda"],
    ["iletisim.html", "Contact", "İletişim"]
  ];
  const sayfa = decodeURIComponent(location.pathname.split("/").pop()) || "index.html";
  const A = typeof AYARLAR !== "undefined" ? AYARLAR : {};
  // Logo varsa resim, yoksa firma adı yazı olarak
  // Emin Seçilmiş Carpet logosu (ES monogramı + yazı). Ana renk currentColor: header'da koyu, fotoğraf üstünde ve footer'da beyaz.
  const G = "#b8925a", SERIF = "'Cormorant Garamond', Georgia, serif";
  const logoSvg = `<svg class="logo-svg" viewBox="0 0 360 90" role="img" aria-label="${A.firmaAdi || ""}">
    <polygon points="45,6 84,45 45,84 6,45" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <polygon points="45,14 76,45 45,76 14,45" fill="none" stroke="${G}" stroke-width="1"/>
    <text x="45" y="55" text-anchor="middle" font-family="${SERIF}" font-size="30" font-weight="700" fill="currentColor">ES</text>
    <line x1="104" y1="18" x2="104" y2="72" stroke="${G}" stroke-width="1"/>
    <text x="122" y="47" font-family="${SERIF}" font-size="36" font-weight="600" fill="currentColor">Emin Seçilmiş</text>
    <text x="123" y="70" font-family="Manrope, Arial, sans-serif" font-size="10.5" font-weight="700" letter-spacing="9.5" fill="${G}">CARPET</text></svg>`;
  const logo = (sinif, href) => A.logo
    ? `<${href ? `a href="${href}"` : "p"} class="${sinif} logo-resim"><img class="logo-koyu" src="${A.logo}" alt="${A.firmaAdi || ""}"><img class="logo-beyaz" src="${A.logoBeyaz || A.logo}" alt="${A.firmaAdi || ""}"></${href ? "a" : "p"}>`
    : `<${href ? `a href="${href}"` : "p"} class="${sinif} logo-cizim">${logoSvg}</${href ? "a" : "p"}>`;
  const altLogo = () => A.logoAlt
    ? `<a href="index.html" class="logo-alt-resim"><img src="${A.logoAlt}" alt="${A.unvan || A.firmaAdi || ""}"></a>`
    : logo("logo logo-alt", "index.html");
  const t = (en, tr) => `<span data-l="en">${en}</span><span data-l="tr">${tr}</span>`;
  const linkler = MENU.map(([href, en, tr]) =>
    `<a href="${href}"${href === sayfa ? ' aria-current="page"' : ""}>${t(en, tr)}</a>`).join("");

  const header = `
<header class="ust">
  <div class="kap ust-ic">
    ${logo("logo", "index.html")}
    <nav class="menu">${linkler}</nav>
    <div class="ust-sag">
      <div class="dil-sec" role="group" aria-label="Language">
        <button data-dil="en">EN</button><button data-dil="tr">TR</button>
      </div>
      <button class="menu-btn" aria-label="Menu" aria-expanded="false"><span></span><span></span></button>
    </div>
  </div>
</header>`;

  const footer = `
<footer class="alt">
  <div class="kap alt-ust">
    <h2>${t("Looking for a reliable carpet supplier?", "Güvenilir bir halı tedarikçisi mi arıyorsunuz?")}</h2>
    <a href="#" class="btn btn-wa" data-wa-en="Hello, I would like to work with you." data-wa-tr="Merhaba, sizinle çalışmak istiyorum.">
      ${t("Write on WhatsApp", "WhatsApp'tan yazın")}</a>
  </div>
  <div class="kap alt-ic">
    <div>
      ${altLogo()}
      <p class="soluk">${t("Wholesale carpets from Türkiye. Serving you for over 10 years.", "Türkiye'den toptan halı. 10 yılı aşkındır hizmetinizdeyiz.")}</p>
    </div>
    <div class="alt-linkler">
      <h3>${t("Menu", "Menü")}</h3>
      ${MENU.map(([href, en, tr]) => `<a href="${href}">${t(en, tr)}</a>`).join("")}
    </div>
    <div class="alt-linkler">
      <h3>${t("Contact", "İletişim")}</h3>
      <span><span data-ayar="yetkili"></span>: <a data-satis-tel></a></span>
      <span class="soluk" data-ayar="adres"></span>
    </div>
    <div class="alt-linkler">
      <h3>${t("Follow", "Takip edin")}</h3>
      <div class="alt-linkler" id="sosyal"></div>
    </div>
  </div>
  <div class="kap alt-son">
    <span>© <span id="yil"></span> <span data-ayar="unvan"></span></span>
    <span class="alt-yasal">
      <a href="kvkk.html">${t("Privacy policy", "KVKK aydınlatma metni")}</a>
      <a href="kvkk.html#cerez">${t("Cookies", "Çerez politikası")}</a>
      <a href="#">${t("Back to top ↑", "Yukarı ↑")}</a>
    </span>
  </div>
</footer>`;

  const pencere = `
<dialog id="urun-pencere" class="pencere" aria-labelledby="d-ad">
  <button class="pencere-kapat" data-kapat aria-label="Close">✕</button>
  <div class="pencere-ic">
    <div class="galeri">
      <div class="galeri-ana">
        <div class="galeri-serit" id="d-serit"></div>
        <button class="galeri-ok galeri-ok-sol" data-git="-1" aria-label="Previous">‹</button>
        <button class="galeri-ok galeri-ok-sag" data-git="1" aria-label="Next">›</button>
        <span class="galeri-sayac" id="d-sayac"></span>
        <button class="galeri-buyut" type="button" aria-label="Zoom">⤢</button>
      </div>
      <div class="galeri-kucuk" id="d-kucuk"></div>
    </div>
    <div class="detay">
      <p class="detay-kod" id="d-kod"></p>
      <h2 id="d-ad"></h2>
      <p class="detay-tur" id="d-tur"></p>
      <p class="detay-desen" id="d-desen"></p>
      <p class="detay-aciklama" id="d-aciklama"></p>
      <h3>${t("Sizes (cm)", "Ebatlar (cm)")}</h3>
      <div class="ebat-sec" id="d-ebatlar"></div>
      <dl class="ozellik" id="d-ozellik"></dl>
      <div class="benzer" id="d-benzer"></div>
      <div class="detay-butonlar">
        <a class="btn btn-wa" id="d-wa" target="_blank" rel="noopener">${t("Get info on WhatsApp", "WhatsApp'tan bilgi al")}</a>
        <button class="btn btn-ikincil" id="d-paylas">${t("Share", "Paylaş")}</button>
      </div>
      <p class="detay-not">${t("Wholesale only. Prices depend on quantity and destination.", "Sadece toptan satış. Fiyat; adet ve ödeme şekline göre değişir.")}</p>
    </div>
  </div>
  <div class="tam-ekran" id="d-tam" hidden><img alt=""><span>✕</span></div>
</dialog>`;

  const wa = `
<a href="#" class="wa-sabit" data-wa-en="Hello, I would like to get information about your carpets." data-wa-tr="Merhaba, toptan fiyat bilgisi almak istiyorum." aria-label="WhatsApp">
  <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.8-1.4a.5.5 0 0 0 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.7-1.2 2.2 2.2 0 0 0 .2-1.2c0-.1-.2-.2-.4-.3Z"/></svg>
</a>`;

  document.body.insertAdjacentHTML("afterbegin", header);
  const main = document.querySelector("main");
  (main || document.body).insertAdjacentHTML("afterend", footer + pencere + wa);
})();

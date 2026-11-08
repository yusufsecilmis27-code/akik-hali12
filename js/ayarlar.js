/*
  FİRMA AYARLARI
  Sitedeki tüm firma bilgileri buradan gelir. Sadece bu dosyayı düzenlemeniz yeterli.
  Tırnak işaretlerinin ("...") içini değiştirin, tırnakları silmeyin.
  { tr: "...", en: "...", ar: "..." } olan yerlerde dilleri yazın (ar: Arapça; yazılmazsa İngilizcesi görünür).
*/
const AYARLAR = {
  firmaAdi: "Emin Seçilmiş Carpet",
  // Logo: dosyayı img klasörüne koyup yolunu yazın. Boş bırakılırsa firma adı yazı olarak görünür.
  // logo / logoBeyaz: header'daki yatay logo (açık zeminde bordo, fotoğraf üstünde beyaz)
  // logoAlt: footer'daki tam logo (koyu zeminde, beyaz)
  logo: "",   // eski Akik Halı logosu: "img/logo-yatay.png"
  logoBeyaz: "",   // eski: "img/logo-yatay-beyaz.png"
  logoAlt: "",   // eski: "img/logo-beyaz.png"

  // GİRİŞTE DÖNEN FOTOĞRAFLAR (ana sayfanın en üstü, tam ekran)
  // Bilgisayar fotoğrafı: YATAY, 1920 x 1080 piksel (16:9). Telefon fotoğrafı: DİKEY, 1080 x 1920 (9:16).
  // Fotoğrafların sol yarısının üstüne yazı geldiği için halıyı sağa ya da ortaya yerleştirin.
  // Dosyaları img/hero klasörüne koyun. urun: o fotoğraftaki halının kodu (yazılırsa altta "Detay" linki çıkar).
  // Örnek: heroGorseller: [{ gorsel: "img/hero/1.jpg", mobil: "img/hero/1-mobil.jpg", urun: "SPT-001" }],
  heroGorseller: [
    { gorsel: "img/hero/1.webp", urun: "AKS-001" },
    { gorsel: "img/hero/2.webp" },
    { gorsel: "img/hero/3.webp" },
    { gorsel: "img/hero/4.webp" },
    { gorsel: "img/hero/5.webp", urun: "AKS-001" }
  ],
  // heroGorseller boşsa bu ürünlerin fotoğrafları kullanılır
  heroUrunler: ["AKS-001", "AKS-002", "SPT-001", "SPT-002", "AKS-004"],
  heroSure: 5, // her fotoğraf kaç saniye görünsün

  // Ana sayfadaki rakamlar
  ihracatUlkeSayisi: "35+",
  yillikKonteyner: "400+",
  desenSayisi: "1.200+",

  // İhracat yaptığınız ülkeler (ana sayfada şerit olarak görünür)
  ulkeler: ["Germany", "Iraq", "Saudi Arabia", "UAE", "USA", "United Kingdom", "Libya", "Azerbaijan", "Kazakhstan", "Russia", "France", "Netherlands"],

  // Telefon: görünen hali ve WhatsApp için başında 90 olan, boşluksuz hali
  satisTelefon: "0544 536 10 33",       // sitedeki tek telefon (arama ve WhatsApp)
  whatsapp: "905445361033",             // tüm WhatsApp düğmeleri bu numaraya gider
  yetkili: "Emin Seçilmiş",
  yetkiliGorev: { tr: "Satış & Pazarlama", en: "Sales & Marketing", ar: "المبيعات والتسويق" },

  adres: "Başpınar OSB, Vali Muammer Güler Blv. OSB 2. Bölge No: 28/A, 27600 Şehitkamil / Gaziantep",
  calismaSaatleri: { tr: "Pazartesi – Cuma 08:00 – 18:00 · Cumartesi 08:00 – 14:00", en: "Monday – Friday 08:00 – 18:00 · Saturday 08:00 – 14:00 (GMT+3)", ar: "الاثنين – الجمعة 08:00 – 18:00 · السبت 08:00 – 14:00 (بتوقيت تركيا GMT+3)" },
  // Google Maps > Paylaş > Harita yerleştir > src="..." içindeki adres
  haritaLinki: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3179.4400433741316!2d37.2991552!3d37.166012099999996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1531e2a520102435%3A0x9a34168a72fc8cfe!2sAkik%20hal%C4%B1!5e0!3m2!1str!2str!4v1793488324727!5m2!1str!2str",
  // "Yol tarifi al" düğmesinin açacağı Google Maps linki
  yolTarifi: "https://maps.app.goo.gl/fp7Eg1e1rHSJkNJf9",

  // Sayfa altındaki telif satırında ve KVKK metninde geçen resmi ad
  unvan: "Akik Halı San. ve Tic. Ltd. Şti.",

  // İHRACAT KOŞULLARI
  ihracat: {
    moq: { tr: "En az 1 adet 20' konteyner. Model ve ebatlar karışık yüklenebilir.", en: "Minimum one 20' container. Designs and sizes can be mixed.", ar: "الحد الأدنى حاوية واحدة 20 قدمًا. يمكن تشكيل التصاميم والمقاسات." },
    teslimSekli: { tr: "EXW, FOB (Mersin / İstanbul), CIF", en: "EXW, FOB (Mersin / Istanbul), CIF", ar: "EXW، FOB (مرسين / إسطنبول)، CIF" },
    odeme: { tr: "T/T: %30 peşin, %70 yükleme öncesi. Akreditif (L/C) görüşülebilir.", en: "T/T: 30% advance, 70% before loading. L/C negotiable.", ar: "تحويل بنكي: 30% مقدمًا و70% قبل التحميل. الاعتماد المستندي (L/C) قابل للنقاش." },
    sure: { tr: "Stok ürünler 7–10 gün, üretim siparişleri 25–35 gün.", en: "Stock items 7–10 days, production orders 25–35 days.", ar: "منتجات المخزون 7–10 أيام، وطلبات الإنتاج 25–35 يومًا." },
    belgeler: { tr: "Ticari fatura, çeki listesi, menşe şahadetnamesi, EUR.1 / A.TR, Form A", en: "Commercial invoice, packing list, certificate of origin, EUR.1 / A.TR, Form A", ar: "فاتورة تجارية، قائمة تعبئة، شهادة منشأ، EUR.1 / A.TR، Form A" },
    ozelEtiket: { tr: "Kendi markanızla etiket, ambalaj ve özel ebat üretimi.", en: "Private label, custom packaging and custom sizes.", ar: "إنتاج بعلامتك التجارية، وتغليف خاص، ومقاسات حسب الطلب." }
  },

  // TÜRKİYE İÇİ TOPTAN KOŞULLAR
  yurtici: {
    minimum: { tr: "Üst sınır yok, istediğiniz kadar alabilirsiniz. En az bir balya (bir çuval).", en: "No upper limit, order as much as you need. Minimum one bale.", ar: "لا يوجد حد أعلى، اطلب الكمية التي تحتاجها. الحد الأدنى بالة واحدة." },
    fiyat: { tr: "Piyasanın en uygun toptan fiyatları. Güncel liste için bize yazın.", en: "Best wholesale prices on the market. Ask us for the current list.", ar: "أفضل أسعار الجملة في السوق. اطلب منا القائمة المحدّثة." },
    odeme: { tr: "Havale / EFT veya kredi kartı", en: "Bank transfer or credit card", ar: "تحويل بنكي أو بطاقة ائتمان" },
    kargo: { tr: "Kargo ve nakliye ücreti alıcıya aittir. Anlaşmalı ambar ve kargo ile 81 ile gönderim.", en: "Shipping costs are paid by the buyer. Delivery to all 81 provinces.", ar: "تكاليف الشحن على المشتري. التوصيل إلى جميع الولايات الـ 81." },
    fatura: { tr: "Tüm satışlar faturalıdır (e-fatura / e-arşiv).", en: "All sales are invoiced (e-invoice).", ar: "جميع المبيعات بفاتورة (فاتورة إلكترونية)." }
  },

  // Sosyal medya (kullanmadığınızı boş bırakın: "")
  instagram: "https://instagram.com/",
  facebook: "",
  youtube: "",
  linkedin: "",
  tiktok: "",

  // Katalog PDF dosyası (siteyle aynı klasöre koyun)
  katalogPdf: "katalog.pdf"
};

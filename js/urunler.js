/*
  ÜRÜN LİSTESİ
  Yeni ürün eklemek için bir bloğu { ... }, kopyalayıp altına yapıştırın ve bilgileri değiştirin.

  kod      : Ürün kodu (WhatsApp mesajına otomatik eklenir)
  ad / adEn: Ürün adı (Türkçe / İngilizce)
  tur      : "Makine Halısı", "Cami Halısı", "Shaggy", "Kilim", "Yolluk", "Çocuk Halısı"
  malzeme  : "Akrilik", "Polyester", "Pamuk", "Yün" (bilinmiyorsa "" bırakın)
  renk     : "Kırmızı", "Lacivert", "Gri", "Krem", "Bej", "Vizon", "Yeşil", "Kahverengi", "Mavi"
             (Bu listelerin İngilizcesi app.js içindeki CEVIRI'de. Yeni bir tür/renk eklerseniz oraya da ekleyin.)
  ebatlar  : Mevcut ebatlar (cm)
  etiket   : "seri" (seri üretim), "spot" (spot halı) veya "" (boş). İlk 4 seri ve ilk 4 spot ürün "Yeni gelenler"de görünür.
  gorseller: Fotoğraflar (img/urunler klasöründe). İlki kartta görünür, hepsi ürün galerisinde. Örnek:
             gorseller: ["img/urunler/AK-101.jpg", "img/urunler/AK-101-yakin.jpg", "img/urunler/AK-101-arka.jpg"]
             Önerilen sıra: genel görünüm, yakın çekim doku, arka yüz, ortamda.
  renkler  : Fotoğraf yoksa gösterilen yer tutucunun renkleri

  İSTEĞE BAĞLI DETAYLAR (ürün penceresinde görünür, yazmazsanız o satır gizlenir):
  hav      : Hav, örn. "20 lanset"
  iplik    : İplik türü, örn. "Polip, Floş Polyester"
  siklik   : Sıklık, örn. "420.000 nokta/m²"
  agirlik  : m² ağırlığı, örn. "2.300 g/m²"
  taban    : Taban, örn. "Jüt", "Kaymaz taban"
  mensei   : Menşei, örn. "Türkiye"
  aciklama : { tr: "...", en: "..." }

  NOT: Aşağıdaki ürünlerin ad, kod, renk ve ebatları fotoğraflara bakılarak geçici olarak yazıldı.
  Gerçek kod, ebat ve malzeme bilgileriyle düzeltin.
*/
const AKIK_EBAT = ["80x150", "120x180", "160x230", "200x290"];
const AKIK_ACIKLAMA = { tr: "Akik Yeni Koleksiyon. Yoğun dokulu, eskitme efektli makine halısı.", en: "Akik New Collection. Dense machine-made rug with a distressed finish." };
const CAMI_EBAT = ["Rulo / metre ile"];
const CAMI_ACIKLAMA = { tr: "Saflı cami halısı. Cami ölçüsüne göre metre ile kesim ve döşeme.", en: "Mosque carpet with prayer rows. Cut to size per metre for your mosque." };

const URUNLER = [
  // SERİ ÜRETİM
  // Saraylı Mercan bir kalitedir; gorseller bu kalitenin desenleridir. desenli: true olunca galeride
  // her fotoğraf "Desen 1, Desen 2..." diye görünür ve seçilen desen WhatsApp mesajına eklenir.
  // Kod geçici; gerçek kodla değiştirin.
  { kod: "AKS-001", ad: "Akik Saraylı Mercan", adEn: "Akik Palace Coral", tur: "Makine Halısı", malzeme: "Polyester", renk: "",
    ebatlar: ["100x200", "100x300", "160x230", "200x290", "240x340", "300x400"], etiket: "seri", desenli: true,
    gorseller: ["img/seri/gorsel-04.webp", "img/seri/gorsel-01.webp", "img/seri/gorsel-02.webp", "img/seri/gorsel-03.webp",
      "img/seri/gorsel-05.webp", "img/seri/gorsel-06.webp", "img/seri/gorsel-07.webp", "img/seri/gorsel-08.webp",
      "img/seri/gorsel-09.webp", "img/seri/gorsel-10.webp", "img/seri/gorsel-11.webp", "img/seri/gorsel-12.webp"],
    hav: "20 lanset", agirlik: "2.300 g/m²", siklik: "420.000 nokta/m²", iplik: "Polip, Floş Polyester, Çöken",
    aciklama: { tr: "Akik seri üretim koleksiyonu. Sık dokulu, saray motifli makine halısı.", en: "Akik series production. Densely woven machine-made rug with palace motifs." } },

  { kod: "AKS-002", ad: "1000 Tarak", adEn: "1000 Reed", tur: "Makine Halısı", malzeme: "", renk: "",
    ebatlar: ["80x80", "80x150", "80x300", "100x200", "100x300", "160x230", "200x290", "300x400"], etiket: "seri", desenli: true,
    gorseller: ["img/seri/tarak-08.jpg", "img/seri/tarak-01.jpg", "img/seri/tarak-02.jpg", "img/seri/tarak-03.jpg",
      "img/seri/tarak-04.jpg", "img/seri/tarak-05.jpg", "img/seri/tarak-06.jpg", "img/seri/tarak-07.jpg",
      "img/seri/tarak-09.jpg", "img/seri/tarak-10.jpg", "img/seri/tarak-11.jpg", "img/seri/tarak-12.jpg"],
    agirlik: "2.500 g/m²",
    aciklama: { tr: "Seri üretim. 1000 tarak sık dokulu, klasik İran desenli makine halısı.", en: "Series production. Densely woven 1000-reed machine-made rug with classic Persian designs." } },

  { kod: "AKS-003", ad: "Kampanyalık Polyester Seri", adEn: "Campaign Polyester Series", tur: "Makine Halısı", malzeme: "Polyester", renk: "",
    ebatlar: ["200x280", "220x300"], etiket: "seri", desenli: true,
    gorseller: ["img/seri/kampanya-03.jpg", "img/seri/kampanya-01.jpg", "img/seri/kampanya-02.jpg",
      "img/seri/kampanya-04.jpg", "img/seri/kampanya-05.jpg"],
    agirlik: "1.300 g/m²",
    aciklama: { tr: "Kampanyalı seri üretim. Kabartma dokulu, modern çerçeve desenli polyester halı.", en: "Series production on promotion. Polyester rug with embossed texture and modern border designs." } },

  { kod: "AKS-004", ad: "Dijital Baskı Kaymaz Taban", adEn: "Digital Print Non-Slip", tur: "Makine Halısı", malzeme: "", renk: "",
    ebatlar: ["İstenilen ebatta üretim"], etiket: "seri", desenli: true,
    gorseller: ["img/seri/dijital-03.jpg", "img/seri/dijital-01.jpg", "img/seri/dijital-02.jpg",
      "img/seri/dijital-04.jpg", "img/seri/dijital-05.jpg"],
    agirlik: "İstenilen ağırlıkta üretim", taban: "Kaymaz taban",
    aciklama: { tr: "Dijital baskı, kaymaz tabanlı halı. İstenilen tüm ebatlarda, istenilen ağırlık ve kalitede üretim sağlanır.", en: "Digital print rug with non-slip backing. Produced in any size, weight and quality you need." } },

  // SPOT HALI
  // Kod geçici; gerçek kodla değiştirin.
  { kod: "SPT-001", ad: "Klasik Tasarım Polyester", adEn: "Classic Design Polyester", tur: "Makine Halısı", malzeme: "Polyester", renk: "",
    ebatlar: ["160x230", "200x290", "240x340"], etiket: "spot", desenli: true,
    gorseller: ["img/spot/klasik-03.webp", "img/spot/klasik-01.webp", "img/spot/klasik-02.webp",
      "img/spot/klasik-04.webp", "img/spot/klasik-05.webp", "img/spot/klasik-06.webp"],
    agirlik: "2.300 g/m²",
    aciklama: { tr: "Spot halı. Klasik ve modern desen seçenekleriyle polyester makine halısı.", en: "Stock rug. Polyester machine-made rug in classic and modern designs." } },

  { kod: "SPT-002", ad: "Sisal", adEn: "Sisal", tur: "Makine Halısı", malzeme: "", renk: "",
    ebatlar: ["80x150", "80x300", "100x200", "120x180", "160x230", "200x290"], etiket: "spot", desenli: true,
    gorseller: ["img/spot/sisal-07.webp", "img/spot/sisal-01.webp", "img/spot/sisal-02.webp", "img/spot/sisal-03.webp",
      "img/spot/sisal-04.webp", "img/spot/sisal-05.webp", "img/spot/sisal-06.webp"],
    aciklama: { tr: "Spot halı. Hasır dokulu, modern ve geometrik desenli sisal görünümlü halı.", en: "Stock rug. Flat-woven sisal-look rug in modern and geometric designs." } },

  { kod: "SPT-003", ad: "Kampanyalık Polyester", adEn: "Campaign Polyester", tur: "Makine Halısı", malzeme: "Polyester", renk: "",
    ebatlar: ["200x270"], etiket: "spot", desenli: true,
    gorseller: ["img/spot/kampanya-07.webp", "img/spot/kampanya-08.webp", "img/spot/kampanya-01.webp"],
    agirlik: "1.700 g/m²",
    aciklama: { tr: "Kampanyalı spot halı. Kabartma dokulu, modern desenli polyester halı.", en: "Stock rug on promotion. Polyester rug with embossed texture and modern designs." } },

  // AKİK YENİ KOLEKSİYON
  { kod: "AK-101", ad: "Akik Madalyon Füme", adEn: "Akik Medallion Smoke", tur: "Makine Halısı", malzeme: "", renk: "Gri",
    ebatlar: AKIK_EBAT, etiket: "spot", gorseller: ["img/urunler/AK-101.jpg"], aciklama: AKIK_ACIKLAMA },
  { kod: "AK-102", ad: "Akik Eskitme", adEn: "Akik Vintage", tur: "Makine Halısı", malzeme: "", renk: "Gri",
    ebatlar: AKIK_EBAT, etiket: "spot", gorseller: ["img/urunler/AK-102.jpg"], aciklama: AKIK_ACIKLAMA },
  { kod: "AK-103", ad: "Akik Madalyon Vizon", adEn: "Akik Medallion Mink", tur: "Makine Halısı", malzeme: "", renk: "Vizon",
    ebatlar: AKIK_EBAT, etiket: "spot", gorseller: ["img/urunler/AK-103.jpg"], aciklama: AKIK_ACIKLAMA },
  { kod: "AK-104", ad: "Akik Dalga", adEn: "Akik Wave", tur: "Makine Halısı", malzeme: "", renk: "Krem",
    ebatlar: AKIK_EBAT, etiket: "spot", gorseller: ["img/urunler/AK-104.jpg"], aciklama: AKIK_ACIKLAMA },
  { kod: "AK-105", ad: "Akik Modern Çizgi", adEn: "Akik Modern Line", tur: "Makine Halısı", malzeme: "", renk: "Gri",
    ebatlar: AKIK_EBAT, etiket: "spot", gorseller: ["img/urunler/AK-105.jpg"], aciklama: AKIK_ACIKLAMA },
  { kod: "AK-106", ad: "Akik Madalyon Lacivert", adEn: "Akik Medallion Navy", tur: "Makine Halısı", malzeme: "", renk: "Lacivert",
    ebatlar: AKIK_EBAT, etiket: "spot", gorseller: ["img/urunler/AK-106.jpg"], aciklama: AKIK_ACIKLAMA },
  { kod: "AK-107", ad: "Akik Klasik", adEn: "Akik Classic", tur: "Makine Halısı", malzeme: "", renk: "Bej",
    ebatlar: AKIK_EBAT, etiket: "spot", gorseller: ["img/urunler/AK-107.jpg"], aciklama: AKIK_ACIKLAMA },
  { kod: "AK-108", ad: "Akik Mermer", adEn: "Akik Marble", tur: "Makine Halısı", malzeme: "", renk: "Bej",
    ebatlar: AKIK_EBAT, etiket: "spot", gorseller: ["img/urunler/AK-108.jpg"], aciklama: AKIK_ACIKLAMA },
  { kod: "AK-109", ad: "Akik Geometrik", adEn: "Akik Geometric", tur: "Makine Halısı", malzeme: "", renk: "Krem",
    ebatlar: AKIK_EBAT, etiket: "spot", gorseller: ["img/urunler/AK-109.jpg"], aciklama: AKIK_ACIKLAMA },
  { kod: "AK-110", ad: "Akik Patchwork", adEn: "Akik Patchwork", tur: "Makine Halısı", malzeme: "", renk: "Gri",
    ebatlar: AKIK_EBAT, etiket: "spot", gorseller: ["img/urunler/AK-110.jpg"], aciklama: AKIK_ACIKLAMA },
  { kod: "AK-111", ad: "Akik Madalyon Krem", adEn: "Akik Medallion Cream", tur: "Makine Halısı", malzeme: "", renk: "Krem",
    ebatlar: AKIK_EBAT, etiket: "spot", gorseller: ["img/urunler/AK-111.jpg"], aciklama: AKIK_ACIKLAMA },
  { kod: "AK-112", ad: "Akik Madalyon Kahve", adEn: "Akik Medallion Brown", tur: "Makine Halısı", malzeme: "", renk: "Kahverengi",
    ebatlar: AKIK_EBAT, etiket: "spot", gorseller: ["img/urunler/AK-112.jpg"], aciklama: AKIK_ACIKLAMA },

  // CAMİ HALISI
  { kod: "CM-201", ad: "Cami Halısı Yeşil", adEn: "Mosque Carpet Green", tur: "Cami Halısı", malzeme: "", renk: "Yeşil",
    ebatlar: CAMI_EBAT, etiket: "seri", gorseller: ["img/urunler/CM-201.jpg"], aciklama: CAMI_ACIKLAMA },
  { kod: "CM-202", ad: "Cami Halısı Bordo Mihrap", adEn: "Mosque Carpet Burgundy Arch", tur: "Cami Halısı", malzeme: "", renk: "Kırmızı",
    ebatlar: CAMI_EBAT, etiket: "seri", gorseller: ["img/urunler/CM-202.jpg"], aciklama: CAMI_ACIKLAMA },
  { kod: "CM-203", ad: "Cami Halısı Bordo Lale", adEn: "Mosque Carpet Burgundy Tulip", tur: "Cami Halısı", malzeme: "", renk: "Kırmızı",
    ebatlar: CAMI_EBAT, etiket: "seri", gorseller: ["img/urunler/CM-203.jpg"], aciklama: CAMI_ACIKLAMA },
  { kod: "CM-204", ad: "Cami Halısı Bordo Klasik", adEn: "Mosque Carpet Burgundy Classic", tur: "Cami Halısı", malzeme: "", renk: "Kırmızı",
    ebatlar: CAMI_EBAT, etiket: "seri", gorseller: ["img/urunler/CM-204.jpg"], aciklama: CAMI_ACIKLAMA },
  { kod: "CM-205", ad: "Cami Halısı Kandil", adEn: "Mosque Carpet Lantern", tur: "Cami Halısı", malzeme: "", renk: "Kırmızı",
    ebatlar: CAMI_EBAT, etiket: "seri", gorseller: ["img/urunler/CM-205.jpg"], aciklama: CAMI_ACIKLAMA },
  { kod: "CM-206", ad: "Cami Halısı Sade Bordo", adEn: "Mosque Carpet Plain Burgundy", tur: "Cami Halısı", malzeme: "", renk: "Kırmızı",
    ebatlar: CAMI_EBAT, etiket: "seri", gorseller: ["img/urunler/CM-206.jpg"], aciklama: CAMI_ACIKLAMA },
  { kod: "CM-207", ad: "Cami Halısı Hayat Ağacı", adEn: "Mosque Carpet Tree of Life", tur: "Cami Halısı", malzeme: "", renk: "Kırmızı",
    ebatlar: CAMI_EBAT, etiket: "seri", gorseller: ["img/urunler/CM-207.jpg"], aciklama: CAMI_ACIKLAMA },
  { kod: "CM-208", ad: "Cami Halısı Çizgili Saf", adEn: "Mosque Carpet Striped Rows", tur: "Cami Halısı", malzeme: "", renk: "Lacivert",
    ebatlar: CAMI_EBAT, etiket: "seri", gorseller: ["img/urunler/CM-208.jpg"], aciklama: CAMI_ACIKLAMA }
];

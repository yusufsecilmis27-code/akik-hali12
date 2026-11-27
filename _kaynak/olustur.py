# -*- coding: utf-8 -*-
"""
EMİN SEÇİLMİŞ CARPET – SİTE OLUŞTURUCU

Kaynak sayfalar bu klasörde (_kaynak) durur; GitHub Pages bu klasörü yayınlamaz.
Bu betik her dil için ayrı sayfalar üretir: /tr/, /en/, /ar/, /ru/, /fr/, /ka/
Çalıştırma (site klasöründe):   python _kaynak/olustur.py

Metinler:
  - Kaynak sayfalarda <span data-l="en">..</span><span data-l="tr">..</span>
  - Arapça: js/ar.js (İngilizce metin -> Arapça) ve _kaynak/ceviri/ar.json
  - Rusça / Fransızca / Gürcüce: _kaynak/ceviri/ru.json, fr.json, ka.json (İngilizce metin -> çeviri)
  - Sayfa başlıkları ve Google açıklamaları: _kaynak/seo.json
  - Ürünler: js/urunler.js, çevirileri js/diller.js
  - Blog yazıları: _kaynak/blog.json
Çevirisi bulunamayan metinler İngilizce kalır ve betik sonunda listelenir.
"""
import os, re, json, html, shutil, subprocess, datetime, sys

K = os.path.dirname(os.path.abspath(__file__))
KOK = os.path.dirname(K)
SITE = "https://eminsecilmiscarpet.com"
DILLER = ["tr", "en", "ar", "ru", "fr", "ka"]
DIL_AD = {"tr": "Türkçe", "en": "English", "ar": "العربية", "ru": "Русский", "fr": "Français", "ka": "ქართული"}
OG = {"tr": "tr_TR", "en": "en_US", "ar": "ar_AR", "ru": "ru_RU", "fr": "fr_FR", "ka": "ka_GE"}
BUGUN = datetime.date.today().isoformat()
GA = "G-2VMGYD68XT"

# Sayfa adresleri: (Türkçe, diğer diller)
SLUG = {"index": ("", ""), "urunler": ("urunler", "products"), "ihracat": ("ihracat", "export"),
        "yurtici": ("yurtici", "wholesale-turkey"), "hakkimizda": ("hakkimizda", "about"),
        "iletisim": ("iletisim", "contact"), "kvkk": ("kvkk", "privacy"), "blog": ("blog", "blog"),
        "il81": ("toptan-hali-81-il", None), "fuar": ("icfe-2027-fuar", "icfe-2027"),
        "pazar": ("ihracat-pazarlari", "export-markets")}
KAYNAK_SAYFALAR = ["index", "urunler", "ihracat", "yurtici", "hakkimizda", "iletisim", "kvkk"]

def yol(sayfa, L):
    s = SLUG[sayfa][0 if L == "tr" else 1]
    return f"/{L}/" + (s + "/" if s else "")

def oku(p): return open(p, encoding="utf-8").read()
def surumlu(yol_):  # önbellek için: /js/app.js?v=ab12cd
    import hashlib
    return yol_ + "?v=" + hashlib.md5(open(os.path.join(KOK, yol_.lstrip("/")), "rb").read()).hexdigest()[:8]
def yaz(p, s):
    os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, "w", encoding="utf-8", newline="\n").write(s)
def norm(h): return re.sub(r"\s+", " ", h).replace("&amp;", "&").strip()
e = html.escape

# ---------- JS verileri (node ile okunur) ----------
JS = r"""
const fs=require('fs');const r=(f)=>fs.readFileSync(f,'utf8');
const AY=new Function(r('js/ayarlar.js')+';return AYARLAR')();
const UR=new Function(r('js/urunler.js')+';return URUNLER')();
const A=new Function(r('js/ar.js')+';return {AR}')();
const DL=new Function(r('js/diller.js')+';return DIL')();
const dil={};for(const [k,v] of Object.entries(DL)){const m=v.metin;
 dil[k]={ceviri:v.ceviri||{},urun:v.urun||{},fiyatSor:m.fiyatSor,grup:m.grup,detay:m.detay,oz:m.oz,benzer:m.benzer,
  wa:m.wa('{U}'),desenSayi:m.desenSayi('{N}'),video:m.video};}
process.stdout.write(JSON.stringify({AY,UR,AR:A.AR,dil}));
"""
veri = json.loads(subprocess.run(["node", "-e", JS], cwd=KOK, capture_output=True, check=True).stdout.decode("utf-8"))
AY, URUNLER, DILV = veri["AY"], veri["UR"], veri["dil"]

# Çeviri sözlükleri: İngilizce (normalleştirilmiş) -> dil
T = {L: {} for L in DILLER}
T["ar"].update({norm(k): v for k, v in veri["AR"].items()})
# Çok dilli çeviri dosyaları: { "İngilizce metin": { "ar": "..", "ru": "..", "fr": "..", "ka": ".." } }
for f in sorted(os.listdir(os.path.join(K, "ceviri"))):
    if f.startswith("coklu") and f.endswith(".json"):
        for en, ceviriler in json.load(open(os.path.join(K, "ceviri", f), encoding="utf-8")).items():
            for L, v in ceviriler.items(): T[L][norm(en)] = v
for L in DILLER:
    p = os.path.join(K, "ceviri", L + ".json")
    if os.path.exists(p):
        T[L].update({norm(k): v for k, v in json.load(open(p, encoding="utf-8")).items()})
EKSIK = {L: set() for L in DILLER}

def cevir_en(en, L, tr=None):
    """İngilizce metnin L dilindeki karşılığı."""
    if L == "en": return en
    if L == "tr" and tr is not None: return tr
    v = T[L].get(norm(en))
    if v is None:
        if L != "tr": EKSIK[L].add(norm(en))
        return tr if (L == "tr" and tr) else en
    return v

SEO = json.load(open(os.path.join(K, "seo.json"), encoding="utf-8"))
FUAR = json.load(open(os.path.join(K, "fuar.json"), encoding="utf-8")) if os.path.exists(os.path.join(K, "fuar.json")) else None
PAZAR = json.load(open(os.path.join(K, "pazarlar.json"), encoding="utf-8")) if os.path.exists(os.path.join(K, "pazarlar.json")) else None
BLOG = json.load(open(os.path.join(K, "blog.json"), encoding="utf-8")) if os.path.exists(os.path.join(K, "blog.json")) else []

# ---------- data-l işleme ----------
ACILIS = re.compile(r'<([a-zA-Z][a-zA-Z0-9]*)\b([^>]*?\sdata-l="(\w+)"[^>]*)>')

def kapanis(s, tag, bas):
    """bas: açılış etiketinin bittiği yer. Eşleşen kapanış etiketinin (baş, son) konumu."""
    derin, i = 1, bas
    ac = re.compile(r"<%s\b[^>]*>|</%s\s*>" % (tag, tag), re.I)
    while True:
        m = ac.search(s, i)
        if not m: raise ValueError("Kapanmayan etiket: " + tag)
        if m.group(0).startswith("</"):
            derin -= 1
            if derin == 0: return m.start(), m.end()
        elif not m.group(0).endswith("/>"):
            derin += 1
        i = m.end()

def dil_isle(s, L):
    cikti, i = [], 0
    while True:
        m = ACILIS.search(s, i)
        if not m:
            cikti.append(s[i:]); break
        cikti.append(s[i:m.start()])
        grup, j = [], m.start()
        while True:
            mm = ACILIS.match(s, j)
            if not mm: break
            tag, attrs, dl = mm.group(1), mm.group(2), mm.group(3)
            ks, ke = kapanis(s, tag, mm.end())
            grup.append((dl, tag, attrs, s[mm.end():ks]))
            j = ke
            bosluk = re.match(r"\s*", s[j:]).end()
            if ACILIS.match(s, j + bosluk): j += bosluk
            else: break
        d = {g[0]: g for g in grup}
        if L in d:
            _, tag, attrs, ic = d[L]
        elif "en" in d:
            _, tag, attrs, ic = d["en"]
            ic = cevir_en(ic, L, d["tr"][3] if "tr" in d else None)
        else:
            _, tag, attrs, ic = grup[0]
        attrs = re.sub(r'\s*data-l="\w+"', "", attrs)
        cikti.append(f"<{tag}{attrs}>{dil_isle(ic, L)}</{tag}>")
        i = j
    return "".join(cikti)

def wa_link(mesaj): return "https://wa.me/" + AY["whatsapp"] + "?text=" + __import__("urllib.parse").parse.quote(mesaj)

def ayar(anahtar, L):
    v = AY
    for k in anahtar.split("."): v = v.get(k) if isinstance(v, dict) else None
    if isinstance(v, dict):
        return v.get(L) or (cevir_en(v["en"], L) if "en" in v else "")
    return v or ""

def nitelik_isle(s, L):
    # WhatsApp düğmeleri ve yer tutucular: dile göre sabit yazılır
    def wa(m):
        tag, at = m.group(1), m.group(2)
        msj = dict(re.findall(r'data-wa-(\w+)="([^"]*)"', at))
        metin = msj.get(L) or cevir_en(msj.get("en", ""), L, msj.get("tr"))
        at = re.sub(r'\s*data-wa-\w+="[^"]*"', "", at)
        at = re.sub(r'\s*href="[^"]*"', "", at)
        return f'<{tag} href="{e(wa_link(html.unescape(metin)))}" target="_blank" rel="noopener"{at}>'
    s = re.sub(r'<(a)\b([^>]*data-wa-en="[^"]*"[^>]*)>', wa, s)
    def ph(m):
        tag, at = m.group(1), m.group(2)
        p = dict(re.findall(r'data-ph-(\w+)="([^"]*)"', at))
        metin = p.get(L) or cevir_en(p.get("en", ""), L, p.get("tr"))
        at = re.sub(r'\s*data-ph-\w+="[^"]*"', "", at)
        return f'<{tag}{at} placeholder="{metin}">'
    s = re.sub(r'<(input|textarea)\b([^>]*data-ph-en="[^"]*"[^>]*)>', ph, s)
    s = re.sub(r'(<(\w+)\b[^>]*data-ayar="([\w.]+)"[^>]*>)\s*(</\2>)',
               lambda m: m.group(1) + e(ayar(m.group(3), L)) + m.group(4), s)
    tel = AY["satisTelefon"]
    s = s.replace("<a data-satis-tel></a>", f'<a data-satis-tel href="tel:+9{re.sub(r"[^0-9]", "", tel)}" dir="ltr">{tel}</a>')
    s = s.replace('<span id="yil"></span>', f'<span id="yil">{datetime.date.today().year}</span>')
    sosyal = "".join(f'<a href="{AY[k]}" target="_blank" rel="noopener">{ad}</a>'
                     for k, ad in [("instagram", "Instagram"), ("facebook", "Facebook"), ("linkedin", "LinkedIn"), ("youtube", "YouTube"), ("tiktok", "TikTok")]
                     if AY.get(k) and AY[k].rstrip("/") not in ("https://instagram.com", "https://www.instagram.com"))
    s = s.replace('<div class="alt-linkler" id="sosyal"></div>', f'<div class="alt-linkler" id="sosyal">{sosyal}</div>')
    if AY.get("haritaLinki"): s = s.replace("data-harita", f'data-harita src="{AY["haritaLinki"]}"')
    return s

def link_isle(s, L):
    def sayfa(m):
        ad, frag = m.group(1), m.group(2) or ""
        if ad not in SLUG: return m.group(0)
        hedef = yol(ad, L) if SLUG[ad][1] is not None or L == "tr" else yol("index", L)
        return f'href="{hedef}{frag}"'
    s = re.sub(r'href="([a-z0-9]+)\.html(#[^"]*)?"', sayfa, s)
    s = re.sub(r'\b(src|href|poster|data-src)="(css|js|img|video)/', r'\1="/\2/', s)
    s = s.replace('href="favicon.svg"', 'href="/favicon.svg"').replace("url(img/", "url(/img/")
    return s

# ---------- Görseller ve ürün kartları ----------
def surum(src, kat):
    if src.startswith("img/"):
        k = "img/" + kat + "/" + re.sub(r"\.\w+$", ".webp", src[4:])
        if os.path.exists(os.path.join(KOK, k)): return "/" + k
    return "/" + src

def video_mu(s): return bool(re.search(r"\.(mp4|webm|mov)$", s, re.I))
def resimler(u): return [g for g in (u.get("gorseller") or []) if not video_mu(g)]
def urun_ad(u, L):
    if L == "tr": return u["ad"]
    if L == "en": return u.get("adEn") or u["ad"]
    if L == "ar": return u.get("adAr") or u.get("adEn") or u["ad"]
    return (DILV[L]["urun"].get(u["kod"]) or [None])[0] or u.get("adEn") or u["ad"]
def urun_aciklama(u, L):
    x = (DILV[L]["urun"].get(u["kod"]) or [None, None])[1]
    a = u.get("aciklama") or {}
    return x or a.get(L) or a.get("en") or a.get("tr") or ""
def cv(s, L):
    c = DILV[L]["ceviri"]
    return c.get(s) or (s.replace("rulo", c["rulo"]) if c.get("rulo") else s)
def urun_yolu(u, L): return yol("urunler", L) + u["kod"].lower() + "/"

def kart(u, L):
    D = DILV[L]
    rozet = f'<span class="rozet rozet-son">{D["grup"]["spot"]}</span>' if u.get("etiket") == "spot" else \
            f'<span class="rozet rozet-seri">{D["grup"]["seri"]}</span>' if u.get("etiket") == "seri" else ""
    r = resimler(u); n = len(r)
    sayi = f'<span class="foto-sayisi">{D["desenSayi"].replace("{N}", str(n)) if u.get("desenli") else str(n) + " ◫"}</span>' if n > 1 else ""
    gorsel = f'<img src="{surum(r[0], "k")}" alt="{e(urun_ad(u, L))} {u["kod"]}" loading="lazy" decoding="async">' if r else ""
    bilgi = " · ".join(cv(x, L) for x in [u.get("tur"), u.get("malzeme"), u.get("renk")] if x)
    return f'''<article class="urun">
      <button class="urun-ac" data-urun="{u["kod"]}" aria-label="{e(urun_ad(u, L))} {u["kod"]}">
        <div class="urun-gorsel">{gorsel}{rozet}{sayi}</div>
        <div class="urun-ic">
          <div class="urun-ust"><h3>{e(urun_ad(u, L))}</h3><span class="urun-kod">{u["kod"]}</span></div>
          <p class="urun-bilgi">{e(bilgi)}</p>
          <p class="urun-ebat">{e(" · ".join(cv(x, L) for x in u["ebatlar"]))}</p>
        </div>
      </button>
      <a class="btn" href="{e(wa_link(D["wa"].replace("{U}", urun_ad(u, L))))}" target="_blank" rel="noopener">{D["fiyatSor"]}</a>
    </article>'''

# ---------- Ortak parçalar ----------
ORTAK = oku(os.path.join(K, "_ortak.html"))
UST = re.search(r"<!--UST-->(.*?)<!--/UST-->", ORTAK, re.S).group(1)
ALT = re.search(r"<!--ALT-->(.*?)<!--/ALT-->", ORTAK, re.S).group(1)
MENU = [("index", "Home", "Ana Sayfa"), ("urunler", "Collection", "Ürünler"), ("ihracat", "Export", "İhracat"),
        ("yurtici", "Domestic", "Yurt İçi"), ("hakkimizda", "About", "Hakkımızda"), ("blog", "Blog", "Blog"),
        ("iletisim", "Contact", "İletişim")]

def ust_alt(L, aktif, alternatif):
    menu = "".join(f'<a href="{s}.html"{" aria-current=\"page\"" if s == aktif else ""}><span data-l="en">{en}</span><span data-l="tr">{tr}</span></a>' for s, en, tr in MENU)
    altmenu = "".join(f'<a href="{s}.html"><span data-l="en">{en}</span><span data-l="tr">{tr}</span></a>' for s, en, tr in MENU)
    if L == "tr": altmenu += '<a href="il81.html">81 İle Toptan Halı</a>'
    if PAZAR: altmenu += f'<a href="pazar.html">{e(PAZAR["metin"]["link"][L])}</a>'
    if FUAR and BUGUN < FUAR["bitis"]: altmenu += '<a href="fuar.html">ICFE 2027</a>'
    diller = f'<details class="dil-sec"><summary aria-label="Language">{L.upper()}</summary><div class="dil-liste">' + "".join(
        f'<a href="{alternatif.get(L2) or yol("index", L2)}" hreflang="{L2}" lang="{L2}"{" class=\"aktif\"" if L2 == L else ""}>{DIL_AD[L2]} <small>{L2.upper()}</small></a>'
        for L2 in DILLER) + "</div></details>"
    u = UST.replace("<!--MENU-->", menu).replace('<div class="dil-sec" role="group" aria-label="Language"><!--DILLER--></div>', diller)
    a = ALT.replace("<!--ALTMENU-->", altmenu)
    return u, a

def bas(L, baslik, aciklama, adres, alternatif, ld=None, robots=None, og_tur="website", gorsel="/img/og.jpg"):
    alt = "".join(f'\n  <link rel="alternate" hreflang="{L2}" href="{SITE}{p}">' for L2, p in alternatif.items())
    if "tr" in alternatif and len(alternatif) > 1:
        alt += f'\n  <link rel="alternate" hreflang="x-default" href="{SITE}{alternatif.get("en", alternatif["tr"])}">'
    lds = "".join(f'\n  <script type="application/ld+json">{json.dumps(x, ensure_ascii=False)}</script>' for x in (ld or []))
    rb = f'\n  <meta name="robots" content="{robots}">' if robots else ""
    yon = json.dumps({L2: p for L2, p in alternatif.items()})
    return f'''<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script>/* İlk ziyarette tarayıcı diline göre o dilin sayfasını aç; menüden seçilen dil hatırlanır. Arama motoru botları yönlendirilmez. */
  (function(){{try{{if(/bot|crawl|spider|slurp|lighthouse|inspection|preview/i.test(navigator.userAgent))return;if(localStorage.getItem("dil"))return;
  var A={yon},n=((navigator.languages&&navigator.languages[0])||navigator.language||"en").slice(0,2).toLowerCase(),d=n==="az"?"tr":n;
  if(!A[d])d=A.en?"en":"{L}";localStorage.setItem("dil",d);if(d!=="{L}"&&A[d])location.replace(A[d]+location.search+location.hash);}}catch(e){{}}}})();</script>
  <title>{e(baslik)}</title>
  <meta name="description" content="{e(aciklama)}">{rb}
  <link rel="canonical" href="{SITE}{adres}">{alt}
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <meta property="og:type" content="{og_tur}">
  <meta property="og:site_name" content="Emin Seçilmiş Carpet">
  <meta property="og:locale" content="{OG[L]}">
  <meta property="og:title" content="{e(baslik)}">
  <meta property="og:description" content="{e(aciklama)}">
  <meta property="og:url" content="{SITE}{adres}">
  <meta property="og:image" content="{SITE}{gorsel}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Tajawal:wght@400;500;700;800&family=Manrope:wght@400;500;600;700;800&family=Noto+Sans+Georgian:wght@400;600;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="{surumlu("/css/style.css")}">{lds}
  <script async src="https://www.googletagmanager.com/gtag/js?id={GA}"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){{dataLayer.push(arguments);}}gtag('js',new Date());gtag('config','{GA}');</script>
</head>'''

def sayfa_yaz(L, adres, head, govde, aktif, alternatif):
    u, a = ust_alt(L, aktif, alternatif)
    icerik = u + govde + a
    icerik = link_isle(nitelik_isle(dil_isle(icerik, L), L), L)
    yon = "rtl" if L == "ar" else "ltr"
    sonu = f'''
<script>window.SITE={{dil:"{L}",urunler:"{yol("urunler", L)}"}};</script>
<script src="{surumlu("/js/ayarlar.js")}"></script>
<script src="{surumlu("/js/diller.js")}"></script>
<script src="{surumlu("/js/urunler.js")}"></script>
<script src="{surumlu("/js/app.js")}"></script>'''
    s = f'<!doctype html>\n<html lang="{L}" data-lang="{L}" dir="{yon}">\n{head}\n<body>\n{icerik}{sonu}\n</body>\n</html>\n'
    yaz(os.path.join(KOK, adres.strip("/"), "index.html"), s)
    HARITA.append((adres, alternatif))

HARITA = []
ORG = {"@context": "https://schema.org", "@type": ["Organization", "LocalBusiness"], "name": "Emin Seçilmiş Carpet",
       "legalName": AY.get("unvan"), "url": SITE + "/", "logo": SITE + "/img/logo.png", "image": SITE + "/img/og.jpg",
       "telephone": "+90 544 536 10 33", "address": {"@type": "PostalAddress", "streetAddress": "Başpınar OSB, Vali Muammer Güler Blv. OSB 2. Bölge No: 28/A",
       "postalCode": "27600", "addressLocality": "Şehitkamil", "addressRegion": "Gaziantep", "addressCountry": "TR"},
       "areaServed": ["TR", "Worldwide"], "description": "Gaziantep toptan halı tedarikçisi: makine halısı, kaymaz taban halı, sisal, yer döşemesi. Wholesale carpet supplier from Turkey."}

def sss_ld(govde):
    cift = re.findall(r"<details><summary>(.*?)</summary><p>(.*?)</p></details>", govde, re.S)
    if not cift: return []
    return [{"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": re.sub("<.*?>", "", q), "acceptedAnswer": {"@type": "Answer", "text": re.sub("<.*?>", "", a)}} for q, a in cift]}]

def kirinti(L, parcalar):
    return {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": i + 1, "name": ad, "item": SITE + p} for i, (ad, p) in enumerate(parcalar)]}

# ---------- Sayfalar ----------
def temizle():
    for L in DILLER:
        shutil.rmtree(os.path.join(KOK, L), ignore_errors=True)

def kaynak_sayfalar():
    for ad in KAYNAK_SAYFALAR:
        src = oku(os.path.join(K, ad + ".html"))
        main = re.search(r"<main\b.*?</main>", src, re.S).group(0)
        alternatif = {L: yol(ad, L) for L in DILLER}
        for L in DILLER:
            govde = main
            if ad == "urunler":
                govde = govde.replace('<div id="katalog" class="izgara"></div>',
                                      '<div id="katalog" class="izgara">' + "".join(kart(u, L) for u in URUNLER) + "</div>")
                liste = "".join(f'<a href="{urun_yolu(u, L)}">{e(urun_ad(u, L))}<span>{u["kod"]}</span></a>' for u in URUNLER)
                govde = govde.replace("</main>", f'''<section class="bolum bolum-gri"><div class="kap">
  <h2><span data-l="en">All product pages</span><span data-l="tr">Tüm ürün sayfaları</span></h2>
  <div class="urun-liste-link">{liste}</div></div></section>
</main>''')
            if ad == "index":
                seri = [u for u in URUNLER if u.get("etiket") == "seri"][:4]
                govde = govde.replace('<div id="vitrin" class="izgara"></div>', '<div id="vitrin" class="izgara">' + "".join(kart(u, L) for u in seri) + "</div>")
                if FUAR and BUGUN < FUAR["bitis"]:
                    govde = govde.replace("<!-- PAZARLAR -->", f'<a class="fuar-serit" href="fuar.html" data-bitis="{FUAR["bitis"]}"><span class="kap">{e(FUAR["duyuru"][L])}</span></a>' + chr(10) + "  <!-- PAZARLAR -->", 1)
            if ad == "ihracat" and PAZAR:
                P = PAZAR["metin"]
                govde = govde.replace("</main>", f'''<section class="bolum bolum-gri"><div class="kap dar">
  <h2>{e(P["h1"][L])}</h2><p>{e(P["alt"][L])}</p>
  <p><a class="btn btn-ikincil" href="pazar.html">{e(P["linkMetin"][L])} →</a></p>
</div></section>
</main>''')
            if ad == "yurtici" and L == "tr":
                govde = govde.replace("</main>", '''<section class="bolum"><div class="kap dar">
  <h2>Türkiye'nin 81 iline toptan halı</h2>
  <p>İstanbul'dan Van'a, Edirne'den Hakkari'ye her ile toptan halı, kaymaz taban halı ve yer döşemesi gönderiyoruz. İlinize göre sevkiyat bilgisi için <a href="il81.html">81 ile toptan halı sayfamıza</a> bakın.</p>
</div></section>
</main>''')
            baslik, aciklama = SEO[ad][L]
            ld = [ORG] if ad == "index" else []
            ld += sss_ld(dil_isle(govde, L))
            head = bas(L, baslik, aciklama, yol(ad, L), alternatif, ld, robots="noindex" if ad == "kvkk" else None)
            sayfa_yaz(L, yol(ad, L), head, govde, ad, alternatif)

ETIKET = {  # sabit küçük metinler (en, tr) – diğer diller ceviri/*.json
    "home": ("Home", "Ana sayfa"), "ihracat": ("Export", "İhracat"), "urunler": ("Collection", "Ürünler"), "boyut": ("Sizes (cm)", "Ebatlar (cm)"),
    "ozellik": ("Specifications", "Özellikler"), "wa": ("Get info on WhatsApp", "WhatsApp'tan bilgi al"),
    "tumu": ("All products", "Tüm ürünler"), "not": ("Wholesale only. Prices depend on quantity and destination.", "Sadece toptan satış. Fiyat; adet ve ödeme şekline göre değişir."),
    "benzer": ("Similar products", "Benzer ürünler"), "toptan": ("Wholesale", "Toptan"),
    "slogan": ("Wholesale carpet supplier from Gaziantep, Turkey. Invoiced sales, delivery to all 81 provinces and export worldwide.",
               "Gaziantep'ten toptan halı tedarikçisi. Faturalı satış, 81 ile sevkiyat ve dünyaya ihracat."),
    "blog_alt": ("Guides for carpet stores, flooring dealers and importers.", "Halı mağazaları, yer döşemesi bayileri ve ithalatçılar için rehberler."),
    "devam": ("Read more →", "Devamını oku →"), "diger": ("Other articles", "Diğer yazılar"),
    "soru": ("Do you have a question? Write to us and we will reply quickly.", "Sorunuz mu var? Bize yazın, hemen dönüş yapalım."),
    "yaz": ("Write on WhatsApp", "WhatsApp'tan yazın"), "okudum": ("Hello, I read your article:", "Merhaba, yazınızı okudum:"), "yazi": ("Article", "Yazı"),
}
def et(k, L): en, tr = ETIKET[k]; return cevir_en(en, L, tr)

AYLAR = {"tr": "Ocak Şubat Mart Nisan Mayıs Haziran Temmuz Ağustos Eylül Ekim Kasım Aralık",
         "en": "January February March April May June July August September October November December",
         "ar": "يناير فبراير مارس أبريل مايو يونيو يوليو أغسطس سبتمبر أكتوبر نوفمبر ديسمبر",
         "ru": "января февраля марта апреля мая июня июля августа сентября октября ноября декабря",
         "fr": "janvier février mars avril mai juin juillet août septembre octobre novembre décembre",
         "ka": "იანვარი თებერვალი მარტი აპრილი მაისი ივნისი ივლისი აგვისტო სექტემბერი ოქტომბერი ნოემბერი დეკემბერი"}
def tarih(iso, L):
    y, m, d = (int(x) for x in iso.split("-"))
    return f"{d} {AYLAR[L].split()[m - 1]} {y}"

def urun_sayfalari():
    for u in URUNLER:
        alternatif = {L: urun_yolu(u, L) for L in DILLER}
        r = resimler(u)
        for L in DILLER:
            ad, tur = urun_ad(u, L), cv(u.get("tur", ""), L)
            fotolar = "".join(f'<a href="{surum(g, "o")}" target="_blank" rel="noopener"><img src="{surum(g, "o" if i == 0 else "k")}" alt="{e(ad)} {u["kod"]} {i + 1}" loading="{"eager" if i == 0 else "lazy"}" decoding="async"></a>'
                              for i, g in enumerate(r[:10]))
            ozel = "".join(f'<dt>{e(etiket)}</dt><dd>{e(cv(u[k], L))}</dd>' for k, etiket in DILV[L]["oz"].items() if u.get(k))
            ebat = "".join(f"<li>{e(cv(x, L))}</li>" for x in u["ebatlar"])
            benzer = [x for x in URUNLER if x["kod"] != u["kod"] and x.get("tur") == u.get("tur")][:4]
            h1 = f"{ad} – {et('toptan', L)} {tur}" if L in ("tr", "en") else f"{ad} – {tur}"
            govde = f'''<main>
  <section class="sayfa-bas">
    <div class="sayfa-bas-gorsel" style="background-image:url({surum(r[0], "o") if r else "/img/o/hero/1.webp"})"></div>
    <div class="kap sayfa-bas-ic">
      <p class="yol-iz"><a href="index.html">{et("home", L)}</a> / <a href="urunler.html">{et("urunler", L)}</a> / {u["kod"]}</p>
      <h1>{e(h1)}</h1>
      <p>{u["kod"]} · {e(tur)}</p>
    </div>
  </section>
  <section class="bolum bolum-sayfa">
    <div class="kap urun-sayfa">
      <div class="urun-fotolar">{fotolar}</div>
      <div class="urun-bilgi-kutu detay">
        <p class="detay-kod">{u["kod"]}</p>
        <p class="detay-aciklama">{e(urun_aciklama(u, L))}</p>
        <p>{e(et("slogan", L))}</p>
        <h2>{et("boyut", L)}</h2>
        <ul class="ebat-liste">{ebat}</ul>
        {f'<h2>{et("ozellik", L)}</h2><dl class="ozellik">{ozel}</dl>' if ozel else ""}
        <div class="detay-butonlar">
          <a class="btn btn-wa" href="{e(wa_link(DILV[L]["wa"].replace("{U}", ad + " (" + u["kod"] + ")")))}" target="_blank" rel="noopener">{et("wa", L)}</a>
          <a class="btn btn-ikincil" href="urunler.html">{et("tumu", L)}</a>
        </div>
        <p class="detay-not">{et("not", L)}</p>
      </div>
    </div>
  </section>
  {f'<section class="bolum bolum-gri"><div class="kap"><div class="bolum-baslik"><h2>{et("benzer", L)}</h2></div><div class="izgara">{"".join(kart(x, L) for x in benzer)}</div></div></section>' if benzer else ""}
</main>'''
            tt = f"{et('toptan', L)} {tur}" if L in ("tr", "en") else f"{tur} {et('toptan', L).lower()}"
            baslik = f"{ad} ({u['kod']}) – {tt} | Emin Seçilmiş Carpet"
            aciklama = f"{urun_aciklama(u, L)} {et('slogan', L)}"
            ld = [{"@context": "https://schema.org", "@type": "Product", "name": ad, "sku": u["kod"], "category": tur,
                   "description": urun_aciklama(u, L), "image": [SITE + surum(g, "o") for g in r[:5]],
                   "brand": {"@type": "Brand", "name": "Emin Seçilmiş Carpet"}},
                  kirinti(L, [(et("home", L), yol("index", L)), (et("urunler", L), yol("urunler", L)), (ad, urun_yolu(u, L))])]
            head = bas(L, baslik, aciklama, urun_yolu(u, L), alternatif, ld, og_tur="product", gorsel=surum(r[0], "o") if r else "/img/og.jpg")
            sayfa_yaz(L, urun_yolu(u, L), head, govde, "urunler", alternatif)

def blog_sayfalari():
    def ydol(y, L): return yol("blog", L) + y["slug"]["tr" if L == "tr" else "en"] + "/"
    for L in DILLER:
        kartlar = "".join(f'''<a class="blog-kart" href="{ydol(y, L)}">
        <img src="{y["gorsel"]}" alt="{e(y["baslik"][L])}" loading="lazy" decoding="async">
        <div class="blog-kart-ic"><span class="blog-tarih">{tarih(y["tarih"], L)}</span><h2>{e(y["baslik"][L])}</h2><p>{e(y["ozet"][L])}</p><span class="btn-yazi">{et("devam", L)}</span></div>
      </a>''' for y in BLOG)
        govde = f'''<main>
  <section class="sayfa-bas"><div class="sayfa-bas-gorsel" style="background-image:url(/img/o/hero/4.webp)"></div>
    <div class="kap sayfa-bas-ic"><p class="yol-iz"><a href="index.html">{et("home", L)}</a> / Blog</p><h1>Blog</h1><p>{et("blog_alt", L)}</p></div></section>
  <section class="bolum bolum-sayfa"><div class="kap"><div class="blog-izgara">{kartlar}</div></div></section>
</main>'''
        alternatif = {L2: yol("blog", L2) for L2 in DILLER}
        baslik, aciklama = SEO["blog"][L]
        sayfa_yaz(L, yol("blog", L), bas(L, baslik, aciklama, yol("blog", L), alternatif), govde, "blog", alternatif)
    for y in BLOG:
        alternatif = {L: ydol(y, L) for L in DILLER}
        for L in DILLER:
            diger = "".join(f'<a href="{ydol(d, L)}">{e(d["baslik"][L])} →</a>' for d in BLOG if d is not y)
            govde = f'''<main>
  <section class="sayfa-bas"><div class="sayfa-bas-gorsel" style="background-image:url(/img/o/hero/4.webp)"></div>
    <div class="kap sayfa-bas-ic"><p class="yol-iz"><a href="index.html">{et("home", L)}</a> / <a href="blog.html">Blog</a> / {et("yazi", L)}</p><h1>{e(y["baslik"][L])}</h1><p>{tarih(y["tarih"], L)}</p></div></section>
  <section class="bolum bolum-sayfa"><article class="kap yazi">
    <img class="yazi-kapak" src="{y["gorsel"]}" alt="{e(y["baslik"][L])}" decoding="async">
    {y["icerik"][L]}
    <div class="yazi-cta"><p>{et("soru", L)}</p><a href="{e(wa_link(et("okudum", L) + " " + y["baslik"][L]))}" class="btn btn-wa" target="_blank" rel="noopener">{et("yaz", L)}</a></div>
    <div class="yazi-diger"><h3>{et("diger", L)}</h3>{diger}<a href="blog.html">Blog →</a></div>
  </article></section>
</main>'''
            ld = [{"@context": "https://schema.org", "@type": "BlogPosting", "headline": y["baslik"][L], "description": y["ozet"][L],
                   "image": SITE + y["gorsel"], "datePublished": y["tarih"], "inLanguage": L, "mainEntityOfPage": SITE + ydol(y, L),
                   "author": {"@type": "Organization", "name": "Emin Seçilmiş Carpet"}, "publisher": {"@type": "Organization", "name": "Emin Seçilmiş Carpet", "logo": {"@type": "ImageObject", "url": SITE + "/img/logo.png"}}}]
            head = bas(L, y["baslik"][L] + " | Emin Seçilmiş Carpet", y["ozet"][L], ydol(y, L), alternatif, ld, og_tur="article", gorsel=y["gorsel"])
            sayfa_yaz(L, ydol(y, L), head, govde, "blog", alternatif)

BOLGELER = [
    ("Marmara Bölgesi", "İstanbul, Bursa, Kocaeli, Tekirdağ, Balıkesir, Sakarya, Çanakkale, Edirne, Kırklareli, Yalova, Bilecik"),
    ("İç Anadolu Bölgesi", "Ankara, Konya, Kayseri, Eskişehir, Sivas, Aksaray, Karaman, Kırıkkale, Kırşehir, Nevşehir, Niğde, Yozgat, Çankırı"),
    ("Ege Bölgesi", "İzmir, Manisa, Aydın, Denizli, Muğla, Afyonkarahisar, Kütahya, Uşak"),
    ("Akdeniz Bölgesi", "Antalya, Adana, Mersin, Hatay, Kahramanmaraş, Osmaniye, Isparta, Burdur"),
    ("Güneydoğu Anadolu Bölgesi", "Gaziantep, Şanlıurfa, Diyarbakır, Mardin, Batman, Adıyaman, Siirt, Şırnak, Kilis"),
    ("Karadeniz Bölgesi", "Samsun, Trabzon, Ordu, Zonguldak, Rize, Giresun, Tokat, Çorum, Amasya, Kastamonu, Düzce, Bolu, Karabük, Bartın, Sinop, Artvin, Gümüşhane, Bayburt"),
    ("Doğu Anadolu Bölgesi", "Erzurum, Van, Malatya, Elazığ, Ağrı, Kars, Muş, Bitlis, Bingöl, Erzincan, Hakkari, Iğdır, Ardahan, Tunceli"),
]

def il81_sayfasi():
    assert sum(len(b[1].split(", ")) for b in BOLGELER) == 81
    bolumler = '<div class="bolgeler">' + "".join(f'<details class="bolge-ac"><summary>{b} toptan halı <small>{len(iller.split(", "))} il</small></summary><ul class="il-liste">' +
                       "".join(f'<li><a href="{e(wa_link("Merhaba, " + il + " için toptan halı fiyat listesi almak istiyorum."))}" target="_blank" rel="noopener">{il}</a></li>' for il in iller.split(", ")) + "</ul></details>" for b, iller in BOLGELER) + "</div>"
    govde = f'''<main>
  <section class="sayfa-bas"><div class="sayfa-bas-gorsel" style="background-image:url(/img/o/hakkimizda/konteyner-2.webp)"></div>
    <div class="kap sayfa-bas-ic"><p class="yol-iz"><a href="index.html">Ana sayfa</a> / <a href="yurtici.html">Yurt İçi</a> / 81 il</p>
    <h1>81 ile toptan halı tedariki</h1><p>Hangi ilde olursanız olun, Gaziantep'ten toptan halı, kaymaz taban halı ve yer döşemesi tedarikçiniz.</p></div></section>
  <section class="bolum bolum-sayfa"><div class="kap dar tanitim">
    <p>Emin Seçilmiş Carpet, Gaziantep Başpınar Organize Sanayi Bölgesi'ndeki deposundan Türkiye'nin 81 iline toptan halı gönderen bir halı toptancısı ve tedarikçisidir. Halı mağazalarına, mobilyacılara, yer döşemesi bayilerine, otellere ve proje firmalarına makine halısı, dijital baskı kaymaz taban halı, rulo halı, sisal ve yapboz halı tedarik ediyoruz.</p>
    <p>Tüm satışlarımız faturalıdır. Siparişler anlaşmalı ambar ve kargo firmalarıyla ilinize gönderilir; kargo ve nakliye ücreti alıcıya aittir. En az sipariş bir balyadır, üst sınır yoktur. Stoktaki ürünler hızlıca, üretim siparişleri ise istediğiniz ebat ve ağırlıkta hazırlanır.</p>
    <p>Aşağıda hizmet verdiğimiz tüm illeri bölgelere göre bulabilirsiniz. <b>Bölgenizi açıp ilinize dokunun</b>, WhatsApp'tan size güncel toptan fiyat listesini gönderelim.</p>
    <div class="butonlar"><a href="#" class="btn btn-wa" data-wa-en="Hello" data-wa-tr="Merhaba, toptan halı fiyat listesi almak istiyorum. İlim: ">WhatsApp'tan fiyat alın</a><a href="urunler.html" class="btn btn-ikincil">Ürünleri gör →</a></div>
    {bolumler}
    <h3 class="sss-baslik">Sık sorulan sorular</h3>
    <details><summary>Bulunduğum ile toptan halı gönderiyor musunuz?</summary><p>Evet. Türkiye'nin 81 ilinin tamamına anlaşmalı ambar ve kargo firmalarıyla gönderim yapıyoruz.</p></details>
    <details><summary>En az ne kadar sipariş vermem gerekir?</summary><p>En az bir balya (bir çuval) sipariş verebilirsiniz. Üst sınır yoktur.</p></details>
    <details><summary>Faturalı satış yapıyor musunuz?</summary><p>Evet, tüm satışlarımız faturalıdır (e-fatura / e-arşiv).</p></details>
    <details><summary>Kaymaz taban halı ve yer döşemesi de var mı?</summary><p>Evet. Dijital baskı kaymaz taban halı ve kaymaz taban rulo halı istediğiniz ebat ve ağırlıkta üretilir.</p></details>
  </div></section>
</main>'''
    alternatif = {"tr": yol("il81", "tr")}
    baslik, aciklama = SEO["il81"]["tr"]
    head = bas("tr", baslik, aciklama, yol("il81", "tr"), alternatif, [ORG] + sss_ld(govde))
    sayfa_yaz("tr", yol("il81", "tr"), head, govde, "yurtici", alternatif)

def fuar_sayfasi():
    if not FUAR: return
    F = FUAR
    alternatif = {L: yol("fuar", L) for L in DILLER}
    secili = [u for k in ("AKS-004", "AKS-006", "AKS-001", "AKS-011") for u in URUNLER if u["kod"] == k]
    for L in DILLER:
        govde = f'''<main>
  <section class="sayfa-bas"><div class="sayfa-bas-gorsel" style="background-image:url(/img/o/hero/2.webp)"></div>
    <div class="kap sayfa-bas-ic"><p class="yol-iz"><a href="index.html">{et("home", L)}</a> / ICFE 2027</p>
    <h1>{e(F["h1"][L])}</h1><p>{e(F["alt"][L])}</p>
    <div class="butonlar" style="margin-top:22px"><a class="btn btn-wa" href="{e(wa_link(F["wa"][L]))}" target="_blank" rel="noopener">{e(F["buton"][L])}</a></div></div></section>
  <section class="bolum bolum-sayfa"><article class="kap yazi">{F["icerik"][L]}
    <div class="yazi-cta"><p>{e(F["alt"][L])}</p><a class="btn btn-wa" href="{e(wa_link(F["wa"][L]))}" target="_blank" rel="noopener">{e(F["buton"][L])}</a></div>
  </article></section>
  <section class="bolum bolum-gri"><div class="kap"><div class="bolum-baslik"><h2>{e(F["urunler_baslik"][L])}</h2></div>
    <div class="izgara">{"".join(kart(u, L) for u in secili)}</div></div></section>
</main>'''
        head = bas(L, F["baslik"][L], F["aciklama"][L], yol("fuar", L), alternatif, [ORG])
        sayfa_yaz(L, yol("fuar", L), head, govde, "", alternatif)

def pazar_sayfasi():
    if not PAZAR: return
    P, M_ = PAZAR, PAZAR["metin"]
    kodlar = sorted({k for b in P["bolgeler"] for k in b["ulkeler"]} | set(P["baslica"]))
    js = "const k=%s,o={};for(const l of %s){o[l]={};for(const c of k)o[l][c]=new Intl.DisplayNames([l],{type:'region'}).of(c)}process.stdout.write(JSON.stringify(o))" % (json.dumps(kodlar), json.dumps(DILLER))
    UL = json.loads(subprocess.run(["node", "-e", js], capture_output=True, check=True).stdout.decode("utf-8"))
    sira = P["dil_sirasi"]
    def cip(ad, L, sinif=""):
        return f'<li><a{sinif} href="{e(wa_link(M_["wa"][L].replace("{YER}", ad)))}" target="_blank" rel="noopener">{e(ad)}</a></li>'
    alternatif = {L: yol("pazar", L) for L in DILLER}
    for L in DILLER:
        baslica = "".join(cip(UL[L][c], L, ' class="vurgu"') for c in P["baslica"])
        bolumler = ""
        for b in P["bolgeler"]:
            ulk = "".join(cip(UL[L][c], L) for c in b["ulkeler"])
            seh = "".join(cip(x.split("|")[sira.index(L)], L) for x in b["sehirler"])
            sayi = f'{e(M_["ulkeler"][L])}: {len(b["ulkeler"])} · {e(M_["sehirler"][L])}: {len(b["sehirler"])}'
            bolumler += f'''<details class="bolge-ac"><summary>{e(b["ad"][L])} <small>{sayi}</small></summary>
      <p>{e(b["metin"][L])}</p>
      <h3 class="pazar-alt">{e(M_["ulkeler"][L])}</h3><ul class="il-liste">{ulk}</ul>
      <h3 class="pazar-alt">{e(M_["sehirler"][L])}</h3><ul class="il-liste">{seh}</ul></details>'''
        govde = f'''<main>
  <section class="sayfa-bas"><div class="sayfa-bas-gorsel" style="background-image:url(/img/o/hakkimizda/konteyner-1.webp)"></div>
    <div class="kap sayfa-bas-ic"><p class="yol-iz"><a href="index.html">{et("home", L)}</a> / <a href="ihracat.html">{et("ihracat", L)}</a> / {e(M_["link"][L])}</p>
    <h1>{e(M_["h1"][L])}</h1><p>{e(M_["alt"][L])}</p></div></section>
  <section class="bolum bolum-sayfa"><div class="kap dar tanitim">
    <p>{e(M_["giris"][L])}</p>
    <p class="pazar-ipucu">{e(M_["ipucu"][L])}</p>
    <div class="il-bolge"><h2>{e(M_["baslica"][L])}</h2><ul class="il-liste">{baslica}</ul></div>
    <div class="bolgeler">{bolumler}</div>
    <div class="yazi-cta" style="margin-top:40px"><p>{e(M_["not"][L])}</p><a class="btn btn-wa" href="{e(wa_link(M_["wa"][L].replace("{YER}", "…")))}" target="_blank" rel="noopener">{et("yaz", L)}</a></div>
  </div></section>
</main>'''
        head = bas(L, P["seo"][L][0], P["seo"][L][1], yol("pazar", L), alternatif, [ORG])
        sayfa_yaz(L, yol("pazar", L), head, govde, "ihracat", alternatif)

def kok_sayfalar():
    # Ana adres: ziyaretçinin diline göre yönlendirir (x-default)
    linkler = "".join(f'<a href="/{L}/" hreflang="{L}" lang="{L}">{DIL_AD[L]}</a> ' for L in DILLER)
    alt = "".join(f'<link rel="alternate" hreflang="{L}" href="{SITE}/{L}/">' for L in DILLER)
    yaz(os.path.join(KOK, "index.html"), f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Emin Seçilmiş Carpet – Toptan Halı / Wholesale Carpets from Turkey</title>
<meta name="description" content="{e(SEO["index"]["tr"][1])}">
<link rel="canonical" href="{SITE}/">{alt}<link rel="alternate" hreflang="x-default" href="{SITE}/">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<script>(function(){{var d=["tr","en","ar","ru","fr","ka"],k;try{{k=localStorage.getItem("dil")}}catch(e){{}}
var n=(navigator.language||"en").slice(0,2).toLowerCase();var s=d.indexOf(k)>-1?k:d.indexOf(n)>-1?n:(n==="az"?"tr":"en");location.replace("/"+s+"/"+location.search+location.hash);}})();</script>
<style>body{{font-family:system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;margin:0;background:#fafaf8}}a{{margin:6px;color:#151515}}</style>
</head><body><main><h1>Emin Seçilmiş Carpet</h1><p>{linkler}</p></main></body></html>
''')
    # Eski adresler yeni Türkçe sayfalara yönlenir
    for ad in KAYNAK_SAYFALAR[1:]:
        h = SITE + yol(ad, "tr")
        yaz(os.path.join(KOK, ad + ".html"), f'<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>Emin Seçilmiş Carpet</title><link rel="canonical" href="{h}"><meta http-equiv="refresh" content="0; url={h}"><script>location.replace("{yol(ad, "tr")}"+location.hash)</script></head><body><a href="{h}">{h}</a></body></html>\n')

def site_haritasi():
    satir = []
    for adres, alternatif in HARITA:
        if "noindex" in oku(os.path.join(KOK, adres.strip("/"), "index.html"))[:3000]: continue
        alt = "".join(f'<xhtml:link rel="alternate" hreflang="{L}" href="{SITE}{p}"/>' for L, p in alternatif.items()) if len(alternatif) > 1 else ""
        satir.append(f"  <url><loc>{SITE}{adres}</loc><lastmod>{BUGUN}</lastmod>{alt}</url>")
    yaz(os.path.join(KOK, "sitemap.xml"), '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' + "\n".join(satir) + "\n</urlset>\n")

if __name__ == "__main__":
    temizle()
    kaynak_sayfalar()
    urun_sayfalari()
    blog_sayfalari()
    il81_sayfasi()
    fuar_sayfasi()
    pazar_sayfasi()
    kok_sayfalar()
    site_haritasi()
    print(f"Tamam: {len(HARITA)} sayfa üretildi.")
    if "--eksik" in sys.argv:
        json.dump({L: sorted(v) for L, v in EKSIK.items() if v}, open(os.path.join(K, "ceviri", "_eksik.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    for L, v in EKSIK.items():
        if v: print(f"  {L}: {len(v)} metnin çevirisi yok (İngilizce görünecek)")

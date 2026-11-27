# -*- coding: utf-8 -*-
"""
Dijital ürün kataloğu (PDF): İngilizce, Arapça, Rusça.
Ürün bilgileri sitenin kendi verisinden (js/urunler.js, js/diller.js) gelir.
Çalıştırma (site klasöründe): python _fuar/katalog_olustur.py
"""
import os, sys, html, subprocess, importlib.util, pathlib

KLASOR = os.path.dirname(os.path.abspath(__file__))
KOK = os.path.dirname(KLASOR)
spec = importlib.util.spec_from_file_location("olustur", os.path.join(KOK, "_kaynak", "olustur.py"))
O = importlib.util.module_from_spec(spec); spec.loader.exec_module(O)
e = html.escape
EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

M = {
 "en": dict(kapak="Wholesale Carpet Catalogue", alt="Machine-made rugs · Non-slip rugs · Roll carpets · Sisal · Puzzle rugs",
            sirket="Akik Halı San. ve Tic. Ltd. Şti. · Gaziantep, Türkiye", ebat="Sizes (cm)", fiyat="Prices on request — write to us on WhatsApp.",
            kosul="Export terms", moq="Minimum order", teslim="Delivery terms", odeme="Payment", sure="Lead time", belge="Documents", etiket="Private label",
            iletisim="Contact", site="Website · 6 languages", wa="WhatsApp", adres="Address", icfe="ICFE 2027 · 6–9 January 2027 · Istanbul — let's meet",
            urunler="Products", sayfa="Page", oz="Specifications"),
 "ar": dict(kapak="كتالوج السجاد بالجملة", alt="سجاد آلي · سجاد مانع للانزلاق · سجاد رول · سيزال · سجاد بازل",
            sirket="Akik Halı San. ve Tic. Ltd. Şti. · غازي عنتاب، تركيا", ebat="المقاسات (سم)", fiyat="الأسعار عند الطلب — راسلنا عبر واتساب.",
            kosul="شروط التصدير", moq="الحد الأدنى للطلب", teslim="شروط التسليم", odeme="الدفع", sure="مدة التجهيز", belge="المستندات", etiket="علامة خاصة",
            iletisim="اتصل بنا", site="الموقع · 6 لغات", wa="واتساب", adres="العنوان", icfe="ICFE 2027 · 6–9 يناير 2027 · إسطنبول — لنلتقِ",
            urunler="المنتجات", sayfa="صفحة", oz="المواصفات"),
 "ru": dict(kapak="Каталог ковров оптом", alt="Машинные ковры · Нескользящие ковры · Рулонные ковры · Сизаль · Ковры-пазлы",
            sirket="Akik Halı San. ve Tic. Ltd. Şti. · Газиантеп, Турция", ebat="Размеры (см)", fiyat="Цены по запросу — напишите нам в WhatsApp.",
            kosul="Условия экспорта", moq="Минимальный заказ", teslim="Условия поставки", odeme="Оплата", sure="Сроки", belge="Документы", etiket="Собственная марка",
            iletisim="Контакты", site="Сайт · 6 языков", wa="WhatsApp", adres="Адрес", icfe="ICFE 2027 · 6–9 января 2027 · Стамбул — давайте встретимся",
            urunler="Товары", sayfa="Стр.", oz="Характеристики"),
}

import tempfile
from PIL import Image
GECICI = os.path.join(tempfile.gettempdir(), "emin-katalog-foto")
os.makedirs(GECICI, exist_ok=True)

def yerel(yol_, uzun=1000):  # /img/... -> küçültülmüş JPEG (PDF boyutu küçük kalsın)
    kaynak = pathlib.Path(KOK, yol_.lstrip("/"))
    hedef = pathlib.Path(GECICI, yol_.strip("/").replace("/", "_") + f"-{uzun}.jpg")
    if not hedef.exists():
        im = Image.open(kaynak).convert("RGB")
        im.thumbnail((uzun, uzun))
        im.save(hedef, "JPEG", quality=78, optimize=True, progressive=True)
    return hedef.as_uri()

CSS = """
@page { size: A4; margin: 0; }
* { box-sizing: border-box; }
body { margin: 0; font-family: "Segoe UI", Arial, sans-serif; color: #151515; }
.sayfa { width: 210mm; height: 297mm; padding: 16mm 15mm; position: relative; page-break-after: always; overflow: hidden; }
.kapak { padding: 0; background: #141414; color: #fff; }
.kapak img.arka { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: .9; }
.kapak::after { content: ""; position: absolute; inset: 0; background: linear-gradient(0deg, rgba(10,10,10,.92) 0%, rgba(10,10,10,.75) 38%, rgba(10,10,10,0) 70%); }
.kapak .ic { z-index: 1; position: absolute; left: 15mm; right: 15mm; bottom: 22mm; }
.kapak .marka { font-family: Georgia, "Times New Roman", serif; font-size: 40pt; font-weight: 700; margin: 0; }
.kapak .marka small { display: block; font-family: "Segoe UI", Arial, sans-serif; font-size: 10pt; letter-spacing: 6px; color: #b8925a; font-weight: 700; margin-top: 4px; }
.kapak h1 { font-size: 24pt; margin: 18mm 0 4mm; }
.kapak p { margin: 2mm 0; font-size: 11pt; color: #e8e6e0; }
.icfe { display: inline-block; margin-top: 8mm; background: #b5532c; color: #fff; padding: 3mm 5mm; border-radius: 3mm; font-weight: 700; font-size: 10.5pt; }
.ust { display: flex; justify-content: space-between; align-items: baseline; border-bottom: 1.5px solid #b8925a; padding-bottom: 3mm; margin-bottom: 7mm; font-size: 9pt; color: #6b6a65; }
.ust b { color: #151515; font-size: 11pt; }
.urun { display: grid; grid-template-columns: 78mm 1fr; gap: 8mm; height: 122mm; margin-bottom: 7mm; }
.urun img { width: 78mm; height: 122mm; object-fit: cover; border-radius: 3mm; background: #f1f0ec; }
.kod { color: #b5532c; font-weight: 800; font-size: 10pt; letter-spacing: 1px; }
.urun h2 { font-size: 18pt; margin: 1mm 0 2mm; line-height: 1.15; }
.tur { color: #6b6a65; font-size: 10pt; margin: 0 0 4mm; }
.acik { font-size: 10.5pt; line-height: 1.5; margin: 0 0 4mm; }
h3 { font-size: 9.5pt; text-transform: uppercase; letter-spacing: 1px; color: #6b6a65; margin: 4mm 0 2mm; }
.ebat { display: flex; flex-wrap: wrap; gap: 1.6mm; }
.ebat span { border: 1px solid #d9d6cf; border-radius: 20px; padding: 1mm 3mm; font-size: 9pt; font-weight: 600; }
dl { display: grid; grid-template-columns: auto 1fr; gap: 1mm 4mm; font-size: 9.5pt; margin: 0; }
dt { color: #6b6a65; } dd { margin: 0; font-weight: 600; }
.alt-not { position: absolute; bottom: 9mm; left: 15mm; right: 15mm; display: flex; justify-content: space-between; font-size: 8.5pt; color: #6b6a65; }
table { width: 100%; border-collapse: collapse; font-size: 10.5pt; }
td { padding: 3.2mm 0; border-bottom: 1px solid #e6e4de; vertical-align: top; }
td:first-child { width: 48mm; color: #6b6a65; font-weight: 600; }
.qr { display: flex; gap: 14mm; margin-top: 10mm; }
.qr div { text-align: center; font-size: 9.5pt; font-weight: 700; } .qr img { width: 42mm; height: 42mm; display: block; margin-bottom: 2mm; }
.qr small { display: block; font-weight: 400; color: #6b6a65; }
[dir=rtl] .urun { direction: rtl; } [dir=rtl] td:first-child { padding-left: 4mm; }
"""

def katalog(L):
    T = M[L]
    yon = "rtl" if L == "ar" else "ltr"
    dil = lambda s: O.cv(s, L)
    sayfalar = [f'''<section class="sayfa kapak">
  <img class="arka" src="{yerel("/img/o/hero/1.webp", 1600)}">
  <div class="ic"><p class="marka" dir="ltr">Emin Seçilmiş<small>CARPET</small></p>
  <h1>{e(T["kapak"])}</h1><p>{e(T["alt"])}</p><p>{e(T["sirket"])}</p>
  <p dir="ltr">eminsecilmiscarpet.com · +90 544 536 10 33</p>
  <span class="icfe">{e(T["icfe"])}</span></div></section>''']
    urunler = O.URUNLER
    for i in range(0, len(urunler), 2):
        bloklar = ""
        for u in urunler[i:i + 2]:
            r = O.resimler(u)
            foto = f'<img src="{yerel(O.surum(r[0], "o"))}">' if r else "<div></div>"
            oz = "".join(f"<dt>{e(et)}</dt><dd>{e(dil(u[k]))}</dd>" for k, et in O.DILV[L]["oz"].items() if u.get(k))
            bloklar += f'''<div class="urun">{foto}<div>
  <span class="kod" dir="ltr">{u["kod"]}</span><h2>{e(O.urun_ad(u, L))}</h2><p class="tur">{e(dil(u.get("tur", "")))}</p>
  <p class="acik">{e(O.urun_aciklama(u, L))}</p>
  <h3>{e(T["ebat"])}</h3><div class="ebat">{"".join(f"<span>{e(dil(x))}</span>" for x in u["ebatlar"])}</div>
  {f'<h3>{e(T["oz"])}</h3><dl>{oz}</dl>' if oz else ""}</div></div>'''
        no = i // 2 + 2
        sayfalar.append(f'''<section class="sayfa"><div class="ust"><b dir="ltr">Emin Seçilmiş Carpet</b><span>{e(T["urunler"])}</span></div>{bloklar}
  <div class="alt-not"><span>{e(T["fiyat"])}</span><span>{e(T["sayfa"])} {no}</span></div></section>''')
    satir = lambda b, k: f"<tr><td>{e(b)}</td><td>{e(O.ayar(k, L))}</td></tr>"
    sayfalar.append(f'''<section class="sayfa"><div class="ust"><b dir="ltr">Emin Seçilmiş Carpet</b><span>{e(T["kosul"])}</span></div>
  <h2 style="font-size:20pt;margin:0 0 6mm">{e(T["kosul"])}</h2>
  <table>{satir(T["moq"], "ihracat.moq")}{satir(T["teslim"], "ihracat.teslimSekli")}{satir(T["odeme"], "ihracat.odeme")}
  {satir(T["sure"], "ihracat.sure")}{satir(T["belge"], "ihracat.belgeler")}{satir(T["etiket"], "ihracat.ozelEtiket")}</table>
  <h2 style="font-size:20pt;margin:14mm 0 4mm">{e(T["iletisim"])}</h2>
  <table><tr><td>{e(T["wa"])}</td><td dir="ltr">+90 544 536 10 33 — Emin Seçilmiş</td></tr>
  <tr><td>{e(T["adres"])}</td><td>{e(O.AY["adres"])}</td></tr><tr><td>Web</td><td dir="ltr">eminsecilmiscarpet.com</td></tr></table>
  <div class="qr"><div><img src="{pathlib.Path(KLASOR, "qr-site.png").as_uri()}">{e(T["site"])}<small dir="ltr">eminsecilmiscarpet.com</small></div>
  <div><img src="{pathlib.Path(KLASOR, "qr-whatsapp.png").as_uri()}">{e(T["wa"])}<small dir="ltr">+90 544 536 10 33</small></div></div>
  <div class="alt-not"><span>{e(T["sirket"])}</span><span>{e(T["sayfa"])} {len(sayfalar) + 1}</span></div></section>''')
    belge = f'<!doctype html><html lang="{L}" dir="{yon}"><head><meta charset="utf-8"><title>Emin Seçilmiş Carpet – {e(T["kapak"])}</title><style>{CSS}</style></head><body>{"".join(sayfalar)}</body></html>'
    h = os.path.join(KLASOR, f"katalog-{L}.html")
    open(h, "w", encoding="utf-8").write(belge)
    pdf = os.path.join(KLASOR, f"Emin-Secilmis-Carpet-Katalog-{L.upper()}.pdf")
    subprocess.run([EDGE, "--headless", "--disable-gpu", "--no-pdf-header-footer", "--allow-file-access-from-files",
                    f"--print-to-pdf={pdf}", pathlib.Path(h).as_uri()], check=True, capture_output=True, timeout=180)
    os.remove(h)
    return pdf

if __name__ == "__main__":
    for L in (sys.argv[1:] or ["en", "ar", "ru"]):
        p = katalog(L)
        print(L, os.path.basename(p), round(os.path.getsize(p) / 1e6, 1), "MB")

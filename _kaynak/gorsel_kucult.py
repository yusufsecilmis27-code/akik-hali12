# -*- coding: utf-8 -*-
"""
Ürün fotoğraflarının küçük sürümlerini üretir (sadece eksik olanları):
  img/seri/x.jpg -> img/k/seri/x.webp (kartlar, 400 px genişlik)
                 -> img/o/seri/x.webp (galeri, en fazla 1000 px genişlik)
Çalıştırma: python _kaynak/gorsel_kucult.py
"""
import os
from PIL import Image, ImageOps

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KLASORLER = ["seri", "spot", "hakkimizda", "hero"]
UZANTI = (".jpg", ".jpeg", ".png", ".webp")

def kucult(kaynak, hedef, genislik):
    if os.path.exists(hedef):
        return False
    os.makedirs(os.path.dirname(hedef), exist_ok=True)
    im = ImageOps.exif_transpose(Image.open(kaynak)).convert("RGB")
    if im.width > genislik:
        im = im.resize((genislik, round(im.height * genislik / im.width)), Image.LANCZOS)
    im.save(hedef, "WEBP", quality=82, method=6)
    return True

yeni = 0
for k in KLASORLER:
    d = os.path.join(KOK, "img", k)
    if not os.path.isdir(d):
        continue
    for f in sorted(os.listdir(d)):
        if not f.lower().endswith(UZANTI):
            continue
        ad = os.path.splitext(f)[0] + ".webp"
        kaynak = os.path.join(d, f)
        yeni += kucult(kaynak, os.path.join(KOK, "img", "k", k, ad), 400)
        yeni += kucult(kaynak, os.path.join(KOK, "img", "o", k, ad), 1000)
print(f"Küçük sürüm: {yeni} yeni dosya")

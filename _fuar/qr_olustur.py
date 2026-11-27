# -*- coding: utf-8 -*-
"""Kartvizit QR kodları ve kartvizit arka yüzü (PDF). Çalıştırma: python _fuar/qr_olustur.py"""
import os, urllib.parse
import qrcode, qrcode.image.svg
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

KLASOR = os.path.dirname(os.path.abspath(__file__))
SITE = "https://eminsecilmiscarpet.com/?utm_source=kartvizit&utm_medium=qr&utm_campaign=icfe2027"
WA = "https://wa.me/905445361033?text=" + urllib.parse.quote("Hello, we met at ICFE 2027.")
KOYU, ALTIN = "#141414", "#b8925a"

def qr(veri, ad):
    q = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_Q, box_size=40, border=2)
    q.add_data(veri); q.make(fit=True)
    q.make_image(fill_color=KOYU, back_color="white").save(os.path.join(KLASOR, ad + ".png"))
    q.make_image(image_factory=qrcode.image.svg.SvgPathImage).save(os.path.join(KLASOR, ad + ".svg"))
    return os.path.join(KLASOR, ad + ".png")

site_png = qr(SITE, "qr-site")
wa_png = qr(WA, "qr-whatsapp")

# Kartvizit arka yüzü: 85 x 55 mm, 3 mm taşma payı (kesim için)
pdfmetrics.registerFont(TTFont("Arial", r"C:\Windows\Fonts\arial.ttf"))
pdfmetrics.registerFont(TTFont("ArialB", r"C:\Windows\Fonts\arialbd.ttf"))
T = 3 * mm
G, Y = 85 * mm + 2 * T, 55 * mm + 2 * T
c = canvas.Canvas(os.path.join(KLASOR, "kartvizit-arka-yuz.pdf"), pagesize=(G, Y))
c.setTitle("Emin Seçilmiş Carpet – kartvizit arka yüz")
c.setFillColor("white"); c.rect(0, 0, G, Y, stroke=0, fill=1)
boy = 30 * mm
for i, (png, baslik, alt) in enumerate([(site_png, "Website · 6 languages", "eminsecilmiscarpet.com"),
                                        (wa_png, "WhatsApp", "+90 544 536 10 33")]):
    x = T + 6 * mm + i * 40 * mm
    c.drawImage(ImageReader(png), x, T + 15 * mm, boy, boy)
    c.setFillColor(KOYU); c.setFont("ArialB", 7.5); c.drawCentredString(x + boy / 2, T + 10.5 * mm, baslik)
    c.setFillColor("#6b6a65"); c.setFont("Arial", 6.5); c.drawCentredString(x + boy / 2, T + 7 * mm, alt)
c.setFillColor(ALTIN); c.setFont("ArialB", 6.5)
c.drawCentredString(G / 2, T + 2.8 * mm, "TR · EN · AR · RU · FR · KA   —   ICFE 2027 Istanbul")
c.showPage(); c.save()
print("Tamam:", ", ".join(sorted(f for f in os.listdir(KLASOR) if not f.endswith(".py"))))

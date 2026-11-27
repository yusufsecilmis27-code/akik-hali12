// "Ürün Ekle" uygulamasının telefona kurulabilmesi için gereken basit hizmet çalışanı.
// Her zaman internetten günceli alır; önbellek kullanmaz.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});

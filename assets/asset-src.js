/* ============================================================
   asset-src.js — resolver aset gambar UNIVERSAL (webp/png/jpg/jpeg)
   ------------------------------------------------------------
   Tujuan: kalau file gambar diganti/dikompres ke format lain
   (mis. biru.png diganti biru.webp, atau sebaliknya), kode TETAP
   jalan tanpa perlu diubah. Cukup sebut nama TANPA ekstensi
   (atau dengan ekstensi apa saja — akan dinormalisasi).

   Dimuat PALING AWAL (sebelum script lain) supaya window.ZaiAsset
   sudah siap dipakai semua modul.

   API:
     ZaiAsset.exts                     → daftar ekstensi (urut preferensi)
     ZaiAsset.resolve('biru')          → Promise<string> URL yg BENAR-BENAR ada
                                          (fallback ke webp bila tak satupun ketemu)
     ZaiAsset.img(imgEl, 'biru')       → set src + pasang fallback onerror berantai
     ZaiAsset.fallback(imgEl)          → pasang fallback onerror utk <img> yg src-nya
                                          sudah diisi (coba ekstensi lain bila gagal)
     ZaiAsset.bg(el, 'dekstop')        → set background-image el ke URL yg ada
     ZaiAsset.tag('biru', 'kelas x')   → string <img> siap-tempel dgn fallback bawaan
   ============================================================ */
(function(){
  if (window.ZaiAsset) return;

  var EXTS = ['webp','png','jpg','jpeg'];
  var RE_EXT = /\.(webp|png|jpe?g)$/i;

  /* buang ekstensi gambar bila ada → dapat "base" tanpa ekstensi */
  function baseOf(name){ return String(name).replace(RE_EXT, ''); }

  /* daftar kandidat URL utk sebuah nama, urut preferensi.
     Bila nama sudah punya ekstensi, ekstensi itu didahulukan. */
  function candidates(name){
    var base = baseOf(name);
    var given = (String(name).match(RE_EXT) || [null])[0];
    var order = EXTS.slice();
    if (given){
      var g = given.slice(1).toLowerCase();
      if (g === 'jpeg') g = 'jpeg';
      order = order.filter(function(e){ return e !== g; });
      order.unshift(g);
    }
    return order.map(function(e){ return base + '.' + e; });
  }

  /* cek keberadaan 1 URL via HEAD (tanpa mengunduh isi gambar) */
  function head(url){
    return fetch(url, { method:'HEAD' })
      .then(function(r){ return (r && r.ok) ? url : null; })
      .catch(function(){ return null; });
  }

  var cache = Object.create(null);

  /* resolve → URL pertama yg ADA. Hasil di-cache per-base. */
  function resolve(name){
    var base = baseOf(name);
    if (cache[base]) return cache[base];
    var list = candidates(name);
    var p = (function next(i){
      if (i >= list.length) return Promise.resolve(list[0]); // fallback: kandidat teratas
      return head(list[i]).then(function(hit){ return hit || next(i+1); });
    })(0);
    cache[base] = p;
    return p;
  }

  /* pasang fallback berantai pada <img>: bila src gagal dimuat,
     coba ekstensi lain satu per satu sebelum menyerah. */
  function attachFallback(img, name){
    var list = candidates(name || img.getAttribute('src') || '');
    var i = 0;
    // mulai dari kandidat yg cocok dgn src sekarang (bila ada)
    var cur = img.getAttribute('src');
    if (cur){
      var idx = list.indexOf(cur);
      if (idx >= 0) i = idx;
    }
    img.addEventListener('error', function onErr(){
      i++;
      if (i < list.length){ img.src = list[i]; }
      else { img.removeEventListener('error', onErr); } // sudah mentok, biarkan
    });
  }

  function img(imgEl, name){
    var list = candidates(name);
    imgEl.src = list[0];
    attachFallback(imgEl, name);
    return imgEl;
  }

  function bg(el, name){
    return resolve(name).then(function(url){
      el.style.backgroundImage = 'url("' + url + '")';
      return url;
    });
  }

  function tag(name, className, extra){
    var list = candidates(name);
    var cls = className ? (' class="' + className + '"') : '';
    var ex  = extra ? (' ' + extra) : '';
    // data-asset menyimpan base → dipungut auto-wiring utk pasang fallback
    return '<img' + cls + ' src="' + list[0] + '" data-asset="' + baseOf(name) + '"' + ex + '>';
  }

  /* auto-wiring: setiap <img data-asset="..."> yg muncul di DOM
     otomatis dapat fallback berantai. Berlaku utk elemen yg sudah
     ada saat load DAN yg ditambahkan belakangan (MutationObserver). */
  function wire(root){
    var imgs = (root || document).querySelectorAll('img[data-asset]:not([data-asset-wired])');
    imgs.forEach(function(im){
      im.setAttribute('data-asset-wired','1');
      attachFallback(im, im.getAttribute('data-asset'));
    });
  }
  function startAutoWire(){
    wire(document);
    var mo = new MutationObserver(function(muts){
      for (var k=0;k<muts.length;k++){
        var m = muts[k];
        for (var j=0;j<m.addedNodes.length;j++){
          var n = m.addedNodes[j];
          if (n.nodeType !== 1) continue;
          if (n.matches && n.matches('img[data-asset]')) wire(n.parentNode||document);
          else if (n.querySelector && n.querySelector('img[data-asset]')) wire(n);
        }
      }
    });
    (document.body ? mo.observe(document.body,{childList:true,subtree:true})
                   : document.addEventListener('DOMContentLoaded', function(){
                       mo.observe(document.body,{childList:true,subtree:true}); wire(document);
                     }));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startAutoWire);
  else startAutoWire();

  window.ZaiAsset = {
    exts: EXTS,
    base: baseOf,
    candidates: candidates,
    resolve: resolve,
    img: img,
    fallback: attachFallback,
    bg: bg,
    tag: tag,
    wire: wire
  };
})();

/* ============================================================
   zai-basket.js — Mini-game "Bantu membuat buket bunga"
   Tarik / ketuk semua hadiah ke dalam keranjang. Setelah lengkap:
   alert indah "Yeyy kamu mengumpulkan hadiah" + tombol OK →
   semburan BUNGA (FlowerSpiralTransition.playFlowers).
   Tampil di halaman background bunga (setelah swapBackground).
   ============================================================ */
(function(){
  if (window.ZaiBasket) return;

  const GIFTS = [
    {id:'lily',   src:'biru.png',    label:'Bunga Biru'},
    {id:'rose',   src:'pink.png',    label:'Mawar Pink'},
    {id:'plum',   src:'kuning.png',  label:'Bunga Kuning'},
    {id:'love',   src:'love.png',    label:'Cinta'},
    {id:'coklat', src:'coklat.webp', label:'Coklat'}
  ];
  const TOTAL = GIFTS.length;

  let started=false, collected=0, overlay=null, basketEl=null;

  /* -------- injeksi style + font lucu -------- */
  function injectStyle(){
    if(document.getElementById('zai-basket-css')) return;
    // font rounded lucu (mirip referensi)
    const f=document.createElement('link');
    f.rel='stylesheet';
    f.href='https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&display=swap';
    document.head.appendChild(f);

    const s=document.createElement('style'); s.id='zai-basket-css';
    s.textContent=`
    #zai-basket{position:fixed;inset:0;z-index:99990;overflow:hidden;
      font-family:"Baloo 2",ui-rounded,"Segoe UI",system-ui,sans-serif;
      background:#bfe39a url("dekstop.png") center/cover no-repeat;
      opacity:0;transition:opacity .6s ease;
      display:flex;flex-direction:column;align-items:center;}
    #zai-basket.show{opacity:1;}
    #zai-basket.leave{opacity:0;transition:opacity .5s ease;}
    /* kabut lembut atas & bawah biar teks kebaca */
    #zai-basket .zb-veil{position:absolute;inset:0;pointer-events:none;
      background:linear-gradient(180deg,rgba(190,225,150,.55),rgba(190,225,150,0) 26%,rgba(190,225,150,0) 62%,rgba(150,200,110,.35));}

    #zai-basket .zb-badge{margin-top:16px;background:rgba(255,255,255,.82);
      color:#7a5a34;font-weight:700;font-size:15px;padding:7px 18px;border-radius:999px;
      box-shadow:0 6px 16px rgba(90,70,40,.18);position:relative;z-index:2;}
    #zai-basket .zb-title{position:relative;z-index:2;margin:14px 20px 0;text-align:center;
      color:#5a3d1e;font-weight:800;font-size:clamp(22px,5.4vw,34px);line-height:1.18;
      text-shadow:0 2px 0 rgba(255,255,255,.5);}
    #zai-basket .zb-sub{position:relative;z-index:2;margin:8px 20px 0;text-align:center;
      color:#7c6a44;font-weight:600;font-size:clamp(13px,3.4vw,17px);}
    #zai-basket .zb-count{position:relative;z-index:2;margin-top:14px;
      background:#ffe9b8;color:#8a5a1e;font-weight:800;font-size:clamp(14px,3.6vw,18px);
      padding:9px 22px;border-radius:999px;box-shadow:0 6px 16px rgba(120,80,20,.18);
      border:2px solid rgba(255,255,255,.7);}

    /* panggung keranjang */
    #zai-basket .zb-stage{position:relative;z-index:2;flex:1;width:100%;
      display:flex;align-items:center;justify-content:center;min-height:0;}
    #zai-basket .zb-basket-wrap{position:relative;width:min(64vw,300px);
      transition:transform .18s ease;filter:drop-shadow(0 18px 22px rgba(60,45,20,.35));}
    #zai-basket .zb-basket-wrap.hot{transform:scale(1.07);}
    #zai-basket .zb-basket{width:100%;display:block;}
    /* video sumber disembunyikan; render tanpa background lewat canvas */
    #zai-basket .zb-cat-src{position:absolute;width:1px;height:1px;opacity:0;
      pointer-events:none;left:-9999px;top:0;}
    /* kucing di SISI KANAN keranjang — TANPA background/kotak */
    #zai-basket .zb-cat{position:absolute;left:calc(50% + min(34vw,168px) + 10px);
      top:50%;transform:translateY(-50%);
      width:min(30vw,150px);height:auto;
      filter:drop-shadow(0 10px 16px rgba(60,45,20,.32));
      pointer-events:none;
      animation:zb-cat-in .6s cubic-bezier(.34,1.56,.64,1) both;}
    @keyframes zb-cat-in{0%{opacity:0;transform:translateY(-50%) scale(.5)}
      100%{opacity:1;transform:translateY(-50%) scale(1)}}
    /* tempat hadiah yang sudah terkumpul "nyembul" dari keranjang */
    #zai-basket .zb-bouquet{position:absolute;left:50%;bottom:58%;transform:translateX(-50%);
      display:flex;justify-content:center;align-items:flex-end;gap:-8px;pointer-events:none;width:120%;}
    #zai-basket .zb-bouquet img{width:clamp(42px,12vw,70px);height:clamp(42px,12vw,70px);
      object-fit:contain;margin:0 -6px;
      filter:drop-shadow(0 4px 6px rgba(0,0,0,.28));
      animation:zb-pop .5s cubic-bezier(.34,1.56,.64,1) both;}
    @keyframes zb-pop{0%{transform:translateY(26px) scale(.4);opacity:0}
      100%{transform:translateY(0) scale(1);opacity:1}}

    /* baki hadiah bawah */
    #zai-basket .zb-tray{position:relative;z-index:2;width:min(96vw,560px);
      margin:0 auto 18px;background:rgba(255,250,235,.92);
      border:2px solid rgba(255,255,255,.8);border-radius:22px;
      box-shadow:0 -6px 24px rgba(80,60,30,.18);
      padding:12px;display:flex;gap:10px;justify-content:center;flex-wrap:nowrap;}
    #zai-basket .zb-cell{flex:1 1 0;min-width:0;aspect-ratio:1;max-width:92px;
      background:linear-gradient(160deg,#fffaf0,#f6e8cf);
      border-radius:16px;box-shadow:inset 0 2px 4px rgba(255,255,255,.7),0 3px 8px rgba(120,90,50,.16);
      display:flex;align-items:center;justify-content:center;position:relative;
      touch-action:none;cursor:grab;transition:transform .15s ease,opacity .3s ease;}
    #zai-basket .zb-cell:active{cursor:grabbing;}
    #zai-basket .zb-cell:hover{transform:translateY(-3px);}
    #zai-basket .zb-cell img{width:86%;height:86%;object-fit:contain;pointer-events:none;
      filter:drop-shadow(0 4px 6px rgba(0,0,0,.28)) saturate(1.12);}
    #zai-basket .zb-cell.taken{opacity:0;pointer-events:none;transform:scale(.4);}
    #zai-basket .zb-cell.wiggle{animation:zb-wig 1.6s ease-in-out infinite;}
    @keyframes zb-wig{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-4px) rotate(2deg)}}
    /* cincin cahaya lembut → item BELUM diambil terlihat jelas & mengundang */
    #zai-basket .zb-cell::after{content:"";position:absolute;inset:-2px;border-radius:16px;
      pointer-events:none;animation:zb-glow 2s ease-in-out infinite;}
    #zai-basket .zb-cell.taken::after{display:none;}
    @keyframes zb-glow{0%,100%{box-shadow:0 0 8px 1px rgba(255,150,190,.18)}
      50%{box-shadow:0 0 16px 4px rgba(255,140,185,.55)}}
    /* saat diangkat: slot asal jadi bayangan bertitik (tetap jelas, tak hilang) */
    #zai-basket .zb-cell.lifting{opacity:.5;box-shadow:inset 0 0 0 2px rgba(240,110,150,.55);}

    /* ---- efek saat item MASUK keranjang ---- */
    .zb-fx{position:fixed;z-index:99996;pointer-events:none;left:0;top:0;
      will-change:transform,opacity;}
    .zb-fx.spark{font-size:22px;transform:translate(-50%,-50%);
      animation:zb-fly .9s cubic-bezier(.3,.7,.3,1) forwards;}
    @keyframes zb-fly{0%{opacity:0;transform:translate(-50%,-50%) scale(.3)}
      18%{opacity:1}
      100%{opacity:0;transform:translate(calc(-50% + var(--dx)),calc(-50% + var(--dy))) scale(1.15) rotate(var(--rot))}}
    .zb-ring{position:fixed;z-index:99994;border-radius:50%;pointer-events:none;
      border:3px solid rgba(255,140,180,.9);transform:translate(-50%,-50%);
      left:0;top:0;animation:zb-ring .6s ease-out forwards;}
    @keyframes zb-ring{0%{width:20px;height:20px;opacity:.85}
      100%{width:190px;height:190px;opacity:0}}
    #zai-basket .zb-count.bump{animation:zb-bump .42s ease;}
    @keyframes zb-bump{0%,100%{transform:scale(1)}40%{transform:scale(1.2)}}

    /* ghost yang mengikuti jari/kursor saat drag */
    .zb-ghost{position:fixed;z-index:99995;width:84px;height:84px;margin:-42px 0 0 -42px;
      pointer-events:none;object-fit:contain;filter:drop-shadow(0 8px 10px rgba(0,0,0,.3));
      transition:none;left:0;top:0;will-change:transform;}

    /* alert indah */
    #zai-basket .zb-modal{position:absolute;inset:0;z-index:5;display:flex;
      align-items:center;justify-content:center;background:rgba(40,25,10,.35);
      opacity:0;pointer-events:none;transition:opacity .4s ease;backdrop-filter:blur(2px);}
    #zai-basket .zb-modal.on{opacity:1;pointer-events:auto;}
    #zai-basket .zb-card{width:min(90vw,440px);background:linear-gradient(180deg,#fffdf7,#fff2d6);
      border-radius:26px;padding:24px 22px 24px;text-align:center;position:relative;
      box-shadow:0 24px 60px rgba(60,40,15,.4),inset 0 2px 0 rgba(255,255,255,.9);
      border:2px solid rgba(255,255,255,.9);transform:scale(.7);transition:transform .45s cubic-bezier(.34,1.56,.64,1);}
    #zai-basket .zb-modal.on .zb-card{transform:scale(1);}
    /* gambar hasil buket — BESAR */
    #zai-basket .zb-card .zb-hasil{display:block;width:min(74vw,340px);height:auto;margin:2px auto 4px;
      filter:drop-shadow(0 12px 20px rgba(0,0,0,.28));
      animation:zb-hasil-pop .6s cubic-bezier(.34,1.56,.64,1) both;}
    @keyframes zb-hasil-pop{0%{transform:scale(.5) rotate(-6deg);opacity:0}
      100%{transform:scale(1) rotate(0);opacity:1}}
    #zai-basket .zb-card .zb-yey{margin:6px 4px 18px;color:#c2185b;font-weight:800;
      font-size:clamp(18px,4.6vw,24px);line-height:1.25;
      text-shadow:0 2px 0 rgba(255,255,255,.5);}
    #zai-basket .zb-ok{border:0;cursor:pointer;font-family:inherit;font-weight:800;font-size:18px;
      color:#fff;padding:12px 40px;border-radius:999px;
      background:linear-gradient(180deg,#ff7fa8,#f0245f);
      box-shadow:0 10px 22px rgba(230,40,90,.45),inset 0 2px 0 rgba(255,255,255,.4);
      transition:transform .15s ease,box-shadow .15s ease;}
    #zai-basket .zb-ok:hover{transform:translateY(-2px);box-shadow:0 14px 26px rgba(230,40,90,.5);}
    #zai-basket .zb-ok:active{transform:translateY(1px);}
    /* kilau sudut kartu */
    #zai-basket .zb-card .zb-cs{position:absolute;color:#ffd76a;opacity:.9;
      text-shadow:0 0 10px rgba(255,200,80,.8);animation:zb-tw 2.2s ease-in-out infinite;}
    @keyframes zb-tw{0%,100%{opacity:.25;transform:scale(.7)}50%{opacity:1;transform:scale(1.15)}}

    @media (max-width:768px){
      #zai-basket{background-image:url("handphone.png");}
      /* mode mobile: keranjang jangan kebesaran, geser kiri agar sejajar & berdampingan dgn kucing */
      #zai-basket .zb-basket-wrap{width:min(46vw,210px);right:11vw;}
      #zai-basket .zb-cat{left:calc(50% - 11vw + min(23vw,105px) + 6px);right:auto;
        width:min(26vw,128px);}
    }
    @media (max-width:430px){
      #zai-basket .zb-basket-wrap{width:44vw;right:12vw;}
      #zai-basket .zb-cat{left:calc(50% - 12vw + 22vw + 4px);right:auto;width:27vw;}
      #zai-basket .zb-tray{gap:6px;padding:9px;border-radius:18px;}
    }
    @media (prefers-reduced-motion:reduce){
      #zai-basket *{animation:none!important;}
    }`;
    document.head.appendChild(s);
  }

  /* -------- bangun UI -------- */
  function build(){
    injectStyle();
    overlay=document.createElement('div'); overlay.id='zai-basket';
    overlay.innerHTML=`
      <div class="zb-veil"></div>
      <div class="zb-badge">🧸 Untuk Sayangku 💛</div>
      <div class="zb-title">Yuk bantu membuat buket bunga 🌼</div>
      <div class="zb-sub">Tarik semua hadiah ke dalam keranjang.</div>
      <div class="zb-count">🌼 <span class="zb-num">0</span> / ${TOTAL} hadiah terkumpul</div>
      <div class="zb-stage">
        <div class="zb-basket-wrap">
          <div class="zb-bouquet"></div>
          <img class="zb-basket" src="keranjang.webp" alt="keranjang" draggable="false">
        </div>
        <video class="zb-cat-src" src="kucing.webm" autoplay loop muted playsinline
               preload="auto" disablepictureinpicture></video>
        <canvas class="zb-cat"></canvas>
      </div>
      <div class="zb-tray"></div>
      <div class="zb-modal">
        <div class="zb-card">
          <span class="zb-cs" style="left:16px;top:14px;font-size:18px">✦</span>
          <span class="zb-cs" style="right:20px;top:22px;font-size:13px;animation-delay:.6s">✦</span>
          <span class="zb-cs" style="left:26px;bottom:60px;font-size:14px;animation-delay:1.1s">✦</span>
          <span class="zb-cs" style="right:24px;bottom:52px;font-size:16px;animation-delay:1.5s">✦</span>
          <img class="zb-hasil" src="hasil-nobg.png" alt="hasil buket" draggable="false">
          <p class="zb-yey">yeyy kamu sudah mengumpulkan nya</p>
          <button class="zb-ok" type="button">iya</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    basketEl=overlay.querySelector('.zb-basket-wrap');
    const tray=overlay.querySelector('.zb-tray');
    GIFTS.forEach(g=>{
      const cell=document.createElement('div');
      cell.className='zb-cell wiggle'; cell.dataset.id=g.id;
      cell.innerHTML=`<img src="${g.src}" alt="${g.label}" draggable="false">`;
      attachDrag(cell,g);
      tray.appendChild(cell);
    });

    overlay.querySelector('.zb-ok').addEventListener('click',finish);
    startCat();

    requestAnimationFrame(()=>overlay.classList.add('show'));
  }

  /* -------- kucing: hapus background + auto ulang --------
     Sampel warna sudut video saat runtime, lalu buang piksel yang mirip
     (chroma-key) tiap frame ke canvas transparan. Kalau canvas gagal,
     jatuh balik ke <video> biasa (tetap loop). */
  function startCat(){
    const vid=overlay.querySelector('.zb-cat-src');
    const cv=overlay.querySelector('.zb-cat');
    if(!vid||!cv) return;
    const cx=cv.getContext('2d',{willReadFrequently:true});
    let raf=0, keyed=false, key={r:0,g:0,b:0};

    // pastikan selalu mengulang walau 'loop' diabaikan browser
    vid.addEventListener('ended',()=>{ vid.currentTime=0; vid.play().catch(()=>{}); });
    const kick=()=>vid.play().catch(()=>{});
    vid.addEventListener('loadeddata',kick); kick();

    function pickKey(w,h){
      // rata-rata 4 sudut sebagai warna background
      const pts=[[2,2],[w-3,2],[2,h-3],[w-3,h-3]];
      let r=0,g=0,b=0;
      for(const [x,y] of pts){ const d=cx.getImageData(x,y,1,1).data; r+=d[0];g+=d[1];b+=d[2]; }
      key={r:r/4,g:g/4,b:b/4}; keyed=true;
    }
    function draw(){
      const w=vid.videoWidth, h=vid.videoHeight;
      if(w&&h){
        if(cv.width!==w){ cv.width=w; cv.height=h; }
        cx.drawImage(vid,0,0,w,h);
        try{
          const img=cx.getImageData(0,0,w,h), p=img.data;
          if(!keyed) pickKey(w,h);
          const kr=key.r,kg=key.g,kb=key.b, TH=90*90;
          for(let i=0;i<p.length;i+=4){
            const dr=p[i]-kr, dg=p[i+1]-kg, db=p[i+2]-kb;
            if(dr*dr+dg*dg+db*db<=TH) p[i+3]=0;   // background -> transparan
          }
          cx.putImageData(img,0,0);
        }catch(_){
          // canvas "tainted" (mis. dibuka file:// tanpa izin) -> pakai video langsung
          cv.style.display='none'; vid.className='zb-cat'; vid.style.cssText='';
          cancelAnimationFrame(raf); return;
        }
      }
      raf=requestAnimationFrame(draw);
    }
    raf=requestAnimationFrame(draw);
  }

  /* -------- drag & drop (pointer, jalan di mouse & sentuh) -------- */
  function basketHit(x,y){
    const r=basketEl.getBoundingClientRect();
    const pad=36;
    return x>=r.left-pad && x<=r.right+pad && y>=r.top-pad && y<=r.bottom+pad*1.4;
  }

  function attachDrag(cell,g){
    let ghost=null,down=null,moved=0;
    const onDown=(ev)=>{
      if(cell.classList.contains('taken'))return;
      ev.preventDefault();
      const p=point(ev);
      down={x:p.x,y:p.y,t:Date.now()};
      moved=0;
      cell.classList.remove('wiggle');
      ghost=document.createElement('img');
      ghost.className='zb-ghost'; ghost.src=g.src;
      ghost.style.transform=`translate(${p.x}px,${p.y}px) scale(1.15)`;
      document.body.appendChild(ghost);
      cell.classList.add('lifting');
      window.addEventListener('pointermove',onMove,{passive:false});
      window.addEventListener('pointerup',onUp,{passive:false});
      window.addEventListener('pointercancel',onUp,{passive:false});
    };
    const onMove=(ev)=>{
      if(!ghost)return; ev.preventDefault();
      const p=point(ev);
      moved=Math.max(moved,Math.hypot(p.x-down.x,p.y-down.y));
      ghost.style.transform=`translate(${p.x}px,${p.y}px) scale(1.15)`;
      basketEl.classList.toggle('hot',basketHit(p.x,p.y));
    };
    const onUp=(ev)=>{
      window.removeEventListener('pointermove',onMove);
      window.removeEventListener('pointerup',onUp);
      window.removeEventListener('pointercancel',onUp);
      if(!ghost)return;
      const p=point(ev);
      const tap = moved<10 && (Date.now()-down.t)<400;
      basketEl.classList.remove('hot');
      if(basketHit(p.x,p.y) || tap){
        collectAnim(ghost,cell,g);
      } else {
        // balik ke tempat semula
        const r=cell.getBoundingClientRect();
        ghost.style.transition='transform .28s ease, opacity .28s ease';
        ghost.style.transform=`translate(${r.left+r.width/2}px,${r.top+r.height/2}px) scale(1)`;
        setTimeout(()=>{ghost&&ghost.remove();ghost=null;
          cell.classList.remove('lifting');cell.classList.add('wiggle');},280);
      }
    };
    cell.addEventListener('pointerdown',onDown);
  }
  function point(ev){ return {x:ev.clientX, y:ev.clientY}; }

  function collectAnim(ghost,cell,g){
    const r=basketEl.getBoundingClientRect();
    const tx=r.left+r.width/2, ty=r.top+r.height*0.36;
    ghost.style.transition='transform .42s cubic-bezier(.5,-0.2,.3,1), opacity .42s ease';
    ghost.style.transform=`translate(${tx}px,${ty}px) scale(.5)`;
    ghost.style.opacity='0';
    setTimeout(()=>ghost&&ghost.remove(),430);
    cell.classList.add('taken');
    // tambahkan ke buket di keranjang
    const bq=overlay.querySelector('.zb-bouquet');
    const im=document.createElement('img'); im.src=g.src; bq.appendChild(im);
    collected++;
    overlay.querySelector('.zb-num').textContent=String(collected);
    // EFEK saat item masuk keranjang: dentuman keranjang + cincin + percikan hati
    collectFx(tx, ty);
    const cnt=overlay.querySelector('.zb-count');
    if(cnt){ cnt.classList.remove('bump'); void cnt.offsetWidth; cnt.classList.add('bump'); }
    basketEl.style.transition='transform .18s cubic-bezier(.34,1.7,.5,1)';
    basketEl.style.transform='scale(1.12)';
    setTimeout(()=>basketEl.style.transform='scale(1)',170);
    if(collected>=TOTAL){ setTimeout(openModal,650); }
  }

  /* percikan hati/kilau + cincin saat item jatuh ke keranjang */
  function collectFx(x,y){
    if(matchMedia('(prefers-reduced-motion:reduce)').matches) return;
    const ring=document.createElement('div'); ring.className='zb-ring';
    ring.style.left=x+'px'; ring.style.top=y+'px';
    document.body.appendChild(ring); setTimeout(()=>ring.remove(),620);
    const GLY=['💛','💗','✨','🌸','💖','⭐'];
    const N=8;
    for(let i=0;i<N;i++){
      const s=document.createElement('div'); s.className='zb-fx spark';
      s.textContent=GLY[i%GLY.length];
      const ang=(-Math.PI/2)+(i/(N-1)-0.5)*Math.PI*1.1;  // menyebar ke atas
      const dist=60+Math.random()*70;
      s.style.left=x+'px'; s.style.top=y+'px';
      s.style.setProperty('--dx',(Math.cos(ang)*dist).toFixed(0)+'px');
      s.style.setProperty('--dy',(Math.sin(ang)*dist-20).toFixed(0)+'px');
      s.style.setProperty('--rot',(Math.random()*90-45).toFixed(0)+'deg');
      s.style.fontSize=(16+Math.random()*12)+'px';
      document.body.appendChild(s); setTimeout(()=>s.remove(),950);
    }
  }

  function openModal(){ overlay.querySelector('.zb-modal').classList.add('on'); }

  /* -------- "iya" → tutup game → SEMBURAN BUNGA (spt buka kado) → AWAN gelap → PAGE 2 -------- */
  function finish(){
    let origin={x:innerWidth/2,y:innerHeight*0.5};
    try{ const r=basketEl.getBoundingClientRect(); origin={x:r.left+r.width/2,y:r.top+r.height*0.36}; }catch(_){}
    overlay.querySelector('.zb-modal').classList.remove('on');
    overlay.classList.add('leave');
    setTimeout(()=>{ overlay&&overlay.remove(); },520);

    let page2Fired=false;
    const goPage2=()=>{ if(page2Fired)return; page2Fired=true;
      if(window.ZaiPage2 && window.ZaiPage2.start) window.ZaiPage2.start(); };

    // 1) bunga menyembur memenuhi layar (sama seperti animasi buka kado)
    if(window.FlowerSpiralTransition && window.FlowerSpiralTransition.playFlowers){
      window.FlowerSpiralTransition.playFlowers({
        origin,
        onCollapse(){ goPage2(); },   // 2) bunga mulai jatuh → awan gelap + page 2
        onDone(){ goPage2(); }        // pengaman bila onCollapse terlewat
      });
    } else {
      goPage2();
    }
  }

  window.ZaiBasket={
    start(){ if(started)return; started=true;
      if(document.readyState==='loading')
        document.addEventListener('DOMContentLoaded',build);
      else build();
    }
  };
})();

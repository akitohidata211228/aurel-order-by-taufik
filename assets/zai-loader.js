/* ============================================================
   zai-loader.js — loading (ketik) + kado premium (beautifier)
   ============================================================ */
(function(){
  if (window.__ZAI_LOADER__) return;
  window.__ZAI_LOADER__ = true;

  /* -------------------- Matikan "surat" bawaan React --------------------
     App React punya adegan sendiri: klik kado → bloom → SURAT (Letter modal
     ".letter-open"). Alur kita menggantinya dgn keranjang → page-2, jadi
     surat itu tak boleh muncul. Sembunyikan modalnya (dan pembobservasi
     cadangan bila :has tak didukung). */
  (function killSurat(){
    const st=document.createElement('style'); st.id='zai-no-surat';
    st.textContent=
      'div:has(> .letter-open){display:none!important;}'+
      '.letter-open{display:none!important;}';
    (document.head||document.documentElement).appendChild(st);
    const hide=()=>{
      const card=document.querySelector('.letter-open');
      if(card){ const modal=card.parentElement;
        if(modal){ modal.style.display='none'; } card.style.display='none'; }
    };
    const mo=new MutationObserver(hide);
    const startMO=()=>mo.observe(document.body,{childList:true,subtree:true});
    if(document.body) startMO();
    else document.addEventListener('DOMContentLoaded',startMO);
  })();

  const HEART_LOVE='<svg viewBox="0 0 32 29" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="zlh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff7aa8"/><stop offset="1" stop-color="#ff3d73"/></linearGradient></defs><path d="M16 29S2 19.5 2 10.2C2 5.6 5.6 2 10 2c2.6 0 5 1.4 6 3.6C17 3.4 19.4 2 22 2c4.4 0 8 3.6 8 8.2C30 19.5 16 29 16 29z" fill="url(#zlh)"/></svg>';
  const HEART_BLUE='<svg viewBox="0 0 32 29" xmlns="http://www.w3.org/2000/svg"><path d="M16 29S2 19.5 2 10.2C2 5.6 5.6 2 10 2c2.6 0 5 1.4 6 3.6C17 3.4 19.4 2 22 2c4.4 0 8 3.6 8 8.2C30 19.5 16 29 16 29z" fill="#6faeee"/></svg>';

  // bow pita emas (SVG) — jauh lebih rapi dari blob CSS
  const BOW=`<svg viewBox="0 0 118 74" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="zgb" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#fff3cf"/><stop offset=".5" stop-color="#ffd766"/><stop offset="1" stop-color="#d29e2f"/>
      </linearGradient>
      <linearGradient id="zgk" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#fff6d8"/><stop offset="1" stop-color="#caa02f"/>
      </linearGradient>
    </defs>
    <path d="M59 40 C46 60 40 66 30 73 C40 71 50 66 59 52 Z" fill="url(#zgb)"/>
    <path d="M59 40 C72 60 78 66 88 73 C78 71 68 66 59 52 Z" fill="url(#zgb)"/>
    <path d="M59 40 C34 16 8 20 8 38 C8 54 40 52 59 42 Z" fill="url(#zgb)" stroke="#b9832a" stroke-width="1"/>
    <path d="M59 40 C84 16 110 20 110 38 C110 54 78 52 59 42 Z" fill="url(#zgb)" stroke="#b9832a" stroke-width="1"/>
    <path d="M30 30 C40 34 48 38 56 41" stroke="#fff6d8" stroke-width="1.5" fill="none" opacity=".6"/>
    <path d="M88 30 C78 34 70 38 62 41" stroke="#fff6d8" stroke-width="1.5" fill="none" opacity=".6"/>
    <ellipse cx="59" cy="41" rx="11" ry="13" fill="url(#zgk)" stroke="#b9832a" stroke-width="1"/>
  </svg>`;

  /* -------------------- Loading overlay -------------------- */
  function buildOverlay(){
    const o=document.createElement('div'); o.id='zai-load';
    const stars=document.createElement('div'); stars.className='zl-stars';
    for(let i=0;i<50;i++){const s=document.createElement('div');s.className='zl-star';
      const sz=1+Math.random()*2.4;
      s.style.width=s.style.height=sz+'px';
      s.style.left=(Math.random()*100)+'%';s.style.top=(Math.random()*100)+'%';
      s.style.animationDelay=(Math.random()*3)+'s';stars.appendChild(s);}
    o.appendChild(stars);
    o.insertAdjacentHTML('beforeend',
      `<div class="zl-halo"></div>
       <div class="zl-title"><span class="zl-typed"></span><span class="zl-caret">|</span></div>
       <div class="zl-track"><div class="zl-fill"></div><div class="zl-heart">${HEART_LOVE}</div></div>`);
    document.body.appendChild(o);
    return o;
  }

  /* -------------------- Hujan matrix LOVE -------------------- */
  function startMatrix(o){
    const cv=document.createElement('canvas'); cv.className='zl-matrix';
    o.insertBefore(cv, o.firstChild);              // di belakang bintang & judul
    const ctx=cv.getContext('2d');
    const GLYPHS='love'.split('');                 // matrix hanya "love"
    const TRAIL=15;                                // panjang ekor ke bawah = 15
    let W,H,fs,cols,heads,speed,chars,raf=0,last=0;
    const rnd=()=>GLYPHS[(Math.random()*GLYPHS.length)|0];
    function size(){
      const dpr=Math.min(window.devicePixelRatio||1,1.5);
      W=innerWidth;H=innerHeight;
      cv.width=Math.ceil(W*dpr);cv.height=Math.ceil(H*dpr);
      cv.style.width=W+'px';cv.style.height=H+'px';
      ctx.setTransform(dpr,0,0,dpr,0,0);
      fs=Math.max(13,Math.round(W/52));            // lebih kecil → jauh lebih banyak kolom (deras)
      ctx.textAlign='center';ctx.textBaseline='middle';
      cols=Math.ceil(W/fs)+1;
      heads=new Array(cols);speed=new Array(cols);chars=new Array(cols);
      for(let c=0;c<cols;c++){
        heads[c]=-Math.floor(Math.random()*30);
        speed[c]=10+Math.random()*16;              // baris per detik (lebih deras)
        chars[c]=[];for(let k=0;k<TRAIL;k++)chars[c].push(rnd());
      }
    }
    function frame(now){
      const dt=last?Math.min((now-last)/1000,.05):0; last=now;
      ctx.clearRect(0,0,W,H);
      ctx.font='700 '+fs+'px "Cormorant Garamond",Georgia,serif';
      for(let c=0;c<cols;c++){
        const prev=Math.floor(heads[c]);
        heads[c]+=speed[c]*dt;
        const head=Math.floor(heads[c]);
        if(head!==prev){ chars[c].unshift(rnd()); if(chars[c].length>TRAIL)chars[c].pop(); }
        const x=c*fs+fs/2;
        for(let k=0;k<TRAIL;k++){
          const row=head-k; if(row<0)continue;
          const y=row*fs+fs/2; if(y>H+fs)continue;
          const a=1-k/TRAIL;                         // kepala terang, ekor memudar
          if(k===0){ ctx.shadowColor='rgba(255,120,170,.9)';ctx.shadowBlur=10;
            ctx.fillStyle='rgba(255,244,250,.98)'; }
          else { ctx.shadowBlur=0;
            ctx.fillStyle='rgba(255,'+((80+130*a)|0)+','+((150+70*a)|0)+','+a.toFixed(3)+')'; }
          ctx.fillText(chars[c][k], x, y);
        }
        ctx.shadowBlur=0;
        if(head*fs>H+TRAIL*fs && Math.random()<.08){
          heads[c]=-Math.floor(Math.random()*12); speed[c]=10+Math.random()*16;
        }
      }
      raf=requestAnimationFrame(frame);
    }
    size(); raf=requestAnimationFrame(frame);
    const onR=()=>{ if(cv.isConnected) size(); };
    window.addEventListener('resize',onR);
    return ()=>{ cancelAnimationFrame(raf); window.removeEventListener('resize',onR); };
  }

  function run(){
    const o=buildOverlay();
    const stopMatrix=startMatrix(o);
    const typed=o.querySelector('.zl-typed');
    const caret=o.querySelector('.zl-caret');
    const fill=o.querySelector('.zl-fill');
    const heart=o.querySelector('.zl-heart');
    const TEXT='Happy girlfriend by rama';
    let i=0;
    // ketik satu huruf demi satu huruf; progress bar sinkron
    (function type(){
      if(i<=TEXT.length){
        typed.textContent=TEXT.slice(0,i);
        const p=(i/TEXT.length)*100;
        fill.style.width=p+'%'; heart.style.left=p+'%';
        i++;
        // sedikit variasi kecepatan biar terasa natural (spasi lebih lama)
        const ch=TEXT[i-2];
        setTimeout(type, ch===' '?190: 70+Math.random()*70);
      } else {
        caret.style.display='none';
        // loading selesai → matrix berhenti; heart di loading bar MENYEMBUR love
        setTimeout(()=>{
          finishLoading(o,stopMatrix,heart);
        }, 620);
      }
    })();
  }

  /* -------------------- Selesai loading → langsung ke kado --------------------
     (animasi LOVE memenuhi layar DIHAPUS sesuai permintaan) */
  function finishLoading(o, stopMatrix, heart){
    o.classList.add('zl-spray');
    o.classList.add('hide');
    setTimeout(()=>{ stopMatrix(); o.remove(); }, 700);
    // siapkan & tampilkan kado tanpa hujan hati
    beautifyLoop();
  }

  /* -------------------- Klik kado → buka + semburan BUNGA + ganti background -------------------- */
  let giftFired=false;
  document.addEventListener('click',function(ev){
    const box=ev.target&&ev.target.closest&&ev.target.closest('.gift-enter');
    if(!box||giftFired)return;
    giftFired=true;
    const stage=box.querySelector('.zg-stage');
    if(stage) stage.classList.add('zg-open');    // animasi tutup terbuka
    const gimg=box.querySelector('.zg-img');
    if(gimg) gimg.src='kotak-buka.webp';          // ganti ke gambar kotak terbuka
    let origin={x:innerWidth/2,y:innerHeight/2};
    try{ const r=(stage||box).getBoundingClientRect(); origin={x:r.left+r.width/2,y:r.top+r.height*0.35}; }catch(_){}
    // beri jeda kecil supaya animasi buka terlihat sebelum bunga menyembur
    setTimeout(()=>{
      window.FlowerSpiralTransition && window.FlowerSpiralTransition.playFlowers({
        origin,
        onCollapse(){ /* bunga sudah memenuhi & mulai jatuh → ganti background website */
          swapBackground();
        },
        onDone(){}
      });
    }, 520);
  },true);

  /* -------------------- Ganti background (dekstop / handphone) -------------------- */
  function swapBackground(){
    if(document.getElementById('zai-final-bg'))return;
    // nama file background dari config terenkripsi (AES) bila sudah siap;
    // fallback plaintext supaya situs tetap jalan walau Web Crypto tak ada.
    const G = window.__zg;
    const bgD = (G && G.cget) ? G.cget('bgDesktop','dekstop.webp') : 'dekstop.webp';
    const bgM = (G && G.cget) ? G.cget('bgMobile','handphone.webp') : 'handphone.webp';
    const st=document.createElement('style'); st.id='zai-final-bg';
    st.textContent=
      '#root .bg-\\[\\#0d0015\\],'+
      'body.zai-final .bg-\\[\\#0d0015\\]{'+
      'background-color:transparent!important;'+
      'background-image:url("'+bgD+'")!important;'+
      'background-size:cover!important;background-position:center!important;'+
      'background-attachment:fixed!important;background-repeat:no-repeat!important;}'+
      '@media (max-width:768px){'+
      '#root .bg-\\[\\#0d0015\\],body.zai-final .bg-\\[\\#0d0015\\]{'+
      'background-image:url("'+bgM+'")!important;background-attachment:scroll!important;}}';
    document.head.appendChild(st);
    document.body.classList.add('zai-final');
    // tampilkan mini-game keranjang di halaman background bunga
    setTimeout(()=>{ window.ZaiBasket && window.ZaiBasket.start(); }, 700);
  }

  /* -------------------- Gift beautifier -------------------- */
  function beautify(btn){
    if(!btn || btn.classList.contains('zai-lux')) return;
    btn.classList.add('zai-lux');
    Array.from(btn.children).forEach(ch=>{ if(!ch.classList.contains('zai-lux-wrap')) ch.classList.add('zai-orig'); });
    injectGiftImgCss();
    const wrap=document.createElement('div'); wrap.className='zai-lux-wrap';
    wrap.innerHTML=
      `<div class="zg-stage">
        <div class="zg-glow"></div>
        <div class="zg-floor"></div>
        <span class="zg-spark" style="left:12%;top:16%;font-size:17px;animation-delay:.1s">✦</span>
        <span class="zg-spark" style="right:8%;top:26%;font-size:12px;animation-delay:.9s">✦</span>
        <span class="zg-spark" style="left:20%;bottom:26%;font-size:14px;animation-delay:1.6s">✦</span>
        <span class="zg-spark" style="right:16%;bottom:30%;font-size:10px;animation-delay:2.3s">✦</span>
        <img class="zg-img" src="kotak-tutup.webp" alt="kado" draggable="false">
      </div>
      <div class="zg-hint">buka kotaknya, maka…</div>`;
    btn.appendChild(wrap);
  }
  /* gambar kado (kotak tutup/buka) menggantikan kotak CSS */
  function injectGiftImgCss(){
    if(document.getElementById('zai-gift-img-css'))return;
    const s=document.createElement('style'); s.id='zai-gift-img-css';
    s.textContent=`
      .zai-lux-wrap .zg-img{display:block;width:min(58vw,240px);height:auto;margin:0 auto;
        filter:drop-shadow(0 16px 26px rgba(20,40,120,.4));
        transition:transform .5s cubic-bezier(.34,1.56,.64,1),filter .4s ease;
        animation:zg-img-float 3.2s ease-in-out infinite;}
      .zai-lux-wrap .zg-stage.zg-open .zg-img{transform:scale(1.12) translateY(-6px);
        filter:drop-shadow(0 22px 34px rgba(20,40,120,.55)) brightness(1.06);animation:none;}
      @keyframes zg-img-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
      @media (prefers-reduced-motion:reduce){.zai-lux-wrap .zg-img{animation:none;}}`;
    document.head.appendChild(s);
  }
  function beautifyLoop(){
    const tryOnce=()=>{const b=document.querySelector('.gift-enter');if(b)beautify(b);};
    tryOnce();
    const mo=new MutationObserver(tryOnce);
    mo.observe(document.body,{childList:true,subtree:true});
    setTimeout(()=>mo.disconnect(),20000);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run);
  else run();
})();

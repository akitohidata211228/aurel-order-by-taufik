/* ============================================================
   zai-page2.js — Setelah semua hadiah terkumpul:
   1) Animasi AWAN (canvas, digambar sendiri) masuk dari KIRI & KANAN
      menutup layar, lalu menyingkir/menghilang.
   2) Muncul PAGE 2 (papan kayu): back2-hp.webp utk mobile/android,
      back2-deks.webp utk desktop. Judul di atas papan.
   3) Tugas: menata potongan CINTA (digambar via canvas) ke bingkai
      hati putus-putus. 2 setengah-lingkaran + 1 wajik = 1 hati utuh.
   ============================================================ */
(function(){
  if (window.ZaiPage2) return;

  /* posisi hati pada tiap papan (fraksi dari area gambar yang tampil).
     df = setengah-lebar hati sebagai fraksi lebar-konten. */
  /* Tiap papan punya 2 area (fraksi dari gambar via object-fit:cover):
     asm  = papan kayu ATAS  → tempat menyusun HATI
     tray = papan kayu BAWAH → rak tempat potongan menunggu. */
  const LAYOUTS = {
    mobile : { img:'back2-hp.webp',
               asm :{xf:0.498, yf:0.383, wf:0.685, hf:0.362},
               tray:{xf:0.498, yf:0.698, wf:0.674, hf:0.122} },
    desktop: { img:'back2-deks.webp',
               asm :{xf:0.496, yf:0.396, wf:0.376, hf:0.430},
               tray:{xf:0.500, yf:0.757, wf:0.370, hf:0.094} }
  };

  const PINK0='#ff8fb0', PINK1='#f0245f', PINK2='#c40024';
  let started=false;

  /* =========================================================
     BAGIAN 1 — AWAN
     ========================================================= */
  const CLOUD_CSS = `
    #zai-clouds{position:fixed;inset:0;z-index:99998;pointer-events:none;}
  `;
  function injectCloudCss(){
    if(document.getElementById('zai-clouds-css'))return;
    const s=document.createElement('style'); s.id='zai-clouds-css';
    s.textContent=CLOUD_CSS; document.head.appendChild(s);
  }

  /* satu awan = beberapa gumpalan lingkaran, putih lembut */
  function makeCloud(cx, cy, scale){
    // puff relatif (x,y,r) terhadap pusat awan, satuan ~px sebelum scale
    const puffs=[
      [-120,10,70],[-60,-18,86],[0,-30,100],[64,-14,88],[120,12,68],
      [-30,26,70],[40,28,66],[0,20,80]
    ];
    return {cx,cy,scale,puffs};
  }
  /* awan GELAP tebal (mendung) — inti pekat, tepi memudar lembut */
  function drawCloud(ctx,c,alpha){
    ctx.save(); ctx.globalAlpha=alpha; ctx.translate(c.cx,c.cy); ctx.scale(c.scale,c.scale);
    for(const [px,py,r] of c.puffs){
      const g=ctx.createRadialGradient(px,py,r*0.1,px,py,r);
      g.addColorStop(0,'#0b0b16'); g.addColorStop(0.55,'#141426');
      g.addColorStop(0.82,'#1c1c34'); g.addColorStop(1,'rgba(20,20,38,0)');
      ctx.fillStyle=g; ctx.beginPath(); ctx.arc(px,py,r*1.15,0,Math.PI*2); ctx.fill();
    }
    ctx.restore();
  }

  function playClouds(onCovered, onGone, opts){
    opts=opts||{};
    const stay=!!opts.stayCovered;      // true = menutup lalu DIAM (utk pindah halaman)
    injectCloudCss();
    const cv=document.createElement('canvas'); cv.id='zai-clouds';
    (document.body||document.documentElement).appendChild(cv);
    const dpr=Math.min(window.devicePixelRatio||1,2);
    let W=innerWidth,H=innerHeight;
    function size(){ W=innerWidth;H=innerHeight; cv.width=Math.ceil(W*dpr);cv.height=Math.ceil(H*dpr);
      cv.style.cssText='position:fixed;inset:0;'; }
    size();
    const ctx=cv.getContext('2d'); ctx.setTransform(dpr,0,0,dpr,0,0);

    const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

    // bikin gugusan awan LEBIH BANYAK & LEBIH BESAR: grid baris × kolom menutup penuh.
    const S=Math.max(1.1, Math.min(W,H)/480);  // scale awan lebih besar
    const rows=Math.ceil(H/(110*S))+2;          // baris lebih rapat
    const cols=Math.ceil(W/(180*S))+2;          // kolom penuh lebar
    const clouds=[];
    for(let r=0;r<rows;r++){
      for(let c=0;c<cols;c++){
        const y=(r+0.5)*(H/rows)+ (Math.random()*30-15);
        const x=(c+0.5)*(W/cols)+ (Math.random()*40-20);
        const fromLeft = (r+c)%2===0;
        const sc=S*(1.1+Math.random()*0.6);     // awan individual lebih besar
        const coverX = x;                        // posisi cover = grid asli (full coverage)
        const startX = fromLeft ? -280*sc - Math.random()*200 : W+280*sc + Math.random()*200;
        const endX   = fromLeft ? W+340*sc : -340*sc;
        clouds.push({...makeCloud(0,y,sc), startX, coverX, endX});
      }
    }

    const T_IN=1250, T_HOLD=stay?100000:650, T_OUT=1150;
    const tCover=T_IN, tOut=T_IN+T_HOLD, tEnd=T_IN+T_HOLD+T_OUT;
    let start=null, firedCover=false, firedGone=false;

    if(reduce){
      try{onCovered&&onCovered();}catch(_){}
      if(!stay) setTimeout(()=>{ try{onGone&&onGone();}catch(_){} cv.remove(); },40);
      return;
    }

    function frame(now){
      if(start===null)start=now;
      const t=now-start;
      ctx.clearRect(0,0,W,H);

      let phase, p;
      for(const c of clouds){
        if(t<tCover){ p=easeOut(t/T_IN); c.cx=lerp(c.startX,c.coverX,p); }
        else if(t<tOut){ c.cx=c.coverX; }
        else { p=easeIn((t-tOut)/T_OUT); c.cx=lerp(c.coverX,c.endX,p); }
      }
      // kabut GELAP pekat biar benar-benar menutup layar saat cover
      let veilA;
      if(t<tCover) veilA=easeOut(t/T_IN);
      else if(t<tOut) veilA=1;
      else veilA=1-easeIn((t-tOut)/T_OUT);
      if(veilA>0){ ctx.save(); ctx.globalAlpha=veilA; ctx.fillStyle='#0a0a14';
        ctx.fillRect(0,0,W,H); ctx.restore(); }

      const cloudA = t<tCover ? easeOut(t/T_IN) : 1;
      for(const c of clouds) drawCloud(ctx,c,cloudA);

      if(!firedCover && t>=tCover){ firedCover=true; try{onCovered&&onCovered();}catch(_){} }
      if(!firedGone && !stay && t>=tEnd){ firedGone=true; try{onGone&&onGone();}catch(_){} }

      if(stay || t<tEnd) requestAnimationFrame(frame);
      else { ctx.clearRect(0,0,W,H); cv.remove(); }
    }
    requestAnimationFrame(frame);
  }

  const lerp=(a,b,p)=>a+(b-a)*p;
  const easeOut=p=>1-Math.pow(1-clamp01(p),3);
  const easeIn=p=>{p=clamp01(p);return p*p*p;};
  const clamp01=x=>x<0?0:x>1?1:x;

  /* =========================================================
     BAGIAN 2 — PAPAN (page 2) + GAME MENATA LOVE
     ========================================================= */
  const NAT={ 'back2-hp.webp':[852,1846], 'back2-deks.webp':[1536,1024] };
  let boardEl=null, cv=null, ctx=null, LAY=null, pieces=[], H0={}, dragging=null;
  let dpr=1, W=0, Hh=0;

  function pickLayout(){
    return (matchMedia('(max-width:768px)').matches) ? LAYOUTS.mobile : LAYOUTS.desktop;
  }

  function injectBoardCss(){
    if(document.getElementById('zai-page2-css'))return;
    const s=document.createElement('style'); s.id='zai-page2-css';
    s.textContent=`
    #zai-page2{position:fixed;inset:0;z-index:99997;overflow:hidden;
      font-family:"Baloo 2",ui-rounded,"Segoe UI",system-ui,sans-serif;
      background:#9fd0f5 center/cover no-repeat;opacity:0;transition:opacity .5s ease;}
    #zai-page2.show{opacity:1;}
    #zai-page2 .zp-title{position:absolute;left:50%;top:3.5%;transform:translateX(-50%);
      z-index:3;text-align:center;color:#5a3d1e;font-weight:800;
      font-size:clamp(20px,5.2vw,34px);line-height:1.15;white-space:nowrap;
      text-shadow:0 2px 0 rgba(255,255,255,.65),0 6px 14px rgba(60,45,20,.25);
      background:rgba(255,255,255,.35);padding:6px 20px;border-radius:999px;
      backdrop-filter:blur(2px);opacity:0;transition:opacity .5s ease .2s,transform .5s ease .2s;}
    #zai-page2.show .zp-title{opacity:1;transform:translateX(-50%) translateY(0);}
    #zai-page2 .zp-cv{position:absolute;inset:0;width:100%;height:100%;touch-action:none;}
    #zai-page2 .zp-done{position:absolute;inset:0;z-index:4;display:flex;
      align-items:center;justify-content:center;pointer-events:none;opacity:0;
      transition:opacity .5s ease;}
    #zai-page2 .zp-done.on{opacity:1;}
    #zai-page2 .zp-done p{margin:0;padding:16px 26px;border-radius:22px;
      background:linear-gradient(180deg,#fff5fa,#ffdcea);color:#c2185b;font-weight:800;
      font-size:clamp(18px,4.8vw,26px);text-align:center;
      box-shadow:0 18px 44px rgba(200,24,91,.35);border:2px solid #fff;
      transform:scale(.7);transition:transform .5s cubic-bezier(.34,1.56,.64,1);}
    #zai-page2 .zp-done.on p{transform:scale(1);}
    @media (prefers-reduced-motion:reduce){#zai-page2 *{transition:none!important;}}`;
    document.head.appendChild(s);
  }

  function mountBoard(){
    injectBoardCss();
    LAY=pickLayout();
    boardEl=document.createElement('div'); boardEl.id='zai-page2';
    boardEl.style.backgroundImage=`url("${LAY.img}")`;
    boardEl.innerHTML=`
      <div class="zp-title">Kumpulkan cintaku kepadamu 💖</div>
      <canvas class="zp-cv"></canvas>
      <div class="zp-done"><p>Cintaku utuh untukmu 💖<br>Terima kasih sudah menata semuanya</p></div>`;
    document.body.appendChild(boardEl);
    cv=boardEl.querySelector('.zp-cv');
    ctx=cv.getContext('2d');
    layout(); buildPieces(); bindDrag();
    render();
    window.addEventListener('resize',onResize);
  }
  function revealBoard(){ boardEl && boardEl.classList.add('show'); }

  function onResize(){ if(!boardEl)return;
    const keep=pieces.map(p=>({id:p.id,placed:p.placed}));
    layout(); buildPieces();
    keep.forEach(k=>{ if(!k.placed)return; const p=pieces.find(q=>q.id===k.id);
      if(p){p.placed=true;p.x=p.homeSlot.x;p.y=p.homeSlot.y;p.curScale=1;} });
    render();
  }

  /* transform object-fit:cover -> px layar */
  function coverMap(){
    const [iw,ih]=NAT[LAY.img]||[W,Hh];
    const scale=Math.max(W/iw, Hh/ih);
    const dw=iw*scale, dh=ih*scale;
    return {ox:(W-dw)/2, oy:(Hh-dh)/2, dw, dh, scale};
  }

  /* rect area (asm/tray) -> px layar */
  function areaRect(a){
    const m=coverMap();
    return { cx:m.ox+a.xf*m.dw, cy:m.oy+a.yf*m.dh,
             w:a.wf*m.dw, h:a.hf*m.dh };
  }

  function layout(){
    dpr=Math.min(window.devicePixelRatio||1,2);
    W=innerWidth; Hh=innerHeight;
    cv.width=Math.ceil(W*dpr); cv.height=Math.ceil(Hh*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);

    const asm=areaRect(LAY.asm);
    // Hati GEOMETRIS = 1 wajik + 2 setengah-lingkaran yang MENYAMBUNG rapi.
    // BBox union ≈ 1.00R lebar × 0.92R tinggi. Ukur R agar muat di papan atas.
    const margin=0.90;
    const R = Math.min(asm.w*margin/1.00, asm.h*margin/0.92);
    const hx = asm.cx;
    const g   = 0.90*R;                // diagonal-penuh wajik
    const a   = g/2;                   // setengah-diagonal wajik
    const rho = a/Math.SQRT2;          // radius lobus = 1/2 sisi wajik  → menyambung mulus
    // pusat union (≈ hyc - 0.04R) tepat di tengah papan atas
    const hyc = asm.cy + 0.04*R;
    const hy  = hyc - a/2;
    H0={hx,hy,R,g,a,rho,hyc,
        diamond:{x:hx, y:hyc},
        left:{x:hx-a/2, y:hyc-a/2},
        right:{x:hx+a/2, y:hyc-a/2}};
  }

  /* ---- 3 potongan cinta: 2 setengah-lingkaran + 1 wajik = 1 hati ---- */
  function buildPieces(){
    const tray=areaRect(LAY.tray);
    const trayY=tray.cy;
    // sebar 3 potongan merata di rak bawah
    const gap=Math.min(H0.R*0.95, tray.w*0.30);
    const trayXs=[tray.cx-gap, tray.cx, tray.cx+gap];
    // Potongan ukuran-penuh dipakai utk menyusun hati di papan atas, jadi
    // TERLALU BESAR utk rak bawah yang tipis → tampilkan MENGECIL di rak,
    // lalu MEMBESAR ke ukuran penuh saat diangkat/dipasang.
    const pieceExtent=Math.max(2*H0.rho, H0.g);  // potongan terbesar (wajik) = g
    const fitW=(gap*0.92)/pieceExtent;          // jangan bersentuhan dgn tetangga
    const fitH=(tray.h*0.82)/pieceExtent;       // muat tinggi rak
    const trayScale=Math.max(0.22, Math.min(1, fitW, fitH));
    const defs=[
      {id:'left',   kind:'half',    flip:false, slot:H0.left},
      {id:'diamond',kind:'diamond', flip:false, slot:H0.diamond},
      {id:'right',  kind:'half',    flip:true,  slot:H0.right}
    ];
    pieces=defs.map((d,i)=>({
      ...d, r:H0.rho, g:H0.g, homeSlot:d.slot,
      trayX:trayXs[i], trayY, trayScale,
      x:trayXs[i], y:trayY, curScale:trayScale, placed:false, hot:false
    }));
  }

  function piecePath(c,p){
    if(p.kind==='diamond'){
      const g=p.g/2;
      c.moveTo(0,-g); c.lineTo(g,0); c.lineTo(0,g); c.lineTo(-g,0); c.closePath();
    } else {
      c.arc(0,0,p.r,-Math.PI/2, Math.PI/2, false); // sisi kanan bulat, sisi kiri datar
      c.closePath();
    }
  }
  function pieceRot(p){
    if(p.kind!=='half') return 0;
    return p.flip ? (-Math.PI*0.25) : (-Math.PI*0.75); // kanan -45°, kiri -135° → menyambung mulus
  }
  function drawPiece(p,ghost){
    const lifted = ghost || !p.placed;   // di rak / diangkat = timbul; terpasang = rata (mulus)
    ctx.save();
    ctx.translate(p.x,p.y);
    const sc=(p.curScale||1)*(ghost?1.06:1);
    if(sc!==1) ctx.scale(sc,sc);
    ctx.rotate(pieceRot(p));
    ctx.beginPath(); piecePath(ctx,p);
    const grd=ctx.createLinearGradient(0,-p.r,0,p.r);
    grd.addColorStop(0,PINK0); grd.addColorStop(.55,PINK1); grd.addColorStop(1,PINK2);
    ctx.fillStyle=grd;
    if(lifted){ ctx.shadowColor='rgba(200,20,60,.45)'; ctx.shadowBlur=ghost?26:14; ctx.shadowOffsetY=ghost?0:6; }
    ctx.fill();
    ctx.shadowBlur=0; ctx.shadowOffsetY=0;
    if(lifted){
      ctx.globalAlpha=0.5; ctx.fillStyle='rgba(255,255,255,.8)';
      ctx.beginPath();
      if(p.kind==='diamond') ctx.ellipse(-p.g*0.12,-p.g*0.12,p.g*0.16,p.g*0.09,-0.6,0,7);
      else ctx.ellipse(-p.r*0.2,-p.r*0.28,p.r*0.22,p.r*0.12,-0.5,0,7);
      ctx.fill();
    }
    ctx.restore();
  }

  /* ---- hati GEOMETRIS utuh (union wajik + 2 lobus) sbagai satu bentuk ---- */
  function addSemi(c,cx,cy,rot){
    const rho=H0.rho, N=26, cr=Math.cos(rot), sr=Math.sin(rot);
    for(let i=0;i<=N;i++){
      const ang=-Math.PI/2 + Math.PI*i/N;              // busur dasar (menonjol +x)
      const bx=rho*Math.cos(ang), by=rho*Math.sin(ang);
      const x=cx+bx*cr-by*sr, y=cy+bx*sr+by*cr;
      if(i===0) c.moveTo(x,y); else c.lineTo(x,y);
    }
    c.closePath();
  }
  function geoHeartPath(c){
    const a=H0.a;
    c.moveTo(0,-a); c.lineTo(a,0); c.lineTo(0,a); c.lineTo(-a,0); c.closePath(); // wajik
    addSemi(c,  a/2,-a/2, -Math.PI*0.25);   // lobus kanan
    addSemi(c, -a/2,-a/2, -Math.PI*0.75);   // lobus kiri
  }

  function drawTargetHint(){
    // siluet hati lembut sebagai panduan (tanpa garis dalam yang berantakan)
    ctx.save(); ctx.translate(H0.hx,H0.hyc);
    ctx.beginPath(); geoHeartPath(ctx);
    ctx.fillStyle='rgba(240,36,95,.12)'; ctx.fill();
    ctx.strokeStyle='rgba(240,36,95,.35)'; ctx.lineWidth=Math.max(1.5,H0.R*0.012);
    ctx.restore();
  }

  let completed=false, completeAt=0;
  function drawWholeHeart(alpha){
    ctx.save(); ctx.globalAlpha=alpha; ctx.translate(H0.hx,H0.hyc);
    ctx.beginPath(); geoHeartPath(ctx);
    const g=ctx.createLinearGradient(0,-H0.R*0.55,0,H0.R*0.6);
    g.addColorStop(0,'#ff6b6b'); g.addColorStop(.5,PINK1); g.addColorStop(1,PINK2);
    ctx.fillStyle=g; ctx.shadowColor='rgba(200,20,60,.5)'; ctx.shadowBlur=30;
    ctx.fill();
    ctx.shadowBlur=0; ctx.globalAlpha=alpha*0.5; ctx.fillStyle='rgba(255,255,255,.85)';
    ctx.beginPath(); ctx.ellipse(-H0.a*0.34,-H0.a*0.52,H0.a*0.26,H0.a*0.15,-.5,0,7); ctx.fill();
    ctx.restore();
  }

  function render(){
    if(!ctx)return;
    ctx.clearRect(0,0,W,Hh);
    const doneP = completed ? clamp01((performance.now()-completeAt)/450) : 0;
    if(!completed) drawTargetHint();
    for(const p of pieces){ if(p!==dragging){ ctx.globalAlpha=(completed?1-doneP:1); drawPiece(p,false);} }
    ctx.globalAlpha=1;
    if(dragging) drawPiece(dragging,true);
    if(completed) drawWholeHeart(doneP);
    if(completed && doneP<1) requestAnimationFrame(render);
  }

  /* ---- drag & drop ---- */
  function snapDist(){ return H0.R*0.6; }
  function pieceAt(x,y){
    for(let i=pieces.length-1;i>=0;i--){ const p=pieces[i];
      if(p.placed) continue;
      const base=(p.kind==='diamond'?p.g*0.6:p.r*1.05);
      const rr=Math.max(base*(p.curScale||1), 24);   // area sentuh minimum utk jari
      if(Math.hypot(x-p.x,y-p.y)<=rr) return p;
    }
    return null;
  }

  /* animasi halus: potongan MEMBESAR saat diangkat/dipasang, MENGECIL &
     kembali ke rak bila dilepas di tempat kosong. */
  function targetScaleOf(p){ return (p===dragging||p.placed)?1:(p.trayScale||1); }
  let animRaf=0;
  function startAnim(){
    if(animRaf||completed) return;
    const step=()=>{
      animRaf=0;
      let moving=false;
      for(const p of pieces){
        const ts=targetScaleOf(p);
        p.curScale+=(ts-p.curScale)*0.28;
        if(Math.abs(ts-p.curScale)>0.003) moving=true; else p.curScale=ts;
        if(p!==dragging){
          const tx=p.placed?p.homeSlot.x:p.trayX;
          const ty=p.placed?p.homeSlot.y:p.trayY;
          p.x+=(tx-p.x)*0.28; p.y+=(ty-p.y)*0.28;
          if(Math.abs(tx-p.x)>0.4||Math.abs(ty-p.y)>0.4) moving=true;
          else { p.x=tx; p.y=ty; }
        }
      }
      render();
      if((moving||dragging)&&!completed) animRaf=requestAnimationFrame(step);
    };
    animRaf=requestAnimationFrame(step);
  }

  function bindDrag(){ cv.addEventListener('pointerdown',onDown); }
  function onDown(ev){
    if(completed)return;
    const p=pieceAt(ev.clientX,ev.clientY); if(!p)return;
    ev.preventDefault();
    dragging=p; p._dx=ev.clientX-p.x; p._dy=ev.clientY-p.y;
    try{cv.setPointerCapture(ev.pointerId);}catch(_){}
    window.addEventListener('pointermove',onMove,{passive:false});
    window.addEventListener('pointerup',onUp,{passive:false});
    window.addEventListener('pointercancel',onUp,{passive:false});
    startAnim();
  }
  function onMove(ev){
    if(!dragging)return; ev.preventDefault();
    dragging.x=ev.clientX-dragging._dx; dragging.y=ev.clientY-dragging._dy;
    startAnim(); render();
  }
  function onUp(){
    window.removeEventListener('pointermove',onMove);
    window.removeEventListener('pointerup',onUp);
    window.removeEventListener('pointercancel',onUp);
    if(!dragging)return;
    const p=dragging, s=p.homeSlot;
    if(Math.hypot(p.x-s.x,p.y-s.y) < snapDist()){ p.x=s.x; p.y=s.y; p.placed=true; }
    dragging=null;
    startAnim();            // pasang di slot / kembali mengecil ke rak
    checkDone();
  }
  function checkDone(){
    if(!completed && pieces.length && pieces.every(p=>p.placed)){
      completed=true; completeAt=performance.now();
      setTimeout(()=>boardEl&&boardEl.querySelector('.zp-done').classList.add('on'),480);
      render();
      // setelah hati utuh & pesan tampil → awan hitam menutup → buka galaxy
      setTimeout(goToGalaxy, 2600);
    }
  }

  let goingGalaxy=false;
  /* pesan lembut saat awan hitam menutup: minta dia mengetuk planet nanti */
  function showGalaxyHint(){
    if(document.getElementById('zai-galaxy-hint')) return;
    const st=document.createElement('style'); st.id='zai-galaxy-hint-css';
    st.textContent=`
      #zai-galaxy-hint{position:fixed;inset:0;z-index:99999;display:flex;
        flex-direction:column;align-items:center;justify-content:center;
        text-align:center;pointer-events:none;padding:24px;
        font-family:"Baloo 2",ui-rounded,"Segoe UI",system-ui,sans-serif;
        opacity:0;transition:opacity .8s ease;}
      #zai-galaxy-hint.on{opacity:1;}
      #zai-galaxy-hint .zgh-emoji{font-size:clamp(34px,9vw,58px);
        filter:drop-shadow(0 0 18px rgba(180,150,255,.7));
        animation:zgh-float 2.6s ease-in-out infinite;}
      #zai-galaxy-hint .zgh-main{margin-top:14px;color:#fff;font-weight:800;
        font-size:clamp(22px,6vw,38px);line-height:1.2;
        text-shadow:0 0 22px rgba(255,120,190,.75),0 2px 10px rgba(0,0,0,.5);}
      #zai-galaxy-hint .zgh-sub{margin-top:10px;color:#ffd9ec;font-weight:600;
        font-size:clamp(14px,3.8vw,20px);opacity:.92;
        text-shadow:0 2px 10px rgba(0,0,0,.5);}
      @keyframes zgh-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
      @media (prefers-reduced-motion:reduce){
        #zai-galaxy-hint{transition:none;}#zai-galaxy-hint .zgh-emoji{animation:none;}}`;
    document.head.appendChild(st);
    const el=document.createElement('div'); el.id='zai-galaxy-hint';
    el.innerHTML=`<div class="zgh-emoji">🪐✨</div>
      <div class="zgh-main">Klik planet setelah animasi selesai ✨</div>
      <div class="zgh-sub">ada sesuatu untukmu di sana 💖</div>`;
    document.body.appendChild(el);
    requestAnimationFrame(()=>requestAnimationFrame(()=>el.classList.add('on')));
  }
  function goToGalaxy(){
    if(goingGalaxy) return; goingGalaxy=true;
    playClouds(function(){                 // saat layar TERTUTUP penuh
      showGalaxyHint();                    // pesan: ketuk planetnya
      setTimeout(function(){ location.href='galaxy'; }, 2000);  // URL bersih (tanpa .html)
    }, null, {stayCovered:true});          // awan gelap menutup lalu DIAM
  }

  window.ZaiPage2={
    start(){ if(started)return; started=true;
      // langsung tampil (tanpa awan hitam) → papan fade-in halus
      mountBoard();
      requestAnimationFrame(()=>requestAnimationFrame(revealBoard));
    }
  };
})();

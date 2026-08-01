/* ============================================================
   flower-spiral.js — efek partikel HADIAH:
   1) MENYEMBUR ke SEGALA PENJURU dari satu titik (burst),
   2) MEMENUHI seluruh layar (grid rapi), tahan penuh ~ beberapa detik,
   3) lalu JATUH lurus ke bawah seperti gravitasi (BUKAN muter / nyilang).
   Dua mode: 'love' (hati merah) & 'flower' (bunga biru).
   ============================================================ */
(function(){
  if (window.FlowerSpiralTransition) return;

  const SPRITE_PX=200;

  /* ---------- gambar bunga biru (dipertahankan) ---------- */
  function fAster(e,t){let n=.46*t;e.save();e.translate(t/2,t/2);
    for(let i=0;i<18;i++){e.save();e.rotate(i/18*Math.PI*2);e.beginPath();e.ellipse(0,-.72*n,.16*n,.44*n,0,0,2*Math.PI);let g=e.createLinearGradient(0,-n,0,-.3*n);g.addColorStop(0,'#bbdefb');g.addColorStop(1,'#1565c0');e.fillStyle=g;e.fill();e.restore();}
    for(let i=0;i<18;i++){e.save();e.rotate(i/18*Math.PI*2+Math.PI/18);e.beginPath();e.ellipse(0,-.54*n,.1*n,.28*n,0,0,2*Math.PI);e.fillStyle='#42a5f5';e.fill();e.restore();}
    let g=e.createRadialGradient(0,0,0,0,0,.34*n);g.addColorStop(0,'#123a72');g.addColorStop(.6,'#0a2550');g.addColorStop(1,'#05132e');e.beginPath();e.arc(0,0,.34*n,0,2*Math.PI);e.fillStyle=g;e.fill();
    e.fillStyle='#ffd54a';for(let a=1;a<=3;a++){let m=7*a;for(let l=0;l<m;l++){let ang=l/m*Math.PI*2+a,o=.08*n*a;e.beginPath();e.arc(Math.cos(ang)*o,Math.sin(ang)*o,.018*n,0,2*Math.PI);e.fill();}}
    e.restore();}
  function fDaisy(e,t){let n=.46*t;e.save();e.translate(t/2,t/2);
    for(let i=0;i<15;i++){e.save();e.rotate(i/15*Math.PI*2);e.beginPath();e.ellipse(0,-.62*n,.13*n,.46*n,0,0,2*Math.PI);e.fillStyle='#e3f2fd';e.shadowColor='rgba(30,60,120,.3)';e.shadowBlur=6;e.fill();e.restore();}
    let g=e.createRadialGradient(0,0,0,0,0,.3*n);g.addColorStop(0,'#fff59d');g.addColorStop(1,'#f9a825');e.beginPath();e.arc(0,0,.3*n,0,2*Math.PI);e.fillStyle=g;e.fill();e.restore();}
  function fRose(e,t){let n=.46*t;e.save();e.translate(t/2,t/2);
    const L=[{n:5,d:.66,rx:.24,ry:.4,c0:'#cfe3fb',c1:'#6faeee'},{n:6,d:.44,rx:.2,ry:.32,c0:'#6faeee',c1:'#2f7fe0'},{n:8,d:.24,rx:.16,ry:.24,c0:'#2f7fe0',c1:'#1557b0'}];
    for(const r of L)for(let i=0;i<r.n;i++){e.save();e.rotate(i/r.n*Math.PI*2);e.beginPath();e.ellipse(0,-n*r.d,n*r.rx,n*r.ry,0,0,2*Math.PI);let g=e.createLinearGradient(0,-n*r.d*1.4,0,0);g.addColorStop(0,r.c0);g.addColorStop(1,r.c1);e.fillStyle=g;e.fill();e.restore();}
    e.beginPath();e.arc(0,0,.13*n,0,2*Math.PI);e.fillStyle='#0d3d85';e.fill();e.restore();}
  function fCamellia(e,t){let n=.46*t;e.save();e.translate(t/2,t/2);
    const L=[{n:6,d:.6,rx:.26,ry:.36,c0:'#eaf3fe',c1:'#9fc6f5'},{n:7,d:.38,rx:.2,ry:.28,c0:'#9fc6f5',c1:'#5b9ae8'},{n:5,d:.18,rx:.15,ry:.2,c0:'#5b9ae8',c1:'#2a72d8'}];
    for(const r of L)for(let i=0;i<r.n;i++){e.save();e.rotate(i/r.n*Math.PI*2+r.d);e.beginPath();e.ellipse(0,-n*r.d,n*r.rx,n*r.ry,0,0,2*Math.PI);let g=e.createLinearGradient(0,-n*r.d*1.4,0,0);g.addColorStop(0,r.c0);g.addColorStop(1,r.c1);e.fillStyle=g;e.fill();e.restore();}
    e.fillStyle='#ffe082';for(let i=0;i<8;i++){let a=i/8*Math.PI*2;e.beginPath();e.arc(Math.cos(a)*n*.06,Math.sin(a)*n*.06,.03*n,0,2*Math.PI);e.fill();}e.restore();}
  function fHydrangea(e,t){let n=.46*t;e.save();e.translate(t/2,t/2);
    const cols=['#7986cb','#5c6bc0','#42a5f5','#64b5f6','#90caf9','#b39ddb'];const pts=[];
    for(let ring=0;ring<=2;ring++){let cnt=ring===0?1:6*ring;for(let a=0;a<cnt;a++){let ang=a/cnt*Math.PI*2+.5*ring,rr=ring*n*.34;pts.push({x:Math.cos(ang)*rr,y:Math.sin(ang)*rr,col:cols[(6*ring+a)%cols.length]});}}
    for(const p of pts){let r=.34*n;for(let k=0;k<4;k++){e.save();e.translate(p.x,p.y);e.rotate(k/4*Math.PI*2);e.beginPath();e.ellipse(0,-.5*r,.24*r,.4*r,0,0,2*Math.PI);e.fillStyle=p.col;e.fill();e.restore();}e.beginPath();e.arc(p.x,p.y,.14*r,0,2*Math.PI);e.fillStyle='#fff9c4';e.fill();}e.restore();}

  /* ---------- gambar hati merah (love) ---------- */
  function fHeart(e,t){
    const n=t*.42; e.save(); e.translate(t/2,t*.46);
    const g=e.createLinearGradient(0,-n,0,n*1.2);
    g.addColorStop(0,'#ff6b6b'); g.addColorStop(.5,'#f0243d'); g.addColorStop(1,'#c40024');
    e.fillStyle=g; e.shadowColor='rgba(220,20,50,.45)'; e.shadowBlur=t*.05;
    e.beginPath();
    e.moveTo(0,n*.98);
    e.bezierCurveTo(-n*1.35,-n*.15,-n*.72,-n*1.12,0,-n*.42);
    e.bezierCurveTo(n*.72,-n*1.12,n*1.35,-n*.15,0,n*.98);
    e.closePath(); e.fill();
    e.shadowBlur=0; e.globalAlpha=.55; e.fillStyle='rgba(255,255,255,.85)';
    e.beginPath(); e.ellipse(-n*.4,-n*.42,n*.2,n*.13,-0.5,0,2*Math.PI); e.fill();
    e.restore();
  }

  const FLOWERS=[fAster,fDaisy,fRose,fCamellia,fHydrangea];
  let flowerSprites=null, heartSprite=null;
  function buildFlowerSprites(){ if(flowerSprites)return flowerSprites;
    flowerSprites=FLOWERS.map(fn=>{const c=document.createElement('canvas');c.width=c.height=SPRITE_PX;fn(c.getContext('2d'),SPRITE_PX);return c;});
    return flowerSprites; }
  function buildHeartSprite(){ if(heartSprite)return heartSprite;
    const c=document.createElement('canvas');c.width=c.height=SPRITE_PX;fHeart(c.getContext('2d'),SPRITE_PX);heartSprite=c;return c; }

  /* ---------- sprite MODE 'mixed' (foto asli): biru, kuning, coklat, hati ----------
     dipakai untuk animasi FINALE full-layar (semua elemen KECUALI keranjang). */
  const MIXED_SRC=['biru','kuning','coklat','love'];  // tanpa ekstensi → resolver pilih format yg ada
  const MIXED_COUNT=MIXED_SRC.length;
  let mixedSprites=null;
  function buildMixedSprites(){ if(mixedSprites)return mixedSprites;
    mixedSprites=MIXED_SRC.map(name=>{
      const im=new Image();
      if(window.ZaiAsset){
        // pasang fallback berantai dulu, lalu set src ke kandidat teratas
        ZaiAsset.img(im, name);
        // pastikan URL final (yg BENAR-BENAR ada) dipakai bila beda ekstensi
        ZaiAsset.resolve(name).then(url=>{ if(im.src.indexOf(url)===-1) im.src=url; });
      } else { im.src=name+'.webp'; }
      return im;
    });
    return mixedSprites; }

  /* ---------- canvas ---------- */
  let canvas,ctx,raf=0,playing=false;
  function ensureCanvas(){ if(canvas)return;
    canvas=document.createElement('canvas');
    canvas.style.cssText='position:fixed;left:0;top:0;width:100vw;height:100vh;z-index:99999;pointer-events:none;';
    (document.body||document.documentElement).appendChild(canvas); }
  function resize(){ const dpr=Math.min(window.devicePixelRatio||1,1.5);
    canvas.width=Math.ceil(innerWidth*dpr);canvas.height=Math.ceil(innerHeight*dpr);
    ctx=canvas.getContext('2d',{alpha:true});ctx.setTransform(dpr,0,0,dpr,0,0); }

  const rand=(a,b)=>a+Math.random()*(b-a);
  const clamp01=x=>x<0?0:x>1?1:x;
  const easeOutCubic=p=>1-Math.pow(1-p,3);
  const easeInCubic=p=>p*p*p;
  const easeOutBack=p=>{const c1=1.70158,c3=c1+1;return 1+c3*Math.pow(p-1,3)+c1*Math.pow(p-1,2);};

  /* ---------- timeline (ms) ----------
     BURST → penuh, HOLD (tahan penuh), FALL (jatuh lurus)         */
  const BURST_SPREAD=520;   // sebar giliran menyembur antar partikel
  const BURST_DUR=760;      // durasi 1 partikel terbang dari titik asal ke posisinya
  const HOLD=3200;          // TAHAN layar penuh (memenuhi layar beberapa detik)
  const FALL_SPREAD=900;    // sebar giliran jatuh
  const FALL_DUR=1500;      // durasi jatuh 1 partikel sampai lewat bawah layar

  function imgIndexFor(mode,i,tx,ty){
    if(mode==='love') return 0;
    if(mode==='mixed') return i%MIXED_COUNT;        // giliran: biru,kuning,coklat,hati,...
    return Math.abs((tx|0)+(ty|0))%FLOWERS.length;  // flower
  }

  /* ---- layout GRID (dipakai flower & mixed): rapi memenuhi layar ---- */
  function buildGrid(mode,origin){
    const vw=innerWidth,vh=innerHeight;
    const ox=origin&&isFinite(origin.x)?origin.x:vw/2;
    const oy=origin&&isFinite(origin.y)?origin.y:vh*0.5;
    const cell=Math.max(80,Math.sqrt(vw*vh/210));
    const cols=Math.ceil(vw/cell)+1, rows=Math.ceil(vh/cell)+1;
    const arr=[];
    const maxDist=Math.hypot(vw,vh)/2;
    let idx=0;
    for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
      const tx=(c+.5)*cell+rand(-.26,.26)*cell;
      const ty=(r+.5)*cell+rand(-.26,.26)*cell;
      // giliran menyembur: yang DEKAT titik asal keluar duluan -> gelombang menyebar ke segala penjuru
      const dist=Math.hypot(tx-ox,ty-oy);
      const burstFrac=clamp01(dist/maxDist);
      // giliran jatuh: baris ATAS jatuh lebih dulu -> terasa "runtuh ke bawah"
      const fallFrac=(r/rows);
      arr.push({
        tx,ty,
        // titik lontar sedikit MELEWATI target (overshoot arah radial) biar terasa "menyembur"
        burstDelay: burstFrac*BURST_SPREAD + rand(-40,40),
        fallDelay: fallFrac*FALL_SPREAD + rand(-40,40),
        size: cell*rand(1.3,1.7),
        rot: rand(-Math.PI,Math.PI),      // rotasi acak saat menyembur (mengecil ke 0 saat menetap)
        swayAmp: rand(10,34),             // ayunan halus saat jatuh (bukan nyilang)
        swayPhase: rand(0,Math.PI*2),
        fallRot: rand(-0.5,0.5),          // kemiringan lembut saat jatuh
        img: imgIndexFor(mode,idx++,tx,ty)
      });
    }
    return {arr,ox,oy,vw,vh,maxDist};
  }

  /* ---- layout SPIRAL (khusus 'love'): hati tersusun spiral phyllotaxis,
     tumbuh MEMUTAR dari titik asal mengikuti lengan spiral hingga memenuhi
     layar, lalu jatuh lurus ke bawah ---- */
  function buildSpiral(origin){
    const vw=innerWidth,vh=innerHeight;
    const ox=origin&&isFinite(origin.x)?origin.x:vw/2;
    const oy=origin&&isFinite(origin.y)?origin.y:vh*0.5;
    const cell=Math.max(76,Math.sqrt(vw*vh/240));
    const maxR=Math.hypot(vw,vh)/2+cell;            // sampai sudut terjauh -> penuh layar
    const GA=Math.PI*(3-Math.sqrt(5));              // golden angle -> spiral rapat merata
    const kR=cell*0.60;                             // jarak radial per langkah (rapat = penuh)
    const count=Math.ceil(Math.pow(maxR/kR,2))+40;
    const arr=[];
    for(let i=0;i<count;i++){
      const ang=i*GA;
      const rad=kR*Math.sqrt(i);
      if(rad>maxR) break;
      const jit=cell*0.14;
      const tx=ox+Math.cos(ang)*rad+rand(-jit,jit);
      const ty=oy+Math.sin(ang)*rad+rand(-jit,jit);
      const burstFrac=clamp01(rad/maxR);            // pusat keluar dulu -> spiral tumbuh ke luar
      const fallFrac=clamp01(ty/vh);                // yang atas jatuh dulu
      arr.push({
        tx,ty,
        spiralAng:ang, spiralRad:rad,               // untuk animasi memutar saat tumbuh
        burstDelay: burstFrac*(BURST_SPREAD*1.5) + rand(-30,30),
        fallDelay: fallFrac*FALL_SPREAD + rand(-40,40),
        size: cell*rand(1.1,1.5),
        rot: ang+Math.PI/2,                          // hati menghadap arah lengan spiral
        swayAmp: rand(10,30),
        swayPhase: rand(0,Math.PI*2),
        fallRot: rand(-0.4,0.4),
        img: 0
      });
    }
    return {arr,ox,oy,vw,vh,maxDist:maxR,spiral:true};
  }

  function buildParticles(mode,origin){
    return mode==='love' ? buildSpiral(origin) : buildGrid(mode,origin);
  }

  function play(mode,opts){
    opts=opts||{};
    if(playing)return;
    ensureCanvas();resize();
    const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
    playing=true;
    const isLove = mode==='love';
    const isMixed = mode==='mixed';
    const sprite = isLove ? buildHeartSprite() : null;
    const flowers = (isLove||isMixed) ? null : buildFlowerSprites();
    const mixed = isMixed ? buildMixedSprites() : null;
    const F=buildParticles(mode,opts.origin);

    const fullAt   = BURST_SPREAD+BURST_DUR;          // ~perkiraan layar penuh
    const holdEnd  = fullAt+HOLD;                     // mulai jatuh
    const fallEnd  = holdEnd+FALL_SPREAD+FALL_DUR;    // selesai

    // background lembut (sekali buat)
    const bg=ctx.createRadialGradient(F.ox,F.oy,0,F.vw/2,F.vh/2,Math.hypot(F.vw,F.vh)/1.4);
    if(isLove){ bg.addColorStop(0,'#ffe1e6');bg.addColorStop(.5,'#ff9aa8');bg.addColorStop(1,'#e64b63'); }
    else if(isMixed){ bg.addColorStop(0,'#fff7e6');bg.addColorStop(.5,'#ffd9a8');bg.addColorStop(1,'#ff8fb0'); }
    else{ bg.addColorStop(0,'#eaf3ff');bg.addColorStop(.5,'#8fbcf2');bg.addColorStop(1,'#3f7fd6'); }

    let start=null, firedFull=false, firedColl=false;

    if(reduce){ // hormati reduced-motion: langsung callback
      try{opts.onFull&&opts.onFull();}catch(_){}
      try{opts.onCollapse&&opts.onCollapse();}catch(_){}
      setTimeout(()=>{try{opts.onDone&&opts.onDone();}catch(_){}
        if(ctx)ctx.clearRect(0,0,F.vw,F.vh);playing=false;},60);
      return;
    }

    function frame(now){
      if(start===null)start=now;
      const t=now-start;
      ctx.clearRect(0,0,F.vw,F.vh);

      // ---- background ----
      let bgA;
      if(t<=holdEnd) bgA=easeOutCubic(clamp01(t/(fullAt*0.9)))*0.9;
      else bgA=(1-easeInCubic(clamp01((t-holdEnd)/(FALL_SPREAD+FALL_DUR))))*0.9;
      if(bgA>0){ ctx.save();ctx.globalAlpha=bgA;ctx.fillStyle=bg;ctx.fillRect(0,0,F.vw,F.vh);ctx.restore(); }

      if(!firedFull && t>=fullAt){ firedFull=true; try{opts.onFull&&opts.onFull();}catch(_){} }
      if(!firedColl && t>=holdEnd){ firedColl=true; try{opts.onCollapse&&opts.onCollapse();}catch(_){} }

      for(const f of F.arr){
        let x,y,rot,alpha=1,sc=1;

        if(t<holdEnd){
          // ---- fase MENYEMBUR + MENETAP (mengisi layar) ----
          const q=clamp01((t-f.burstDelay)/BURST_DUR);
          if(q<=0){ continue; }                  // belum waktunya keluar
          const e=easeOutBack(q);                // overshoot -> terasa "meletus/menyembur"
          if(F.spiral){
            // hati TUMBUH menyusuri lengan spiral: radius 0->target sambil MEMUTAR
            const rr=f.spiralRad*e;
            const aa=f.spiralAng - (1-easeOutCubic(q))*1.6;   // berputar masuk ke posisi
            x=F.ox+Math.cos(aa)*rr;
            y=F.oy+Math.sin(aa)*rr;
            rot=(aa+Math.PI/2)*(0.4+0.6*q);        // ikut arah spiral, menetap
          } else {
            x=F.ox+(f.tx-F.ox)*e;
            y=F.oy+(f.ty-F.oy)*e;
            rot=f.rot*(1-easeOutCubic(q));         // dari acak -> tegak (0)
          }
          sc=0.3+0.7*easeOutCubic(clamp01(q*1.2));
          alpha=clamp01(q*3);
        } else {
          // ---- fase JATUH lurus ke bawah (gravitasi), ayunan halus, TANPA muter ----
          const q=clamp01((t-holdEnd-f.fallDelay)/FALL_DUR);
          if(q<=0){ x=f.tx;y=f.ty;rot=0;sc=1;alpha=1; }
          else{
            const drop=easeInCubic(q)*(F.vh+f.size+200);   // akselerasi jatuh, lewat bawah layar
            x=f.tx + Math.sin(f.swayPhase+q*Math.PI*2)*f.swayAmp*(1-q*0.3); // ayun halus mengecil
            y=f.ty + drop;
            rot=f.fallRot*q;                                 // miring lembut, bukan berputar
            sc=1; alpha=1;                                   // hilang karena keluar layar, bukan fade
          }
        }

        const s=f.size*sc;
        if(s<=0||alpha<=0||y>F.vh+s) continue;
        const img = isLove ? sprite : (isMixed ? mixed[f.img] : flowers[f.img]);
        if(isMixed && (!img || !img.complete || !img.naturalWidth)) continue; // foto belum siap
        ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y);ctx.rotate(rot);
        ctx.drawImage(img,-s/2,-s/2,s,s);ctx.restore();
      }

      if(t<fallEnd)raf=requestAnimationFrame(frame);
      else{
        ctx.clearRect(0,0,F.vw,F.vh);playing=false;
        try{opts.onDone&&opts.onDone();}catch(_){}
      }
    }
    raf=requestAnimationFrame(frame);
  }

  window.addEventListener('resize',()=>{ if(canvas&&!playing)resize(); });
  (window.requestIdleCallback||function(f){setTimeout(f,300);})(()=>{try{buildFlowerSprites();buildHeartSprite();buildMixedSprites();}catch(_){}});

  window.FlowerSpiralTransition={
    play:(opts)=>play('flower',opts),      // kompat lama: default bunga
    playLove:(opts)=>play('love',opts),    // hati SPIRAL memenuhi layar
    playFlowers:(opts)=>play('flower',opts),
    playMixed:(opts)=>play('mixed',opts)   // FINALE: biru+kuning+coklat+hati (tanpa keranjang)
  };
})();

/* ============================================================
   script.js  —  San Valentín · Carta de amor
   Secciones:
     1. Configuración & estado
     2. p5 Sketch — Intro (corazones flotantes oscuro)
     3. p5 Sketch — Celebración "Sí"
     4. p5 Sketch — Fondo carta (corazones suaves)
     5. Auxiliar: dibujar corazón paramétrico
     6. Partículas CSS fondo pregunta
     7. Botón "No" con huida
     8. handleYes → transición a celebración → carta
     9. Animación del sobre (p5 + DOM)
    10. Typewriter con micro-corazones
    11. Arranque
   ============================================================ */


/* ─────────────────────────────────────────────────────────────
   1. CONFIGURACIÓN & ESTADO
   ───────────────────────────────────────────────────────────── */
const CFG = {
  introDuration    : 4000,   // ms pantalla intro
  introFadeOut     : 1100,   // ms fade-out intro
  yesDuration      : 3200,   // ms pantalla "sí" antes de carta
  bgParticles      : 14,     // burbujas fondo pregunta
  noEscapeRounds   : 4,      // veces que huye el botón No
  typewriterDelay  : 38,     // ms entre caracteres (título)
  typewriterDelayP : 28,     // ms entre caracteres (párrafos)
titleText : 'Pensaste que no te lo iba a pedir, ¿verdad?',

para0 : 'Jajaja, loquita… pues pensaste mal. La verdad es que no soy mucho de hacer algo solo porque todo el mundo lo hace en una fecha específica. No me gusta regalar o decir cosas bonitas solo porque "toca" ese día; a mí me nace hacerlo cuando realmente lo siento y quiero sorprenderte sin que lo esperes.',

para1 : 'Y creo que lo has notado, porque a veces, de la nada, te sorprendo con un ramo o algún detalle sin que sea una fecha especial. Me gusta hacerlo en momentos inesperados, porque sé que eso te hace sonreír aún más. Pero aun que sea asi no creas que no sabia que te morias de ganas por que te lo pediera jajaj, hoy quiero dedicarte estos pensamientos, porque no hay dia que no piense en ti.',
  signText         : '— El amor perdura a pesar de Todo ♥',
};

let noClickCount = 0;
let introSketch  = null;
let yesSketch    = null;
let letterSketch = null;


/* ─────────────────────────────────────────────────────────────
   2. p5 SKETCH — INTRO: corazones flotantes sobre fondo oscuro
   ───────────────────────────────────────────────────────────── */
function createIntroSketch(containerId) {
  return new p5(p => {
    const hearts = [];

    class Heart {
      constructor(randomY = false) { this.init(randomY); }
      init(randomY) {
        this.x    = p.random(p.width);
        this.y    = randomY ? p.random(p.height) : p.height + p.random(40, 100);
        this.sz   = p.random(10, 44);
        this.spd  = p.random(0.5, 2.0);
        this.drift = p.random(-0.5, 0.5);
        this.a    = p.random(110, 220);
        this.fade = p.random(0.4, 1.1);
        const pal = [[255,90,130],[210,50,90],[255,150,175],[170,40,80],[255,120,155]];
        this.c = p.random(pal);
      }
      update() {
        this.y -= this.spd; this.x += this.drift; this.a -= this.fade;
        if (this.a <= 0 || this.y < -this.sz * 2) this.init();
      }
      draw() {
        p.push(); p.translate(this.x, this.y); p.noStroke();
        p.fill(this.c[0], this.c[1], this.c[2], this.a);
        drawHeart(p, 0, 0, this.sz); p.pop();
      }
    }

    p.setup = () => {
      p.createCanvas(p.windowWidth, p.windowHeight).parent(containerId);
      p.frameRate(60);
      for (let i = 0; i < 55; i++) hearts.push(new Heart(true));
    };
    p.draw  = () => { p.clear(); hearts.forEach(h => { h.update(); h.draw(); }); };
    p.windowResized = () => p.resizeCanvas(p.windowWidth, p.windowHeight);
  });
}


/* ─────────────────────────────────────────────────────────────
   3. p5 SKETCH — CELEBRACIÓN "SÍ"
   ───────────────────────────────────────────────────────────── */
function createYesSketch(containerId) {
  return new p5(p => {
    const parts = [];

    class Particle {
      constructor(burst) {
        this.x  = burst ? p.random(p.width*0.25, p.width*0.75) : p.random(p.width);
        this.y  = burst ? p.random(p.height*0.25, p.height*0.75) : p.height + 50;
        this.vx = p.random(-3, 3);
        this.vy = burst ? p.random(-6, -1) : p.random(-2.5, -0.8);
        this.sz = p.random(9, 34);
        this.a  = 255;
        const pal = [[255,80,130],[255,160,190],[210,45,95],[255,195,215],[170,35,75]];
        this.c  = p.random(pal);
      }
      update() { this.x+=this.vx; this.y+=this.vy; this.vy+=0.045; this.a-=1.1; }
      draw()   { p.push();p.translate(this.x,this.y);p.noStroke();p.fill(this.c[0],this.c[1],this.c[2],this.a);drawHeart(p,0,0,this.sz);p.pop(); }
      dead()   { return this.a<=0 || this.y < -this.sz*2; }
    }

    p.setup = () => {
      p.createCanvas(p.windowWidth, p.windowHeight).parent(containerId);
      p.frameRate(60);
      for (let i = 0; i < 80; i++) parts.push(new Particle(true));
    };
    p.draw = () => {
      p.clear();
      if (p.frameCount % 4  === 0) parts.push(new Particle(false));
      if (p.frameCount % 18 === 0 && parts.length < 160)
        for (let i=0;i<8;i++) parts.push(new Particle(true));
      for (let i = parts.length-1; i >= 0; i--) {
        parts[i].update(); parts[i].draw();
        if (parts[i].dead()) parts.splice(i,1);
      }
    };
    p.windowResized = () => p.resizeCanvas(p.windowWidth, p.windowHeight);
  });
}


/* ─────────────────────────────────────────────────────────────
   4. p5 SKETCH — FONDO CARTA: corazones suaves y lentos
   ───────────────────────────────────────────────────────────── */
function createLetterBgSketch(containerId) {
  return new p5(p => {
    const hearts = [];

    class BgHeart {
      constructor() { this.reset(); }
      reset() {
        this.x   = p.random(p.width);
        this.y   = p.height + p.random(20, 80);
        this.sz  = p.random(6, 22);
        this.spd = p.random(0.25, 0.9);
        this.dr  = p.random(-0.3, 0.3);
        this.a   = p.random(30, 90);
        this.fd  = p.random(0.1, 0.3);
        // Tonos: vino claro y dorado apagado
        const pal = [
          [180, 80, 110, this.a],
          [200, 130, 80, this.a],
          [220, 100, 130, this.a],
          [160, 60,  90, this.a],
        ];
        this.c = p.random(pal);
      }
      update() {
        this.y -= this.spd; this.x += this.dr; this.a -= this.fd;
        if (this.a <= 0 || this.y < -this.sz) this.reset();
      }
      draw() {
        p.push(); p.translate(this.x, this.y); p.noStroke();
        p.fill(this.c[0], this.c[1], this.c[2], this.a); drawHeart(p, 0, 0, this.sz); p.pop();
      }
    }

    p.setup = () => {
      p.createCanvas(p.windowWidth, p.windowHeight).parent(containerId);
      p.frameRate(30);
      for (let i = 0; i < 40; i++) { const h = new BgHeart(); h.y = p.random(p.height); hearts.push(h); }
    };
    p.draw = () => { p.clear(); hearts.forEach(h=>{h.update();h.draw();}); };
    p.windowResized = () => p.resizeCanvas(p.windowWidth, p.windowHeight);
  });
}


/* ─────────────────────────────────────────────────────────────
   5. AUXILIAR: corazón paramétrico p5
   ───────────────────────────────────────────────────────────── */
function drawHeart(p, cx, cy, s) {
  p.beginShape();
  for (let t = 0; t < p.TWO_PI; t += 0.05) {
    const x = s * 0.05 * (16 * Math.pow(Math.sin(t), 3));
    const y = -s * 0.05 * (13*Math.cos(t) - 5*Math.cos(2*t) - 2*Math.cos(3*t) - Math.cos(4*t));
    p.vertex(cx + x, cy + y);
  }
  p.endShape(p.CLOSE);
}


/* ─────────────────────────────────────────────────────────────
   6. PARTÍCULAS CSS — fondo de la pregunta
   ───────────────────────────────────────────────────────────── */
function spawnBgParticles() {
  const wrap = document.getElementById('bg-particles');
  for (let i = 0; i < CFG.bgParticles; i++) {
    const el  = document.createElement('div');
    el.className = 'bg-particle';
    const sz  = Math.random() * 220 + 80;
    el.style.cssText = `
      width:${sz}px; height:${sz}px;
      left:${Math.random()*110-10}%;
      bottom:-${sz}px;
      animation-delay:${Math.random()*12}s;
      animation-duration:${Math.random()*14+12}s;
    `;
    wrap.appendChild(el);
  }
}


/* ─────────────────────────────────────────────────────────────
   7. BOTÓN "NO" — efecto de huida
   ───────────────────────────────────────────────────────────── */
function escapeNo(btn) {
  noClickCount++;
  const margin = 24;
  const newX = Math.random() * (window.innerWidth  - btn.offsetWidth  - margin*2) + margin;
  const newY = Math.random() * (window.innerHeight - btn.offsetHeight - margin*2) + margin;

  btn.style.cssText += `
    position:fixed; left:${newX}px; top:${newY}px; right:auto; bottom:auto;
    z-index:999;
    transition: left .35s ease, top .35s ease, transform .35s ease, opacity .35s ease;
  `;

  if (noClickCount > CFG.noEscapeRounds) {
    const s = Math.max(0.28, 1 - (noClickCount - CFG.noEscapeRounds) * 0.1);
    btn.style.transform = `scale(${s})`;
    btn.style.opacity   = Math.max(0.18, s);
  }
  if (noClickCount > CFG.noEscapeRounds + 6) btn.title = '¡Sabes que quieres! 😄';
}


/* ─────────────────────────────────────────────────────────────
   8. handleYes — celebración → carta
   ───────────────────────────────────────────────────────────── */
function handleYes() {
  const main = document.getElementById('main-content');
  main.style.transition = 'opacity .6s ease';
  main.style.opacity    = '0';

  setTimeout(() => {
    main.classList.add('hidden');

    const yesScreen = document.getElementById('yes-screen');
    yesScreen.classList.remove('hidden');
    yesScreen.style.opacity = '0';
    yesSketch = createYesSketch('yes-canvas-container');

    requestAnimationFrame(() => {
      yesScreen.style.transition = 'opacity .8s ease';
      yesScreen.style.opacity    = '1';
    });

    // Después de CFG.yesDuration → mostrar carta
    setTimeout(() => {
      yesScreen.style.transition = 'opacity .9s ease';
      yesScreen.style.opacity    = '0';

      setTimeout(() => {
        yesScreen.classList.add('hidden');
        if (yesSketch) { yesSketch.remove(); yesSketch = null; }
        showLetterScreen();
      }, 900);
    }, CFG.yesDuration);

  }, 600);
}


/* ─────────────────────────────────────────────────────────────
   9. PANTALLA CARTA — apertura del sobre + reveal carta
   ───────────────────────────────────────────────────────────── */
function showLetterScreen() {
  const screen = document.getElementById('letter-screen');
  screen.classList.remove('hidden');
  screen.style.opacity = '0';

  // Fondo p5 de la carta
  letterSketch = createLetterBgSketch('letter-bg-canvas');

  requestAnimationFrame(() => {
    screen.style.transition = 'opacity 1s ease';
    screen.style.opacity    = '1';

    // Esperar a que el sobre sea visible y luego animarlo
    setTimeout(() => animateEnvelope(), 900);
  });
}

/**
 * Secuencia de apertura del sobre:
 *  1. Vibración suave (shake)
 *  2. Romper sello (desaparece)
 *  3. Solapa se abre
 *  4. Carta sube desde dentro del sobre
 *  5. Sobre baja y desaparece
 *  6. Carta se centra y expande
 *  7. Inicia typewriter
 */
function animateEnvelope() {
  const env     = document.getElementById('envelope');
  const flap    = document.getElementById('env-top');
  const seal    = document.getElementById('env-seal');
  const card    = document.getElementById('letter-card');
  const stage   = document.getElementById('letter-stage');

  // ── Fase 1: shake del sobre (CSS keyframes inline) ──────
  env.style.animation = 'envShake 0.55s ease-in-out';
  env.style.animationFillMode = 'none';

  // Inyectamos keyframes de shake si no existen
  if (!document.getElementById('kf-shake')) {
    const style = document.createElement('style');
    style.id = 'kf-shake';
    style.textContent = `
      @keyframes envShake {
        0%,100%{transform:translateX(0) rotate(0deg)}
        15%{transform:translateX(-6px) rotate(-1.5deg)}
        35%{transform:translateX(6px) rotate(1.5deg)}
        55%{transform:translateX(-4px) rotate(-1deg)}
        75%{transform:translateX(4px) rotate(1deg)}
      }
    `;
    document.head.appendChild(style);
  }

  // ── Fase 2: romper sello ────────────────────────────────
  setTimeout(() => {
    seal.classList.add('broken');
  }, 400);

  // ── Fase 3: abrir solapa ────────────────────────────────
  setTimeout(() => {
    flap.classList.add('open');
  }, 650);

  // ── Fase 4: carta empieza a asomar ─────────────────────
  setTimeout(() => {
    card.style.transition = 'opacity 0.5s ease, transform 1.1s cubic-bezier(0.22,1,0.36,1)';
    card.style.opacity    = '1';
    card.style.transform  = 'translateX(-50%) translateY(-55%) scale(0.82)';
  }, 1000);

  // ── Fase 5: sobre baja y se va ─────────────────────────
  setTimeout(() => {
    env.style.transition  = 'opacity 0.7s ease, transform 0.7s ease';
    env.style.transform   = 'translateY(80px) scale(0.85)';
    env.style.opacity     = '0';
    env.style.pointerEvents = 'none';
  }, 1700);

  // ── Fase 6: carta se centra y es visible ───────────────
  setTimeout(() => {
    card.classList.add('revealed');
    // Pasar a flujo normal para que el contenedor lo gestione
    card.style.transition  = 'transform 0.9s cubic-bezier(0.22,1,0.36,1), opacity 0.3s';
    card.style.position    = 'relative';
    card.style.top         = 'auto';
    card.style.left        = 'auto';
    card.style.transform   = 'scale(1)';
    card.style.margin      = '0 auto';
    card.style.width       = 'min(560px, calc(100vw - 48px))';
    card.style.boxSizing   = 'border-box';
    card.style.overflow    = 'hidden';

    // Ocultar sobre del DOM para limpiar layout
    setTimeout(() => env.style.display = 'none', 700);

    // ── Fase 7: iniciar typewriter ─────────────────────
    setTimeout(() => startTypewriter(), 700);

  }, 2400);
}


/* ─────────────────────────────────────────────────────────────
   10. TYPEWRITER CON MICRO-CORAZONES
   ───────────────────────────────────────────────────────────── */

/**
 * Escribe texto carácter a carácter en un elemento.
 * Cada carácter aparece con una animación de "corazón" que flota y se desvanece.
 *
 * @param {HTMLElement} el        - elemento destino
 * @param {string}      text      - texto a escribir
 * @param {number}      delay     - ms entre caracteres
 * @param {boolean}     showHeart - si true, muestra micro-corazón junto a cada char
 * @returns {Promise}             - resuelve cuando termina
 */
function typeInto(el, text, delay, showHeart = true) {
  return new Promise(resolve => {
    let i = 0;
    const chars = [...text]; // spread para manejar emoji/unicode

    function next() {
      if (i >= chars.length) { resolve(); return; }

      const ch = chars[i];
      i++;

      // Span del carácter
      const span = document.createElement('span');

      if (ch === ' ' || ch === '\u00A0') {
        // Espacio: no animar, solo agregar
        span.innerHTML = '&nbsp;';
        span.className = 'char-space';
        el.appendChild(span);
      } else {
        span.textContent = ch;
        span.className   = 'char-span';
        span.style.animationDelay = '0ms';
        el.appendChild(span);

        // Micro-corazón (solo en un porcentaje de los caracteres para no saturar)
        if (showHeart && Math.random() < 0.28 && ch.trim()) {
          const hrt = document.createElement('span');
          hrt.className   = 'char-heart';
          hrt.textContent = '♥';
          el.appendChild(hrt);
          // Eliminar del DOM tras la animación
          hrt.addEventListener('animationend', () => hrt.remove(), { once: true });
        }
      }

      // Scroll suave si es necesario
      el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });

      setTimeout(next, delay);
    }

    next();
  });
}

/**
 * Orquesta la escritura de todos los textos de la carta
 * y luego revela firma y botón CTA.
 */
async function startTypewriter() {
  const titleEl = document.getElementById('letter-title');
  const para0   = document.getElementById('para-0');
  const para1   = document.getElementById('para-1');
  const signEl  = document.getElementById('letter-sign');
  const ctaWrap = document.getElementById('letter-cta');

  // Título (corazones más frecuentes)
  await typeInto(titleEl, CFG.titleText, CFG.typewriterDelay, true);

  // Pausa dramática entre título y cuerpo
  await sleep(420);

  // Párrafo 0
  await typeInto(para0, CFG.para0, CFG.typewriterDelayP, true);
  await sleep(280);

  // Párrafo 1
  await typeInto(para1, CFG.para1, CFG.typewriterDelayP, true);
  await sleep(400);

  // Firma
  signEl.textContent = CFG.signText;
  signEl.classList.add('visible');
  await sleep(900);

  // Botón CTA
  ctaWrap.classList.remove('hidden');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => ctaWrap.classList.add('visible'));
  });
}

/** Utilidad: promesa que espera `ms` milisegundos */
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }


/* ─────────────────────────────────────────────────────────────
   11. ARRANQUE
   ───────────────────────────────────────────────────────────── */
function startExperience() {
  introSketch = createIntroSketch('p5-canvas-container');
  spawnBgParticles();

  setTimeout(() => {
    const introScreen = document.getElementById('intro-screen');
    const mainContent = document.getElementById('main-content');

    introScreen.classList.add('fade-out');

    setTimeout(() => {
      mainContent.classList.remove('hidden');
      mainContent.style.opacity = '0';
      requestAnimationFrame(() => {
        mainContent.style.transition = 'opacity .9s ease';
        mainContent.style.opacity    = '1';
        document.body.style.overflow = 'auto';
      });

      setTimeout(() => {
        if (introSketch) { introSketch.remove(); introSketch = null; }
      }, CFG.introFadeOut + 500);

    }, CFG.introFadeOut / 2);

  }, CFG.introDuration);
}

document.addEventListener('DOMContentLoaded', startExperience);
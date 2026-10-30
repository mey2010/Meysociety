/*
 * Orquestación: scroll (GSAP ScrollTrigger) → progreso → cámara + luz + capa comercial.
 */
(function () {
  const cfg = window.CONCIERGE_CONFIG;
  const params = new URLSearchParams(location.search);
  const apiKey = params.get('key') || cfg.googleMapsApiKey;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lowPower = matchMedia('(pointer: coarse)').matches || (navigator.hardwareConcurrency || 8) <= 4;
  const pad = (n) => String(n).padStart(2, '0');

  // --- Línea de tiempo: segmentos travel/hold medidos en pantallas de scroll ---
  const segments = [];
  let total = 0;
  cfg.scenes.forEach((s, i) => {
    if (i > 0 && s.travel) { segments.push({ type: 'travel', from: i - 1, to: i, start: total, len: s.travel }); total += s.travel; }
    segments.push({ type: 'hold', scene: i, start: total, len: s.hold }); total += s.hold;
  });
  const holdOf = (i) => segments.find((s) => s.type === 'hold' && s.scene === i);

  const track = document.getElementById('world-track');
  track.style.height = `${(total + 1) * 100}vh`;

  // smootherstep: la cámara arranca y frena suave, y queda quieta en cada hold.
  const ease = (t) => t * t * t * (t * (t * 6 - 15) + 10);
  const clamp01 = (x) => Math.min(1, Math.max(0, x));

  function stateAt(units) {
    const seg = segments.find((s) => units < s.start + s.len) || segments[segments.length - 1];
    if (seg.type === 'hold') {
      const s = cfg.scenes[seg.scene];
      return { cam: s.camera, light: s.light, seg };
    }
    const t = clamp01((units - seg.start) / seg.len);
    const a = cfg.scenes[seg.from], b = cfg.scenes[seg.to];
    const e = reducedMotion ? Math.round(t) : ease(t);
    return { cam: ConciergeWorld.lerpCamera(a.camera, b.camera, e), light: a.light + (b.light - a.light) * e, seg };
  }

  // --- Capa comercial ---
  const panels = document.getElementById('panels');
  const rail = document.getElementById('rail');
  const counter = document.getElementById('counter');
  const mask = document.getElementById('villa-mask');
  const grade = document.getElementById('grade');
  const railFill = document.getElementById('rail-fill');

  // Titulares que entran palabra a palabra (CSS, escalonado con --i).
  const splitWords = (text) => text.split(' ').map((w, i) => `<span class="w"><span style="--i:${i}">${w}</span></span>`).join(' ');

  cfg.scenes.forEach((s, i) => {
    if (!s.title) return;
    const p = document.createElement('section');
    p.className = 'panel' + (s.constellation ? ' panel-finale' : '');
    p.dataset.scene = i;
    p.innerHTML = `
      <p class="eyebrow"><span class="num">${pad(s.number)}</span>${s.eyebrow}</p>
      <h2 class="${i === 0 ? 'hero' : ''}">${splitWords(s.title)}</h2>
      <p class="body">${s.body}</p>
      ${s.verified ? '' : '<p class="pending">Location pending validation</p>'}
      ${s.cards ? `<div class="cards">${s.cards.map(cardHTML).join('')}</div>` : ''}
      ${s.cta ? `<a class="btn ${s.cta.primary ? '' : 'ghost'}" href="${s.cta.href}">${s.cta.label}</a>` : ''}`;
    panels.appendChild(p);
    const dot = document.createElement('li');
    dot.innerHTML = `<span class="rail-num">${pad(s.number)}</span><span class="rail-label">${s.label}</span>`;
    dot.dataset.scene = i;
    rail.appendChild(dot);
  });

  function cardHTML(c) {
    return `<article class="card">
      <div class="card-media" role="img" aria-label="Authentic photo pending"><span>Photo pending</span></div>
      <div class="card-body">
        <h3>${c.name}</h3><p class="meta">${c.meta}</p>
        <ul>${c.features.map((f) => `<li>${f}</li>`).join('')}</ul>
        <a class="btn small" href="#concierge" data-service="Villas & accommodation">Enquire</a>
      </div></article>`;
  }

  // --- Constelación: los servicios se unen alrededor del concierge ---
  const svg = document.getElementById('constellation');
  const N = cfg.constellation.length;
  const nodes = cfg.constellation.map((label, k) => {
    const a = -Math.PI / 2 + (k / N) * Math.PI * 2;
    return { label, x: 500 + Math.cos(a) * 360, y: 500 + Math.sin(a) * 330 };
  });
  svg.innerHTML = `
    <g class="ring">${nodes.map((n, k) => {
      const m = nodes[(k + 1) % N];
      return `<line pathLength="1" x1="${n.x}" y1="${n.y}" x2="${m.x}" y2="${m.y}" style="--k:${k}"/>`;
    }).join('')}</g>
    <g class="spokes">${nodes.map((n, k) => `<line pathLength="1" x1="500" y1="500" x2="${n.x}" y2="${n.y}" style="--k:${k}"/>`).join('')}</g>
    <g class="nodes">${nodes.map((n, k) => `
      <g class="node" style="--k:${k}" transform="translate(${n.x} ${n.y})">
        <circle r="7"/><circle class="halo" r="16"/>
        <text y="${n.y < 500 ? -30 : 44}" text-anchor="middle">${n.label}</text>
      </g>`).join('')}</g>
    <g class="core"><circle r="76"/><text y="-6" text-anchor="middle">One</text><text y="26" text-anchor="middle">concierge</text></g>`;

  const finaleIdx = cfg.scenes.findIndex((s) => s.constellation);
  const villasIdx = cfg.scenes.findIndex((s) => s.mask);

  function render(progress) {
    const units = progress * total;
    const { cam, light, seg } = stateAt(units);
    world && world.setCamera(cam);
    grade.style.setProperty('--light', light.toFixed(3));
    document.body.classList.toggle('scrolled', progress > 0.02);

    // Copy visible solo durante el hold de su escena.
    const active = seg.type === 'hold' ? seg.scene : -1;
    panels.querySelectorAll('.panel').forEach((p) => p.classList.toggle('on', Number(p.dataset.scene) === active));

    // Raíl de escenas + contador.
    let current = cfg.scenes[0];
    rail.querySelectorAll('li').forEach((d) => {
      const i = Number(d.dataset.scene);
      const reached = units >= holdOf(i).start - 0.5;
      d.classList.toggle('on', reached);
      if (reached) current = cfg.scenes[i];
    });
    railFill.style.transform = `scaleY(${progress.toFixed(4)})`;
    counter.innerHTML = `<b>${pad(current.number)}</b> / ${pad(cfg.totalScenes)}`;

    // Máscara piscina → mar: el vídeo real de la villa se abre en arco.
    const vh = holdOf(villasIdx);
    const r = clamp01((units - (vh.start - 0.6)) / 1.2) * (1 - clamp01((units - (vh.start + vh.len - 0.4)) / 0.6));
    mask.style.setProperty('--reveal', r.toFixed(3));

    // Constelación: aparece durante el último vuelo y se completa en el hold final.
    const fh = holdOf(finaleIdx);
    const c = clamp01((units - (fh.start - 1.2)) / (1.2 + fh.len * 0.6));
    svg.style.setProperty('--c', c.toFixed(3));
    svg.classList.toggle('on', c > 0);
    document.body.classList.toggle('finale', c > 0.05);
  }

  // --- Formulario concierge multiservicio → WhatsApp ---
  const form = document.getElementById('concierge-form');
  const services = document.getElementById('services');
  const svcError = document.getElementById('services-error');
  cfg.services.forEach((name) => {
    const id = 'svc-' + name.replace(/\W+/g, '-').toLowerCase();
    services.insertAdjacentHTML('beforeend',
      `<label class="chip" for="${id}"><input type="checkbox" id="${id}" name="services" value="${name}"><span>${name}</span></label>`);
  });
  services.addEventListener('change', () => { svcError.hidden = true; });
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-service]');
    if (!a) return;
    const box = form.querySelector(`input[value="${a.dataset.service}"]`);
    if (box) box.checked = true;
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = new FormData(form);
    if (!d.getAll('services').length) {
      svcError.hidden = false;
      services.querySelector('input').focus();
      return;
    }
    const lines = [
      `Hello ${cfg.brand.name}, I would like to create a private experience.`,
      `Services: ${d.getAll('services').join(', ')}`,
      `Dates: ${d.get('from') || '—'} → ${d.get('to') || '—'}`,
      `Guests: ${d.get('guests') || '—'}`,
      `Name: ${d.get('name')}`,
      d.get('notes') ? `Notes: ${d.get('notes')}` : '',
    ].filter(Boolean);
    window.open(`https://wa.me/${cfg.whatsapp}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener');
  });
  document.querySelectorAll('[data-wa]').forEach((a) => {
    a.href = `https://wa.me/${cfg.whatsapp}?text=${encodeURIComponent(`Hello ${cfg.brand.name}`)}`;
  });
  document.querySelectorAll('[data-email]').forEach((a) => { a.href = `mailto:${cfg.email}`; a.textContent = cfg.email; });

  // El mapa queda tapado por la sección clara: cabecera en modo claro.
  new IntersectionObserver(([e]) => document.body.classList.toggle('on-light', e.isIntersecting), { rootMargin: '0px 0px -92% 0px' })
    .observe(document.getElementById('concierge'));

  // --- Arranque ---
  let world = null;
  const status = document.getElementById('status');
  const intro = document.getElementById('intro');
  const liftIntro = () => document.body.classList.add('ready');

  function hasWebGL() {
    try { return !!document.createElement('canvas').getContext('webgl2'); } catch (_) { return false; }
  }

  async function boot() {
    setTimeout(liftIntro, 4500); // nunca bloquear la página por la carga del mapa
    if (hasWebGL() && window.Cesium) {
      try {
        world = await ConciergeWorld.createWorld('cesium', document.getElementById('credits'), { apiKey, lowPower });
        if (world.mode === 'satellite') status.textContent = 'Preview · satellite imagery — photorealistic 3D activates with a Google Maps key';
        world.ready().then(() => setTimeout(liftIntro, 600));
      } catch (err) {
        console.error(err);
        document.body.classList.add('no-3d');
        status.textContent = 'Photorealistic 3D unavailable · editorial mode';
        liftIntro();
      }
    } else {
      document.body.classList.add('no-3d');
      liftIntro();
    }
    intro.addEventListener('transitionend', () => intro.remove(), { once: true });

    gsap.registerPlugin(ScrollTrigger);
    const state = { p: 0 };
    gsap.to(state, {
      p: 1, ease: 'none',
      onUpdate: () => render(state.p),
      scrollTrigger: { trigger: track, start: 'top top', end: 'bottom bottom', scrub: reducedMotion ? true : 1.2 },
    });
    render(0);
  }

  boot();
})();

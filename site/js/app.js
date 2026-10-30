/*
 * Orquestación: scroll (GSAP ScrollTrigger) → progreso → cámara + capa comercial.
 */
(function () {
  const cfg = window.CONCIERGE_CONFIG;
  const params = new URLSearchParams(location.search);
  const apiKey = params.get('key') || cfg.googleMapsApiKey;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lowPower = matchMedia('(pointer: coarse)').matches || (navigator.hardwareConcurrency || 8) <= 4;

  // --- Línea de tiempo: segmentos travel/hold medidos en pantallas de scroll ---
  const segments = [];
  let total = 0;
  cfg.scenes.forEach((s, i) => {
    if (i > 0 && s.travel) { segments.push({ type: 'travel', from: i - 1, to: i, start: total, len: s.travel }); total += s.travel; }
    segments.push({ type: 'hold', scene: i, start: total, len: s.hold }); total += s.hold;
  });

  const track = document.getElementById('world-track');
  track.style.height = `${(total + 1) * 100}vh`;

  // smootherstep: la cámara arranca y frena suave, y queda quieta en cada hold.
  const ease = (t) => t * t * t * (t * (t * 6 - 15) + 10);

  function cameraAt(units) {
    const seg = segments.find((s) => units < s.start + s.len) || segments[segments.length - 1];
    if (seg.type === 'hold') return { cam: cfg.scenes[seg.scene].camera, scene: seg.scene, local: (units - seg.start) / seg.len, seg };
    const t = Math.min(1, Math.max(0, (units - seg.start) / seg.len));
    const a = cfg.scenes[seg.from].camera, b = cfg.scenes[seg.to].camera;
    return { cam: ConciergeWorld.lerpCamera(a, b, reducedMotion ? Math.round(t) : ease(t)), scene: t < 0.5 ? seg.from : seg.to, local: t, seg };
  }

  // --- Capa comercial ---
  const panels = document.getElementById('panels');
  const rail = document.getElementById('rail');
  const mask = document.getElementById('villa-mask');

  cfg.scenes.forEach((s, i) => {
    if (s.title) {
      const p = document.createElement('section');
      p.className = 'panel';
      p.dataset.scene = i;
      p.innerHTML = `
        <p class="eyebrow">${s.eyebrow}</p>
        <h2 class="${i === 0 ? 'hero' : ''}">${s.title}</h2>
        <p class="body">${s.body}</p>
        ${s.verified ? '' : '<p class="pending">Location pending validation</p>'}
        ${s.cards ? `<div class="cards">${s.cards.map(cardHTML).join('')}</div>` : ''}
        ${s.cta ? `<a class="btn ghost" href="${s.cta.href}">${s.cta.label}</a>` : ''}`;
      panels.appendChild(p);
      const dot = document.createElement('li');
      dot.innerHTML = `<span>${s.label}</span>`;
      dot.dataset.scene = i;
      rail.appendChild(dot);
    }
  });

  function cardHTML(c) {
    const subject = encodeURIComponent(`Enquiry: ${c.name}`);
    return `<article class="card">
      <div class="card-media" aria-label="Authentic photo pending"><span>Photo pending</span></div>
      <div class="card-body">
        <h3>${c.name}</h3><p class="meta">${c.meta}</p>
        <ul>${c.features.map((f) => `<li>${f}</li>`).join('')}</ul>
        <a class="btn small" href="#concierge" data-service="Villas & accommodation" data-subject="${subject}">Enquire</a>
      </div></article>`;
  }

  function render(progress) {
    const units = progress * total;
    const { cam, seg } = cameraAt(units);
    world && world.setCamera(cam);

    // Copy visible solo durante el hold de su escena (fade de entrada/salida).
    const active = seg.type === 'hold' ? seg.scene : -1;
    panels.querySelectorAll('.panel').forEach((p) => {
      const on = Number(p.dataset.scene) === active;
      p.classList.toggle('on', on);
    });
    rail.querySelectorAll('li').forEach((d) => {
      const i = Number(d.dataset.scene);
      d.classList.toggle('on', units >= segments.find((s) => s.type === 'hold' && s.scene === i).start - 0.5);
    });

    // Máscara piscina → mar: el vídeo real de la villa se abre en arco
    // durante el último tramo de la aproximación y el hold de villas.
    const villasIdx = cfg.scenes.findIndex((s) => s.mask);
    const villaHold = segments.find((s) => s.type === 'hold' && s.scene === villasIdx);
    const r = Math.min(1, Math.max(0, (units - (villaHold.start - 0.6)) / 1.2));
    mask.style.setProperty('--reveal', r.toFixed(3));
  }

  // --- Formulario concierge multiservicio → WhatsApp ---
  const form = document.getElementById('concierge-form');
  const services = document.getElementById('services');
  cfg.services.forEach((name) => {
    const id = 'svc-' + name.replace(/\W+/g, '-').toLowerCase();
    services.insertAdjacentHTML('beforeend',
      `<label class="chip" for="${id}"><input type="checkbox" id="${id}" name="services" value="${name}"><span>${name}</span></label>`);
  });
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-service]');
    if (!a) return;
    const box = form.querySelector(`input[value="${a.dataset.service}"]`);
    if (box) box.checked = true;
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = new FormData(form);
    const lines = [
      `Hello ${cfg.brand.name}, I would like to create a private experience.`,
      `Services: ${d.getAll('services').join(', ') || '—'}`,
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

  function hasWebGL() {
    try { return !!document.createElement('canvas').getContext('webgl2'); } catch (_) { return false; }
  }

  async function boot() {
    if (hasWebGL() && window.Cesium) {
      try {
        world = await ConciergeWorld.createWorld('cesium', document.getElementById('credits'), { apiKey, lowPower });
        if (world.mode === 'osm') status.textContent = 'Preview · OpenStreetMap (add a Google Maps key for photorealistic 3D)';
      } catch (err) {
        console.error(err);
        document.body.classList.add('no-3d');
        status.textContent = 'Photorealistic 3D unavailable · editorial mode';
      }
    } else {
      document.body.classList.add('no-3d');
    }

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

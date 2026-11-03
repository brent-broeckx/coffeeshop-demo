import './journey.css';

type Mode = 'walk' | 'bike';

interface Plan {
  label: string;
  icon: string;
  tripMin: number;
  realMs: number;
}

const plans: Record<Mode, Plan> = {
  walk: { label: 'Walking', icon: 'ph-person-simple-walk', tripMin: 14, realMs: 13000 },
  bike: { label: 'Cycling', icon: 'ph-bicycle', tripMin: 6, realMs: 9000 },
};

// Share of the trip after which the order is placed from the phone.
const ORDER_AT = 0.18;
const START_CLOCK_MIN = 8 * 60 + 10;
const ROOM_C = 22;
const POUR_C = 70;
const COOL_RATE = 0.06;
const BREW_MIN = 2.4;

// Barista pipeline, in minutes before the guest arrives.
const stages = [
  { until: 3, label: 'Order in. We start when you are 3 min out' },
  { until: 2.2, label: 'Grinding fresh beans' },
  { until: 1.4, label: 'Pulling the shot' },
  { until: 0.6, label: 'Steaming the milk' },
  { until: 0, label: 'Poured and waiting on the pass' },
];
const POUR_BEFORE_ARRIVAL = 0.6;

// Map is drawn in a 800x500 viewBox. Streets are the gaps between blocks.
const VB_W = 800;
const VB_H = 500;
const xs = [-40, 100, 230, 330, 450, 560, 680, 840];
const ys = [-40, 70, 190, 310, 420, 540];
const RIVER_COL = 2;
const parks = new Set(['1-1', '4-3', '0-4']);
const SHOP_CELL = '6-1';
const HOME_CELL = '1-4';
const ROUTE = 'M165 420 H230 V310 H560 V190 H680 V125';
const HOME = { x: 165, y: 420 };
const SHOP = { x: 680, y: 125 };

const cooled = (minutes: number) => ROOM_C + (POUR_C - ROOM_C) * Math.exp(-COOL_RATE * minutes);
const pad = (n: number) => String(n).padStart(2, '0');
const clock = (min: number) => `${pad(Math.floor(min / 60) % 24)}:${pad(Math.floor(min % 60))}`;
const countdown = (min: number) => {
  const s = Math.max(0, Math.round(min * 60));
  return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
};
const pct = (v: number, of: number) => `${(v / of) * 100}%`;

function blocks() {
  let out = '';
  for (let c = 0; c < xs.length - 1; c++) {
    for (let r = 0; r < ys.length - 1; r++) {
      if (c === RIVER_COL) continue;
      const key = `${c}-${r}`;
      const x = xs[c] + 13;
      const y = ys[r] + 13;
      const w = xs[c + 1] - xs[c] - 26;
      const h = ys[r + 1] - ys[r] - 26;
      if (parks.has(key)) {
        out += `<rect class="jm-park" x="${x}" y="${y}" width="${w}" height="${h}" rx="10" />`;
        for (let i = 0; i < 5; i++) {
          const tx = x + 18 + ((i * 37) % (w - 30));
          const ty = y + 18 + ((i * 53) % (h - 30));
          out += `<circle class="jm-tree" cx="${tx}" cy="${ty}" r="${7 + (i % 3) * 2}" />`;
        }
        continue;
      }
      const kind = key === SHOP_CELL ? ' jm-block--shop' : key === HOME_CELL ? ' jm-block--home' : '';
      // Two-tone split gives each block a few separate buildings.
      const split = (c + r) % 2 === 0 ? w * 0.55 : h * 0.5;
      const parts =
        (c + r) % 2 === 0
          ? [
              [x, y, split - 4, h],
              [x + split + 4, y, w - split - 4, h],
            ]
          : [
              [x, y, w, split - 4],
              [x, y + split + 4, w, h - split - 4],
            ];
      for (const [bx, by, bw, bh] of parts) {
        out += `<rect class="jm-wall${kind}" x="${bx}" y="${by + 7}" width="${bw}" height="${bh}" rx="6" />`;
        out += `<rect class="jm-block${kind}" x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="6" />`;
      }
    }
  }
  return out;
}

function bridges() {
  return ys
    .slice(1, -1)
    .map(
      (y) =>
        `<rect class="jm-bridge" x="${xs[RIVER_COL] - 4}" y="${y - 13}" width="${xs[RIVER_COL + 1] - xs[RIVER_COL] + 8}" height="26" rx="4" />`,
    )
    .join('');
}

const mapSvg = `
  <svg class="journey__svg" viewBox="0 0 ${VB_W} ${VB_H}" preserveAspectRatio="none" aria-hidden="true">
    <rect class="jm-street" width="${VB_W}" height="${VB_H}" />
    <rect class="jm-quay" x="${xs[RIVER_COL] + 6}" y="-10" width="${xs[RIVER_COL + 1] - xs[RIVER_COL] - 12}" height="${VB_H + 20}" />
    <path class="jm-river" d="M392 -10 C420 90, 360 170, 390 250 S418 410, 386 510" />
    ${bridges()}
    ${blocks()}
    <text class="jm-label" x="372" y="470" transform="rotate(-80 372 470)">Leie</text>
    <text class="jm-label" x="470" y="303">Veldstraat</text>
    <text class="jm-label" x="112" y="64">Citadelpark</text>
    <path class="jm-route" d="${ROUTE}" />
    <path class="jm-trail" d="${ROUTE}" data-trail />
  </svg>`;

const pin = (cls: string, x: number, y: number, inner: string, attrs = '') =>
  `<div class="journey__pin ${cls}" style="--x:${pct(x, VB_W)};--y:${pct(y, VB_H)}" ${attrs}><span class="journey__pin-body">${inner}</span></div>`;

const template = `
  <section class="journey" id="journey" aria-labelledby="journey-title">
    <div class="journey__copy">
      <p class="eyebrow reveal">Order on the way</p>
      <h2 class="section-title reveal" id="journey-title">Order on the go. Arrive to a perfect cup.</h2>
      <p class="lead reveal">Tap your order as you leave. We time the shot to your arrival, so your coffee is poured moments before you walk in. Never waiting, never lukewarm.</p>
      <ul class="journey__facts reveal">
        <li><i class="ph ph-timer" aria-hidden="true"></i><span><strong>Timed to your ETA.</strong> We only start grinding when you are about 3 minutes away.</span></li>
        <li><i class="ph ph-thermometer-simple" aria-hidden="true"></i><span><strong>60 to 70°C on pickup.</strong> The sweet spot where sweetness and crema peak.</span></li>
        <li><i class="ph ph-hand-coins" aria-hidden="true"></i><span><strong>No downsides.</strong> Same price, same barista care, no queue.</span></li>
      </ul>
      <div class="journey__controls reveal">
        <div class="journey__seg" role="group" aria-label="How are you coming?">
          <button type="button" data-mode="walk" aria-pressed="true"><i class="ph ph-person-simple-walk" aria-hidden="true"></i> Walk</button>
          <button type="button" data-mode="bike" aria-pressed="false"><i class="ph ph-bicycle" aria-hidden="true"></i> Bike</button>
        </div>
        <button type="button" class="journey__toggle" data-view aria-pressed="true"><i class="ph ph-cube" aria-hidden="true"></i> 3D view</button>
        <button type="button" class="btn btn--ghost btn--small" data-replay><i class="ph ph-arrow-counter-clockwise" aria-hidden="true"></i> Replay</button>
      </div>
    </div>

    <div class="journey__stage reveal">
      <div class="journey__hud" aria-live="polite">
        <div class="journey__stat">
          <span class="journey__stat-label">Time</span>
          <span class="journey__stat-value" data-clock>08:10</span>
        </div>
        <div class="journey__stat">
          <span class="journey__stat-label" data-timer-label>Not ordered yet</span>
          <span class="journey__stat-value journey__stat-value--accent" data-timer>--:--</span>
        </div>
        <div class="journey__stat journey__stat--temp">
          <span class="journey__stat-label">Your cup</span>
          <span class="journey__stat-value" data-temp>Not brewed</span>
          <span class="journey__thermo" aria-hidden="true"><span class="journey__thermo-band"></span><span class="journey__thermo-fill" data-thermo></span></span>
        </div>
        <p class="journey__status"><i class="ph ph-person-simple-walk" aria-hidden="true" data-status-icon></i> <span data-status>Leaving home</span></p>
      </div>

      <div class="journey__map is-3d" data-map>
        <div class="journey__plane">
          ${mapSvg}
          <div class="journey__overlay">
            ${pin('journey__pin--home', HOME.x, HOME.y, '<i class="ph ph-house" aria-hidden="true"></i>')}
            ${pin('journey__pin--shop', SHOP.x, SHOP.y, '<i class="ph ph-coffee" aria-hidden="true"></i><em>Ombra</em>', 'data-shop')}
            ${pin('journey__pin--order', 0, 0, '<i class="ph ph-device-mobile" aria-hidden="true"></i>', 'data-order-pin')}
            ${pin('journey__pin--me', HOME.x, HOME.y, '<i class="ph ph-person-simple-walk" aria-hidden="true" data-me-icon></i><span class="journey__bubble" data-bubble><i class="ph ph-check-circle" aria-hidden="true"></i> Flat white ordered<br /><small data-bubble-time>Pickup 08:24</small></span>', 'data-me')}
          </div>
        </div>
      </div>

      <div class="journey__done" data-done hidden>
        <div class="journey__cup" aria-hidden="true">
          <span class="journey__steam"></span><span class="journey__steam"></span><span class="journey__steam"></span>
          <i class="ph ph-coffee"></i>
        </div>
        <p class="eyebrow">Arrived <span data-done-time>08:24</span></p>
        <h3>The best cup you have had all week.</h3>
        <p class="journey__done-temp"><strong data-done-temp>68°C</strong> poured <span data-done-wait>36 s</span> before you walked in.</p>
        <p class="journey__done-compare" data-done-compare></p>
        <button type="button" class="btn btn--primary btn--small" data-replay><i class="ph ph-arrow-counter-clockwise" aria-hidden="true"></i> Replay the trip</button>
      </div>
    </div>
  </section>`;

class OmbraJourney extends HTMLElement {
  private mode: Mode = 'walk';
  private raf = 0;
  private t0 = 0;
  private len = 0;
  private started = false;
  private reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  private q = <T extends Element = HTMLElement>(sel: string) => this.querySelector<T>(sel)!;

  connectedCallback() {
    if (this.childElementCount) return;
    this.innerHTML = template;

    const trail = this.q<SVGPathElement>('[data-trail]');
    this.len = trail.getTotalLength();
    trail.style.strokeDasharray = `${this.len}`;
    const orderPt = trail.getPointAtLength(this.len * ORDER_AT);
    const orderPin = this.q('[data-order-pin]');
    orderPin.style.setProperty('--x', pct(orderPt.x, VB_W));
    orderPin.style.setProperty('--y', pct(orderPt.y, VB_H));

    this.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach((b) =>
      b.addEventListener('click', () => this.setMode(b.dataset.mode as Mode)),
    );
    const viewBtn = this.q<HTMLButtonElement>('[data-view]');
    viewBtn.addEventListener('click', () => {
      const on = this.q('[data-map]').classList.toggle('is-3d');
      viewBtn.setAttribute('aria-pressed', String(on));
    });
    this.querySelectorAll('[data-replay]').forEach((b) => b.addEventListener('click', () => this.play()));

    this.render(0);
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !this.started) {
          io.disconnect();
          this.play();
        }
      },
      { threshold: 0.45 },
    );
    io.observe(this.q('[data-map]'));
  }

  disconnectedCallback() {
    cancelAnimationFrame(this.raf);
  }

  private setMode(mode: Mode) {
    this.mode = mode;
    this.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach((b) =>
      b.setAttribute('aria-pressed', String(b.dataset.mode === mode)),
    );
    const icon = plans[mode].icon;
    this.querySelectorAll('[data-me-icon], [data-status-icon]').forEach((el) => {
      el.className = `ph ${icon}`;
    });
    this.play();
  }

  private play() {
    this.started = true;
    cancelAnimationFrame(this.raf);
    this.q('[data-done]').hidden = true;
    this.q('[data-map]').classList.remove('is-arrived');
    if (this.reduceMotion) {
      this.render(1);
      this.finish();
      return;
    }
    this.t0 = performance.now();
    const frame = (now: number) => {
      const p = Math.min(1, (now - this.t0) / plans[this.mode].realMs);
      this.render(p);
      if (p < 1) this.raf = requestAnimationFrame(frame);
      else this.finish();
    };
    this.raf = requestAnimationFrame(frame);
  }

  private render(p: number) {
    const plan = plans[this.mode];
    const trail = this.q<SVGPathElement>('[data-trail]');
    trail.style.strokeDashoffset = `${this.len * (1 - p)}`;
    const pt = trail.getPointAtLength(this.len * p);
    const me = this.q('[data-me]');
    me.style.setProperty('--x', pct(pt.x, VB_W));
    me.style.setProperty('--y', pct(pt.y, VB_H));

    const sim = p * plan.tripMin;
    const remaining = plan.tripMin - sim;
    const ordered = p >= ORDER_AT;
    const arrival = START_CLOCK_MIN + plan.tripMin;
    this.q('[data-clock]').textContent = clock(START_CLOCK_MIN + sim);
    this.q('[data-order-pin]').classList.toggle('is-visible', ordered);
    this.q('[data-bubble]').classList.toggle('is-visible', ordered && p < ORDER_AT + 0.24);
    this.q('[data-bubble-time]').textContent = `Pickup ${clock(arrival)}`;
    this.q('[data-timer-label]').textContent = ordered ? 'Pickup in' : 'Not ordered yet';
    this.q('[data-timer]').textContent = ordered ? countdown(remaining) : '--:--';

    let status = p === 0 ? 'Leaving home' : `${plan.label} to Ombra`;
    if (ordered) status = stages.find((s, i) => remaining > s.until || i === stages.length - 1)!.label;
    if (p >= 1) status = 'In your hands';
    this.q('[data-status]').textContent = status;

    const sincePour = POUR_BEFORE_ARRIVAL - remaining;
    const tempEl = this.q('[data-temp]');
    const thermo = this.q('[data-thermo]');
    if (sincePour >= 0) {
      const t = cooled(sincePour);
      tempEl.textContent = `${Math.round(t)}°C`;
      thermo.style.setProperty('--fill', `${((t - 20) / 60) * 100}%`);
      tempEl.classList.add('is-hot');
    } else {
      tempEl.textContent = ordered && remaining <= stages[0].until ? 'Brewing' : 'Not brewed';
      thermo.style.setProperty('--fill', '0%');
      tempEl.classList.remove('is-hot');
    }
  }

  private finish() {
    const plan = plans[this.mode];
    const arrival = START_CLOCK_MIN + plan.tripMin;
    // What the cup would be if brewed the moment the order came in.
    const naiveMinutes = plan.tripMin * (1 - ORDER_AT) - BREW_MIN;
    this.q('[data-done-time]').textContent = clock(arrival);
    this.q('[data-done-temp]').textContent = `${Math.round(cooled(POUR_BEFORE_ARRIVAL))}°C`;
    this.q('[data-done-wait]').textContent = `${Math.round(POUR_BEFORE_ARRIVAL * 60)} s`;
    this.q('[data-done-compare]').textContent =
      `Brewed the moment you ordered, it would have sat for ${Math.round(naiveMinutes)} min and cooled to ${Math.round(cooled(naiveMinutes))}°C.`;
    this.q('[data-map]').classList.add('is-arrived');
    this.q('[data-done]').hidden = false;
  }
}

if (!customElements.get('ombra-journey')) customElements.define('ombra-journey', OmbraJourney);

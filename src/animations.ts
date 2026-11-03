const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function revealOnScroll() {
  const items = document.querySelectorAll<HTMLElement>('.reveal');
  if (reduceMotion) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
  );
  items.forEach((el) => io.observe(el));
}

// Crossfades the sticky image to match the step currently in the middle of the viewport.
function storySync() {
  const imgs = document.querySelectorAll<HTMLElement>('[data-story-img]');
  const stepEls = document.querySelectorAll<HTMLElement>('[data-story-step]');
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const idx = (entry.target as HTMLElement).dataset.storyStep;
        stepEls.forEach((s) => s.classList.toggle('is-active', s === entry.target));
        imgs.forEach((img) => img.classList.toggle('is-active', img.dataset.storyImg === idx));
      });
    },
    { rootMargin: '-45% 0px -45% 0px' },
  );
  stepEls.forEach((s) => io.observe(s));
}

function menuPanels() {
  const panels = document.querySelectorAll<HTMLButtonElement>('[data-panel]');
  const open = (target: HTMLButtonElement) => {
    panels.forEach((p) => {
      const isTarget = p === target;
      p.classList.toggle('is-open', isTarget);
      p.setAttribute('aria-expanded', String(isTarget));
    });
  };
  const canHover = window.matchMedia('(hover: hover)').matches;
  panels.forEach((p) => {
    p.addEventListener('click', () => open(p));
    p.addEventListener('focus', () => open(p));
    if (canHover) p.addEventListener('mouseenter', () => open(p));
  });
}

function navState() {
  const nav = document.querySelector<HTMLElement>('[data-nav]');
  const hero = document.querySelector('.hero');
  if (!nav || !hero) return;
  const io = new IntersectionObserver(
    ([entry]) => nav.classList.toggle('is-solid', entry.intersectionRatio < 0.85),
    { threshold: [0, 0.85, 1] },
  );
  io.observe(hero);
}

export function initAnimations() {
  requestAnimationFrame(() => document.body.classList.add('is-loaded'));
  revealOnScroll();
  storySync();
  menuPanels();
  navState();
}

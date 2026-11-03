import '@fontsource-variable/bricolage-grotesque';
import '@fontsource-variable/geist';
import '@phosphor-icons/web/regular';
import './style.css';
import { coffeeTypes, origins, promos, steps } from './data.ts';
import { initAnimations } from './animations.ts';

const app = document.querySelector<HTMLDivElement>('#app')!;

const arrow = '<i class="ph ph-arrow-up-right" aria-hidden="true"></i>';

const nav = `
  <header class="nav" data-nav>
    <a class="brand" href="#top" aria-label="Ombra Coffee home">
      <i class="ph ph-coffee-bean" aria-hidden="true"></i>
      <span>Ombra</span>
    </a>
    <nav aria-label="Main">
      <a href="#story">Our coffee</a>
      <a href="#menu">Menu</a>
      <a href="#promos">This month</a>
    </nav>
    <a class="btn btn--ghost btn--small" href="#visit">Find us</a>
  </header>`;

const heroWords = (text: string) =>
  text
    .split(' ')
    .map(
      (w, i) =>
        `<span class="word"><span style="--i:${i}">${w === 'slowing' ? `<em>${w}</em>` : w}</span></span>`,
    )
    .join(' ');

const hero = `
  <section class="hero" id="top">
    <div class="hero__copy">
      <h1 class="hero__title">${heroWords('Coffee worth slowing down for.')}</h1>
      <p class="hero__sub fade-up" style="--d:.55s">
        Small-batch roasts, carefully pulled espresso and a quiet corner to enjoy them. Open daily from 7:30.
      </p>
      <div class="hero__ctas fade-up" style="--d:.7s">
        <a class="btn btn--primary" href="#menu">See the menu ${arrow}</a>
        <a class="btn btn--ghost" href="#visit">Find us</a>
      </div>
    </div>
    <figure class="hero__media">
      <div class="hero__img-wrap">
        <img src="/images/pouring.jpg" alt="Milk being poured into a latte, forming latte art" width="1600" height="895" fetchpriority="high" />
      </div>
      <img class="hero__inset" src="/images/cheers.jpg" alt="Friends raising cups of coffee together" width="1600" height="1067" />
    </figure>
  </section>`;

const marqueeItems = origins
  .map((o) => `<span>${o}</span><i class="ph ph-coffee-bean" aria-hidden="true"></i>`)
  .join('');
const marquee = `
  <section class="marquee" aria-label="Origins we roast">
    <div class="marquee__track">
      <div class="marquee__group">${marqueeItems}</div>
      <div class="marquee__group" aria-hidden="true">${marqueeItems}</div>
    </div>
  </section>`;

const story = `
  <section class="story" id="story">
    <div class="story__media" aria-hidden="true">
      ${steps
        .map(
          (s, i) =>
            `<img class="story__img${i === 0 ? ' is-active' : ''}" src="${s.image}" alt="" loading="lazy" data-story-img="${i}" />`,
        )
        .join('')}
    </div>
    <div class="story__content">
      <h2 class="section-title reveal">From cherry to cup</h2>
      <p class="lead reveal">Good coffee is a chain of small decisions. Here is what happens before it reaches your table.</p>
      <ol class="story__steps">
        ${steps
          .map(
            (s, i) => `
          <li class="story__step" data-story-step="${i}">
            <h3>${s.title}</h3>
            <p>${s.body}</p>
            <img class="story__step-img" src="${s.image}" alt="${s.alt}" loading="lazy" />
          </li>`,
          )
          .join('')}
      </ol>
    </div>
  </section>`;

const menu = `
  <section class="menu" id="menu">
    <h2 class="section-title reveal">Know what you are ordering</h2>
    <p class="lead reveal">Six classics, and what actually goes into each one.</p>
    <div class="menu__panels reveal">
      ${coffeeTypes
        .map(
          (c, i) => `
        <button class="panel${i === 1 ? ' is-open' : ''}" type="button" aria-expanded="${i === 1}" data-panel>
          <img src="${c.image}" alt="${c.alt}" loading="lazy" />
          <span class="panel__shade" aria-hidden="true"></span>
          <span class="panel__label" aria-hidden="true">${c.name}</span>
          <span class="panel__body">
            <span class="panel__name">${c.name}</span>
            <span class="panel__build">${c.build}</span>
            <span class="panel__desc">${c.description}</span>
          </span>
        </button>`,
        )
        .join('')}
    </div>
  </section>`;

const [featured, ...smallPromos] = promos;
const promoSection = `
  <section class="promos" id="promos">
    <p class="eyebrow reveal">This month</p>
    <h2 class="section-title reveal">Worth trying now</h2>
    <div class="bento">
      <article class="bento__cell bento__cell--feature reveal">
        <img src="${featured.image}" alt="${featured.alt}" loading="lazy" />
        <div class="bento__text">
          <h3>${featured.title}</h3>
          <p>${featured.body}</p>
          <span class="price">${featured.price}</span>
        </div>
      </article>
      ${smallPromos
        .map(
          (p, i) => `
        <article class="bento__cell bento__cell--${i === 0 ? 'wide' : 'split'} reveal" style="--i:${i + 1}">
          <img src="${p.image}" alt="${p.alt}" loading="lazy" />
          <div class="bento__text">
            <h3>${p.title}</h3>
            <p>${p.body}</p>
            <span class="price">${p.price}</span>
          </div>
        </article>`,
        )
        .join('')}
    </div>
  </section>`;

const visit = `
  <section class="visit" id="visit">
    <div class="visit__img reveal">
      <img src="/images/cafe-interior.jpg" alt="Inside the café, with plants, wooden tables and a long bar" loading="lazy" />
    </div>
    <div class="visit__info">
      <h2 class="section-title reveal">Come by for a cup</h2>
      <dl class="visit__list">
        <div class="reveal">
          <dt><i class="ph ph-map-pin" aria-hidden="true"></i> Address</dt>
          <dd>Veldstraat 42<br />9000 Gent</dd>
        </div>
        <div class="reveal">
          <dt><i class="ph ph-clock" aria-hidden="true"></i> Hours</dt>
          <dd>Mon to Fri, 7:30 to 18:00<br />Sat and Sun, 8:30 to 17:00</dd>
        </div>
      </dl>
      <a class="btn btn--primary reveal" href="https://maps.google.com/?q=Veldstraat+42+Gent" target="_blank" rel="noreferrer">Get directions ${arrow}</a>
    </div>
  </section>`;

const footer = `
  <footer class="footer">
    <a class="brand brand--large" href="#top" aria-label="Back to top">
      <i class="ph ph-coffee-bean" aria-hidden="true"></i><span>Ombra</span>
    </a>
    <div class="footer__meta">
      <a href="https://instagram.com" target="_blank" rel="noreferrer"><i class="ph ph-instagram-logo" aria-hidden="true"></i> Instagram</a>
      <span>© 2026 Ombra Coffee</span>
    </div>
  </footer>`;

app.innerHTML = `${nav}<main>${hero}${marquee}${story}${menu}${promoSection}${visit}</main>${footer}`;

initAnimations();

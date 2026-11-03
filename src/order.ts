import { coffeeTypes } from './data.ts';
import { ORDER_KEY, barcode, euro, ticketHeader, ticketLines, ticketTotal, type Order } from './ticket.ts';

const MAX_QTY = 9;

export const orderSection = () => `
  <section class="order" id="order">
    <div class="order__intro">
      <p class="eyebrow reveal">Order ahead</p>
      <h2 class="section-title reveal">Skip the queue</h2>
      <p class="lead reveal">Pick your coffees and we will have them on the bar when you walk in.</p>
    </div>
    <div class="order__layout">
      <ol class="order__list reveal" aria-label="Coffees">
        ${coffeeTypes
          .map(
            (c, i) => `
          <li class="order__row" data-coffee="${i}">
            <img src="${c.image}" alt="" loading="lazy" />
            <div class="order__info">
              <h3>${c.name}</h3>
              <p>${c.build}</p>
            </div>
            <span class="order__price">${euro(c.price)}</span>
            <div class="stepper" role="group" aria-label="${c.name} quantity">
              <button type="button" data-dec aria-label="Remove one ${c.name}" disabled><i class="ph ph-minus" aria-hidden="true"></i></button>
              <output data-qty aria-live="polite">0</output>
              <button type="button" data-inc aria-label="Add one ${c.name}"><i class="ph ph-plus" aria-hidden="true"></i></button>
            </div>
          </li>`,
          )
          .join('')}
      </ol>
      <form class="ticket reveal" data-ticket aria-label="Your order ticket" novalidate>
        <div class="ticket__paper">
          <div data-ticket-head></div>
          <ul class="ticket__lines" data-ticket-lines></ul>
          <p class="ticket__empty" data-ticket-empty>Nothing on the ticket yet.<br />Add a coffee to get started.</p>
          <div class="ticket__total">
            <span>Total</span>
            <strong data-ticket-total>${euro(0)}</strong>
          </div>
          <label class="ticket__name">
            <span>Name on the cup</span>
            <input type="text" name="name" maxlength="24" autocomplete="given-name" placeholder="Your name" />
          </label>
          <div class="ticket__tear" aria-hidden="true"></div>
          <button class="ticket__submit" type="submit" data-ticket-submit disabled>
            Place order <i class="ph ph-arrow-right" aria-hidden="true"></i>
          </button>
          <div data-ticket-barcode></div>
        </div>
      </form>
    </div>
  </section>`;

export function initOrder() {
  const form = document.querySelector<HTMLFormElement>('[data-ticket]');
  if (!form) return;

  const ticketNumber = String(Math.floor(1000 + Math.random() * 9000));
  const openedAt = new Date();
  const qty = coffeeTypes.map(() => 0);

  const head = form.querySelector<HTMLElement>('[data-ticket-head]')!;
  const linesEl = form.querySelector<HTMLUListElement>('[data-ticket-lines]')!;
  const emptyEl = form.querySelector<HTMLElement>('[data-ticket-empty]')!;
  const totalEl = form.querySelector<HTMLElement>('[data-ticket-total]')!;
  const submit = form.querySelector<HTMLButtonElement>('[data-ticket-submit]')!;
  const nameInput = form.querySelector<HTMLInputElement>('input[name="name"]')!;

  head.innerHTML = ticketHeader(ticketNumber, openedAt);
  form.querySelector<HTMLElement>('[data-ticket-barcode]')!.innerHTML = barcode(ticketNumber);

  const currentLines = () =>
    coffeeTypes.flatMap((c, i) => (qty[i] > 0 ? [{ name: c.name, qty: qty[i], price: c.price }] : []));

  const render = () => {
    const lines = currentLines();
    linesEl.innerHTML = ticketLines(lines);
    emptyEl.hidden = lines.length > 0;
    totalEl.textContent = euro(ticketTotal(lines));
    submit.disabled = lines.length === 0;
    document.querySelectorAll<HTMLElement>('[data-coffee]').forEach((row) => {
      const n = qty[Number(row.dataset.coffee)];
      row.classList.toggle('is-picked', n > 0);
      row.querySelector('[data-qty]')!.textContent = String(n);
      row.querySelector<HTMLButtonElement>('[data-dec]')!.disabled = n === 0;
      row.querySelector<HTMLButtonElement>('[data-inc]')!.disabled = n >= MAX_QTY;
    });
  };

  document.querySelectorAll<HTMLElement>('[data-coffee]').forEach((row) => {
    const i = Number(row.dataset.coffee);
    row.querySelector('[data-inc]')!.addEventListener('click', () => {
      qty[i] = Math.min(MAX_QTY, qty[i] + 1);
      render();
    });
    row.querySelector('[data-dec]')!.addEventListener('click', () => {
      qty[i] = Math.max(0, qty[i] - 1);
      render();
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const lines = currentLines();
    if (lines.length === 0) return;
    const order: Order = {
      number: ticketNumber,
      name: nameInput.value.trim(),
      lines,
      placedAt: new Date().toISOString(),
    };
    sessionStorage.setItem(ORDER_KEY, JSON.stringify(order));
    window.location.href = '/thanks.html';
  });

  render();
}

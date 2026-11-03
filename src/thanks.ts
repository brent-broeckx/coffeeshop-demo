import '@fontsource-variable/bricolage-grotesque';
import '@fontsource-variable/geist';
import '@phosphor-icons/web/regular';
import './style.css';
import { ORDER_KEY, barcode, escapeHtml, euro, ticketHeader, ticketLines, ticketTotal, type Order } from './ticket.ts';

const app = document.querySelector<HTMLDivElement>('#app')!;

const readOrder = (): Order | null => {
  try {
    const raw = sessionStorage.getItem(ORDER_KEY);
    return raw ? (JSON.parse(raw) as Order) : null;
  } catch {
    return null;
  }
};

const order = readOrder();

const header = `
  <header class="nav is-solid">
    <a class="brand" href="/" aria-label="Ombra Coffee home">
      <i class="ph ph-coffee-bean" aria-hidden="true"></i>
      <span>Ombra</span>
    </a>
  </header>`;

const body = order
  ? `
    <div class="thanks__copy">
      <p class="eyebrow fade-up">Order received</p>
      <h1 class="thanks__title fade-up" style="--d:.1s">Thank you${order.name ? `, <em>${escapeHtml(order.name)}</em>` : ''}.</h1>
      <p class="lead fade-up" style="--d:.2s">
        Your ticket is on the rail. Show number <strong>${order.number}</strong> at the bar and we will hand over your coffee.
      </p>
      <div class="hero__ctas fade-up" style="--d:.3s">
        <a class="btn btn--primary" href="/">Back to Ombra <i class="ph ph-arrow-up-right" aria-hidden="true"></i></a>
        <a class="btn btn--ghost" href="/#order">Order again</a>
      </div>
    </div>
    <div class="ticket ticket--placed" aria-label="Your order ticket">
      <div class="ticket__paper">
        ${ticketHeader(order.number, new Date(order.placedAt))}
        <ul class="ticket__lines">${ticketLines(order.lines)}</ul>
        <div class="ticket__total">
          <span>Total</span>
          <strong>${euro(ticketTotal(order.lines))}</strong>
        </div>
        ${order.name ? `<p class="ticket__for">For: <strong>${escapeHtml(order.name)}</strong></p>` : ''}
        <div class="ticket__tear" aria-hidden="true"></div>
        <p class="ticket__note">Pay at the bar · Thank you!</p>
        ${barcode(order.number)}
        <span class="ticket__stamp" aria-hidden="true">Order in</span>
      </div>
    </div>`
  : `
    <div class="thanks__copy">
      <p class="eyebrow fade-up">No order found</p>
      <h1 class="thanks__title fade-up" style="--d:.1s">Nothing on the rail yet.</h1>
      <p class="lead fade-up" style="--d:.2s">Pick a few coffees and place an order first.</p>
      <div class="hero__ctas fade-up" style="--d:.3s">
        <a class="btn btn--primary" href="/#order">Start an order <i class="ph ph-arrow-up-right" aria-hidden="true"></i></a>
      </div>
    </div>`;

app.innerHTML = `${header}<main class="thanks">${body}</main>`;

requestAnimationFrame(() => document.body.classList.add('is-loaded'));

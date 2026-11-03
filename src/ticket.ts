export interface TicketLine {
  name: string;
  qty: number;
  price: number;
}

export interface Order {
  number: string;
  name: string;
  lines: TicketLine[];
  placedAt: string;
}

export const ORDER_KEY = 'ombra-order';

export const euro = (n: number) => `€${n.toFixed(2)}`;

export const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]!);

export const ticketTotal = (lines: TicketLine[]) => lines.reduce((sum, l) => sum + l.qty * l.price, 0);

export const formatStamp = (d: Date) =>
  `${d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} · ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;

export const ticketHeader = (number: string, when: Date) => `
  <div class="ticket__head">
    <p class="ticket__brand"><i class="ph ph-coffee-bean" aria-hidden="true"></i> Ombra Coffee</p>
    <p class="ticket__addr">Veldstraat 42 · 9000 Gent</p>
    <div class="ticket__meta">
      <span>Ticket <strong data-ticket-number>No. ${number}</strong></span>
      <span>${formatStamp(when)}</span>
    </div>
  </div>`;

export const ticketLines = (lines: TicketLine[]) =>
  lines
    .map(
      (l) => `
    <li class="ticket__line" data-ticket-line>
      <span class="ticket__qty">${l.qty}×</span>
      <span class="ticket__item">${l.name}</span>
      <span class="ticket__leader" aria-hidden="true"></span>
      <span class="ticket__amount">${euro(l.qty * l.price)}</span>
    </li>`,
    )
    .join('');

// Bars are derived from the ticket number so the same ticket always shows the same barcode.
export const barcode = (seed: string) => {
  let x = [...seed].reduce((a, c) => a * 31 + c.charCodeAt(0), 7);
  const bars = Array.from({ length: 42 }, () => {
    x = (x * 1103515245 + 12345) % 2147483648;
    return `<span style="--w:${1 + (x % 3)}px"></span>`;
  }).join('');
  return `<div class="ticket__barcode" aria-hidden="true">${bars}</div>`;
};

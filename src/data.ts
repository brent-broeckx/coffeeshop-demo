export interface Step {
  title: string;
  body: string;
  image: string;
  alt: string;
}

export interface CoffeeType {
  name: string;
  build: string;
  description: string;
  image: string;
  alt: string;
}

export interface Promo {
  title: string;
  body: string;
  price: string;
  image: string;
  alt: string;
}

export const origins: string[] = [
  'Ethiopia Guji',
  'Colombia Huila',
  'Kenya Nyeri',
  'Brazil Cerrado',
  'Guatemala Antigua',
  'Rwanda Nyamasheke',
];

export const steps: Step[] = [
  {
    title: 'Grown high',
    body: 'Coffee is the seed of a cherry. Altitude slows ripening, so beans grown above 1,500 metres build more sugar and brighter acidity.',
    image: '/images/beans-bowl.jpg',
    alt: 'A bowl of whole roasted coffee beans',
  },
  {
    title: 'Roasted light',
    body: 'We roast in small batches every Tuesday. A lighter roast keeps the fruit and floral notes that a dark roast would burn away.',
    image: '/images/beans.jpg',
    alt: 'Freshly roasted coffee beans filling the frame',
  },
  {
    title: 'Ground to order',
    body: 'Ground coffee goes stale in minutes. Every cup starts with beans weighed and ground right before brewing.',
    image: '/images/portafilters.jpg',
    alt: 'Portafilters with beans, grounds and a finished latte',
  },
  {
    title: 'Brewed with care',
    body: 'Water at 93 degrees, a precise ratio and a steady hand. Small details, but they are the whole difference in the cup.',
    image: '/images/pourover-bar.jpg',
    alt: 'A barista pouring water over a filter brewer',
  },
];

export const coffeeTypes: CoffeeType[] = [
  {
    name: 'Espresso',
    build: '18 g coffee, 36 g out, about 28 seconds',
    description: 'Hot water pushed through finely ground coffee under pressure. Dense, syrupy and the base of almost everything else on the menu.',
    image: '/images/espresso.jpg',
    alt: 'A short espresso in a glass on a saucer',
  },
  {
    name: 'Cappuccino',
    build: 'Double espresso, steamed milk, thick foam',
    description: 'Equal parts coffee, milk and airy foam. Lighter than a latte, with the espresso still clearly in front.',
    image: '/images/cappuccino.jpg',
    alt: 'A cappuccino with latte art seen from above',
  },
  {
    name: 'Flat white',
    build: 'Double ristretto, thin velvety milk',
    description: 'Smaller and stronger than a latte. The milk is steamed silky and flat, so the coffee flavour carries through.',
    image: '/images/flat-whites.jpg',
    alt: 'Two flat whites with latte art between plants',
  },
  {
    name: 'Americano',
    build: 'Double espresso topped with hot water',
    description: 'Espresso stretched with water into a longer, cleaner cup. Close to filter coffee, with a little more body.',
    image: '/images/americano.jpg',
    alt: 'A black americano with crema on a wooden table',
  },
  {
    name: 'Pour-over',
    build: '15 g coffee to 250 g water, by hand',
    description: 'Water poured slowly over a paper filter. The clearest way to taste the origin of a single bean.',
    image: '/images/filter.jpg',
    alt: 'A white mug of filter coffee on dark slate',
  },
  {
    name: 'Cold brew',
    build: 'Coarse grounds steeped 16 hours in cold water',
    description: 'Never heated, so it comes out smooth, low in acidity and naturally sweet. Best over ice, with or without milk.',
    image: '/images/cold-brew.jpg',
    alt: 'A glass of cold brew with milk swirling through it',
  },
];

export const promos: Promo[] = [
  {
    title: 'Iced oat latte',
    body: 'Our house espresso over ice with creamy oat milk and a touch of maple. Back for the season.',
    price: '€4.80',
    image: '/images/iced-latte.jpg',
    alt: 'An iced latte in a tall glass on a wooden counter',
  },
  {
    title: 'Saturday tasting',
    body: 'Six coffees side by side, guided by our roaster. Every Saturday at 10:00.',
    price: '€12',
    image: '/images/tasting.jpg',
    alt: 'A circle of coffee cups on a table, seen from above',
  },
  {
    title: 'Guji natural, 250 g',
    body: 'Blueberry, cocoa and jasmine. Roasted this week, ready to take home.',
    price: '€14.50',
    image: '/images/flatlay.jpg',
    alt: 'Beans, fresh grounds and a latte on a wooden board',
  },
];

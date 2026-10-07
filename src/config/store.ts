import type { DayHours } from '../lib/types';

// Shop details shown on the storefront. Everything here is PLACEHOLDER content:
// replace it with the client's real details (and swap the files in public/placeholder).
export const store = {
  name: '[shop name]',
  // Shown in the box under the shop name. While empty, a placeholder box is shown.
  description: '',
  logo: 'placeholder/logo.svg',
  cover: {
    desktop: 'placeholder/cover-desktop.svg',
    mobile: 'placeholder/cover-mobile.svg',
  },
  productPlaceholder: 'placeholder/product.svg',
  phone: '0400 000 000',
  currency: '$',
  // Delivery hours, Monday first. Used for the delivery time choices.
  hours: [
    { day: 'Monday', open: '09:00', close: '21:00' },
    { day: 'Tuesday', open: '09:00', close: '21:00' },
    { day: 'Wednesday', open: '09:00', close: '21:00' },
    { day: 'Thursday', open: '09:00', close: '21:00' },
    { day: 'Friday', open: '09:00', close: '21:00' },
    { day: 'Saturday', open: '09:00', close: '21:00' },
    { day: 'Sunday', open: '09:00', close: '21:00' },
  ] as DayHours[],
  // Shown as a full-screen notice when the site first opens.
  notice: {
    showOnLoad: true,
    title: 'Store Notice',
    headline: '✅ NOTICE:',
    points: [
      'Your store announcement goes here, e.g. delivery areas or payment information.',
      'Add as many points as you need. A second language can go on its own line.',
    ],
  },
  poweredBy: { label: 'Your Company', url: '#' },
  // DEMO ONLY: the owner passcode lives in the browser code, so it is not real security.
  // A production site must check the owner's login on a server.
  adminPasscode: '1234',
};

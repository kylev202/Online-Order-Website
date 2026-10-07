// Front-end card checks for the DEMO payment form.
// The live site must use the payment provider's secure card fields (e.g. Stripe Elements),
// so card numbers never pass through this site's own code or server.

export interface Card {
  number: string;
  expiry: string;
  cvc: string;
  name: string;
}

export type CardErrors = Partial<Record<keyof Card, string>>;

export const digitsOnly = (text: string) => text.replace(/\D/g, '');

/** "4242424242424242" -> "4242 4242 4242 4242" */
export function formatCardNumber(input: string) {
  return digitsOnly(input)
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, '$1 ');
}

/** "1228" -> "12 / 28" */
export function formatExpiry(input: string) {
  const digits = digitsOnly(input).slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)} / ${digits.slice(2)}` : digits;
}

// Standard checksum that catches most mistyped card numbers.
function passesLuhn(digits: string) {
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let d = Number(digits[digits.length - 1 - i]);
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
}

export function cardErrors(card: Card, now = new Date()): CardErrors {
  const number = digitsOnly(card.number);
  const expiry = digitsOnly(card.expiry);
  const month = Number(expiry.slice(0, 2));
  const year = 2000 + Number(expiry.slice(2, 4));
  const expired = year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1);
  return {
    number: number.length >= 13 && passesLuhn(number) ? undefined : 'Please enter a valid card number',
    expiry: expiry.length === 4 && month >= 1 && month <= 12 && !expired ? undefined : 'Please enter a valid expiry date',
    cvc: /^\d{3,4}$/.test(card.cvc) ? undefined : 'Please enter the 3 or 4 digit security code',
    name: card.name.trim() ? undefined : 'Please enter the name on the card',
  };
}

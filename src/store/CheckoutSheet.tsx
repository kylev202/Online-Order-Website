import { useMemo, useRef, useState, type InputHTMLAttributes } from 'react';
import { CountryCode, Stepper } from '../components/controls';
import { CreditCardIcon, LockIcon, MapPinIcon, TruckIcon, WalletIcon } from '../components/icons';
import { BottomSheet } from '../components/overlays';
import { store } from '../config/store';
import { cardErrors, digitsOnly, formatCardNumber, formatExpiry, type Card, type CardErrors } from '../lib/card';
import { formatPrice } from '../lib/format';
import { useMenu, newId } from '../lib/menuStore';
import { cartItems, clearCart, setQty, useOrder } from '../lib/orderStore';
import { saveOrder, type Order } from '../lib/orders';
import { FulfillmentModal } from './FulfillmentModal';

interface Details {
  name: string;
  country: string;
  phone: string;
  street: string;
  suburb: string;
  postcode: string;
  instructions: string;
}

type DetailErrors = Partial<Record<keyof Details, string>>;

const EMPTY_DETAILS: Details = { name: '', country: 'AU', phone: '', street: '', suburb: '', postcode: '', instructions: '' };
const EMPTY_CARD: Card = { number: '', expiry: '', cvc: '', name: '' };

const hasErrors = (errors: object) => Object.values(errors).some(Boolean);

/**
 * Two-step checkout, like the original site's bottom panel:
 * 1. Fulfillment: items + delivery details. 2. Payment: card or wallet, then pay.
 * DEMO: no payment is taken; a successful "payment" creates an order to track.
 */
export function CheckoutSheet({ onClose, onPaid }: { onClose: () => void; onPaid: (orderId: string) => void }) {
  const menu = useMenu();
  const { lines, deliveryTime } = useOrder();
  const items = useMemo(() => cartItems(menu, lines), [menu, lines]);
  const total = items.reduce((sum, item) => sum + item.qty * item.product.price, 0);
  const when = deliveryTime || 'ASAP';

  const [step, setStep] = useState<'delivery' | 'payment'>('delivery');
  const [details, setDetails] = useState(EMPTY_DETAILS);
  const [detailErrors, setDetailErrors] = useState<DetailErrors>({});
  const [method, setMethod] = useState<'card' | 'wallet'>('card');
  const [card, setCard] = useState(EMPTY_CARD);
  const [cardErrs, setCardErrs] = useState<CardErrors>({});
  const [changingTime, setChangingTime] = useState(false);
  const [paying, setPaying] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const setDetail = (field: keyof Details, value: string) => {
    setDetails((d) => ({ ...d, [field]: value }));
    setDetailErrors((e) => ({ ...e, [field]: undefined }));
  };

  const setCardField = (field: keyof Card, value: string) => {
    setCard((c) => ({ ...c, [field]: value }));
    setCardErrs((e) => ({ ...e, [field]: undefined }));
  };

  // The sheet body (parent of the content) is what scrolls. Runs after React has re-rendered.
  const scrollBody = (to: 'top' | 'first-error') =>
    requestAnimationFrame(() => {
      const body = contentRef.current?.parentElement;
      if (to === 'top') body?.scrollTo({ top: 0 });
      else body?.querySelector('.text-field--error')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    });

  const goTo = (next: 'delivery' | 'payment') => {
    setStep(next);
    scrollBody('top');
  };

  const continueToPayment = () => {
    const errors: DetailErrors = {
      name: details.name.trim() ? undefined : 'Please enter your name',
      phone: digitsOnly(details.phone).length >= 6 ? undefined : 'Please enter a valid mobile number',
      street: details.street.trim() ? undefined : 'Please enter your street address',
      suburb: details.suburb.trim() ? undefined : 'Please enter your suburb',
      postcode: details.postcode.trim() ? undefined : 'Please enter your postcode',
    };
    setDetailErrors(errors);
    if (hasErrors(errors)) scrollBody('first-error');
    else goTo('payment');
  };

  const pay = () => {
    if (method === 'card') {
      const errors = cardErrors(card);
      setCardErrs(errors);
      if (hasErrors(errors)) return scrollBody('first-error');
    }
    setPaying(true);
    // DEMO: pretend to wait for the payment provider. Only the last 4 card digits are kept.
    window.setTimeout(() => {
      const now = Date.now();
      const order: Order = {
        id: newId('o'),
        number: String(Math.floor(1000 + Math.random() * 9000)),
        createdAt: now,
        lines: items.map(({ product, qty }) => ({ productId: product.id, name: product.name, price: product.price, qty })),
        total,
        deliveryTime: when,
        customer: { name: details.name.trim(), phone: details.phone.trim() },
        address: {
          street: details.street.trim(),
          suburb: details.suburb.trim(),
          postcode: details.postcode.trim(),
          instructions: details.instructions.trim(),
        },
        payment: method === 'card' ? `Card •••• ${digitsOnly(card.number).slice(-4)}` : 'Apple Pay / Google Pay',
        statusTimes: [now],
      };
      saveOrder(order);
      clearCart();
      onPaid(order.id);
    }, 1500);
  };

  const isDeliveryStep = step === 'delivery';
  const title = `${isDeliveryStep ? 'Step 1 of 2 · Delivery' : 'Step 2 of 2 · Payment'} · ${formatPrice(total)}`;

  return (
    <BottomSheet
      title={title}
      onClose={paying ? () => {} : onClose}
      onBack={!isDeliveryStep && !paying ? () => goTo('delivery') : undefined}
      action={
        isDeliveryStep ? (
          <button className="sheet-action" onClick={continueToPayment} disabled={items.length === 0}>
            Continue
          </button>
        ) : (
          <button className="sheet-action" onClick={pay} disabled={paying || items.length === 0}>
            {paying ? 'Processing…' : `Pay ${formatPrice(total)}`}
          </button>
        )
      }
    >
      <div className="checkout" ref={contentRef}>
        {isDeliveryStep ? (
          <>
            <h3 className="co-title co-title--first">Your Items</h3>
            {items.length === 0 ? (
              <div className="co-empty">
                <p>Your cart is empty.</p>
                <button className="top-btn" onClick={onClose}>
                  Continue Shopping
                </button>
              </div>
            ) : (
              items.map(({ product, qty }) => (
                <div key={product.id} className="co-item">
                  <img className="co-thumb" src={product.image || store.productPlaceholder} alt="" />
                  <div className="co-grow">
                    <div className="co-item-name">{product.name}</div>
                    <div className="co-muted">{formatPrice(product.price)} each</div>
                  </div>
                  <Stepper value={qty} onChange={(v) => setQty(product.id, v)} label={`${product.name} quantity`} />
                  <div className="co-item-total">{formatPrice(product.price * qty)}</div>
                </div>
              ))
            )}

            <div className="co-box">
              <TruckIcon />
              <div className="co-grow">
                <div className="co-strong">Delivery · {when}</div>
                <div className="free-note">Free delivery</div>
              </div>
              <button type="button" className="more-chip more-chip--wide" onClick={() => setChangingTime(true)}>
                Change
              </button>
            </div>

            <h3 className="co-title">Delivery Details</h3>
            <TextField label="Full Name *" error={detailErrors.name} value={details.name} onChange={(e) => setDetail('name', e.target.value)} autoComplete="name" />
            <div className="co-field">
              <span className="co-label">Mobile Number *</span>
              <div className={`phone-field${detailErrors.phone ? ' text-field--error' : ''}`}>
                <CountryCode value={details.country} onChange={(iso) => setDetail('country', iso)} />
                <input
                  className="phone-input"
                  value={details.phone}
                  onChange={(e) => setDetail('phone', e.target.value)}
                  inputMode="tel"
                  autoComplete="tel-national"
                  aria-label="Mobile number"
                />
              </div>
              {detailErrors.phone && <span className="field-error">{detailErrors.phone}</span>}
            </div>
            <TextField
              label="Street Address *"
              error={detailErrors.street}
              value={details.street}
              onChange={(e) => setDetail('street', e.target.value)}
              autoComplete="address-line1"
              placeholder="e.g. 12 Example Street, Unit 3"
            />
            <div className="co-row2 co-row2--wide-first">
              <TextField label="Suburb *" error={detailErrors.suburb} value={details.suburb} onChange={(e) => setDetail('suburb', e.target.value)} autoComplete="address-level2" />
              <TextField
                label="Postcode *"
                error={detailErrors.postcode}
                value={details.postcode}
                onChange={(e) => setDetail('postcode', e.target.value)}
                autoComplete="postal-code"
                inputMode="numeric"
              />
            </div>
            <label className="co-field">
              <span className="co-label">Delivery Instructions</span>
              <textarea
                className="text-area"
                rows={2}
                value={details.instructions}
                onChange={(e) => setDetail('instructions', e.target.value)}
                placeholder="e.g. Leave at the front door"
              />
            </label>
          </>
        ) : (
          <>
            <div className="co-box co-box--first">
              <MapPinIcon />
              <div className="co-grow">
                <div className="co-strong">Deliver to {details.name}</div>
                <div className="co-muted">
                  {details.street}, {details.suburb} {details.postcode} · {when}
                </div>
              </div>
              <button type="button" className="more-chip more-chip--wide" onClick={() => goTo('delivery')}>
                Edit
              </button>
            </div>

            <h3 className="co-title">Payment Method</h3>
            <div className="pay-methods" role="radiogroup" aria-label="Payment method">
              <button role="radio" aria-checked={method === 'card'} className={`pay-method${method === 'card' ? ' pay-method--on' : ''}`} onClick={() => setMethod('card')}>
                <CreditCardIcon />
                Credit / Debit Card
              </button>
              <button role="radio" aria-checked={method === 'wallet'} className={`pay-method${method === 'wallet' ? ' pay-method--on' : ''}`} onClick={() => setMethod('wallet')}>
                <WalletIcon />
                Apple Pay / Google Pay
              </button>
            </div>

            {method === 'card' ? (
              <>
                <TextField
                  label="Card Number"
                  error={cardErrs.number}
                  value={card.number}
                  onChange={(e) => setCardField('number', formatCardNumber(e.target.value))}
                  inputMode="numeric"
                  autoComplete="cc-number"
                  placeholder="1234 1234 1234 1234"
                />
                <div className="co-row2">
                  <TextField
                    label="Expiry Date"
                    error={cardErrs.expiry}
                    value={card.expiry}
                    onChange={(e) => setCardField('expiry', formatExpiry(e.target.value))}
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    placeholder="MM / YY"
                  />
                  <TextField
                    label="Security Code"
                    error={cardErrs.cvc}
                    value={card.cvc}
                    onChange={(e) => setCardField('cvc', digitsOnly(e.target.value).slice(0, 4))}
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    placeholder="CVC"
                  />
                </div>
                <TextField label="Name on Card" error={cardErrs.name} value={card.name} onChange={(e) => setCardField('name', e.target.value)} autoComplete="cc-name" />
              </>
            ) : (
              <p className="pay-wallet-note">You will confirm the payment in Apple Pay or Google Pay on your device.</p>
            )}

            <div className="co-summary">
              <div className="co-sum-row co-sum-total">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
            <p className="pay-secure">
              <LockIcon />
              Payments are encrypted and processed by a secure payment provider.
            </p>
            <p className="co-demo">Demo: no real payment is taken. Test card: 4242 4242 4242 4242, any future expiry date, any 3 digits.</p>
          </>
        )}
      </div>

      {paying && (
        <div className="pay-processing" role="status">
          <span className="spinner" />
          Processing payment…
        </div>
      )}
      {changingTime && <FulfillmentModal onClose={() => setChangingTime(false)} />}
    </BottomSheet>
  );
}

function TextField({ label, error, ...input }: { label: string; error?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="co-field">
      <span className="co-label">{label}</span>
      <input className={`text-field${error ? ' text-field--error' : ''}`} {...input} />
      {error && <span className="field-error">{error}</span>}
    </label>
  );
}

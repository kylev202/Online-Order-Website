import { useMemo, useRef, useState, type InputHTMLAttributes } from 'react';
import { CountryCode, Stepper } from '../components/controls';
import { MapPinIcon, TruckIcon, WalletIcon } from '../components/icons';
import { BottomSheet } from '../components/overlays';
import { store } from '../config/store';
import { ApiError, errorMessage } from '../lib/api';
import { formatPrice } from '../lib/format';
import { loadMenu, useMenu } from '../lib/menuStore';
import { cartItems, clearCart, setQty, useOrder } from '../lib/orderStore';
import { placeOrder } from '../lib/orders';
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

const hasErrors = (errors: object) => Object.values(errors).some(Boolean);
const digitsOnly = (text: string) => text.replace(/\D/g, '');

/**
 * Two-step checkout, like the original site's bottom panel:
 * 1. Delivery: items + delivery details. 2. Payment: pay on delivery, confirm age, place the order.
 * Online card payment slots into step 2 once a payment provider is connected.
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
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [ageError, setAgeError] = useState('');
  const [orderError, setOrderError] = useState('');
  const [changingTime, setChangingTime] = useState(false);
  const [placing, setPlacing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const setDetail = (field: keyof Details, value: string) => {
    setDetails((d) => ({ ...d, [field]: value }));
    setDetailErrors((e) => ({ ...e, [field]: undefined }));
  };

  // The sheet body (parent of the content) is what scrolls. Runs after React has re-rendered.
  const scrollBody = (to: 'top' | 'first-error') =>
    requestAnimationFrame(() => {
      const body = contentRef.current?.parentElement;
      if (to === 'top') body?.scrollTo({ top: 0 });
      else body?.querySelector('.text-field--error, .field-error')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
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
    setOrderError('');
    if (hasErrors(errors)) scrollBody('first-error');
    else goTo('payment');
  };

  const submitOrder = async () => {
    if (!ageConfirmed) {
      setAgeError(`Please confirm you are ${store.minimumAge} or older.`);
      return scrollBody('first-error');
    }
    setPlacing(true);
    setOrderError('');
    try {
      const order = await placeOrder({
        lines: items.map(({ product, qty }) => ({ productId: product.id, qty })),
        deliveryTime: when,
        customer: { name: details.name.trim(), phone: details.phone.trim() },
        address: {
          street: details.street.trim(),
          suburb: details.suburb.trim(),
          postcode: details.postcode.trim(),
          instructions: details.instructions.trim(),
        },
        ageConfirmed,
      });
      clearCart();
      onPaid(order.id);
    } catch (error) {
      setPlacing(false);
      if (error instanceof ApiError && error.status === 409) {
        // Some products were removed from the shop: reload the menu so they drop out of the cart.
        await loadMenu();
        setOrderError('Some items are no longer available and were removed from your cart. Please check your order.');
        goTo('delivery');
      } else {
        setOrderError(errorMessage(error));
      }
    }
  };

  const isDeliveryStep = step === 'delivery';
  const title = `${isDeliveryStep ? 'Step 1 of 2 · Delivery' : 'Step 2 of 2 · Payment'} · ${formatPrice(total)}`;

  return (
    <BottomSheet
      title={title}
      onClose={placing ? () => {} : onClose}
      onBack={!isDeliveryStep && !placing ? () => goTo('delivery') : undefined}
      action={
        isDeliveryStep ? (
          <button className="sheet-action" onClick={continueToPayment} disabled={items.length === 0}>
            Continue
          </button>
        ) : (
          <button className="sheet-action" onClick={submitOrder} disabled={placing || items.length === 0}>
            {placing ? 'Placing order…' : `Place Order · ${formatPrice(total)}`}
          </button>
        )
      }
    >
      <div className="checkout" ref={contentRef}>
        {isDeliveryStep && orderError && (
          <p className="co-alert" role="alert">
            {orderError}
          </p>
        )}
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
            {/* maxLength values match the server's limits (worker/orders.ts). */}
            <TextField
              label="Full Name *"
              error={detailErrors.name}
              value={details.name}
              onChange={(e) => setDetail('name', e.target.value)}
              autoComplete="name"
              maxLength={80}
            />
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
                  maxLength={30}
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
              maxLength={120}
            />
            <div className="co-row2 co-row2--wide-first">
              <TextField
                label="Suburb *"
                error={detailErrors.suburb}
                value={details.suburb}
                onChange={(e) => setDetail('suburb', e.target.value)}
                autoComplete="address-level2"
                maxLength={60}
              />
              <TextField
                label="Postcode *"
                error={detailErrors.postcode}
                value={details.postcode}
                onChange={(e) => setDetail('postcode', e.target.value)}
                autoComplete="postal-code"
                inputMode="numeric"
                maxLength={12}
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
                maxLength={300}
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

            <h3 className="co-title">Payment</h3>
            <div className="co-box">
              <WalletIcon />
              <div className="co-grow">
                <div className="co-strong">Pay on delivery</div>
                <div className="co-muted">Pay the driver by cash or card when your order arrives.</div>
              </div>
            </div>

            <div className="co-summary">
              <div className="co-sum-row co-sum-total">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <label className={`co-check${ageError ? ' co-check--error' : ''}`}>
              <input
                type="checkbox"
                checked={ageConfirmed}
                onChange={(e) => {
                  setAgeConfirmed(e.target.checked);
                  setAgeError('');
                }}
              />
              <span>
                I am {store.minimumAge} or older and will show photo ID to the driver.
              </span>
            </label>
            {ageError && <span className="field-error">{ageError}</span>}
            {orderError && (
              <p className="co-alert" role="alert">
                {orderError}
              </p>
            )}
          </>
        )}
      </div>

      {placing && (
        <div className="pay-processing" role="status">
          <span className="spinner" />
          Placing your order…
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

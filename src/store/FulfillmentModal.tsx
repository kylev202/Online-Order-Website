import { useMemo, useState } from 'react';
import { TruckIcon } from '../components/icons';
import { Modal } from '../components/overlays';
import { deliverySlots } from '../lib/hours';
import { setDeliveryTime, useOrder } from '../lib/orderStore';

export function FulfillmentModal({ onClose }: { onClose: () => void }) {
  const { deliveryTime } = useOrder();
  const slots = useMemo(() => deliverySlots(), []);
  const [time, setTime] = useState(slots.includes(deliveryTime) ? deliveryTime : 'ASAP');

  const start = () => {
    setDeliveryTime(time);
    onClose();
  };

  return (
    <Modal onClose={onClose} className="fulfil-modal" align="center">
      <div className="fulfil-options">
        <button className="fulfil-option fulfil-option--on" aria-pressed="true">
          <TruckIcon />
          <span>Delivery</span>
        </button>
      </div>
      <p className="fulfil-fee free-note">Free delivery</p>
      <label className="fulfil-time">
        <span className="fulfil-label">Delivery Time</span>
        <select className="input" value={time} onChange={(e) => setTime(e.target.value)}>
          <option value="ASAP">ASAP</option>
          {slots.map((slot) => (
            <option key={slot} value={slot}>
              Today {slot}
            </option>
          ))}
        </select>
      </label>
      <button className="btn-start" onClick={start}>
        Start Order
      </button>
    </Modal>
  );
}

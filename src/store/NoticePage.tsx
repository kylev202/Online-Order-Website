import { PageShell } from '../components/overlays';
import { store } from '../config/store';

const LEAVE_URL = 'https://www.google.com';

/** Opening page: age check plus the store notice. Escape does not skip it. */
export function NoticePage({ onConfirm }: { onConfirm: () => void }) {
  return (
    <PageShell
      title={store.notice.title}
      showBack={false}
      onClose={() => {}}
      footer={
        <div className="notice-actions">
          <button className="btn-block btn-black btn-bold" onClick={onConfirm}>
            I’m {store.minimumAge} or older
          </button>
          <a className="btn-block btn-outline" href={LEAVE_URL} rel="noreferrer">
            Leave
          </a>
        </div>
      }
    >
      <div className="notice">
        <div className="notice-age">
          <strong>{store.minimumAge}+ only</strong>
          <span>
            You must be {store.minimumAge} or older to order from this shop. Photo ID is checked on delivery.
          </span>
        </div>
        <p className="notice-headline">{store.notice.headline}</p>
        <ul className="notice-points">
          {store.notice.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </div>
    </PageShell>
  );
}

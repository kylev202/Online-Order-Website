import { PageShell } from '../components/overlays';
import { store } from '../config/store';

export function NoticePage({ onClose }: { onClose: () => void }) {
  return (
    <PageShell
      title={store.notice.title}
      showBack={false}
      onClose={onClose}
      footer={
        <button className="btn-block btn-black" onClick={onClose}>
          Got It
        </button>
      }
    >
      <div className="notice">
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

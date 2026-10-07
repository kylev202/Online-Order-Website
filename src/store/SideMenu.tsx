import { PoweredBy } from '../components/controls';
import { Drawer } from '../components/overlays';
import { navigate } from '../lib/router';

export function SideMenu({ onClose }: { onClose: () => void }) {
  const go = (route: string) => {
    onClose();
    navigate(route);
  };

  return (
    <Drawer side="left" className="side-menu" label="Menu" onClose={onClose}>
      <div className="side-body">
        <button className="side-btn side-btn--black" onClick={() => go('/login')}>
          Login
        </button>
        <button className="side-btn" onClick={() => go('/signup')}>
          Sign Up
        </button>
        <button className="side-btn" onClick={() => go('/orders')}>
          My Orders
        </button>
      </div>
      <PoweredBy className="side-foot" />
    </Drawer>
  );
}

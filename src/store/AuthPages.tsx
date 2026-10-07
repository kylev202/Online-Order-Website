import { useState, type FormEvent } from 'react';
import { CountryCode } from '../components/controls';
import { Dialog, PageShell } from '../components/overlays';
import { navigate } from '../lib/router';

// Customer accounts are not connected in the demo; these pages show the design only.
function DemoNotice({ onClose }: { onClose: () => void }) {
  return (
    <Dialog title="Info" onOk={onClose}>
      Customer accounts are not connected in this demo yet.
    </Dialog>
  );
}

export function LoginPage() {
  const [country, setCountry] = useState('AU');
  const [showDemo, setShowDemo] = useState(false);
  const demo = (e?: FormEvent) => {
    e?.preventDefault();
    setShowDemo(true);
  };

  return (
    <PageShell title="Login" onClose={() => navigate('/')}>
      <form className="auth" onSubmit={demo}>
        <h2 className="auth-title">Login with your mobile</h2>
        <p className="auth-required">* indicates required field</p>
        <div className="phone-field auth-phone">
          <CountryCode value={country} onChange={setCountry} />
          <input className="phone-input" placeholder="* Mobile Number" inputMode="tel" autoComplete="tel-national" aria-label="Mobile number" />
        </div>
        <input className="text-field auth-password" type="password" placeholder="* Password" autoComplete="current-password" aria-label="Password" />
        <div className="auth-links">
          <button type="button" onClick={() => demo()}>
            Privacy Policy
          </button>
          <button type="button" onClick={() => demo()}>
            Forgot Password
          </button>
        </div>
        <button className="btn-block btn-black auth-btn auth-btn--first" type="submit">
          Login
        </button>
        <button className="btn-block btn-outline auth-btn" type="button" onClick={() => navigate('/signup')}>
          Sign Up
        </button>
      </form>
      {showDemo && <DemoNotice onClose={() => setShowDemo(false)} />}
    </PageShell>
  );
}

export function SignUpPage() {
  const [country, setCountry] = useState('AU');
  const [showDemo, setShowDemo] = useState(false);

  return (
    <PageShell title="Sign Up" onClose={() => navigate('/')} columnClassName="page-column--grey">
      <form
        className="auth auth--signup"
        onSubmit={(e) => {
          e.preventDefault();
          setShowDemo(true);
        }}
      >
        <h2 className="auth-title auth-title--sm">Enter your mobile number</h2>
        <div className="phone-field phone-field--inset">
          <CountryCode value={country} onChange={setCountry} />
          <input className="phone-input" inputMode="tel" autoComplete="tel-national" aria-label="Mobile number" />
        </div>
        <p className="auth-hint">By continuing you may receive an SMS for verification code.</p>
        <button className="btn-block btn-black auth-btn auth-btn--continue" type="submit">
          Continue
        </button>
      </form>
      {showDemo && <DemoNotice onClose={() => setShowDemo(false)} />}
    </PageShell>
  );
}

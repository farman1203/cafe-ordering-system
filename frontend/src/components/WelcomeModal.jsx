import { useState } from 'react';
import { Coffee, Phone } from 'lucide-react';
import Modal from './Modal';
import { isValidPhone, normalizePhone } from '../utils/helpers';

// Shown when a customer scans the QR. Asks for a mobile number (no account / OTP needed).
export default function WelcomeModal({ table, onSubmit, onSkip }) {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!isValidPhone(phone)) return setError('Enter a valid 10-digit mobile number (starting with 6-9)');
    onSubmit(normalizePhone(phone));
  };

  return (
    <Modal onClose={onSkip} size="sm">
      <form className="welcome" onSubmit={submit} noValidate>
        <div className="welcome__icon"><Coffee size={30} /></div>
        <h2>Welcome to Brew &amp; Bites!</h2>
        {table && <p className="table-chip table-chip--big">You are at Table {table}</p>}
        <p className="muted">Enter your mobile number so we can link your order and let you track it. No sign-up needed.</p>
        <label className="field">
          <span>Mobile number</span>
          <div className="input-icon">
            <Phone size={17} />
            <input type="tel" inputMode="numeric" autoFocus placeholder="98765 43210" value={phone} maxLength={14}
              onChange={(e) => { setPhone(e.target.value); setError(''); }} aria-invalid={!!error} />
          </div>
          {error && <small className="field__error">{error}</small>}
        </label>
        <button className="btn btn--primary btn--block" type="submit">Start ordering</button>
        <button type="button" className="link-btn link-btn--center" onClick={onSkip}>Skip for now</button>
      </form>
    </Modal>
  );
}

import { defineTheme } from '../../sdk/index.js';
import './widget.css';

// Three blurred colour pools breathing very slowly: ice-cream blue, mint, lemon.
function SoftAurora() {
  return <div className="w-soft-aurora" aria-hidden="true"><i /><i /><i /></div>;
}

export default defineTheme({
  id: 'soft-aurora',
  name: 'Soft aurora',
  about: 'Ice-cream blue, mint and lemon pools that breathe very slowly.',
  View: SoftAurora,
});

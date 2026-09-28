import { defineTheme } from '../../sdk/index.js';
import './widget.css';

// Milk-white paper with a slow drift of soft dots, a little lime near the edges.
function DriftDots() {
  return <div className="w-drift-dots" aria-hidden="true"><i /><i /></div>;
}

export default defineTheme({
  id: 'drift-dots',
  name: 'Drifting dots',
  about: 'Milk-white paper, soft dots drifting slowly. Calm behind any room.',
  View: DriftDots,
});

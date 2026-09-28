import { defineWidget, edgeUrl, getJson, useData } from '../../sdk/index.js';
import './widget.css';

// A football score that keeps itself fresh (every minute while the tab is
// open): live when the match is on, the result after, the kick-off before.
function LiveScore({ config }) {
  const team = String(config.team || '').trim(), vs = String(config.vs || '').trim();
  const key = team.length > 1 ? `score:${team}:${vs}`.toLowerCase() : null;
  const { data, error, loading } = useData(key, () => getJson(edgeUrl('score', { team, vs })), 1);
  const s = data?.found ? data : null;
  const live = s?.state === 'in';
  return <div className={`w-live-score ${live ? 'w-live-score-on' : ''}`} title={error || data?.note || undefined}>
    <header><small>{s?.league || 'Football'}</small>{live && <b className="w-live-score-live"><i />LIVE</b>}</header>
    <div className="w-live-score-row">
      <span>{s?.home.name || team || 'Team'}</span>
      <strong>{s ? `${s.home.score === '' ? '–' : s.home.score} : ${s.away.score === '' ? '–' : s.away.score}` : loading ? '…' : '– : –'}</strong>
      <span>{s?.away.name || vs || 'Rival'}</span>
    </div>
    <footer>{s ? s.detail : error || data?.note || 'Pick your team in settings'}</footer>
  </div>;
}

export default defineWidget({
  id: 'live-score',
  name: 'Live score',
  about: 'Your team’s match, live while it’s on and the result after. Watch it together in the room.',
  fields: {
    team: { type: 'text', label: 'Your team', max: 40, placeholder: 'Ajax', default: 'Ajax' },
    vs: { type: 'text', label: 'Against (optional)', max: 40, placeholder: 'Liverpool', default: '' },
  },
  View: LiveScore,
});

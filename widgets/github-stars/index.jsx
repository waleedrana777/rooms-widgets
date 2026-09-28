import { accent, defineWidget, readValue, useData } from '../../sdk/index.js';
import './widget.css';

// A GitHub repo's stars, through Rooms' cache (the network example).
const REPO = /^[\w.-]+\/[\w.-]+$/;

function GithubStars({ config }) {
  const repo = String(config.repo || '').trim();
  const key = REPO.test(repo) ? `github-stars:${repo}` : null;
  const { data, error, loading } = useData(key, () => readValue(`https://api.github.com/repos/${repo}`, 'stargazers_count'), 30);
  const count = typeof data === 'number' ? data.toLocaleString() : loading ? '…' : '—';
  return <div className="w-github-stars" style={{ '--w': accent(config.color) }} title={error || undefined}>
    <b><i aria-hidden="true">★</i>{count}</b>
    <small>{key ? repo : 'owner/repo'}</small>
  </div>;
}

export default defineWidget({
  id: 'github-stars',
  name: 'GitHub stars',
  about: 'Stars on any public GitHub repo, updated every half hour.',
  fields: {
    repo: { type: 'text', label: 'Repo', max: 60, placeholder: 'facebook/react', default: 'facebook/react' },
    color: { type: 'color', default: 'black' },
  },
  View: GithubStars,
});

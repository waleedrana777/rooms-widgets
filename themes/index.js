// Every room theme in this folder: themes/<id>/index.jsx, made with defineTheme().
const found = import.meta.glob('./*/index.jsx', { eager: true });
export default Object.values(found).map(module => module.default).sort((a, b) => a.name.localeCompare(b.name));

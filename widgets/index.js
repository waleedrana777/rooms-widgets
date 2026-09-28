// Every widget in this folder. Adding one is adding a folder: widgets/<id>/index.jsx.
const found = import.meta.glob('./*/index.jsx', { eager: true });
export default Object.values(found).map(module => module.default).sort((a, b) => a.name.localeCompare(b.name));

async function listDatasets() {
  try {
    const res = await fetch('datasets/');
    const text = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');
    return [...doc.querySelectorAll('a')]
      .map(a => a.getAttribute('href'))
      .filter(href => href.endsWith('/') && href !== '../')
      .map(folder => folder.replace(/\/$/, ''));
  } catch (e) {
    console.error('Failed to list dataset folders:', e);
    return [];
  }
}

async function loadMetadata(name) {
  const res = await fetch(`datasets/${name}/metadata.json`);
  const metadata = await res.json();

  try {
    const folder = `datasets/${name}/dataset_files/`;
    const listing = await fetch(folder);
    const text = await listing.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');
    const links = [...doc.querySelectorAll('a')];
    metadata.files = links
      .map(a => a.getAttribute('href'))
      .filter(href => href && href !== '../');
    metadata.folder = name;
  } catch (e) {
    metadata.files = [];
    metadata.folder = name;
  }

  return metadata;
}

function renderResults(items, container) {
  container.innerHTML = '';
  items.forEach(m => {
    const card = document.createElement('div');
    card.className = 'card';

    const fileList = m.files.length
      ? '<ul>' + m.files.map(f => `<li><a href="datasets/${m.folder}/dataset_files/${f}" target="_blank">${f}</a></li>`).join('') + '</ul>'
      : '<p>No files listed.</p>';

    card.innerHTML = `
      <h3>${m.dataset_name}</h3>
      <p>${m.description}</p>
      <p><em>Rights:</em> ${m.usage_rights}</p>
      <strong>Files:</strong>
      ${fileList}
    `;
    container.appendChild(card);
  });
}

async function doSearch(query) {
  const folders = await listDatasets();
  const all = await Promise.all(folders.map(loadMetadata));
  return all.filter(m =>
    m.dataset_name.toLowerCase().includes(query) ||
    m.tags.join(' ').toLowerCase().includes(query)
  );
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('search-form');
  const input = document.getElementById('query');
  const resultsDiv = document.getElementById('results');
  const filterBtn = document.getElementById('filter-btn');
  const filterPanel = document.getElementById('filter-panel');

  const params = new URLSearchParams(window.location.search);
  if (params.has('q')) {
    input.value = params.get('q');
    doSearch(params.get('q').toLowerCase()).then(res => renderResults(res, resultsDiv));
  }

  form?.addEventListener('submit', e => {
    e.preventDefault();
    const q = input.value;
    if (window.location.pathname.endsWith('results.html')) {
      doSearch(q.toLowerCase()).then(res => renderResults(res, resultsDiv));
    } else {
      window.location = `results.html?q=${encodeURIComponent(q)}`;
    }
  });

  filterBtn?.addEventListener('click', () => {
    filterPanel.classList.toggle('hidden');
  });
});

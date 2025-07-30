const datasets = [
  'strawberries_galloway',
  'bananas_brazil',
  'algae_stirling'
];

async function loadMetadata(name) {
  const res = await fetch(`datasets/${name}/metadata.json`);
  return res.json();
}

function renderResults(items, container) {
  container.innerHTML = '';
  items.forEach(m => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3>${m.dataset_name}</h3>
      <p><strong>Files:</strong> ${m.files.join(', ')}</p>
      <p>${m.description}</p>
      <p><em>Rights:</em> ${m.usage_rights}</p>
    `;
    container.appendChild(card);
  });
}

async function doSearch(query) {
  const all = await Promise.all(datasets.map(loadMetadata));
  const filtered = all.filter(m =>
    m.dataset_name.toLowerCase().includes(query) ||
    m.tags.join(' ').toLowerCase().includes(query)
  );
  // attach file names
  filtered.forEach(m => m.files = ['(list file names manually)']);
  return filtered;
}

// Shared handler for both pages
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('search-form');
  const input = document.getElementById('query');
  const resultsDiv = document.getElementById('results');
  const filterBtn = document.getElementById('filter-btn');
  const filterPanel = document.getElementById('filter-panel');

  // if on results page, pre-fill
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

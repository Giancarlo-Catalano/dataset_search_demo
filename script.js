async function listDatasets() {
  try {
    const res = await fetch('datasets/index.json');
    return await res.json();
  } catch (e) {
    console.error('Failed to list dataset folders:', e);
    return [];
  }
}

async function loadMetadata(name) {
  const res = await fetch(`datasets/${name}/metadata.json`);
  const metadata = await res.json();
  metadata.folder = name;
  metadata.files = metadata.files || [];
  return metadata;
}

function renderResults(items, container) {
  container.innerHTML = '';
  items.forEach(m => {
    const card = document.createElement('div');
    card.className = 'card';

    const header = document.createElement('div');
    header.className = 'card-header';
    header.innerHTML = `<h3>${m.dataset_name}</h3><p>${m.description}</p><p><em>Last updated:</em> ${m.last_updated}</p>`;

    const details = document.createElement('div');
    details.className = 'card-details hidden';
    const fileList = m.files.length
      ? '<ul>' + m.files.map(f => `<li><a href="datasets/${m.folder}/dataset_files/${f}" target="_blank">${f}</a></li>`).join('') + '</ul>'
      : '<p>No files listed.</p>';

    details.innerHTML = `
      <p><strong>Authors:</strong> ${m.authors?.join(', ') || 'N/A'}</p>
      <p><strong>Contact:</strong> ${m.author_contacts?.join(', ') || 'N/A'}</p>
      <p><strong>Identifier:</strong> ${m.identifier || 'N/A'}</p>
      <p><strong>Used in works:</strong> ${m.works_that_used_this_dataset?.join(', ') || 'N/A'}</p>
      <p><strong>Rights:</strong> ${m.usage_rights || 'N/A'}</p>
      <strong>Files:</strong>
      ${fileList}
    `;

    header.addEventListener('click', () => {
      details.classList.toggle('hidden');
    });

    card.appendChild(header);
    card.appendChild(details);
    container.appendChild(card);
  });
}

async function doSearch(query) {
  const folders = await listDatasets();
  const all = await Promise.all(folders.map(loadMetadata));
  return all.filter(m =>
    m.dataset_name.toLowerCase().includes(query) ||
    (m.tags || []).join(' ').toLowerCase().includes(query)
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

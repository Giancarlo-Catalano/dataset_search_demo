async function listDatasets() {
  try {
    const res = await fetch('datasets/index.json');
    return res.json();
  } catch (e) {
    console.error('Failed to list dataset folders:', e);
    return [];
  }
}

async function loadMetadata(name) {
  const res = await fetch(`datasets/${name}/metadata.json`);
  const metadata = await res.json();
  metadata.folder = name;

  try {
    const folderUrl = `datasets/${name}/dataset_files/`;
    const listing = await fetch(folderUrl);
    const parser = new DOMParser();
    const doc = parser.parseFromString(await listing.text(), 'text/html');
    metadata.files = [...doc.querySelectorAll('a')]
      .map(a => a.getAttribute('href'))
      .filter(href => href && href !== '../');
  } catch (e) {
    metadata.files = [];
  }

  return metadata;
}

function renderResults(items, container) {
  container.innerHTML = '';
  items.forEach(m => {
    const card = document.createElement('div');
    card.className = 'card';

    const header = document.createElement('div');
    header.className = 'card-header';
    header.innerHTML = `
      <h3>${m.dataset_name}</h3>
      <p>${m.description}</p>
      <small>Last updated: ${m.last_updated}</small>
    `;

    const details = document.createElement('div');
    details.className = 'card-details';
    details.innerHTML = `
      <p><strong>Authors:</strong> ${m.authors.join(', ')}</p>
      <p><strong>DOI:</strong> ${m.identifier}</p>
      <p><strong>Used in:</strong> ${m.works_that_used_this_dataset.join(', ')}</p>
      <p><strong>Usage rights:</strong> ${m.usage_rights}</p>
      <strong>Files:</strong>
      ${m.files.length
        ? '<ul>' + m.files.map(f => `<li><a href="datasets/${m.folder}/dataset_files/${f}" download>${f}</a></li>`).join('') + '</ul>'
        : '<p>No files available.</p>'}
    `;

    header.addEventListener('click', () => {
      const isVisible = details.style.display === 'block';
      details.style.display = isVisible ? 'none' : 'block';
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

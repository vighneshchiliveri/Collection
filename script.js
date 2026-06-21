let library = { music: [], video: [] };
let currentView = 'music';

const catalogEl = document.getElementById('catalog');
const emptyStateEl = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const resultCount = document.getElementById('resultCount');
const genreFilter = document.getElementById('genreFilter');
const modalBackdrop = document.getElementById('modalBackdrop');
const modalContent = document.getElementById('modalContent');
const modalClose = document.getElementById('modalClose');

async function loadLibrary() {
  try {
    const res = await fetch('media/library.json');
    library = await res.json();
  } catch (err) {
    console.error('Could not load library.json', err);
    library = { music: [], video: [] };
  }
  populateGenres();
  render();
}

function populateGenres() {
  const items = library[currentView] || [];
  const genres = [...new Set(items.map(i => i.genre).filter(Boolean))].sort();
  genreFilter.innerHTML = '<option value="">All</option>' +
    genres.map(g => `<option value="${escapeHtml(g)}">${escapeHtml(g)}</option>`).join('');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Accepts any Google Drive share link format and rewrites it to a direct
// download link. Leaves local paths and non-Drive URLs untouched.
function normalizeDriveUrl(path) {
  if (!path) return path;
  const match = path.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (match) {
    return `https://drive.google.com/uc?export=download&id=${match[1]}`;
  }
  const openMatch = path.match(/drive\.google\.com\/open\?id=([^&]+)/);
  if (openMatch) {
    return `https://drive.google.com/uc?export=download&id=${openMatch[1]}`;
  }
  return path;
}

function isExternalUrl(path) {
  return /^https?:\/\//i.test(path);
}

function getFiltered() {
  const items = library[currentView] || [];
  const q = searchInput.value.trim().toLowerCase();
  const genre = genreFilter.value;
  return items.filter(item => {
    const haystack = `${item.title} ${item.artist || item.creator || ''}`.toLowerCase();
    const matchesQuery = !q || haystack.includes(q);
    const matchesGenre = !genre || item.genre === genre;
    return matchesQuery && matchesGenre;
  });
}

function render() {
  const filtered = getFiltered();
  const items = library[currentView] || [];
  resultCount.textContent = `${filtered.length} / ${items.length}`;

  if (filtered.length === 0) {
    catalogEl.innerHTML = '';
    emptyStateEl.hidden = false;
    return;
  }
  emptyStateEl.hidden = true;

  catalogEl.innerHTML = filtered.map((item, idx) => {
    const catNum = String(idx + 1).padStart(3, '0');
    const subLabel = item.artist || item.creator || '';
    return `
      <article class="entry-card" tabindex="0" data-id="${item.id}" role="button" aria-label="${escapeHtml(item.title)}">
        <span class="entry-cat">No. ${catNum}</span>
        <img class="entry-cover" src="${item.cover}" alt="" loading="lazy">
        <div class="entry-body">
          <h3 class="entry-title">${escapeHtml(item.title)}</h3>
          <p class="entry-sub">${escapeHtml(subLabel)}</p>
          <div class="entry-meta">
            <span>${escapeHtml(item.genre || '')}</span>
            <span>${escapeHtml(item.duration || '')}</span>
          </div>
        </div>
      </article>
    `;
  }).join('');

  catalogEl.querySelectorAll('.entry-card').forEach(card => {
    card.addEventListener('click', () => openModal(card.dataset.id));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(card.dataset.id);
      }
    });
  });
}

function openModal(id) {
  const item = (library[currentView] || []).find(i => i.id === id);
  if (!item) return;

  const subLabel = item.artist || item.creator || '';
  const filesHtml = (item.files || []).map(f => {
    const href = normalizeDriveUrl(f.path);
    const downloadAttr = isExternalUrl(href) ? '' : 'download';
    return `
    <div class="quality-row">
      <div class="quality-info">
        <span class="quality-name">${escapeHtml(f.format)} — ${escapeHtml(f.quality)}</span>
        <span class="quality-size">${escapeHtml(f.size || '')}</span>
      </div>
      <a class="download-btn" href="${href}" ${downloadAttr} target="_blank" rel="noopener">Download</a>
    </div>
  `;
  }).join('');

  modalContent.innerHTML = `
    <img class="modal-cover" src="${item.cover}" alt="">
    <div class="modal-body">
      <h2 class="modal-title">${escapeHtml(item.title)}</h2>
      <p class="modal-sub">${escapeHtml(subLabel)} · ${escapeHtml(item.genre || '')} · ${escapeHtml(item.duration || '')}</p>
      <p class="quality-label">Available qualities</p>
      <div class="quality-list">${filesHtml || '<p>No files attached yet.</p>'}</div>
    </div>
  `;
  modalBackdrop.classList.add('open');
}

function closeModal() {
  modalBackdrop.classList.remove('open');
}

modalClose.addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', e => {
  if (e.target === modalBackdrop) closeModal();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

document.querySelectorAll('.toggle-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.toggle-btn').forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    currentView = btn.dataset.view;
    searchInput.value = '';
    populateGenres();
    render();
  });
});

searchInput.addEventListener('input', render);
genreFilter.addEventListener('change', render);

loadLibrary();

const STORAGE_KEY = 'kp-region-selection';

/**
 * Fetches the EDS folder index for the given fragment folder path.
 * EDS auto-generates /{folder}.json with {data: [{path, title, ...}]}
 */
async function fetchFragmentIndex(folderPath) {
  const indexUrl = `${folderPath}.json`;
  try {
    const resp = await fetch(indexUrl);
    if (!resp.ok) throw new Error(`Index fetch failed: ${resp.status}`);
    const json = await resp.json();
    return (json.data || []).filter((item) => item.path && item.title);
  } catch (e) {
    console.error('[fragment-region-picker] Could not load index:', e);
    return [];
  }
}

/**
 * Fetches a fragment's rendered HTML via EDS .plain.html convention.
 * Returns an HTML string of just the block content, no chrome.
 */
async function fetchFragment(fragmentPath) {
  try {
    const resp = await fetch(`${fragmentPath}.plain.html`);
    if (!resp.ok) throw new Error(`Fragment fetch failed: ${resp.status}`);
    return await resp.text();
  } catch (e) {
    console.error('[fragment-region-picker] Could not load fragment:', e);
    return '<p>Content could not be loaded. Please try again.</p>';
  }
}

/**
 * Saves the selected region path to localStorage.
 */
function saveSelection(path) {
  try {
    localStorage.setItem(STORAGE_KEY, path);
  } catch (e) { /* ignore */ }
}

/**
 * Reads the saved region path from localStorage.
 */
function loadSelection() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch (e) { return null; }
}

/**
 * Renders the fragment HTML into the content panel.
 * Calls EDS decorateMain equivalent so blocks inside fragments are decorated.
 */
async function renderFragment(fragmentPath, contentPanel) {
  contentPanel.classList.add('loading');
  contentPanel.innerHTML = '';

  const html = await fetchFragment(fragmentPath);

  // Wrap in a div so we can decorate blocks inside
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;

  // EDS block decoration — import from scripts.js
  // decorateMain handles block discovery + decoration for injected HTML
  const { decorateMain } = await import('/scripts/scripts.js');
  decorateMain(wrapper);

  // Await any loadEager / lazy phases if needed
  const { loadBlocks } = await import('/scripts/aem.js');
  await loadBlocks(wrapper);

  contentPanel.appendChild(wrapper);
  contentPanel.classList.remove('loading');
}

/**
 * Builds the dropdown <select> from the sorted fragment index.
 */
function buildSelect(fragments) {
  const label = document.createElement('label');
  label.className = 'region-picker-label';
  label.setAttribute('for', 'region-select');
  label.textContent = 'Select your region:';

  const select = document.createElement('select');
  select.id = 'region-select';
  select.className = 'region-picker-select';
  select.setAttribute('aria-label', 'Select a region to view contact details');

  // Sort alphabetically by title
  const sorted = [...fragments].sort((a, b) =>
    a.title.localeCompare(b.title),
  );

  sorted.forEach(({ path, title }) => {
    const option = document.createElement('option');
    option.value = path;
    option.textContent = title;
    select.appendChild(option);
  });

  return { label, select, sorted };
}

export default async function decorate(block) {
  // Read folder path from first row, first cell
  const folderPath = block.querySelector('div > div')?.textContent?.trim();
  if (!folderPath) {
    block.innerHTML = '<p>No fragment folder configured.</p>';
    return;
  }

  // Clear block content while loading
  block.innerHTML = '<p class="region-picker-loading">Loading regions&hellip;</p>';

  // Fetch index
  const fragments = await fetchFragmentIndex(folderPath);
  if (!fragments.length) {
    block.innerHTML = '<p>No regions found. Please check the fragment folder.</p>';
    return;
  }

  // Build UI
  const pickerWrapper = document.createElement('div');
  pickerWrapper.className = 'region-picker-controls';

  const { label, select, sorted } = buildSelect(fragments);
  pickerWrapper.appendChild(label);
  pickerWrapper.appendChild(select);

  const contentPanel = document.createElement('div');
  contentPanel.className = 'region-picker-content';
  contentPanel.setAttribute('aria-live', 'polite');
  contentPanel.setAttribute('role', 'region');
  contentPanel.setAttribute('aria-label', 'Contact details for selected region');

  block.innerHTML = '';
  block.appendChild(pickerWrapper);
  block.appendChild(contentPanel);

  // Restore saved selection or default to first
  const saved = loadSelection();
  const savedExists = sorted.find((f) => f.path === saved);
  const initialPath = savedExists ? saved : sorted[0].path;
  select.value = initialPath;

  // Load initial fragment
  await renderFragment(initialPath, contentPanel);

  // Handle change
  select.addEventListener('change', async () => {
    const selected = select.value;
    saveSelection(selected);
    await renderFragment(selected, contentPanel);
  });
}

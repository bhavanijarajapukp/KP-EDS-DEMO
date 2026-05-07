export default function decorate(block) {
  const rows = [...block.children];
  const regions = rows.map((row) => row.children[0]?.textContent?.trim()).filter(Boolean);

  block.innerHTML = '';

  const label = document.createElement('label');
  label.setAttribute('for', 'region-select');
  label.textContent = 'Select a region';

  const select = document.createElement('select');
  select.id = 'region-select';
  select.setAttribute('aria-label', 'Select your region');

  regions.forEach((region) => {
    const option = document.createElement('option');
    option.value = region.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    option.textContent = region;
    select.appendChild(option);
  });

  block.appendChild(label);
  block.appendChild(select);

  function showRegion(regionValue) {
    document.querySelectorAll('.contact-details-wrapper').forEach((section) => {
      section.style.display = section.dataset.region === regionValue ? 'block' : 'none';
    });
    try { localStorage.setItem('kp-region', regionValue); } catch (e) { /* ignore */ }
  }

  select.addEventListener('change', () => showRegion(select.value));

  // Init after contact-details blocks have decorated
  setTimeout(() => {
    let saved = null;
    try { saved = localStorage.getItem('kp-region'); } catch (e) { /* ignore */ }
    if (saved && [...select.options].find((o) => o.value === saved)) {
      select.value = saved;
      showRegion(saved);
    } else if (select.options.length > 0) {
      showRegion(select.options[0].value);
    }
  }, 300);
}

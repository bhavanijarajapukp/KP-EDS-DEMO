export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  const regionName = rows[0]?.children[1]?.textContent?.trim()
    || rows[0]?.children[0]?.textContent?.trim()
    || '';
  const regionKey = regionName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  // Register region on wrapper for region-selector to target
  const wrapper = block.closest('.contact-details-wrapper');
  if (wrapper) {
    wrapper.dataset.region = regionKey;
    wrapper.style.display = 'none';
  }

  block.innerHTML = '';

  // Region heading
  const heading = document.createElement('h2');
  heading.textContent = regionName;
  block.appendChild(heading);

  // Intro paragraph
  const intro = document.createElement('p');
  intro.className = 'region-intro';
  intro.textContent = 'Como siempre, puede llamarnos si tiene alguna pregunta o si necesita ayuda. Seleccione el número de teléfono adecuado de la lista que aparece a continuación.';
  block.appendChild(intro);

  // Process rows (skip row 0 — region name row)
  rows.slice(1).forEach((row) => {
    const cells = [...row.children];
    const label = cells[0]?.textContent?.trim();
    const value = cells[1]?.innerHTML?.trim();
    if (!label) return;

    const item = document.createElement('div');
    item.className = 'contact-item';

    const itemHeading = document.createElement('h3');
    itemHeading.textContent = label;
    item.appendChild(itemHeading);

    if (value) {
      const content = document.createElement('div');
      content.innerHTML = value;
      // Convert phone numbers to tel: links
      content.innerHTML = content.innerHTML.replace(
        /(\d[\d\s().+-]{6,})/g,
        (match) => {
          const cleaned = match.replace(/[^\d+]/g, '');
          return `<a class="phone" href="tel:${cleaned}">${match}</a>`;
        },
      );
      item.appendChild(content);
    }

    block.appendChild(item);
  });
}

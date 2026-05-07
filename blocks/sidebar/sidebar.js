export default function decorate(block) {
  const rows = [...block.children];
  const navRow = rows[0];
  const emergencyRow = rows[1];

  block.innerHTML = '';

  // Build sidebar nav
  const navDiv = document.createElement('div');
  navDiv.className = 'sidebar-nav';

  if (navRow) {
    const ul = navRow.querySelector('ul');
    if (ul) {
      navDiv.appendChild(ul);
      const firstLi = ul.querySelector('li:first-child');
      if (firstLi) firstLi.classList.add('active');
      ul.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
          ul.querySelectorAll('li').forEach((li) => li.classList.remove('active'));
          link.closest('li').classList.add('active');
        });
      });
    } else {
      navDiv.innerHTML = navRow.innerHTML;
    }
  }
  block.appendChild(navDiv);

  // Build emergency box
  if (emergencyRow) {
    const emergencyDiv = document.createElement('div');
    emergencyDiv.className = 'emergency-box';

    const icon = document.createElement('div');
    icon.className = 'emergency-icon';
    icon.textContent = '⚠️';

    const content = document.createElement('div');
    content.className = 'emergency-content';
    content.innerHTML = emergencyRow.innerHTML;

    emergencyDiv.appendChild(icon);
    emergencyDiv.appendChild(content);
    block.appendChild(emergencyDiv);
  }
}

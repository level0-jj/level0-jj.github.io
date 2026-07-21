(() => {
  const palette = [
    '#5b7cfa',
    '#7659d6',
    '#2f9eaa',
    '#d16b86',
    '#ca7a45',
    '#4e88b7',
  ];

  function hash(text) {
    let value = 0;
    for (let index = 0; index < text.length; index += 1) {
      value = (value * 31 + text.charCodeAt(index)) >>> 0;
    }
    return value;
  }

  function renderPrettyWordCloud() {
    const canvas = document.getElementById('wordcloud-canvas');
    const page = document.getElementById('page');
    if (!canvas || !page || typeof window.WordCloud !== 'function') return;

    const originalList = Array.isArray(window.__yunWordcloudList)
      ? window.__yunWordcloudList
      : null;
    const links = new Map();
    document.querySelectorAll('.tag-list-item').forEach((item) => {
      const name = item.querySelector('.tag-list-name')?.textContent?.trim();
      if (name) links.set(name, item.href);
    });

    const list = originalList || Array.from(links.keys()).map((name) => [name, 1, links.get(name)]);
    if (!list.length) return;

    const counts = new Map();
    document.querySelectorAll('.tag-list-item').forEach((item) => {
      const name = item.querySelector('.tag-list-name')?.textContent?.trim();
      const count = Number(item.querySelector('.tag-list-count')?.textContent) || 1;
      if (name) counts.set(name, count);
    });

    const width = Math.max(280, page.clientWidth - 48);
    const height = Math.max(300, Math.min(430, Math.round(width * 0.46)));
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const weightedList = list.map(([name, , url]) => {
      const count = counts.get(name) || 1;
      return [name, 15 + Math.sqrt(count) * 8, url || links.get(name)];
    });

    window.WordCloud(canvas, {
      list: weightedList,
      gridSize: Math.max(7, Math.round(width / 85)) * ratio,
      weightFactor: ratio,
      fontFamily: "'Noto Serif SC', 'Source Han Serif SC', 'Songti SC', serif",
      fontWeight: '600',
      backgroundColor: 'transparent',
      color(word) {
        return palette[hash(word) % palette.length];
      },
      rotateRatio: 0.08,
      minRotation: -Math.PI / 18,
      maxRotation: Math.PI / 18,
      rotationSteps: 2,
      shuffle: false,
      drawOutOfBound: false,
      shrinkToFit: true,
      hover(item) {
        canvas.classList.toggle('is-hovering', Boolean(item));
      },
      click(item) {
        if (item?.[2]) window.location.href = item[2];
      },
    });
  }

  function scheduleRender() {
    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;
      if (typeof window.WordCloud === 'function' && document.getElementById('wordcloud-canvas')) {
        window.clearInterval(timer);
        renderPrettyWordCloud();
      } else if (attempts > 30) {
        window.clearInterval(timer);
      }
    }, 100);
  }

  document.addEventListener('DOMContentLoaded', scheduleRender);
  document.addEventListener('pjax:complete', scheduleRender);

  let resizeTimer;
  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(renderPrettyWordCloud, 180);
  });
})();

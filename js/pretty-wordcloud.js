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

  function renderFriendshipQuote() {
    const links = document.getElementById('links');
    if (!links) return;

    let quote = document.querySelector('.friendship-quote');
    if (!quote) {
      quote = document.createElement('div');
      quote.className = 'friendship-quote';
      quote.setAttribute('role', 'note');
      quote.setAttribute('aria-label', '友情名言');

      const textElement = document.createElement('p');
      textElement.className = 'friendship-quote-text';
      const authorElement = document.createElement('cite');
      authorElement.className = 'friendship-quote-author';
      quote.append(textElement, authorElement);
      links.insertAdjacentElement('afterend', quote);
    }

    const quotes = [
      ['真正的朋友，是一个灵魂孕育在两个躯体里。', '亚里士多德'],
      ['人生得一知己足矣，斯世当以同怀视之。', '鲁迅'],
      ['海内存知己，天涯若比邻。', '王勃'],
      ['同是天涯沦落人，相逢何必曾相识。', '白居易'],
      ['友谊是人生的调味品，也是人生的止痛药。', '爱默生'],
      ['最好的镜子是老朋友。', '乔治·赫伯特'],
    ];
    const [text, author] = quotes[Math.floor(Math.random() * quotes.length)];
    quote.querySelector('.friendship-quote-text').textContent = text;
    quote.querySelector('.friendship-quote-author').textContent = `—— ${author}`;
    window.requestAnimationFrame(() => quote.classList.add('is-visible'));
  }

  function scheduleRender() {
    renderFriendshipQuote();
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

  if (document.readyState !== 'loading') scheduleRender();

  let resizeTimer;
  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(renderPrettyWordCloud, 180);
  });
})();

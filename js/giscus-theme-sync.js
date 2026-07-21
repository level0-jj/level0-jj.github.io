(() => {
  let currentTheme;

  function getTheme() {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  }

  function syncGiscusTheme(force = false) {
    const theme = getTheme();
    if (!force && theme === currentTheme) return;
    currentTheme = theme;

    document.querySelectorAll('iframe.giscus-frame').forEach((iframe) => {
      iframe.contentWindow?.postMessage(
        {
          giscus: {
            setConfig: { theme },
          },
        },
        'https://giscus.app',
      );
    });
  }

  const observer = new MutationObserver((mutations) => {
    const themeChanged = mutations.some(
      (mutation) => mutation.type === 'attributes' && mutation.attributeName === 'class',
    );
    const iframeAdded = mutations.some((mutation) =>
      Array.from(mutation.addedNodes).some(
        (node) =>
          node.nodeType === Node.ELEMENT_NODE &&
          (node.matches?.('iframe.giscus-frame') || node.querySelector?.('iframe.giscus-frame')),
      ),
    );

    if (themeChanged) syncGiscusTheme();
    if (iframeAdded) window.setTimeout(() => syncGiscusTheme(true), 0);
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
    childList: true,
    subtree: true,
  });

  window.addEventListener('message', (event) => {
    if (event.origin === 'https://giscus.app' && event.data?.giscus) {
      syncGiscusTheme(true);
    }
  });

  document.addEventListener('DOMContentLoaded', () => syncGiscusTheme(true));
  document.addEventListener('pjax:complete', () => syncGiscusTheme(true));

  if (document.readyState !== 'loading') syncGiscusTheme(true);
})();

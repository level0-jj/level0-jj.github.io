(() => {
  function getTheme() {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  }

  function syncGiscusTheme(force = false) {
    const theme = getTheme();

    document.querySelectorAll('iframe.giscus-frame').forEach((iframe) => {
      if (!force && iframe.dataset.blogTheme === theme) return;
      iframe.dataset.blogTheme = theme;
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

  function watchFrame(iframe) {
    if (iframe.dataset.themeSyncReady) return;
    iframe.dataset.themeSyncReady = 'true';
    iframe.addEventListener('load', () => syncGiscusTheme(true));
  }

  function findAndWatchFrames(root = document) {
    if (root.matches?.('iframe.giscus-frame')) watchFrame(root);
    root.querySelectorAll?.('iframe.giscus-frame').forEach(watchFrame);
  }

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes') {
        syncGiscusTheme();
      } else {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) findAndWatchFrames(node);
        });
      }
    });
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
    childList: true,
    subtree: true,
  });

  function initialize() {
    findAndWatchFrames();
    syncGiscusTheme(true);
  }

  document.addEventListener('DOMContentLoaded', initialize);
  document.addEventListener('pjax:complete', initialize);

  if (document.readyState !== 'loading') initialize();
})();

(() => {
  const CONTENT_SELECTOR = '#content';
  const EXIT_CLASS = 'page-transition-leaving';
  const ENTER_CLASS = 'page-transition-entering';

  function getContent() {
    return document.querySelector(CONTENT_SELECTOR);
  }

  function isInternalNavigation(event) {
    if (event.defaultPrevented || event.button !== 0) return false;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;

    const link = event.target.closest('a[href]');
    if (!link || link.target === '_blank' || link.hasAttribute('download')) return false;
    if (link.dataset.noPjax !== undefined || link.closest('[data-no-pjax]')) return false;

    const url = new URL(link.href, window.location.href);
    if (!/^https?:$/.test(url.protocol) || url.origin !== window.location.origin) return false;
    if (url.pathname === window.location.pathname && url.search === window.location.search) return false;

    return true;
  }

  function startExit(event) {
    if (!isInternalNavigation(event)) return;
    const content = getContent();
    if (!content) return;
    content.classList.remove(ENTER_CLASS);
    content.classList.add(EXIT_CLASS);
  }

  function startEnter() {
    const content = getContent();
    if (!content) return;

    content.classList.remove(EXIT_CLASS);
    content.classList.add(ENTER_CLASS);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => content.classList.remove(ENTER_CLASS));
    });
  }

  function restoreContent() {
    const content = getContent();
    content?.classList.remove(EXIT_CLASS, ENTER_CLASS);
  }

  document.addEventListener('click', startExit, true);
  document.addEventListener('pjax:success', startEnter);
  document.addEventListener('pjax:error', restoreContent);
  window.addEventListener('pageshow', restoreContent);
})();

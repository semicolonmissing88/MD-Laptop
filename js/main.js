(function () {
  'use strict';

  // Persist/restore scroll so refresh keeps the same section.
  var KEY = 'md_scrollY';

  try {
    // Avoid browser auto-restoration fighting our saved scroll position.
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  } catch (e) {}

  function getScrollY() {
    return window.pageYOffset || document.documentElement.scrollTop || 0;
  }

  function setScrollY(y) {
    window.scrollTo(0, Math.max(0, y | 0));
  }

  function restoreScroll() {
    try {
      var raw = sessionStorage.getItem(KEY);
      if (!raw) return;
      var y = parseInt(raw, 10);
      if (!isFinite(y)) return;
      setScrollY(y);
    } catch (e) {}
  }

  function persistScroll() {
    try {
      sessionStorage.setItem(KEY, String(getScrollY() | 0));
    } catch (e) {}
  }

  function hideLoaderSoon() {
    // Loader fades out after all assets have loaded, then is removed from DOM.
    var el = document.querySelector('.js-page-loader');
    if (!el) return;
    el.classList.add('is-hiding');
    window.setTimeout(function () {
      el.parentNode && el.parentNode.removeChild(el);
    }, 520);
  }

  function initScrollTop() {
    // Scroll-to-top button: appears past a threshold, scroll handler is rAF-throttled.
    var btn = document.querySelector('.js-scroll-top');
    if (!btn) return;

    var ticking = false;
    function update() {
      ticking = false;
      var show = getScrollY() > 520;
      btn.classList.toggle('is-visible', show);
    }

    window.addEventListener(
      'scroll',
      function () {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(update);
      },
      { passive: true }
    );

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    update();
  }
  // Save scroll for unload + bfcache navigations.
  window.addEventListener('pagehide', persistScroll, { passive: true });
  window.addEventListener('beforeunload', persistScroll);
  window.addEventListener('pageshow', restoreScroll);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      restoreScroll();
      initScrollTop();
    });
  } else {
    restoreScroll();
    initScrollTop();
  }

  window.addEventListener('load', hideLoaderSoon, { once: true });
})();

$(function () {
  // Slick + FAQ: init only when matching elements exist.
  var idle = { pauseOnFocus: false, pauseOnHover: false, pauseOnDotsHover: false };

  function warrantyArrow(dir, icon, label) {
    return (
      '<button type="button" class="services-warranty-arrow services-warranty-arrow--' +
      dir +
      ' slick-arrow" aria-label="' +
      label +
      '"><i class="fa-solid fa-chevron-' +
      icon +
      '" aria-hidden="true"></i></button>'
    );
  }

  var warrantyCarousel = {
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    speed: 450,
    infinite: true,
    responsive: [
      { breakpoint: 992, settings: { slidesToShow: 2 } },
      { breakpoint: 576, settings: { slidesToShow: 1 } },
    ],
  };

  var $banner = $('.js-banner-slider');
  if ($banner.length) {
    // Hero background slideshow.
    $banner.slick(
      $.extend(
        {
          fade: true,
          cssEase: 'ease-in-out',
          autoplay: true,
          autoplaySpeed: 1500,
          speed: 1500,
          infinite: true,
          arrows: false,
          dots: false,
        },
        idle
      )
    );
  }

  var $warranty = $('.js-services-warranty-slider');
  if ($warranty.length) {
    // Warranty carousel with custom arrows.
    $warranty.slick(
      $.extend({}, idle, warrantyCarousel, {
        arrows: true,
        dots: false,
        appendArrows: $warranty.closest('.services-warranty').find('.services-warranty-nav'),
        prevArrow: warrantyArrow('prev', 'left', 'Previous slide'),
        nextArrow: warrantyArrow('next', 'right', 'Next slide'),
      })
    );
  }

  var $team = $('.js-services-team-slider');
  if ($team.length) {
    // Team carousel uses dots (no arrows).
    $team.slick(
      $.extend({}, idle, warrantyCarousel, {
        slidesToShow: 4,
        responsive: [
          { breakpoint: 1200, settings: { slidesToShow: 3 } },
          { breakpoint: 992, settings: { slidesToShow: 2 } },
          { breakpoint: 576, settings: { slidesToShow: 1 } },
        ],
        arrows: false,
        dots: true,
        appendDots: $team.closest('.services-warranty').find('.services-warranty-dots'),
      })
    );
  }

  var $faq = $('.js-faq-accordion');
  if ($faq.length) {
    // Single-open accordion; keeps aria-expanded in sync.
    $faq.on('click', '.faq-accordion__button', function () {
      var $btn = $(this);
      var $item = $btn.closest('.faq-accordion__item');
      var isOpen = $item.hasClass('is-open');

      $faq.find('.faq-accordion__item').removeClass('is-open');
      $faq.find('.faq-accordion__button').attr('aria-expanded', 'false');

      if (!isOpen) {
        $item.addClass('is-open');
        $btn.attr('aria-expanded', 'true');
      }
    });
  }
});

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

  function initNavToggle() {
    var btn = document.querySelector('.js-nav-toggle');
    var nav = document.getElementById('nav');
    if (!btn || !nav) return;

    function setOpen(open) {
      document.body.classList.toggle('nav-open', !!open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }

    btn.addEventListener('click', function () {
      setOpen(!document.body.classList.contains('nav-open'));
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setOpen(false);
    });

    nav.addEventListener('click', function (e) {
      var a = e.target && e.target.closest ? e.target.closest('a') : null;
      if (a) setOpen(false);
    });

    var mq = window.matchMedia('(min-width: 992px)');
    function onChange() {
      if (mq.matches) setOpen(false);
    }
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else mq.addListener(onChange);
    onChange();
  }

  function initFinalCtaMoreToggle() {
    var link = document.querySelector('.js-final-cta-more-toggle');
    var panel = document.getElementById('final-cta-more-text');
    var wrap = document.querySelector('.js-final-cta-accordion');
    if (!link || !panel || !wrap) return;

    link.addEventListener('click', function (e) {
      e.preventDefault();
      var open = !wrap.classList.contains('is-open');
      if (open) {
        wrap.classList.add('is-open');
        panel.removeAttribute('inert');
        panel.setAttribute('aria-hidden', 'false');
        link.setAttribute('aria-expanded', 'true');
      } else {
        wrap.classList.remove('is-open');
        panel.setAttribute('inert', '');
        panel.setAttribute('aria-hidden', 'true');
        link.setAttribute('aria-expanded', 'false');
      }
    });
  }

  function initFooterLinkToggles() {
    document.querySelectorAll('.js-footer-link-toggle').forEach(function (btn) {
      var id = btn.getAttribute('aria-controls');
      var panel = id ? document.getElementById(id) : null;
      var group = btn.closest('.footer-link__group');
      if (!panel || !group) return;

      btn.addEventListener('click', function () {
        var open = !group.classList.contains('is-open');
        if (open) {
          group.classList.add('is-open');
          panel.removeAttribute('inert');
          panel.setAttribute('aria-hidden', 'false');
          btn.setAttribute('aria-expanded', 'true');
        } else {
          group.classList.remove('is-open');
          panel.setAttribute('inert', '');
          panel.setAttribute('aria-hidden', 'true');
          btn.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  // Save scroll for unload + bfcache navigations.
  window.addEventListener('pagehide', persistScroll, { passive: true });
  window.addEventListener('beforeunload', persistScroll);
  window.addEventListener('pageshow', restoreScroll);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      restoreScroll();
      initScrollTop();
      initNavToggle();
      initFinalCtaMoreToggle();
      initFooterLinkToggles();
    });
  } else {
    restoreScroll();
    initScrollTop();
    initNavToggle();
    initFinalCtaMoreToggle();
    initFooterLinkToggles();
  }

  window.addEventListener('load', hideLoaderSoon, { once: true });
})();

$(function () {
  // Slick + FAQ: init only when matching elements exist.
  var idle = { pauseOnFocus: false, pauseOnHover: false, pauseOnDotsHover: false };

  function initBannerSponsors() {
    var $s = $('.js-banner-sponsors');
    if (!$s.length) return;

    function apply() {
      var isMobile = window.matchMedia('(max-width: 768px)').matches;
      if (isMobile) {
        if ($s.hasClass('slick-initialized')) return;
        $s.slick(
          $.extend({}, idle, {
            arrows: false,
            dots: false,
            infinite: true,
            autoplay: true,
            autoplaySpeed: 2200,
            speed: 350,
            slidesToShow: 3,
            slidesToScroll: 1,
            swipeToSlide: true,
          })
        );
      } else if ($s.hasClass('slick-initialized')) {
        $s.slick('unslick');
      }
    }

    apply();
    $(window).on('resize orientationchange', apply);
  }

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

  initBannerSponsors();

  var $warranty = $('.js-services-warranty-slider');
  if ($warranty.length) {
    // Warranty carousel with custom arrows.
    $warranty.each(function () {
      var $slider = $(this);
      $slider.slick(
        $.extend({}, idle, warrantyCarousel, {
          arrows: true,
          dots: false,
          appendArrows: $slider.closest('.services-warranty').find('.services-warranty-nav').first(),
          prevArrow: warrantyArrow('prev', 'left', 'Previous slide'),
          nextArrow: warrantyArrow('next', 'right', 'Next slide'),
        })
      );
    });
  }

  var $team = $('.js-services-team-slider');
  if ($team.length) {
    // Team carousel uses dots (no arrows).
    $team.each(function () {
      var $slider = $(this);
      $slider.slick(
        $.extend({}, idle, warrantyCarousel, {
          slidesToShow: 4,
          responsive: [
            { breakpoint: 1200, settings: { slidesToShow: 3 } },
            { breakpoint: 992, settings: { slidesToShow: 2 } },
            {
              breakpoint: 768,
              settings: { slidesToShow: 1, centerMode: true, centerPadding: '56px' },
            },
            {
              breakpoint: 576,
              settings: { slidesToShow: 1, centerMode: true, centerPadding: '28px' },
            },
          ],
          arrows: false,
          dots: true,
          appendDots: $slider.closest('.services-warranty').find('.services-warranty-dots').first(),
        })
      );
    });
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

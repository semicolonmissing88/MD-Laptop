(function () {
    'use strict';

    var once = true;
    var reducedMotion =
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function getOffset(el) {
        var v = el.getAttribute('data-aos-offset');
        return v ? Math.min(parseInt(v, 10), 120) : 40;
    }

    function applyVisible(el, delay) {
        if (el.classList.contains('io-visible')) return;
        var dur = el.getAttribute('data-aos-duration');
        if (dur) el.style.transitionDuration = parseInt(dur, 10) + 'ms';
        if (reducedMotion) {
            el.classList.add('io-visible');
            return;
        }
        if (delay > 0) {
            setTimeout(function () {
                el.classList.add('io-visible');
            }, delay);
        } else {
            el.classList.add('io-visible');
        }
    }

    function revealAllInstant() {
        document.querySelectorAll('[data-aos]').forEach(function (el) {
            el.classList.add('io-visible');
        });
    }

    function observeStaggerParents() {
        document.querySelectorAll('[data-aos-stagger]').forEach(function (parent) {
            if (parent.dataset.ioObserved) return;
            var stagger = parseInt(parent.getAttribute('data-aos-stagger') || '90', 10);
            var offset = Math.min(getOffset(parent), 100);
            var children = parent.querySelectorAll('[data-aos]');
            if (!children.length) return;

            var obs = new IntersectionObserver(
                function (entries) {
                    entries.forEach(function (entry) {
                        if (!entry.isIntersecting) return;
                        var p = entry.target;
                        children.forEach(function (child, i) {
                            applyVisible(child, i * stagger);
                        });
                        if (once) {
                            obs.unobserve(p);
                            p.dataset.ioObserved = '1';
                        }
                    });
                },
                { rootMargin: '0px 0px -' + offset + 'px 0px', threshold: 0.08 }
            );
            obs.observe(parent);
        });
    }

    function observeDirect() {
        var staggerChildren = document.querySelectorAll('[data-aos-stagger] [data-aos]');
        var staggerSet = new Set(Array.prototype.slice.call(staggerChildren));

        document.querySelectorAll('[data-aos]').forEach(function (el) {
            if (staggerSet.has(el) || el.dataset.ioObserved) return;
            var offset = getOffset(el);
            var obs = new IntersectionObserver(
                function (entries) {
                    entries.forEach(function (entry) {
                        if (!entry.isIntersecting) return;
                        var t = entry.target;
                        var delay = parseInt(t.getAttribute('data-aos-delay') || '0', 10);
                        applyVisible(t, delay);
                        if (once) {
                            obs.unobserve(t);
                            t.dataset.ioObserved = '1';
                        }
                    });
                },
                { rootMargin: '0px 0px -' + offset + 'px 0px', threshold: 0.08 }
            );
            obs.observe(el);
        });
    }

    function init() {
        if (reducedMotion) {
            revealAllInstant();
            return;
        }
        observeStaggerParents();
        observeDirect();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();


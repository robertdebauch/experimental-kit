document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('[data-cards-slider]');
    if (!container) {
        return;
    }

    const scrollerCatcher = container.getAttribute('data-scroller-selector') || '.tn-molecule';
    const scroller = container.querySelector(scrollerCatcher);
    if (!scroller) {
        return;
    }

    const arrowBackground = container.getAttribute('data-arrow-bg') || 'rgba(0,0,0,0.6)';
    const arrowHoverBackground = container.getAttribute('data-arrow-hover-bg') || 'rgba(0,0,0,0.8)';
    const arrowColor = container.getAttribute('data-arrow-color') || 'white';

    const prevBtn = document.createElement('button');
    prevBtn.className = 'slider-btn slider-btn--prev';
    prevBtn.style.backgroundColor = arrowBackground;
    prevBtn.innerHTML = `<svg width="24" height="21" viewBox="0 0 34 30" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M34 15.0005L19.2664 30L16.2373 26.9926L25.9117 17.1438H0V12.8571H25.9117L16.2373 3.00737L19.2664 0L34 15.0005Z" fill="${arrowColor}"/></svg>`

    const nextBtn = document.createElement('button');
    nextBtn.className = 'slider-btn slider-btn--next';
    nextBtn.style.backgroundColor = arrowBackground;
    nextBtn.innerHTML = `<svg width="24" height="21" viewBox="0 0 34 30" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M34 15.0005L19.2664 30L16.2373 26.9926L25.9117 17.1438H0V12.8571H25.9117L16.2373 3.00737L19.2664 0L34 15.0005Z" fill="${arrowColor}"/></svg>`;

    prevBtn.addEventListener('mouseenter', () => { prevBtn.style.backgroundColor = arrowHoverBackground; });
    prevBtn.addEventListener('mouseleave', () => { prevBtn.style.backgroundColor = arrowBackground; });
    nextBtn.addEventListener('mouseenter', () => { nextBtn.style.backgroundColor = arrowHoverBackground; });
    nextBtn.addEventListener('mouseleave', () => { nextBtn.style.backgroundColor = arrowBackground; });

    container.appendChild(prevBtn);
    container.appendChild(nextBtn);

    function getStepSize() {
        const firstCard = scroller.querySelector('[data-card]');
        if (!firstCard) {
            return 300;
        }

        const style = window.getComputedStyle(firstCard);
        const gap = parseFloat(style.marginRight) || 20;
        return firstCard.offsetWidth + gap;
    }

    let step = getStepSize();
    window.addEventListener('resize', () => {
        step = getStepSize();
        updateArrows();
    });

    function updateArrows() {
        const isScrollAvailable = scroller.scrollWidth > scroller.clientWidth + 2;

        if (!isScrollAvailable) {
            prevBtn.style.opacity = '0.3';
            prevBtn.style.pointerEvents = 'none';
            nextBtn.style.opacity = '0.3';
            nextBtn.style.pointerEvents = 'none';

            scroller.classList.remove('slider-scroller');

            return;
        }

        scroller.classList.add('slider-scroller');
        prevBtn.style.opacity = scroller.scrollLeft <= 1 ? '0.3' : '1';
        prevBtn.style.pointerEvents = scroller.scrollLeft <= 1 ? 'none' : 'auto';

        const maxScroll = scroller.scrollWidth - scroller.clientWidth;

        nextBtn.style.opacity = scroller.scrollLeft >= maxScroll - 1 ? '0.3' : '1';
        nextBtn.style.pointerEvents = scroller.scrollLeft >= maxScroll - 1 ? 'none' : 'auto';
    }

    updateArrows();
    scroller.addEventListener('scroll', updateArrows);

    function scrollByStep(direction) {
        scroller.scrollBy({
            left: direction * step,
            behavior: 'smooth'
        });

        setTimeout(updateArrows, 350);
    }

    prevBtn.addEventListener('click', () => scrollByStep(-1));
    nextBtn.addEventListener('click', () => scrollByStep(1));

    // dragging
    let isDragging = false, startX = 0, scrollStart = 0, moved = false;

    scroller.addEventListener('pointerdown', (event) => {
        startX = event.clientX; scrollStart = scroller.scrollLeft; moved = false; isDragging = true;
        event.preventDefault();
    });

    window.addEventListener('pointermove', (event) => {
        if (!isDragging) {
            return;
        }
        const dx = event.clientX - startX;

        if (Math.abs(dx) > 3) {
            moved = true;
        }

        if (moved) {
            scroller.scrollLeft = scrollStart - dx;
        }
    });


    window.addEventListener('pointerup', () => {
        if (!isDragging) return; isDragging = false;
        if (moved) {
            setTimeout(updateArrows, 50);
        }
    });

    window.addEventListener('pointercancel', () => {
        isDragging = false;
    });

    // if scrub is in use
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        const scrub = container.getAttribute('data-scrub');

        if (scrub !== null) {
            const start = container.getAttribute('data-start') || 'top top';
            const end = container.getAttribute('data-end') || 'bottom bottom';

            gsap.to(scroller, {
                x: () => -(scroller.scrollWidth - container.offsetWidth),
                ease: 'none',
                scrollTrigger: {
                    trigger: container,
                    start: start,
                    end: end,
                    scrub: scrub === '' ? true : parseFloat(scrub),
                    invalidateOnRefresh: true
                }
            });
        }
    }
});
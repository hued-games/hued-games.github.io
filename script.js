document.addEventListener('DOMContentLoaded', () => {
    let appsData = [];
    let currentIndex = 0;
    let autoSlideInterval;

    const featuredGameWrapper = document.getElementById('featuredGameWrapper');
    const appGrid = document.getElementById('appGrid');
    const sliderWrapper = document.getElementById('sliderWrapper');

    /* --- Fetch and Initialize --- */
    fetch('apps.json')
        .then(res => res.json())
        .then(data => {
            appsData = data;
            initializeLayout();
        })
        .catch(err => console.error('Error loading apps:', err));

    function initializeLayout() {
        if (appsData.length === 0) {
            featuredGameWrapper.style.display = 'block';
            featuredGameWrapper.innerHTML = '<p style="text-align:center;color:var(--text-secondary);">No games available right now. Check back soon!</p>';
            return;
        }

        if (appsData.length === 1) {
            setupFeaturedShowcase(appsData[0]);
        } else {
            // Default to Slider layout if multiple games are found
            setupSlider();
        }
        setupScrollReveal();
    }

    function setupFeaturedShowcase(app) {
        featuredGameWrapper.style.display = 'block';
        appGrid.style.display = 'none';
        sliderWrapper.style.display = 'none';

        featuredGameWrapper.innerHTML = `
            <div class="featured-game-card" id="featuredCard">
                <div class="featured-visual-pane">
                    <img src="${app.icon}" alt="${app.name} Icon" class="featured-icon-3d" id="tiltIcon" loading="lazy">
                </div>
                <div class="featured-info">
                    <div class="featured-badge-list">
                        <span class="game-badge badge-genre">Logic & Riddles</span>
                        <span class="game-badge badge-rating">4.8 ★</span>
                        <span class="game-badge badge-genre">Brain Training</span>
                    </div>
                    <h3>${app.name}</h3>
                    <p>${app.description}</p>
                    <a href="${app.link}" class="google-play-link" target="_blank" rel="noopener noreferrer">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                             alt="Get it on Google Play" class="google-play-badge" loading="lazy">
                    </a>
                </div>
            </div>
        `;

        initTiltEffect();
    }

    /* --- 3D Card Tilt Effect --- */
    function initTiltEffect() {
        const card = document.getElementById('featuredCard');
        const icon = document.getElementById('tiltIcon');

        if (!card || !icon) return;

        card.addEventListener('mousemove', e => {
            const cardRect = card.getBoundingClientRect();
            const cardWidth = cardRect.width;
            const cardHeight = cardRect.height;
            
            // Mouse coordinates relative to card center
            const mouseX = e.clientX - cardRect.left - cardWidth / 2;
            const mouseY = e.clientY - cardRect.top - cardHeight / 2;

            // Rotation angles (capped)
            const rotateX = -(mouseY / (cardHeight / 2)) * 12; // tilt up/down
            const rotateY = (mouseX / (cardWidth / 2)) * 12;  // tilt left/right

            icon.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg) scale(1.06)`;
            icon.style.boxShadow = `0 25px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(236, 72, 153, 0.4)`;
        });

        card.addEventListener('mouseleave', () => {
            icon.style.transform = 'rotateY(-10deg) rotateX(10deg) scale(1)';
            icon.style.boxShadow = `0 15px 35px rgba(0, 0, 0, 0.5), 0 0 15px rgba(168, 85, 247, 0.35)`;
            icon.style.transition = 'transform 0.5s ease, box-shadow 0.5s ease';
        });

        card.addEventListener('mouseenter', () => {
            icon.style.transition = 'none';
        });
    }

    function createAppCardHTML(app) {
        return `
            <img src="${app.icon}" alt="${app.name} Icon" class="app-icon" loading="lazy">
            <h3>${app.name}</h3>
            <p>${app.description}</p>
            <a href="${app.link}" class="google-play-link" target="_blank" rel="noopener noreferrer">
                <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                     alt="Get it on Google Play" class="google-play-badge" loading="lazy">
            </a>
        `;
    }

    /* --- Slider Logic for multiple games --- */
    function setupSlider() {
        const slider = document.getElementById('appSlider');
        const dotsContainer = document.getElementById('sliderDots');
        currentIndex = 0;

        featuredGameWrapper.style.display = 'none';
        appGrid.style.display = 'none';
        sliderWrapper.style.display = 'block';

        slider.innerHTML = '';
        dotsContainer.innerHTML = '';

        appsData.forEach((app, index) => {
            const card = document.createElement('div');
            card.className = 'app-card';
            card.innerHTML = createAppCardHTML(app);
            slider.appendChild(card);

            const dot = document.createElement('span');
            dot.className = 'dot';
            dot.dataset.index = index.toString();
            dotsContainer.appendChild(dot);
        });

        updateSlider();
        startAutoSlide();
    }

    function updateSlider() {
        const slider = document.getElementById('appSlider');
        const dotsContainer = document.getElementById('sliderDots');
        const cards = slider.querySelectorAll('.app-card');
        if (cards.length === 0) return;

        const cardWidth = cards[0].offsetWidth;
        const margin = parseInt(getComputedStyle(cards[0]).marginRight) * 2;
        const totalWidth = cardWidth + margin;
        const offset = (slider.parentElement.clientWidth / 2) - (totalWidth / 2);

        slider.style.left = `${offset - (currentIndex * totalWidth)}px`;

        cards.forEach((card, i) => {
            card.classList.toggle('active', i === currentIndex);
        });

        const dots = dotsContainer.querySelectorAll('.dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentIndex);
        });
    }

    function nextSlide() {
        if (appsData.length === 0) return;
        currentIndex = (currentIndex + 1) % appsData.length;
        updateSlider();
    }

    function prevSlide() {
        if (appsData.length === 0) return;
        currentIndex = (currentIndex - 1 + appsData.length) % appsData.length;
        updateSlider();
    }

    function startAutoSlide() {
        stopAutoSlide();
        autoSlideInterval = setInterval(nextSlide, 5000);
    }

    function stopAutoSlide() {
        if (autoSlideInterval) {
            clearInterval(autoSlideInterval);
        }
    }

    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const dotsContainer = document.getElementById('sliderDots');

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            prevSlide();
            startAutoSlide();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            nextSlide();
            startAutoSlide();
        });
    }

    if (dotsContainer) {
        dotsContainer.addEventListener('click', e => {
            if (e.target.classList.contains('dot')) {
                currentIndex = parseInt(e.target.dataset.index);
                updateSlider();
                startAutoSlide();
            }
        });
    }

    window.addEventListener('resize', () => {
        if (appsData.length > 1) {
            updateSlider();
        }
    });

    /* --- Mobile Menu Drawer Toggle --- */
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('show');
            menuToggle.classList.toggle('open');
        });

        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('show');
                menuToggle.classList.remove('open');
            });
        });
    }

    /* --- Scroll Spy Active Nav Highlights --- */
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.scrollY >= sectionTop - 150) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    /* --- Copy to Clipboard Tooltip --- */
    const emailBtn = document.getElementById('emailBtn');
    const emailTooltip = document.getElementById('emailTooltip');

    if (emailBtn && emailTooltip) {
        emailBtn.addEventListener('click', () => {
            const email = emailBtn.getAttribute('data-email');
            navigator.clipboard.writeText(email)
                .then(() => {
                    emailTooltip.textContent = 'Copied!';
                    setTimeout(() => {
                        emailTooltip.textContent = 'Copy to clipboard';
                    }, 2000);
                })
                .catch(err => {
                    console.error('Failed to copy text: ', err);
                });
        });
    }

    /* --- Intersection Observer Scroll Reveals --- */
    function setupScrollReveal() {
        const reveals = document.querySelectorAll('.scroll-reveal');
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.15
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        reveals.forEach(reveal => {
            observer.observe(reveal);
        });
    }
});

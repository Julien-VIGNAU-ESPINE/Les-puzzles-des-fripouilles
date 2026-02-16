document.addEventListener('DOMContentLoaded', () => {
    // Data list of puzzles with multiple images, tags, date, and pieces (number)
    const puzzles = [
        {
            id: 1,
            title: "Hello Kitty",
            pieces: 500,
            images: [
                "./img/hellokitty01_01.jpg",
                "./img/hellokitty01_02.jpg"
            ],
            tags: ["Hello Kitty", "Dessin"],
            date: "2025-02-01",
            price: "5.00€",
            brand: "Ravensburger",
            difficulty: 2
        },
        {
            id: 2,
            title: "Les jardins du manoird'Eyrignac",
            pieces: 500,
            images: [
                "./img/eyrignac01_01.jpg"
            ],
            tags: ["Jardin", "Réaliste"],
            date: "2025-02-12",
            price: "5.00€",
            brand: "Ravensburger",
            difficulty: 3
        },
        {
            id: 3,
            title: "Pixar",
            pieces: 1000,
            images: [
                "./img/pixar01_01.jpg",
                "./img/pixar01_02.jpg"
            ],
            tags: ["Dessin", "Coloré"],
            date: "2025-02-15",
            price: "4.00€",
            brand: "Educa",
            difficulty: 3
        }
    ];

    const gallery = document.getElementById('gallery');
    const filterContainer = document.getElementById('filter-container');
    const sortSelect = document.getElementById('sort-select');

    // Modal Elements
    const modal = document.getElementById('modal');
    const modalImg = document.getElementById('modal-image');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-desc');
    const modalTags = document.getElementById('modal-tags');
    const closeBtn = document.querySelector('.close-button');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const carouselDots = document.getElementById('carousel-dots');

    let currentPuzzle = null;
    let currentImageIndex = 0;
    let currentFilter = 'all';

    // --- Initialization ---
    initFilters();
    sortAndRender(); // Initial render

    // --- Filter Logic ---
    function initFilters() {
        const allTags = new Set();
        puzzles.forEach(p => p.tags.forEach(t => allTags.add(t)));

        const allBtn = createFilterBtn('Tout', 'all', true);
        filterContainer.appendChild(allBtn);

        Array.from(allTags).sort().forEach(tag => {
            filterContainer.appendChild(createFilterBtn(tag, tag));
        });
    }

    function createFilterBtn(text, filterValue, isActive = false) {
        const btn = document.createElement('button');
        btn.textContent = text;
        btn.className = `filter-btn ${isActive ? 'active' : ''}`;
        btn.dataset.filter = filterValue;

        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = filterValue;
            sortAndRender();
        });
        return btn;
    }

    // --- Sorting & Rendering Logic ---
    function sortAndRender() {
        // 1. Filter
        let filteredPuzzles = currentFilter === 'all'
            ? [...puzzles]
            : puzzles.filter(p => p.tags.includes(currentFilter));

        // 2. Sort
        const sortValue = sortSelect.value;
        filteredPuzzles.sort((a, b) => {
            switch (sortValue) {
                case 'date-desc':
                    return new Date(b.date) - new Date(a.date);
                case 'date-asc':
                    return new Date(a.date) - new Date(b.date);
                case 'pieces-desc':
                    return b.pieces - a.pieces;
                case 'pieces-asc':
                    return a.pieces - b.pieces;
                default:
                    return 0;
            }
        });

        // 3. Render
        renderGallery(filteredPuzzles);
    }

    function getStarsHtml(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            stars += i <= rating ? '<span class="star filled">★</span>' : '<span class="star">☆</span>';
        }
        return `<div class="stars" title="Difficulté: ${rating}/5">${stars}</div>`;
    }

    function renderGallery(items) {
        gallery.innerHTML = '';
        items.forEach((puzzle, index) => {
            const card = document.createElement('div');
            card.className = 'puzzle-card';
            card.style.animationDelay = `${Math.min(index * 0.1, 1)}s`;

            const tagsHtml = puzzle.tags.map(tag => `<span class="tag">#${tag}</span>`).join('');
            // Format date for display
            const dateObj = new Date(puzzle.date);
            const dateStr = dateObj.toLocaleDateString('fr-FR');
            const starsHtml = puzzle.difficulty ? getStarsHtml(puzzle.difficulty) : '';

            card.innerHTML = `
                <div class="puzzle-image-wrapper">
                    <img src="${puzzle.images[0]}" alt="${puzzle.title}" loading="lazy">
                </div>
                <div class="puzzle-info">
                    <div class="puzzle-header-info">
                        <h3>${puzzle.title}</h3>
                        ${starsHtml}
                    </div>
                    <p class="puzzle-brand">${puzzle.brand || ''}</p>
                    <div class="puzzle-meta">
                        <span>🧩 ${puzzle.pieces} p.</span>
                        <span>📅 ${dateStr}</span>
                    </div>
                    <div class="puzzle-tags">${tagsHtml}</div>
                </div>
            `;

            card.addEventListener('click', () => openModal(puzzle));
            gallery.appendChild(card);
        });
    }

    // --- Event Listeners for Sorting ---
    sortSelect.addEventListener('change', sortAndRender);

    // --- Modal & Carousel Logic (Same as before) ---
    function openModal(puzzle) {
        currentPuzzle = puzzle;
        currentImageIndex = 0;
        updateModalContent();
        modal.style.display = 'flex';
        void modal.offsetWidth; // Force reflow
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    function updateModalContent() {
        if (!currentPuzzle) return;
        modalImg.src = currentPuzzle.images[currentImageIndex];
        modalTitle.textContent = currentPuzzle.title;

        // Add meta info to modal description
        const dateObj = new Date(currentPuzzle.date);
        const dateStr = dateObj.toLocaleDateString('fr-FR');
        const starsHtml = currentPuzzle.difficulty ? getStarsHtml(currentPuzzle.difficulty) : '';

        modalDesc.innerHTML = `
            <div class="modal-meta-header">
                <span class="modal-brand">${currentPuzzle.brand || ''}</span>
                ${starsHtml}
            </div>
            <p style="margin-bottom: 0.5rem; color: var(--accent-color);">
                <strong>${currentPuzzle.pieces} pièces</strong> • Fait le ${dateStr} • <span class="price-tag">${currentPuzzle.price || ''}</span>
            </p>
            ${currentPuzzle.desc || ''}
        `;

        modalTags.innerHTML = currentPuzzle.tags.map(tag => `<span class="tag">#${tag}</span>`).join('');

        if (currentPuzzle.images.length > 1) {
            prevBtn.style.display = 'block';
            nextBtn.style.display = 'block';
            renderDots();
        } else {
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
            carouselDots.innerHTML = '';
        }
    }

    function renderDots() {
        carouselDots.innerHTML = '';
        currentPuzzle.images.forEach((_, idx) => {
            const dot = document.createElement('div');
            dot.className = `dot ${idx === currentImageIndex ? 'active' : ''}`;
            dot.addEventListener('click', () => {
                currentImageIndex = idx;
                updateModalContent();
            });
            carouselDots.appendChild(dot);
        });
    }

    function nextImage() {
        if (!currentPuzzle) return;
        currentImageIndex = (currentImageIndex + 1) % currentPuzzle.images.length;
        updateModalContent();
    }

    function prevImage() {
        if (!currentPuzzle) return;
        currentImageIndex = (currentImageIndex - 1 + currentPuzzle.images.length) % currentPuzzle.images.length;
        updateModalContent();
    }

    function closeModal() {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
            currentPuzzle = null;
        }, 300);
    }

    closeBtn.addEventListener('click', closeModal);
    prevBtn.addEventListener('click', (e) => { e.stopPropagation(); prevImage(); });
    nextBtn.addEventListener('click', (e) => { e.stopPropagation(); nextImage(); });

    window.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (!modal.classList.contains('show')) return;
        if (e.key === 'Escape') closeModal();
        if (e.key === 'ArrowLeft') prevImage();
        if (e.key === 'ArrowRight') nextImage();
    });
});

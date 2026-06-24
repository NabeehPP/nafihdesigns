/* =============================================
   NAFIH DESIGN — JAVASCRIPT
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {
  // ─────────────────────────────────────────
  // CONSTANTS & DOM ELEMENTS
  // ─────────────────────────────────────────

  const leftPanel = document.getElementById('leftPanel');
  const rightPanel = document.getElementById('rightPanel');
  const loadingScreen = document.getElementById('loadingScreen');
  
  const navLinks = document.querySelectorAll('.nav-link');
  const progressBars = {
    left: document.querySelector('.panel-progress--left span'),
    right: document.querySelector('.panel-progress--right span')
  };

  // ─────────────────────────────────────────
  // LOADING SCREEN — FADE OUT ANIMATION
  // ─────────────────────────────────────────

  const hideLoadingScreen = () => {
    if (!loadingScreen) return;

    loadingScreen.style.pointerEvents = 'none';
    loadingScreen.addEventListener('animationend', () => {
      loadingScreen.style.display = 'none';
    }, { once: true });

    // Fallback for browsers that do not fire animationend reliably.
    setTimeout(() => {
      if (loadingScreen && getComputedStyle(loadingScreen).display !== 'none') {
        loadingScreen.style.display = 'none';
      }
    }, 2400);
  };

  // Hide loading screen after page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hideLoadingScreen);
  } else {
    hideLoadingScreen();
  }

  // ─────────────────────────────────────────
  // SCROLL PROGRESS TRACKING
  // ─────────────────────────────────────────

  const updateScrollProgress = (panel, progressBar) => {
    if (!panel || !progressBar) return;

    // Calculate scroll progress
    const scrollHeight = panel.scrollHeight - panel.clientHeight;
    const scrollProgress = scrollHeight > 0 ? (panel.scrollTop / scrollHeight) * 100 : 0;

    // Update progress bar width
    progressBar.style.width = `${scrollProgress}%`;
  };

  // Left panel scroll listener
  if (leftPanel && progressBars.left) {
    leftPanel.addEventListener('scroll', () => {
      updateScrollProgress(leftPanel, progressBars.left);
      updateActiveNavLink();
    }, { passive: true });

    // Initial progress update
    updateScrollProgress(leftPanel, progressBars.left);
  }

  // Right panel scroll listener
  if (rightPanel && progressBars.right) {
    rightPanel.addEventListener('scroll', () => {
      updateScrollProgress(rightPanel, progressBars.right);
      updateActiveNavLink();
    }, { passive: true });

    // Initial progress update
    updateScrollProgress(rightPanel, progressBars.right);
  }

  // ─────────────────────────────────────────
  // NAVIGATION ACTIVE STATE MANAGEMENT
  // ─────────────────────────────────────────

  const getCurrentSectionId = (panel, sections) => {
    if (!panel || sections.length === 0) return null;

    const offset = panel.scrollTop + 120;
    let currentSection = sections[0]?.id || null;

    sections.forEach((section) => {
      if (section.offsetTop <= offset) {
        currentSection = section.id;
      }
    });

    return currentSection;
  };

  const updateActiveNavLink = () => {
    const leftSections = leftPanel ? Array.from(leftPanel.querySelectorAll('.panel-section')) : [];
    const rightSections = rightPanel ? Array.from(rightPanel.querySelectorAll('#projects, #cases')) : [];

    const leftActive = getCurrentSectionId(leftPanel, leftSections);
    const rightActive = getCurrentSectionId(rightPanel, rightSections);

    navLinks.forEach((link) => {
      const target = link.getAttribute('data-target');
      const panel = link.getAttribute('data-panel');

      if ((panel === 'left' && target === leftActive) || (panel === 'right' && target === rightActive)) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  };

  // ─────────────────────────────────────────
  // SMOOTH SCROLL NAVIGATION
  // ─────────────────────────────────────────

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();

      const targetId = link.getAttribute('data-target');
      const panelName = link.getAttribute('data-panel');
      const targetPanel = panelName === 'right' ? rightPanel : leftPanel;

      if (!targetPanel || !targetId) return;

      // Find the target section inside the correct panel.
      const targetSection = targetPanel.querySelector(`#${targetId}`);
      if (!targetSection) return;

      // Use container-relative coordinates so scrolling is always inside the panel.
      const containerTop = targetPanel.getBoundingClientRect().top;
      const targetTop = targetSection.getBoundingClientRect().top;
      const scrollOffset = targetTop - containerTop + targetPanel.scrollTop - 24;

      targetPanel.scrollTo({
        top: scrollOffset,
        behavior: 'smooth'
      });

      if (targetPanel === leftPanel) {
        updateActiveNavLink();
      }
    });
  });

  // ─────────────────────────────────────────
  // GALLERY ANIMATIONS & INTERACTIONS
  // ─────────────────────────────────────────

  const galleryItems = document.querySelectorAll('.gallery-item');

  // Enhance gallery items with interaction feedback
  galleryItems.forEach((item) => {
    // Add focus state for accessibility
    item.addEventListener('focus', () => {
      item.style.outline = '2px solid #2563eb';
      item.style.outlineOffset = '4px';
    });

    item.addEventListener('blur', () => {
      item.style.outline = 'none';
    });

    // Add click handler for potential lightbox or detail view
    item.addEventListener('click', () => {
      // Could be extended to open a lightbox or project detail
      console.log('Gallery item clicked:', item.alt);
    });
  });

  // ─────────────────────────────────────────
  // KEYBOARD NAVIGATION
  // ─────────────────────────────────────────

  document.addEventListener('keydown', (e) => {
    // Only handle keyboard navigation if the focused element is a panel scroll container.
    if (e.target !== leftPanel && e.target !== rightPanel) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        e.target.scrollBy({ top: 100, behavior: 'smooth' });
        break;
      case 'ArrowUp':
        e.preventDefault();
        e.target.scrollBy({ top: -100, behavior: 'smooth' });
        break;
      case 'End':
        e.preventDefault();
        e.target.scrollTo({ top: e.target.scrollHeight, behavior: 'smooth' });
        break;
      case 'Home':
        e.preventDefault();
        e.target.scrollTo({ top: 0, behavior: 'smooth' });
        break;
    }
  });

  // ─────────────────────────────────────────
  // PERFORMANCE: DEBOUNCE FOR SCROLL EVENTS
  // ─────────────────────────────────────────

  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  // Debounced active link update (avoids excessive updates during scroll)
  const debouncedUpdateActiveLink = debounce(updateActiveNavLink, 100);

  leftPanel?.addEventListener('scroll', debouncedUpdateActiveLink, { passive: true });
  rightPanel?.addEventListener('scroll', debouncedUpdateActiveLink, { passive: true });

  // ─────────────────────────────────────────
  // CLEANUP: REMOVE UNNECESSARY SCROLL MOMENTUM LOGIC
  // ─────────────────────────────────────────

  // Momentum tracking caused extra overhead and can interfere with native scroll.
  // The panels now rely on browser-native smooth scrolling only.

  // ─────────────────────────────────────────
  // INTERSECTION OBSERVER FOR LAZY LOADING
  // ─────────────────────────────────────────

  const observerOptions = {
    root: rightPanel,
    rootMargin: '50px',
    threshold: 0.1
  };

  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        // Trigger load animation if needed
        img.style.animation = 'none';
        setTimeout(() => {
          img.style.animation = '';
        }, 10);
        imageObserver.unobserve(img);
      }
    });
  }, observerOptions);

  galleryItems.forEach(item => imageObserver.observe(item));

  // ─────────────────────────────────────────
  // RESPONSIVE BEHAVIOR
  // ─────────────────────────────────────────

  // Handle mobile-specific behavior
  const handleResponsive = () => {
    const isMobile = window.innerWidth < 900;

    if (isMobile) {
      // On mobile, disable sticky positioning
      document.body.classList.add('is-mobile');
    } else {
      document.body.classList.remove('is-mobile');
    }
  };

  // Check on load
  handleResponsive();

  // Listen for resize
  window.addEventListener('resize', debounce(handleResponsive, 250));

  // ─────────────────────────────────────────
  // ACCESSIBILITY: FOCUS MANAGEMENT
  // ─────────────────────────────────────────

  // Ensure panels can be focused for keyboard navigation
  if (leftPanel) leftPanel.setAttribute('tabindex', '0');
  if (rightPanel) rightPanel.setAttribute('tabindex', '0');

  // ─────────────────────────────────────────
  // INITIAL STATE
  // ─────────────────────────────────────────

  // Set initial active link
  updateActiveNavLink();

  // Log initialization (development only)
  if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production') {
    console.log('✓ Nafih Design — Premium Portfolio Initialized');
    console.log('✓ Dual-scroll experience active');
    console.log('✓ Navigation state tracking enabled');
  }
});

// ─────────────────────────────────────────
// PERFORMANCE: DEFER NON-CRITICAL SCRIPTS
// ─────────────────────────────────────────

// Load analytics or third-party scripts after page load
window.addEventListener('load', () => {
  // Analytics initialization would go here
  // Third-party widget loading would go here
});

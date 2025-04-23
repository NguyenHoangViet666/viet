(function() {
    'use strict';

    function calculateBasePath() {
        const path = window.location.pathname;
        if (path.includes('/HTML/')) {
            return '../';
        }
        if (path.includes('/TRUYEN/')) {
             let depth = 2;
             const partsAfterTruyen = path.substring(path.indexOf('/TRUYEN/') + '/TRUYEN/'.length).split('/').filter(Boolean);
             if (partsAfterTruyen.length > 2) {
                depth = partsAfterTruyen.length;
             }
             let basePath = '';
             for(let i = 0; i < depth; i++) { basePath += '../'; }
             return basePath;
        }
        return './';
    }

    function isHomePage() {
        const path = window.location.pathname;
        const segments = path.split('/').filter(Boolean);

        if (path === '/') return true;

        if (path.endsWith('/index.html')) {
            if (segments.length === 1 && segments[0].toLowerCase() === 'index.html') return true;
             if (segments.length === 2 && segments[1].toLowerCase() === 'index.html') return true;
        }

        if (segments.length === 1 && !path.includes('.')) {
             if (path.endsWith('/')) return true;
             return true;
        }

        return false;
    }

    const BASE_PATH = calculateBasePath();
    const IS_HOME_PAGE = isHomePage();

    console.log(`[BetoBook Script v5] Base Path: ${BASE_PATH}, Is Home Page: ${IS_HOME_PAGE}`);


    if (IS_HOME_PAGE) {
        document.addEventListener('DOMContentLoaded', () => {
            const xemThemButton = document.getElementById('xem-them');
            const truyenAnSection = document.getElementById('truyen-an');
            if (xemThemButton && truyenAnSection) {
                xemThemButton.addEventListener('click', function() {
                    console.log('[BetoBook Script v5] Nút "Xem thêm" được nhấn.');
                    truyenAnSection.style.display = 'block';
                    this.style.display = 'none';
                });
            } else {
                console.warn('[BetoBook Script v5] DOMContentLoaded: Không tìm thấy nút "Xem thêm" hoặc khu vực truyện ẩn trên trang chủ.');
            }
        });
    }

    const navigationPlaceholder = document.getElementById('navigation');
    if (navigationPlaceholder) {
        let navPathToFetch;
        if (IS_HOME_PAGE) {
            navPathToFetch = 'HTML/navigation.html';
             console.log(`[BetoBook Script v5] Đang ở trang chủ, fetch từ: ${navPathToFetch}`);
        } else {
            navPathToFetch = BASE_PATH + 'HTML/navigation.html';
             console.log(`[BetoBook Script v5] Đang ở trang con, fetch từ: ${navPathToFetch} (Base path: ${BASE_PATH})`);
        }

        fetch(navPathToFetch)
            .then(response => {
                if (!response.ok) {
                    console.error(`[BetoBook Script v5] Lỗi HTTP ${response.status} khi fetch: ${response.url} (Đường dẫn đã thử: ${navPathToFetch})`);
                    throw new Error(`HTTP ${response.status} - Không thể tải ${navPathToFetch}`);
                }
                return response.text();
            })
            .then(data => {
                console.log('[BetoBook Script v5] Tải navigation thành công.');
                navigationPlaceholder.innerHTML = data;
                setupNavigationInteractions();
            })
            .catch(error => {
                console.error('[BetoBook Script v5] Lỗi tải navigation:', error);
                navigationPlaceholder.innerHTML = `<p style="color:red; text-align:center; border: 1px solid red; padding: 10px;">Lỗi tải thanh điều hướng. Vui lòng kiểm tra Console (F12).</p>`;
            });
    } else {
        console.error('[BetoBook Script v5] Không tìm thấy placeholder #navigation.');
    }

    function setupNavigationInteractions() {
        const navContainer = document.getElementById('navigation');
        if (!navContainer) {
             console.error("[BetoBook Script v5] Không tìm thấy navContainer sau khi fetch.");
            return;
        }

        const linkBasePath = BASE_PATH;

        const logoImg = navContainer.querySelector('header img[alt="Logo BetoBook"]');
        if (logoImg) {
            const currentLogoSrc = logoImg.getAttribute('src');
            const correctLogoSrc = linkBasePath + 'Ảnh/logo1.png';
            const normalizePath = (p) => p ? (p.startsWith('./') ? p.substring(2) : p) : '';
            if (normalizePath(currentLogoSrc) !== normalizePath(correctLogoSrc)) {
                console.log(`[BetoBook Script v5] Sửa đường dẫn logo ảnh từ "${currentLogoSrc}" thành "${correctLogoSrc}"`);
                logoImg.setAttribute('src', correctLogoSrc);
            }
        } else { console.warn('[BetoBook Script v5] Không tìm thấy ảnh logo trong navigation.'); }

        const titleLink = navContainer.querySelector('header h1 a');
        if (titleLink) {
            const currentTitleHref = titleLink.getAttribute('href');
            const correctTitleHref = linkBasePath + 'index.html';
            const normalizePath = (p) => p ? (p.startsWith('./') ? p.substring(2) : p) : '';
             if (normalizePath(currentTitleHref) !== normalizePath(correctTitleHref)) {
                 console.log(`[BetoBook Script v5] Sửa đường dẫn link title từ "${currentTitleHref}" thành "${correctTitleHref}"`);
                 titleLink.setAttribute('href', correctTitleHref);
             }
        } else { console.warn('[BetoBook Script v5] Không tìm thấy link title H1 trong navigation.'); }

        const loginButtonContainer = navContainer.querySelector(".btn-login") || navContainer.querySelector(".user-icon-container");
        if (loginButtonContainer) {
             const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
             const userPagePath = linkBasePath + 'HTML/user.html';
             const loginPagePath = linkBasePath + 'HTML/login.html';
             const homePagePath = linkBasePath + 'index.html';
             if (isLoggedIn) {
                const userName = localStorage.getItem("userName") || "User";
                const isAdmin = localStorage.getItem("isAdmin") === "true";
                loginButtonContainer.innerHTML = ''; loginButtonContainer.className = 'user-icon-container'; loginButtonContainer.removeAttribute('href');
                const iconButton = document.createElement('span'); iconButton.className = 'user-icon-button'; iconButton.innerHTML = '<i class="bx bxs-user"></i>'; iconButton.title = `${userName} ${isAdmin ? '(Admin)' : ''}`;
                const dropdownMenu = document.createElement('div'); dropdownMenu.className = 'user-menu-dropdown';
                dropdownMenu.innerHTML = `<a href="${userPagePath}">Tài khoản</a><a href="#" id="logout-link">Đăng xuất</a>`;
                loginButtonContainer.appendChild(iconButton); loginButtonContainer.appendChild(dropdownMenu);
                loginButtonContainer.addEventListener('click', function(event) { if (!event.target.closest('.user-menu-dropdown a')) { event.preventDefault(); event.stopPropagation(); closeOtherDropdowns(dropdownMenu); dropdownMenu.classList.toggle('active'); } });
                const logoutLink = dropdownMenu.querySelector('#logout-link');
                if (logoutLink) { logoutLink.addEventListener('click', function(event) { event.preventDefault(); localStorage.removeItem('isLoggedIn'); localStorage.removeItem('userName'); localStorage.removeItem('isAdmin'); alert('Bạn đã đăng xuất thành công.'); window.location.href = homePagePath; }); }
             } else { loginButtonContainer.className = 'btn-login'; loginButtonContainer.textContent = 'Đăng Nhập'; loginButtonContainer.href = loginPagePath; }
        } else { console.warn('[BetoBook Script v5] Không tìm thấy nút đăng nhập/icon user trong navigation.'); }

        const theLoaiSelect = navContainer.querySelector('#the-loai');
        if (theLoaiSelect) {
             theLoaiSelect.addEventListener('change', function() {
                 if (this.value && this.value !== "") { const targetPath = linkBasePath + 'HTML/' + this.value; window.location.href = targetPath; }
             });
        } else { console.warn('[BetoBook Script v5] Không tìm thấy dropdown #the-loai.'); }

        const loaiTruyenSelect = navContainer.querySelector('.search-container select[name="loaitruyen"]');
        if (loaiTruyenSelect) {
              loaiTruyenSelect.addEventListener('change', function() {
                  if (this.value && this.value !== "") { const targetPath = linkBasePath + 'HTML/' + this.value; window.location.href = targetPath; }
              });
        } else { console.warn('[BetoBook Script v5] Không tìm thấy dropdown loại truyện.'); }

        const searchForm = navContainer.querySelector('.search-container form');
        const searchInput = navContainer.querySelector('.search-container input[name="q"]');
        const searchButton = navContainer.querySelector('.search-container button[type="submit"]');
        if (searchForm && searchInput && searchButton) {
             const updateSearchButtonState = () => { searchButton.disabled = searchInput.value.trim() === ''; };
             searchInput.addEventListener('input', updateSearchButtonState); updateSearchButtonState();
             searchForm.addEventListener('submit', function(event) {
                 event.preventDefault(); const searchTerm = searchInput.value.trim(); if (!searchTerm) { searchInput.focus(); return; }
                 const targetAction = searchForm.getAttribute('action'); if (!targetAction) { alert("Lỗi: Không thể xác định trang kết quả tìm kiếm."); return; }
                 const searchResultPageUrl = linkBasePath + 'HTML/' + targetAction; const finalSearchUrl = `${searchResultPageUrl}?q=${encodeURIComponent(searchTerm)}`;
                 window.location.href = finalSearchUrl;
             });
        } else { console.error('[BetoBook Script v5] Không tìm thấy các thành phần của form tìm kiếm.'); }

    }

    let slideIndex = 1;
    let slideInterval;
    let slideshowContainer;
    document.addEventListener('DOMContentLoaded', () => {
        slideshowContainer = document.querySelector('.slideshow-container');
        if (IS_HOME_PAGE && slideshowContainer) {
            console.log('[BetoBook Script v5] DOMContentLoaded: Khởi tạo slideshow.');
            showSlides(slideIndex); startSlideShow();
            slideshowContainer.addEventListener('mouseenter', stopSlideShow);
            slideshowContainer.addEventListener('mouseleave', startSlideShow);
        } else if (IS_HOME_PAGE) { console.warn('[BetoBook Script v5] DOMContentLoaded: Đang ở trang chủ nhưng không tìm thấy .slideshow-container.'); }
    });

    function showSlides(n) {
        if (!slideshowContainer) return; const slides = slideshowContainer.getElementsByClassName("mySlides"); const dots = document.getElementsByClassName("dot"); if (slides.length === 0) return; if (n > slides.length) { slideIndex = 1 } if (n < 1) { slideIndex = slides.length } for (let i = 0; i < slides.length; i++) { if (slides[i]) slides[i].style.display = "none"; } if (dots.length > 0) { for (let i = 0; i < dots.length; i++) { if (dots[i]) dots[i].className = dots[i].className.replace(" active", ""); } if (dots[slideIndex - 1]) { dots[slideIndex - 1].className += " active"; } } if (slides[slideIndex - 1]) { slides[slideIndex - 1].style.display = "block"; }
     }
    function plusSlides(n) { if (!slideshowContainer) return; stopSlideShow(); showSlides(slideIndex += n); startSlideShow(); }
    function currentSlide(n) { if (!slideshowContainer) return; stopSlideShow(); showSlides(slideIndex = n); startSlideShow(); }
    function startSlideShow() {
        if (!slideshowContainer || slideshowContainer.getElementsByClassName("mySlides").length === 0) return; stopSlideShow(); console.log('[BetoBook Script v5] Bắt đầu slideshow tự động.'); slideInterval = setInterval(() => { showSlides(slideIndex += 1); }, 3500);
     }
    function stopSlideShow() { clearInterval(slideInterval); }
    window.plusSlides = plusSlides; window.currentSlide = currentSlide;

    window.addEventListener('load', () => {
        console.log('[BetoBook Script v5] Trang đã tải xong.');
        const preloader = document.getElementById('preloader');
        if (preloader) {
            console.log('[BetoBook Script v5] Ẩn preloader.');
            setTimeout(() => {
                preloader.style.opacity = '0';
                preloader.addEventListener('transitionend', () => { if(preloader) preloader.style.display = 'none'; }, { once: true });
                setTimeout(() => { if(preloader && preloader.style.display !== 'none') preloader.style.display = 'none'; }, 500);
            }, 100);
        }
    });

    function closeOtherDropdowns(currentDropdown = null) {
        const allActiveDropdowns = document.querySelectorAll('.user-menu-dropdown.active'); allActiveDropdowns.forEach(dropdown => { if (dropdown !== currentDropdown) dropdown.classList.remove('active'); });
     }
    document.addEventListener('click', function(event) {
        const clickedInsideUserIcon = event.target.closest('.user-icon-container'); if (!clickedInsideUserIcon) { closeOtherDropdowns(); }
     });

    console.log('[BetoBook Script v5] Đã thực thi xong.');

})();
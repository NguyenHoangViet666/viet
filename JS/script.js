(function() {
    'use strict';

    /**
     * Tính toán đường dẫn gốc tương đối dựa trên vị trí trang hiện tại.
     * @returns {string} Đường dẫn tương đối đến thư mục gốc (ví dụ: './' hoặc '../' hoặc '../../').
     */
    function calculateBasePath() {
        const path = window.location.pathname;
        if (path.includes('/HTML/')) {
            return '../';
        }
        if (path.includes('/TRUYEN/')) {
            // Giả định độ sâu 2 cấp từ gốc cho các trang truyện
            // Nếu cấu trúc phức tạp hơn (vd: /TRUYEN/A/B/C/truyen.html) cần điều chỉnh
             let depth = 2; // ../../
             // Simple check for deeper structure, might need refinement
             const partsAfterTruyen = path.substring(path.indexOf('/TRUYEN/') + '/TRUYEN/'.length).split('/').filter(Boolean);
             if (partsAfterTruyen.length > 2) { // More than FOLDER/file.html
                depth = partsAfterTruyen.length; // Estimate depth based on segments
                console.warn(`[BetoBook Script v4] Detected deeper structure in TRUYEN, adjusting base path depth to ${depth}. Review if accurate.`);
             }
             let basePath = '';
             for(let i = 0; i < depth; i++) {
                 basePath += '../';
             }
             return basePath;
        }
        // Mặc định là ở thư mục gốc
        return './';
    }

    /**
     * Kiểm tra xem trang hiện tại có phải là trang chủ gốc hay không.
     * @returns {boolean} True nếu là trang chủ, False nếu không phải.
     */
    function isHomePage() {
        const path = window.location.pathname;
        const segments = path.split('/').filter(Boolean); // Lọc bỏ các phần tử rỗng

        if (path === '/' || path === '/index.html') return true;
        // GitHub Pages repo root checks
        if (segments.length === 1 && (path.endsWith('/') || !path.includes('.'))) return true; // /repo-name/ or /repo-name
        if (segments.length === 2 && segments[1] === 'index.html' && path.endsWith('/index.html')) return true; // /repo-name/index.html

        return false;
    }

    const BASE_PATH = calculateBasePath();
    const IS_HOME_PAGE = isHomePage();

    console.log(`[BetoBook Script v4] Base Path: ${BASE_PATH}, Is Home Page: ${IS_HOME_PAGE}`);

    // --- LOGIC CHO NÚT "XEM THÊM" (Chỉ chạy ở trang chủ) ---
    if (IS_HOME_PAGE) {
        document.addEventListener('DOMContentLoaded', () => {
            const xemThemButton = document.getElementById('xem-them');
            const truyenAnSection = document.getElementById('truyen-an');
            if (xemThemButton && truyenAnSection) {
                xemThemButton.addEventListener('click', function() {
                    console.log('[BetoBook Script v4] Nút "Xem thêm" được nhấn.');
                    truyenAnSection.style.display = 'block';
                    this.style.display = 'none';
                });
            } else {
                console.warn('[BetoBook Script v4] DOMContentLoaded: Không tìm thấy nút "Xem thêm" hoặc khu vực truyện ẩn trên trang chủ.');
            }
        });
    }

    // --- LOGIC TẢI THANH ĐIỀU HƯỚNG (NAVIGATION) ---
    const navigationPlaceholder = document.getElementById('navigation');
    if (navigationPlaceholder) {
        // Đường dẫn fetch LUÔN tương đối từ file script.js (JS/) đến file navigation.html (HTML/)
        const navPathToFetch = '../HTML/navigation.html';

        console.log(`[BetoBook Script v4] Đang tải navigation từ: ${navPathToFetch}`);

        fetch(navPathToFetch)
            .then(response => {
                if (!response.ok) {
                    console.error(`[BetoBook Script v4] Lỗi HTTP ${response.status} khi fetch: ${response.url}`);
                    throw new Error(`HTTP ${response.status} - Không thể tải ${navPathToFetch}`);
                }
                return response.text();
            })
            .then(data => {
                console.log('[BetoBook Script v4] Tải navigation thành công.');
                navigationPlaceholder.innerHTML = data;
                setupNavigationInteractions(); // Gọi hàm xử lý tương tác *sau khi* HTML được chèn
            })
            .catch(error => {
                console.error('[BetoBook Script v4] Lỗi tải navigation:', error);
                navigationPlaceholder.innerHTML = `<p style="color:red; text-align:center; border: 1px solid red; padding: 10px;">Lỗi tải thanh điều hướng. Vui lòng kiểm tra Console (F12).</p>`;
            });
    } else {
        console.error('[BetoBook Script v4] Không tìm thấy placeholder #navigation.');
    }

    /**
     * Thiết lập các tương tác cho thanh điều hướng sau khi đã tải xong HTML.
     * Sửa lại đường dẫn ảnh logo và link title dựa trên trang hiện tại.
     */
    function setupNavigationInteractions() {
        const navContainer = document.getElementById('navigation');
        if (!navContainer) {
             console.error("[BetoBook Script v4] Không tìm thấy navContainer sau khi fetch.");
            return;
        }

        const linkBasePath = BASE_PATH; // Dùng BASE_PATH đã tính

        // --- SỬA ĐƯỜNG DẪN LOGO ẢNH ---
        const logoImg = navContainer.querySelector('header img[alt="Logo BetoBook"]');
        if (logoImg) {
            const currentLogoSrc = logoImg.getAttribute('src'); // Đường dẫn gốc trong HTML/nav.html (vd: ../Ảnh/logo1.png)
            const correctLogoSrc = linkBasePath + 'Ảnh/logo1.png'; // Đường dẫn đúng từ trang hiện tại

            // Chuẩn hóa đường dẫn (xóa './' nếu có) để so sánh chính xác
            const normalizePath = (p) => p ? (p.startsWith('./') ? p.substring(2) : p) : '';
            const normalizedCurrentImg = normalizePath(currentLogoSrc);
            const normalizedCorrectImg = normalizePath(correctLogoSrc);

            if (normalizedCurrentImg !== normalizedCorrectImg) {
                console.log(`[BetoBook Script v4] Sửa đường dẫn logo ảnh từ "${currentLogoSrc}" thành "${correctLogoSrc}"`);
                logoImg.setAttribute('src', correctLogoSrc);
            } else {
                 console.log(`[BetoBook Script v4] Đường dẫn logo ảnh "${currentLogoSrc}" đã đúng.`);
            }
        } else {
            console.warn('[BetoBook Script v4] Không tìm thấy ảnh logo trong navigation.');
        }

        // --- SỬA ĐƯỜNG DẪN LINK CHỮ "BetoBook" ---
        const titleLink = navContainer.querySelector('header h1 a');
        if (titleLink) {
            const currentTitleHref = titleLink.getAttribute('href'); // Đường dẫn gốc trong HTML/nav.html (vd: ../index.html)
            const correctTitleHref = linkBasePath + 'index.html'; // Đường dẫn đúng đến trang chủ từ trang hiện tại

            const normalizePath = (p) => p ? (p.startsWith('./') ? p.substring(2) : p) : '';
            const normalizedCurrentTitle = normalizePath(currentTitleHref);
            const normalizedCorrectTitle = normalizePath(correctTitleHref);

             if (normalizedCurrentTitle !== normalizedCorrectTitle) {
                 console.log(`[BetoBook Script v4] Sửa đường dẫn link title từ "${currentTitleHref}" thành "${correctTitleHref}"`);
                 titleLink.setAttribute('href', correctTitleHref);
             } else {
                 console.log(`[BetoBook Script v4] Đường dẫn link title "${currentTitleHref}" đã đúng.`);
             }
        } else {
            console.warn('[BetoBook Script v4] Không tìm thấy link title H1 trong navigation.');
        }

        // --- Nút Đăng nhập / Icon Người dùng ---
        const loginButtonContainer = navContainer.querySelector(".btn-login") || navContainer.querySelector(".user-icon-container");
        if (loginButtonContainer) {
            const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
            const userPagePath = linkBasePath + 'HTML/user.html';
            const loginPagePath = linkBasePath + 'HTML/login.html';
            const homePagePath = linkBasePath + 'index.html'; // Đã sửa ở trên, dùng lại

            console.log(`[BetoBook Script v4] Link paths: user=${userPagePath}, login=${loginPagePath}, home=${homePagePath}`);

            if (isLoggedIn) {
                const userName = localStorage.getItem("userName") || "User";
                const isAdmin = localStorage.getItem("isAdmin") === "true";
                loginButtonContainer.innerHTML = '';
                loginButtonContainer.className = 'user-icon-container';
                loginButtonContainer.removeAttribute('href');
                const iconButton = document.createElement('span');
                iconButton.className = 'user-icon-button';
                iconButton.innerHTML = '<i class="bx bxs-user"></i>';
                iconButton.title = `${userName} ${isAdmin ? '(Admin)' : ''}`;
                const dropdownMenu = document.createElement('div');
                dropdownMenu.className = 'user-menu-dropdown';
                dropdownMenu.innerHTML = `
                    <a href="${userPagePath}">Tài khoản</a>
                    <a href="#" id="logout-link">Đăng xuất</a>
                `;
                loginButtonContainer.appendChild(iconButton);
                loginButtonContainer.appendChild(dropdownMenu);
                loginButtonContainer.addEventListener('click', function(event) {
                    if (!event.target.closest('.user-menu-dropdown a')) {
                        event.preventDefault(); event.stopPropagation();
                        closeOtherDropdowns(dropdownMenu);
                        dropdownMenu.classList.toggle('active');
                    }
                });
                const logoutLink = dropdownMenu.querySelector('#logout-link');
                if (logoutLink) {
                    logoutLink.addEventListener('click', function(event) {
                        event.preventDefault();
                        localStorage.removeItem('isLoggedIn'); localStorage.removeItem('userName'); localStorage.removeItem('isAdmin');
                        alert('Bạn đã đăng xuất thành công.'); window.location.href = homePagePath;
                    });
                }
            } else {
                 loginButtonContainer.className = 'btn-login';
                 loginButtonContainer.textContent = 'Đăng Nhập';
                 loginButtonContainer.href = loginPagePath;
            }
        } else {
            console.warn('[BetoBook Script v4] Không tìm thấy nút đăng nhập/icon user trong navigation.');
        }

        // --- Dropdown Thể loại ---
        const theLoaiSelect = navContainer.querySelector('#the-loai');
        if (theLoaiSelect) {
            theLoaiSelect.addEventListener('change', function() {
                if (this.value && this.value !== "") {
                    const targetPath = linkBasePath + 'HTML/' + this.value; // value là tên file a.html
                    console.log(`[BetoBook Script v4] Chuyển đến thể loại: ${targetPath}`);
                    window.location.href = targetPath;
                }
            });
        } else {
             console.warn('[BetoBook Script v4] Không tìm thấy dropdown #the-loai.');
        }

        // --- Dropdown Loại truyện ---
        const loaiTruyenSelect = navContainer.querySelector('.search-container select[name="loaitruyen"]');
        if (loaiTruyenSelect) {
             loaiTruyenSelect.addEventListener('change', function() {
                 if (this.value && this.value !== "") {
                     const targetPath = linkBasePath + 'HTML/' + this.value; // value là tên file b.html
                     console.log(`[BetoBook Script v4] Chuyển đến loại truyện: ${targetPath}`);
                     window.location.href = targetPath;
                 }
             });
        } else {
            console.warn('[BetoBook Script v4] Không tìm thấy dropdown loại truyện.');
        }


        // --- Form Tìm kiếm ---
        const searchForm = navContainer.querySelector('.search-container form');
        const searchInput = navContainer.querySelector('.search-container input[name="q"]');
        const searchButton = navContainer.querySelector('.search-container button[type="submit"]');

        if (searchForm && searchInput && searchButton) {
            const updateSearchButtonState = () => { searchButton.disabled = searchInput.value.trim() === ''; };
            searchInput.addEventListener('input', updateSearchButtonState);
            updateSearchButtonState();
            searchForm.addEventListener('submit', function(event) {
                event.preventDefault();
                const searchTerm = searchInput.value.trim();
                if (!searchTerm) { searchInput.focus(); return; }
                const targetAction = searchForm.getAttribute('action'); // vd: "search-results.html"
                if (!targetAction) { alert("Lỗi: Không thể xác định trang kết quả tìm kiếm."); return; }
                const searchResultPageUrl = linkBasePath + 'HTML/' + targetAction;
                const finalSearchUrl = `${searchResultPageUrl}?q=${encodeURIComponent(searchTerm)}`;
                console.log(`[BetoBook Script v4] Tìm kiếm với từ khóa "${searchTerm}", chuyển đến: ${finalSearchUrl}`);
                window.location.href = finalSearchUrl;
            });
        } else {
            console.error('[BetoBook Script v4] Không tìm thấy các thành phần của form tìm kiếm.');
        }

    } // Kết thúc hàm setupNavigationInteractions

    // --- LOGIC SLIDESHOW ---
    let slideIndex = 1;
    let slideInterval;
    let slideshowContainer; // Khai báo biến ở phạm vi rộng hơn
    document.addEventListener('DOMContentLoaded', () => {
        slideshowContainer = document.querySelector('.slideshow-container'); // Tìm sau khi DOM load
        if (IS_HOME_PAGE && slideshowContainer) {
            console.log('[BetoBook Script v4] DOMContentLoaded: Khởi tạo slideshow.');
            showSlides(slideIndex);
            startSlideShow();
            slideshowContainer.addEventListener('mouseenter', stopSlideShow);
            slideshowContainer.addEventListener('mouseleave', startSlideShow);
        } else if (IS_HOME_PAGE) {
            console.warn('[BetoBook Script v4] DOMContentLoaded: Đang ở trang chủ nhưng không tìm thấy .slideshow-container.');
        }
    });

    function showSlides(n) {
        if (!slideshowContainer) return;
        const slides = slideshowContainer.getElementsByClassName("mySlides");
        const dots = document.getElementsByClassName("dot");
        if (slides.length === 0) return;

        if (n > slides.length) { slideIndex = 1 }
        if (n < 1) { slideIndex = slides.length }

        for (let i = 0; i < slides.length; i++) {
            if (slides[i]) slides[i].style.display = "none";
        }
        if (dots.length > 0) {
            for (let i = 0; i < dots.length; i++) {
                if (dots[i]) dots[i].className = dots[i].className.replace(" active", "");
            }
            if (dots[slideIndex - 1]) {
                dots[slideIndex - 1].className += " active";
            }
        }
        if (slides[slideIndex - 1]) {
            slides[slideIndex - 1].style.display = "block";
        }
    }

    function plusSlides(n) { if (!slideshowContainer) return; stopSlideShow(); showSlides(slideIndex += n); startSlideShow(); }
    function currentSlide(n) { if (!slideshowContainer) return; stopSlideShow(); showSlides(slideIndex = n); startSlideShow(); }
    function startSlideShow() {
        if (!slideshowContainer || slideshowContainer.getElementsByClassName("mySlides").length === 0) return;
        stopSlideShow();
        console.log('[BetoBook Script v4] Bắt đầu slideshow tự động.');
        slideInterval = setInterval(() => { showSlides(slideIndex += 1); }, 3500);
    }
    function stopSlideShow() { clearInterval(slideInterval); }

    window.plusSlides = plusSlides;
    window.currentSlide = currentSlide;

    // --- SỰ KIỆN KHI TẢI XONG TRANG (Chỉ còn preloader) ---
    window.addEventListener('load', () => {
        console.log('[BetoBook Script v4] Trang đã tải xong.');
        const preloader = document.getElementById('preloader');
        if (preloader) {
            console.log('[BetoBook Script v4] Ẩn preloader.');
            setTimeout(() => {
                preloader.style.opacity = '0';
                preloader.addEventListener('transitionend', () => { if(preloader) preloader.style.display = 'none'; }, { once: true });
                setTimeout(() => { if(preloader && preloader.style.display !== 'none') preloader.style.display = 'none'; }, 500);
            }, 100);
        }
    });

    // --- HÀM ĐÓNG DROPDOWN USER ---
    function closeOtherDropdowns(currentDropdown = null) {
        const allActiveDropdowns = document.querySelectorAll('.user-menu-dropdown.active');
        allActiveDropdowns.forEach(dropdown => { if (dropdown !== currentDropdown) dropdown.classList.remove('active'); });
    }

    // --- SỰ KIỆN CLICK TOÀN TRANG (ĐỂ ĐÓNG DROPDOWN) ---
    document.addEventListener('click', function(event) {
        const clickedInsideUserIcon = event.target.closest('.user-icon-container');
        if (!clickedInsideUserIcon) { closeOtherDropdowns(); }
    });

    console.log('[BetoBook Script v4] Đã thực thi xong.');

})();

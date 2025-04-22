(function() {
    'use strict'; // Giúp bắt lỗi tốt hơn

    /**
     * Tính toán đường dẫn gốc tương đối dựa trên vị trí trang hiện tại.
     * @returns {string} Đường dẫn tương đối đến thư mục gốc (ví dụ: './' hoặc '../' hoặc '../../').
     */
    function calculateBasePath() {
        const path = window.location.pathname;
        // Nếu đường dẫn chứa '/HTML/', nghĩa là đang ở trong thư mục HTML
        if (path.includes('/HTML/')) {
            return '../'; // Cần đi lên 1 cấp để về gốc
        }
        // Nếu đường dẫn chứa '/TRUYEN/'
        if (path.includes('/TRUYEN/')) {
            // Đếm số lượng dấu '/' sau '/TRUYEN/' để xác định độ sâu
            // Ví dụ: /TRUYEN/FOLDER/file.html -> có 2 segment sau TRUYEN
            const partsAfterTruyen = path.substring(path.indexOf('/TRUYEN/') + '/TRUYEN/'.length).split('/').filter(Boolean);
            let depth = 2; // Mặc định đi lên 2 cấp (từ file.html -> FOLDER -> TRUYEN -> gốc)
            if (partsAfterTruyen.length > 1) {
                 // Nếu có nhiều hơn 1 segment (ví dụ: /TRUYEN/FOLDER/SUBFOLDER/file.html)
                 // Bạn cần tính toán lại độ sâu cần đi lên.
                 // Ví dụ đơn giản: depth = partsAfterTruyen.length + 1;
                 // Tuy nhiên, cần xem cấu trúc thực tế của bạn trong TRUYEN. Giữ nguyên 2 cấp cho đơn giản.
                console.warn("[BetoBook Script] Cấu trúc thư mục trong TRUYEN có thể phức tạp hơn, đang giả định độ sâu 2.");
            }
            let basePath = '';
            for(let i = 0; i < depth; i++) {
                basePath += '../';
            }
            return basePath; // Ví dụ: '../../'
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

        if (path === '/') return true;
        if (path.endsWith('/index.html')) {
            if (segments.length === 1 && segments[0] === 'index.html') return true; // /index.html
             // Check for /repo-name/index.html
             if (segments.length === 2 && segments[1] === 'index.html') return true;
        }
         // Check for /repo-name/ (GitHub Pages root)
         if (segments.length === 1 && path.endsWith('/')) return true;
         // Check for /repo-name (GitHub Pages root without trailing slash, less common but possible)
         // Ensure it's not a file like /somefile. Kinda tricky. Let's assume /repo-name/ is the main case.
        if (segments.length === 1 && !path.endsWith('/') && !path.includes('.')) return true;


        return false;
    }

    const BASE_PATH = calculateBasePath();
    const IS_HOME_PAGE = isHomePage();

    console.log(`[BetoBook Script] Base Path: ${BASE_PATH}, Is Home Page: ${IS_HOME_PAGE}`);

    // --- LOGIC CHO NÚT "XEM THÊM" (Chỉ chạy ở trang chủ) ---
    if (IS_HOME_PAGE) {
        const xemThemButton = document.getElementById('xem-them');
        const truyenAnSection = document.getElementById('truyen-an');
        if (xemThemButton && truyenAnSection) {
            xemThemButton.addEventListener('click', function() {
                console.log('[BetoBook Script] Nút "Xem thêm" được nhấn.');
                truyenAnSection.style.display = 'block'; // Hoặc 'grid', 'flex' tùy CSS
                this.style.display = 'none';
            });
        } else {
            if (document.readyState === 'complete' || document.readyState === 'interactive') {
                 console.warn('[BetoBook Script] Không tìm thấy nút "Xem thêm" hoặc khu vực truyện ẩn trên trang chủ.');
            } else {
                // Đợi DOM load xong nếu script chạy quá sớm
                 window.addEventListener('DOMContentLoaded', () => {
                    const btn = document.getElementById('xem-them');
                    const section = document.getElementById('truyen-an');
                    if (!btn || !section) {
                         console.warn('[BetoBook Script] DOMContentLoaded: Không tìm thấy nút "Xem thêm" hoặc khu vực truyện ẩn trên trang chủ.');
                    }
                 });
            }
        }
    }

    // --- LOGIC TẢI THANH ĐIỀU HƯỚNG (NAVIGATION) ---
    const navigationPlaceholder = document.getElementById('navigation');
    if (navigationPlaceholder) {
        // --- Sửa logic lấy đường dẫn fetch ---
        let navPathToFetch;
        // Đường dẫn fetch LUÔN tương đối từ vị trí file script.js (trong thư mục JS/)
        // để đến file navigation.html (trong thư mục HTML/)
        navPathToFetch = '../HTML/navigation.html'; // Luôn đi lên 1 cấp từ JS/ rồi vào HTML/

        console.log(`[BetoBook Script] Đang tải navigation từ: ${navPathToFetch}`);
        // -------------------------------------

        fetch(navPathToFetch)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status} - Không thể tải ${navPathToFetch}`);
                }
                return response.text();
            })
            .then(data => {
                console.log('[BetoBook Script] Tải navigation thành công.');
                navigationPlaceholder.innerHTML = data;
                setupNavigationInteractions(); // Gọi hàm xử lý tương tác *sau khi* HTML được chèn
            })
            .catch(error => {
                console.error('[BetoBook Script] Lỗi tải navigation:', error);
                navigationPlaceholder.innerHTML = `<p style="color:red; text-align:center; border: 1px solid red; padding: 10px;">Lỗi tải thanh điều hướng. Vui lòng kiểm tra Console (F12).</p>`;
            });
    } else {
        console.error('[BetoBook Script] Không tìm thấy placeholder #navigation.');
    }

    /**
     * Thiết lập các tương tác cho thanh điều hướng sau khi đã tải xong HTML.
     * Tính toán đường dẫn link dựa trên trang hiện tại (BASE_PATH).
     */
    function setupNavigationInteractions() {
        const navContainer = document.getElementById('navigation');
        if (!navContainer) {
            console.error("[BetoBook Script] Không tìm thấy navContainer sau khi fetch.");
            return;
        }

        // --- Tính toán đường dẫn cơ sở cho các link ---
        // Đường dẫn này sẽ được dùng để tạo URL tuyệt đối (tương đối từ gốc) cho các link
        const linkBasePath = BASE_PATH; // Dùng BASE_PATH đã tính toán

        // --- Nút Đăng nhập / Icon Người dùng ---
        const loginButtonContainer = navContainer.querySelector(".btn-login") || navContainer.querySelector(".user-icon-container");
        if (loginButtonContainer) {
            const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
            // Đường dẫn đến các trang liên quan, tính từ gốc
            const userPagePath = linkBasePath + 'HTML/user.html';
            const loginPagePath = linkBasePath + 'HTML/login.html';
            const homePagePath = linkBasePath + 'index.html';

            console.log(`[BetoBook Script] Link paths: user=${userPagePath}, login=${loginPagePath}, home=${homePagePath}`);

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
                        event.preventDefault();
                        event.stopPropagation();
                        closeOtherDropdowns(dropdownMenu);
                        dropdownMenu.classList.toggle('active');
                    }
                });

                const logoutLink = dropdownMenu.querySelector('#logout-link');
                if (logoutLink) {
                    logoutLink.addEventListener('click', function(event) {
                        event.preventDefault();
                        localStorage.removeItem('isLoggedIn');
                        localStorage.removeItem('userName');
                        localStorage.removeItem('isAdmin');
                        alert('Bạn đã đăng xuất thành công.');
                        window.location.href = homePagePath;
                    });
                }
            } else {
                loginButtonContainer.className = 'btn-login';
                loginButtonContainer.textContent = 'Đăng Nhập';
                loginButtonContainer.href = loginPagePath;
            }
        } else {
            console.warn('[BetoBook Script] Không tìm thấy nút đăng nhập/icon user trong navigation.');
        }

        // --- Dropdown Thể loại ---
        const theLoaiSelect = navContainer.querySelector('#the-loai');
        if (theLoaiSelect) {
            theLoaiSelect.addEventListener('change', function() {
                if (this.value && this.value !== "") { // Đảm bảo có giá trị và không phải option mặc định
                    const targetPath = linkBasePath + 'HTML/' + this.value;
                    console.log(`[BetoBook Script] Chuyển đến thể loại: ${targetPath}`);
                    window.location.href = targetPath;
                }
            });
        } else {
             console.warn('[BetoBook Script] Không tìm thấy dropdown #the-loai.');
        }

        // --- Dropdown Loại truyện ---
        const loaiTruyenSelect = navContainer.querySelector('.search-container select[name="loaitruyen"]');
        if (loaiTruyenSelect) {
            loaiTruyenSelect.addEventListener('change', function() {
                if (this.value && this.value !== "") { // Đảm bảo có giá trị và không phải option mặc định
                    const targetPath = linkBasePath + 'HTML/' + this.value;
                    console.log(`[BetoBook Script] Chuyển đến loại truyện: ${targetPath}`);
                    window.location.href = targetPath;
                }
            });
        } else {
             console.warn('[BetoBook Script] Không tìm thấy dropdown loại truyện.');
        }

        // --- Form Tìm kiếm ---
        const searchForm = navContainer.querySelector('.search-container form');
        const searchInput = navContainer.querySelector('.search-container input[name="q"]');
        const searchButton = navContainer.querySelector('.search-container button[type="submit"]');

        if (searchForm && searchInput && searchButton) {
            const updateSearchButtonState = () => {
                searchButton.disabled = searchInput.value.trim() === '';
            };
            searchInput.addEventListener('input', updateSearchButtonState);
            updateSearchButtonState();

            searchForm.addEventListener('submit', function(event) {
                event.preventDefault();
                const searchTerm = searchInput.value.trim();
                if (!searchTerm) {
                    searchInput.focus();
                    return;
                }

                const targetAction = searchForm.getAttribute('action'); // vd: "search-results.html"
                if (!targetAction) {
                    alert("Lỗi: Không thể xác định trang kết quả tìm kiếm.");
                    return;
                }

                const searchResultPageUrl = linkBasePath + 'HTML/' + targetAction;
                const finalSearchUrl = `${searchResultPageUrl}?q=${encodeURIComponent(searchTerm)}`;

                console.log(`[BetoBook Script] Tìm kiếm với từ khóa "${searchTerm}", chuyển đến: ${finalSearchUrl}`);
                window.location.href = finalSearchUrl;
            });
        } else {
            console.error('[BetoBook Script] Không tìm thấy các thành phần của form tìm kiếm.');
        }
    }

    // --- LOGIC SLIDESHOW ---
    let slideIndex = 1;
    let slideInterval;
    const slideshowContainer = document.querySelector('.slideshow-container');

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

    function plusSlides(n) {
        if (!slideshowContainer) return; // Thêm kiểm tra
        stopSlideShow();
        showSlides(slideIndex += n);
        startSlideShow();
    }

    function currentSlide(n) {
         if (!slideshowContainer) return; // Thêm kiểm tra
        stopSlideShow();
        showSlides(slideIndex = n);
        startSlideShow();
    }

    function startSlideShow() {
        if (!slideshowContainer || slideshowContainer.getElementsByClassName("mySlides").length === 0) return;
        stopSlideShow();
        console.log('[BetoBook Script] Bắt đầu slideshow tự động.');
        slideInterval = setInterval(() => {
            showSlides(slideIndex += 1);
        }, 3500);
    }

    function stopSlideShow() {
        // console.log('[BetoBook Script] Dừng slideshow tự động.');
        clearInterval(slideInterval);
    }

    // Đưa hàm ra global để HTML dùng được
    window.plusSlides = plusSlides;
    window.currentSlide = currentSlide;

    // --- SỰ KIỆN KHI TẢI XONG TRANG ---
    window.addEventListener('load', () => {
        console.log('[BetoBook Script] Trang đã tải xong.');

        // Khởi tạo slideshow chỉ khi ở trang chủ VÀ có container
        if (IS_HOME_PAGE && slideshowContainer) {
            console.log('[BetoBook Script] Khởi tạo slideshow.');
            showSlides(slideIndex);
            startSlideShow();
            slideshowContainer.addEventListener('mouseenter', stopSlideShow);
            slideshowContainer.addEventListener('mouseleave', startSlideShow);
        } else if (IS_HOME_PAGE) {
             console.warn('[BetoBook Script] Đang ở trang chủ nhưng không tìm thấy .slideshow-container.');
        }

        // Ẩn preloader
        const preloader = document.getElementById('preloader');
        if (preloader) {
             console.log('[BetoBook Script] Ẩn preloader.');
             setTimeout(() => {
                 preloader.style.opacity = '0';
                 preloader.addEventListener('transitionend', () => {
                     if (preloader) preloader.style.display = 'none';
                 }, { once: true });
                 setTimeout(() => {
                    if (preloader && preloader.style.display !== 'none') {
                         preloader.style.display = 'none';
                    }
                 }, 500);
             }, 100);
        }
    });

    // --- HÀM ĐÓNG DROPDOWN USER ---
    function closeOtherDropdowns(currentDropdown = null) {
        const allActiveDropdowns = document.querySelectorAll('.user-menu-dropdown.active');
        allActiveDropdowns.forEach(dropdown => {
            if (dropdown !== currentDropdown) {
                dropdown.classList.remove('active');
            }
        });
    }

    // --- SỰ KIỆN CLICK TOÀN TRANG (ĐỂ ĐÓNG DROPDOWN) ---
    document.addEventListener('click', function(event) {
        const clickedInsideUserIcon = event.target.closest('.user-icon-container');
        if (!clickedInsideUserIcon) {
            closeOtherDropdowns();
        }
    });

    console.log('[BetoBook Script] Đã thực thi xong.');

})(); // Kết thúc IIFE

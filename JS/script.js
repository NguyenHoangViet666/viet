(function() {
    'use strict';

    function calculateBasePath() {
        const path = window.location.pathname;
        if (path.includes('/HTML/')) {
            return '../';
        }
        if (path.includes('/TRUYEN/')) {
            // Cần tính toán độ sâu chính xác hơn nếu cấu trúc phức tạp
            return '../../';
        }
        return './';
    }

    function isHomePage() {
        const path = window.location.pathname;
        const segments = path.split('/').filter(Boolean);

        if (path === '/' || path === '/index.html') return true; // Root or /index.html
        // GitHub Pages repo root: /repo-name/ or /repo-name/index.html
        if (segments.length === 1 && (path.endsWith('/') || !path.includes('.'))) return true;
        if (segments.length === 2 && segments[1] === 'index.html' && path.endsWith('/index.html')) return true;

        return false;
    }

    const BASE_PATH = calculateBasePath();
    const IS_HOME_PAGE = isHomePage();

    console.log(`[BetoBook Script v3] Base Path: ${BASE_PATH}, Is Home Page: ${IS_HOME_PAGE}`);

    // --- LOGIC CHO NÚT "XEM THÊM" (Chỉ chạy ở trang chủ) ---
    if (IS_HOME_PAGE) {
        // Sử dụng DOMContentLoaded để đảm bảo các element đã tồn tại
        document.addEventListener('DOMContentLoaded', () => {
            const xemThemButton = document.getElementById('xem-them');
            const truyenAnSection = document.getElementById('truyen-an');
            if (xemThemButton && truyenAnSection) {
                xemThemButton.addEventListener('click', function() {
                    console.log('[BetoBook Script v3] Nút "Xem thêm" được nhấn.');
                    truyenAnSection.style.display = 'block';
                    this.style.display = 'none';
                });
            } else {
                console.warn('[BetoBook Script v3] Không tìm thấy nút "Xem thêm" hoặc khu vực truyện ẩn trên trang chủ.');
            }
        });
    }

    // --- LOGIC TẢI THANH ĐIỀU HƯỚNG (NAVIGATION) ---
    const navigationPlaceholder = document.getElementById('navigation');
    if (navigationPlaceholder) {
        // --- QUYẾT ĐỊNH ĐƯỜNG DẪN FETCH DỰA TRÊN TRANG HIỆN TẠI ---
        let navPathToFetch;
        if (IS_HOME_PAGE) {
            // Đang ở trang gốc (index.html), fetch tương đối từ gốc
            navPathToFetch = 'HTML/navigation.html';
        } else {
            // Đang ở trang con (ví dụ: trong HTML/ hoặc TRUYEN/), fetch tương đối từ trang con đó
            // Nếu trang con là HTML/tinh-cam.html, cần fetch 'navigation.html'
            // Nếu trang con là TRUYEN/xxx/yyy.html, cần fetch '../../HTML/navigation.html'
            // -> Dùng BASE_PATH để tính ngược lại
            navPathToFetch = BASE_PATH + 'HTML/navigation.html';
        }
        // !!! **TRƯỜNG HỢP ĐẶC BIỆT:** Nếu đang ở trang HTML/ thì BASE_PATH là '../'.
        // Khi đó BASE_PATH + 'HTML/navigation.html' = '../HTML/navigation.html'
        // Đây là đường dẫn đúng để fetch TỪ FILE SCRIPT (JS/)
        // -> Logic này có vẻ đúng cho cả hai trường hợp! Hãy thử lại cách này.
        navPathToFetch = BASE_PATH + 'HTML/navigation.html';


        console.log(`[BetoBook Script v3] Tính toán navPathToFetch: ${navPathToFetch} (Dựa trên BASE_PATH: ${BASE_PATH})`);

        fetch(navPathToFetch)
            .then(response => {
                if (!response.ok) {
                    // Log URL đã fetch bị lỗi
                    console.error(`[BetoBook Script v3] Lỗi HTTP ${response.status} khi fetch: ${response.url}`);
                    throw new Error(`HTTP ${response.status} - Không thể tải ${navPathToFetch}`);
                }
                return response.text();
            })
            .then(data => {
                console.log('[BetoBook Script v3] Tải navigation thành công.');
                navigationPlaceholder.innerHTML = data;
                setupNavigationInteractions(); // Gọi hàm xử lý tương tác
            })
            .catch(error => {
                console.error('[BetoBook Script v3] Lỗi tải navigation:', error);
                navigationPlaceholder.innerHTML = `<p style="color:red; text-align:center; border: 1px solid red; padding: 10px;">Lỗi tải thanh điều hướng. Vui lòng kiểm tra Console (F12).</p>`;
            });
    } else {
        console.error('[BetoBook Script v3] Không tìm thấy placeholder #navigation.');
    }

    /**
     * Thiết lập các tương tác cho thanh điều hướng sau khi đã tải xong HTML.
     */
    function setupNavigationInteractions() {
        const navContainer = document.getElementById('navigation');
        if (!navContainer) {
             console.error("[BetoBook Script v3] Không tìm thấy navContainer sau khi fetch.");
            return;
        }

        const linkBasePath = BASE_PATH;

        // --- Nút Đăng nhập / Icon Người dùng ---
        const loginButtonContainer = navContainer.querySelector(".btn-login") || navContainer.querySelector(".user-icon-container");
        if (loginButtonContainer) {
            const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
            const userPagePath = linkBasePath + 'HTML/user.html';
            const loginPagePath = linkBasePath + 'HTML/login.html';
            const homePagePath = linkBasePath + 'index.html';

            console.log(`[BetoBook Script v3] Link paths: user=${userPagePath}, login=${loginPagePath}, home=${homePagePath}`);

            if (isLoggedIn) {
                // ... (Logic hiển thị icon user và dropdown như cũ) ...
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
                // ... (Logic hiển thị nút Đăng nhập như cũ) ...
                 loginButtonContainer.className = 'btn-login';
                 loginButtonContainer.textContent = 'Đăng Nhập';
                 loginButtonContainer.href = loginPagePath;
            }
        } else {
            console.warn('[BetoBook Script v3] Không tìm thấy nút đăng nhập/icon user trong navigation.');
        }

        // --- Dropdown Thể loại ---
        const theLoaiSelect = navContainer.querySelector('#the-loai');
        if (theLoaiSelect) {
            theLoaiSelect.addEventListener('change', function() {
                if (this.value && this.value !== "") {
                    const targetPath = linkBasePath + 'HTML/' + this.value;
                    console.log(`[BetoBook Script v3] Chuyển đến thể loại: ${targetPath}`);
                    window.location.href = targetPath;
                }
            });
        } else {
             console.warn('[BetoBook Script v3] Không tìm thấy dropdown #the-loai.');
        }

        // --- Dropdown Loại truyện ---
        const loaiTruyenSelect = navContainer.querySelector('.search-container select[name="loaitruyen"]');
        if (loaiTruyenSelect) {
             loaiTruyenSelect.addEventListener('change', function() {
                 if (this.value && this.value !== "") {
                     const targetPath = linkBasePath + 'HTML/' + this.value;
                     console.log(`[BetoBook Script v3] Chuyển đến loại truyện: ${targetPath}`);
                     window.location.href = targetPath;
                 }
             });
        } else {
            console.warn('[BetoBook Script v3] Không tìm thấy dropdown loại truyện.');
        }


        // --- Form Tìm kiếm ---
        const searchForm = navContainer.querySelector('.search-container form');
        const searchInput = navContainer.querySelector('.search-container input[name="q"]');
        const searchButton = navContainer.querySelector('.search-container button[type="submit"]');

        if (searchForm && searchInput && searchButton) {
            // ... (Logic disable nút và xử lý submit như cũ) ...
            const updateSearchButtonState = () => { searchButton.disabled = searchInput.value.trim() === ''; };
            searchInput.addEventListener('input', updateSearchButtonState);
            updateSearchButtonState();
            searchForm.addEventListener('submit', function(event) {
                event.preventDefault();
                const searchTerm = searchInput.value.trim();
                if (!searchTerm) { searchInput.focus(); return; }
                const targetAction = searchForm.getAttribute('action');
                if (!targetAction) { alert("Lỗi: Không thể xác định trang kết quả tìm kiếm."); return; }
                const searchResultPageUrl = linkBasePath + 'HTML/' + targetAction;
                const finalSearchUrl = `${searchResultPageUrl}?q=${encodeURIComponent(searchTerm)}`;
                console.log(`[BetoBook Script v3] Tìm kiếm với từ khóa "${searchTerm}", chuyển đến: ${finalSearchUrl}`);
                window.location.href = finalSearchUrl;
            });
        } else {
            console.error('[BetoBook Script v3] Không tìm thấy các thành phần của form tìm kiếm.');
        }
    }

    // --- LOGIC SLIDESHOW ---
    let slideIndex = 1;
    let slideInterval;
    // Đảm bảo slideshowContainer được tìm thấy sau khi DOM sẵn sàng nếu cần
    let slideshowContainer;
     document.addEventListener('DOMContentLoaded', () => {
         slideshowContainer = document.querySelector('.slideshow-container');
         // Khởi tạo slideshow nếu ở trang chủ và tìm thấy container
        if (IS_HOME_PAGE && slideshowContainer) {
            console.log('[BetoBook Script v3] DOMContentLoaded: Khởi tạo slideshow.');
            showSlides(slideIndex);
            startSlideShow();
            slideshowContainer.addEventListener('mouseenter', stopSlideShow);
            slideshowContainer.addEventListener('mouseleave', startSlideShow);
        } else if (IS_HOME_PAGE) {
            console.warn('[BetoBook Script v3] DOMContentLoaded: Đang ở trang chủ nhưng không tìm thấy .slideshow-container.');
        }
     });


    function showSlides(n) {
        if (!slideshowContainer) return; // Luôn kiểm tra trước khi dùng
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
        if (!slideshowContainer) return;
        stopSlideShow(); showSlides(slideIndex += n); startSlideShow();
    }
    function currentSlide(n) {
        if (!slideshowContainer) return;
        stopSlideShow(); showSlides(slideIndex = n); startSlideShow();
    }
    function startSlideShow() {
        if (!slideshowContainer || slideshowContainer.getElementsByClassName("mySlides").length === 0) return;
        stopSlideShow();
        console.log('[BetoBook Script v3] Bắt đầu slideshow tự động.');
        slideInterval = setInterval(() => { showSlides(slideIndex += 1); }, 3500);
    }
    function stopSlideShow() {
        // console.log('[BetoBook Script v3] Dừng slideshow tự động.');
        clearInterval(slideInterval);
    }

    window.plusSlides = plusSlides;
    window.currentSlide = currentSlide;

    // --- SỰ KIỆN KHI TẢI XONG TRANG (Chỉ còn preloader) ---
    window.addEventListener('load', () => {
        console.log('[BetoBook Script v3] Trang đã tải xong.');
        // Preloader
        const preloader = document.getElementById('preloader');
        if (preloader) {
            console.log('[BetoBook Script v3] Ẩn preloader.');
            setTimeout(() => {
                preloader.style.opacity = '0';
                preloader.addEventListener('transitionend', () => {
                    if(preloader) preloader.style.display = 'none';
                }, { once: true });
                setTimeout(() => { if(preloader && preloader.style.display !== 'none') preloader.style.display = 'none'; }, 500);
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
        if (!clickedInsideUserIcon) { closeOtherDropdowns(); }
    });

    console.log('[BetoBook Script v3] Đã thực thi xong.');

})();

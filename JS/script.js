(function() {
    'use strict'; // Giúp bắt lỗi tốt hơn

    /**
     * Tính toán đường dẫn gốc tương đối dựa trên vị trí trang hiện tại.
     * @returns {string} Đường dẫn tương đối đến thư mục gốc (ví dụ: './' hoặc '../').
     */
    function calculateBasePath() {
        const path = window.location.pathname;
        // Nếu đường dẫn chứa '/HTML/', nghĩa là đang ở trong thư mục HTML
        if (path.includes('/HTML/')) {
            return '../'; // Cần đi lên 1 cấp để về gốc
        }
        // Nếu đường dẫn chứa '/TRUYEN/' (ví dụ: /TRUYEN/TRUYEN01/page.html)
        if (path.includes('/TRUYEN/')) {
             // Giả sử cấu trúc là /TRUYEN/FOLDER/file.html, cần đi lên 2 cấp
            return '../../';
        }
        // Mặc định là ở thư mục gốc (hoặc cấu trúc không xác định)
        return './';
    }

    /**
     * Kiểm tra xem trang hiện tại có phải là trang chủ gốc hay không.
     * @returns {boolean} True nếu là trang chủ, False nếu không phải.
     */
    function isHomePage() {
        const path = window.location.pathname;
        // Kiểm tra các trường hợp phổ biến của trang chủ gốc:
        // /, /index.html, /ten-repo/, /ten-repo/index.html (cho GitHub Pages)
        const segments = path.split('/').filter(Boolean); // Lọc bỏ các phần tử rỗng

        if (path === '/') return true; // Gốc tuyệt đối
        if (path.endsWith('/index.html')) {
            // Nếu chỉ có index.html (ví dụ: /index.html) hoặc /ten-repo/index.html
            if (segments.length === 1 || segments.length === 2) return true;
        }
        // Nếu là thư mục gốc của repo trên GitHub Pages (ví dụ: /ten-repo/)
        if (segments.length === 1 && !path.endsWith('/') && !path.includes('.')) return true; // Kiểm tra kỹ hơn xem có phải tên file không
        if (segments.length === 1 && path.endsWith('/')) return true; // /ten-repo/

        return false; // Mặc định không phải trang chủ nếu không khớp các điều kiện trên
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
            // Chỉ cảnh báo nếu không tìm thấy khi *đang* ở trang chủ
            console.warn('[BetoBook Script] Không tìm thấy nút "Xem thêm" hoặc khu vực truyện ẩn trên trang chủ.');
        }
    }

    // --- LOGIC TẢI THANH ĐIỀU HƯỚNG (NAVIGATION) ---
    const navigationPlaceholder = document.getElementById('navigation');
    if (navigationPlaceholder) {
        // Đường dẫn tương đối từ file script (JS/) đến file navigation (HTML/)
        const navFileRelativePath = '../HTML/navigation.html';
        console.log(`[BetoBook Script] Đang tải navigation từ: ${navFileRelativePath}`);

        fetch(navFileRelativePath)
            .then(response => {
                if (!response.ok) {
                    // Ném lỗi rõ ràng hơn
                    throw new Error(`HTTP ${response.status} - Không thể tải ${navFileRelativePath}`);
                }
                return response.text();
            })
            .then(data => {
                console.log('[BetoBook Script] Tải navigation thành công.');
                navigationPlaceholder.innerHTML = data; // Chèn HTML vào placeholder

                // --- Gắn lại các sự kiện và cập nhật đường dẫn trong navigation ---
                setupNavigationInteractions();
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
     */
    function setupNavigationInteractions() {
        const navContainer = document.getElementById('navigation'); // Lấy container đã có nội dung
        if (!navContainer) return;

        // --- Nút Đăng nhập / Icon Người dùng ---
        const loginButtonContainer = navContainer.querySelector(".btn-login") || navContainer.querySelector(".user-icon-container");
        if (loginButtonContainer) {
            const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
            // Tính toán đường dẫn đúng dựa trên trang hiện tại
            const userPagePath = BASE_PATH + 'HTML/user.html';
            const loginPagePath = BASE_PATH + 'HTML/login.html';
            const homePagePath = BASE_PATH + 'index.html'; // Luôn trỏ về gốc index.html

            if (isLoggedIn) {
                // Hiển thị icon user và dropdown (Giữ nguyên logic)
                const userName = localStorage.getItem("userName") || "User";
                const isAdmin = localStorage.getItem("isAdmin") === "true";
                loginButtonContainer.innerHTML = ''; // Xóa nội dung cũ (nút login)
                loginButtonContainer.className = 'user-icon-container'; // Đảm bảo đúng class
                loginButtonContainer.removeAttribute('href');

                const iconButton = document.createElement('span');
                iconButton.className = 'user-icon-button';
                iconButton.innerHTML = '<i class="bx bxs-user"></i>';
                iconButton.title = `${userName} ${isAdmin ? '(Admin)' : ''}`; // Hiển thị tên khi hover

                const dropdownMenu = document.createElement('div');
                dropdownMenu.className = 'user-menu-dropdown';
                dropdownMenu.innerHTML = `
                    <a href="${userPagePath}">Tài khoản</a>
                    <a href="#" id="logout-link">Đăng xuất</a>
                `;

                loginButtonContainer.appendChild(iconButton);
                loginButtonContainer.appendChild(dropdownMenu);

                // Sự kiện click cho icon (mở/đóng dropdown)
                loginButtonContainer.addEventListener('click', function(event) {
                    // Chỉ toggle nếu click vào icon, không phải link trong dropdown
                    if (!event.target.closest('.user-menu-dropdown a')) {
                        event.preventDefault(); // Ngăn hành vi mặc định nếu container là thẻ a cũ
                        event.stopPropagation();
                        closeOtherDropdowns(dropdownMenu); // Đóng các dropdown khác nếu có
                        dropdownMenu.classList.toggle('active');
                    }
                });

                // Sự kiện click cho nút Đăng xuất
                const logoutLink = dropdownMenu.querySelector('#logout-link');
                if (logoutLink) {
                    logoutLink.addEventListener('click', function(event) {
                        event.preventDefault();
                        localStorage.removeItem('isLoggedIn');
                        localStorage.removeItem('userName');
                        localStorage.removeItem('isAdmin'); // Luôn xóa trạng thái admin khi logout
                        alert('Bạn đã đăng xuất thành công.');
                        window.location.href = homePagePath; // Về trang chủ
                    });
                }
            } else {
                // Hiển thị nút Đăng nhập
                loginButtonContainer.className = 'btn-login';
                loginButtonContainer.textContent = 'Đăng Nhập';
                loginButtonContainer.href = loginPagePath; // Link đến trang đăng nhập
            }
        } else {
            console.warn('[BetoBook Script] Không tìm thấy nút đăng nhập/icon user trong navigation.');
        }

        // --- Dropdown Thể loại ---
        const theLoaiSelect = navContainer.querySelector('#the-loai');
        if (theLoaiSelect) {
            theLoaiSelect.addEventListener('change', function() {
                if (this.value) {
                    // Giá trị là tên file (vd: "hanh-dong.html")
                    // Đường dẫn đầy đủ sẽ là BASE_PATH + 'HTML/' + tên file
                    const targetPath = BASE_PATH + 'HTML/' + this.value;
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
                if (this.value) {
                    // Giá trị là tên file (vd: "oneshot.html")
                    const targetPath = BASE_PATH + 'HTML/' + this.value;
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
            // Disable nút tìm kiếm nếu ô input trống
            const updateSearchButtonState = () => {
                searchButton.disabled = searchInput.value.trim() === '';
            };
            searchInput.addEventListener('input', updateSearchButtonState);
            updateSearchButtonState(); // Chạy lần đầu

            // Xử lý khi submit form
            searchForm.addEventListener('submit', function(event) {
                event.preventDefault(); // Ngăn gửi form theo cách truyền thống
                const searchTerm = searchInput.value.trim();
                if (!searchTerm) {
                    searchInput.focus(); // Focus vào ô input nếu trống
                    return;
                }

                // Action của form nên là "search-results.html" (trong navigation.html)
                const targetAction = searchForm.getAttribute('action'); // vd: "search-results.html"
                if (!targetAction) {
                    alert("Lỗi: Không thể xác định trang kết quả tìm kiếm.");
                    return;
                }

                // Đường dẫn đầy đủ đến trang kết quả
                const searchResultPageUrl = BASE_PATH + 'HTML/' + targetAction;
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
    const slideshowContainer = document.querySelector('.slideshow-container'); // Tìm container

    function showSlides(n) {
        if (!slideshowContainer) return; // Thoát nếu không có slideshow
        const slides = slideshowContainer.getElementsByClassName("mySlides");
        const dots = document.getElementsByClassName("dot"); // Dots có thể nằm ngoài container

        if (slides.length === 0) return; // Thoát nếu không có slide

        // Xử lý chỉ số slide vòng lặp
        if (n > slides.length) { slideIndex = 1 }
        if (n < 1) { slideIndex = slides.length }

        // Ẩn tất cả slide
        for (let i = 0; i < slides.length; i++) {
            slides[i].style.display = "none";
        }

        // Bỏ active tất cả dot (nếu có)
        if (dots.length > 0) {
            for (let i = 0; i < dots.length; i++) {
                dots[i].className = dots[i].className.replace(" active", "");
            }
            // Đặt active cho dot tương ứng (nếu có)
            if (dots[slideIndex - 1]) {
                 dots[slideIndex - 1].className += " active";
            }
        }


        // Hiển thị slide hiện tại (kiểm tra chỉ số hợp lệ)
        if (slides[slideIndex - 1]) {
            slides[slideIndex - 1].style.display = "block";
        } else {
             console.error(`[BetoBook Script] Slide index không hợp lệ: ${slideIndex - 1}`);
        }
    }

    function plusSlides(n) {
        stopSlideShow(); // Dừng trước khi chuyển
        showSlides(slideIndex += n);
        startSlideShow(); // Bắt đầu lại sau khi chuyển
    }

    function currentSlide(n) {
        stopSlideShow();
        showSlides(slideIndex = n);
        startSlideShow();
    }

    function startSlideShow() {
        if (!slideshowContainer || slideshowContainer.getElementsByClassName("mySlides").length === 0) {
            return; // Không chạy nếu không có slideshow
        }
        stopSlideShow(); // Xóa interval cũ nếu có
        console.log('[BetoBook Script] Bắt đầu slideshow tự động.');
        slideInterval = setInterval(() => {
            showSlides(slideIndex += 1);
        }, 3500); // Thời gian chuyển slide (3.5 giây)
    }

    function stopSlideShow() {
        // console.log('[BetoBook Script] Dừng slideshow tự động.');
        clearInterval(slideInterval);
    }

    // Đưa các hàm slideshow ra global scope để thẻ HTML gọi được qua onclick
    window.plusSlides = plusSlides;
    window.currentSlide = currentSlide;

    // --- SỰ KIỆN KHI TẢI XONG TRANG ---
    window.addEventListener('load', () => {
        console.log('[BetoBook Script] Trang đã tải xong.');

        // Khởi tạo slideshow chỉ khi ở trang chủ và có container slideshow
        if (IS_HOME_PAGE && slideshowContainer) {
            console.log('[BetoBook Script] Khởi tạo slideshow.');
            showSlides(slideIndex); // Hiển thị slide đầu tiên
            startSlideShow(); // Bắt đầu chạy tự động
            // Tạm dừng khi hover chuột
            slideshowContainer.addEventListener('mouseenter', stopSlideShow);
            slideshowContainer.addEventListener('mouseleave', startSlideShow);
        } else if (IS_HOME_PAGE) {
            console.warn('[BetoBook Script] Đang ở trang chủ nhưng không tìm thấy slideshow container.');
        }

        // Ẩn preloader
        const preloader = document.getElementById('preloader');
        if (preloader) {
             console.log('[BetoBook Script] Ẩn preloader.');
             // Dùng timeout nhỏ để đảm bảo mọi thứ render xong trước khi mờ dần
             setTimeout(() => {
                 preloader.style.opacity = '0';
                 preloader.addEventListener('transitionend', () => {
                     preloader.style.display = 'none';
                 }, { once: true });
                  // Fallback nếu transitionend không kích hoạt
                 setTimeout(() => {
                    if (preloader.style.display !== 'none') {
                         preloader.style.display = 'none';
                    }
                 }, 500); // Thời gian phải lớn hơn transition duration
             }, 100); // Đợi 100ms
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
        // Kiểm tra xem có click vào bên trong icon user hay không
        const clickedInsideUserIcon = event.target.closest('.user-icon-container');
        // Nếu không click vào icon user và có dropdown đang mở, thì đóng nó đi
        if (!clickedInsideUserIcon) {
            closeOtherDropdowns();
        }
    });

    console.log('[BetoBook Script] Đã thực thi xong.');

})(); // Kết thúc IIFE (Immediately Invoked Function Expression)

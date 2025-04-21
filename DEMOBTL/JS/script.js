// --- START OF FILE script.js ---

(function() { // Sử dụng IIFE để tránh biến toàn cục không cần thiết

    // --- Phần 0: Các đường dẫn cơ sở và Helper ---
    // Giả định file JS này có thể được tải từ trang chủ (trong HTML/) hoặc trang con (sâu hơn)
    const getCurrentBasePath = () => {
        const path = window.location.pathname;
        // Ví dụ: Nếu trang là /DEMOBTL/HTML/index.html -> ../../
        // Ví dụ: Nếu trang là /DEMOBTL/TRUYEN/abc/story.html -> ../../../
        // Cách đơn giản hơn: Giả định cấu trúc cố định
        // Nếu ở trong thư mục HTML: '../../' để lên thư mục gốc rồi vào nơi khác
        // Nếu ở trong thư mục TRUYEN/xxx: '../../../'
        // --> Sử dụng cách tiếp cận dựa trên vị trí của navigation.html là an toàn hơn
        // Nếu index.html ở /DEMOBTL/HTML/ và navigation.html ở /DEMOBTL/HTML/
        // thì từ index.html, đường dẫn đến nav là 'navigation.html'
        // Nếu trang truyện ở /DEMOBTL/TRUYEN/TRUYEN01/trang_truyen_1.html
        // thì đường dẫn đến nav là '../../HTML/navigation.html'
        if (window.location.pathname.includes('/TRUYEN/')) {
            return '../../'; // Từ trang truyện lên 2 cấp
        } else if (window.location.pathname.includes('/HTML/')) {
             // Nếu là index.html hoặc trang khác trong HTML/
             // Cần phân biệt index.html với các trang khác như gioithieu.html
             if (window.location.pathname.endsWith('/') || window.location.pathname.endsWith('index.html')) {
                 // Từ index.html trong HTML/ đến navigation.html trong HTML/ là cùng cấp
                 // Tuy nhiên, để đến các file Ảnh hoặc quay về gốc thì vẫn cần '../'
                 // --> Cần cẩn thận hơn
                 // --> Giải pháp: Luôn dùng đường dẫn tuyệt đối ảo hoặc tương đối từ gốc nếu có thể
                 // --> Giữ nguyên logic cũ: xác định base path dựa trên trang hiện tại là đủ dùng
                 return '../../'; // Giả định trang HTML/ cũng cần lên 2 cấp để tới gốc DEMOBTL
             } else {
                 // Các trang khác trong HTML/ như gioithieu.html, login.html
                 return '../../'; // Cũng lên 2 cấp
             }
        }
        // Mặc định hoặc trường hợp không xác định rõ
        return '../../';
    };

    const BASE_PATH = getCurrentBasePath(); // Ví dụ: '../../'
    const HTML_FOLDER = 'HTML/';
    const COMMON_HTML_PREFIX = BASE_PATH + HTML_FOLDER; // Ví dụ: '../../HTML/'

    function isHomePage() {
        const path = window.location.pathname;
        // Điều chỉnh lại cho chính xác với cấu trúc của bạn
        // Ví dụ: chỉ trang index.html trong thư mục HTML là trang chủ
        return path.endsWith('/HTML/index.html') || path.endsWith('/HTML/');
        // Hoặc nếu trang chủ ở gốc: return path === '/' || path.endsWith('/index.html');
    }

    console.log("Script.js: Base path determined as:", BASE_PATH);
    console.log("Script.js: Is homepage?", isHomePage());

    // --- Phần 1: Xử lý trang chủ (Xem thêm, Slideshow) ---
    if (isHomePage()) {
        console.log("Script.js: Setting up homepage features...");
        // 1.1 Xử lý nút Xem thêm
        const xemThemButton = document.getElementById('xem-them');
        const truyenAnSection = document.getElementById('truyen-an');
        if (xemThemButton && truyenAnSection) {
            xemThemButton.addEventListener('click', function() {
                truyenAnSection.style.display = 'block'; // Hoặc 'grid', 'flex'
                this.style.display = 'none';
                console.log("Script.js: Show hidden stories.");
            });
        } else {
            console.warn("Script.js: 'xem-them' button or 'truyen-an' section not found on homepage.");
        }

        // 1.2 Slideshow sẽ được thiết lập ở cuối file trong listener 'load'
    }

    // --- Phần 2: Tải và xử lý Navigation ---
    const navigationPlaceholder = document.getElementById('navigation');
    if (navigationPlaceholder) {
        // Xác định đường dẫn đến navigation.html TỪ trang hiện tại
        let navPath = '';
        if (isHomePage()) {
            // Nếu index.html và navigation.html cùng trong thư mục HTML/
            navPath = 'navigation.html';
        } else if (window.location.pathname.includes('/HTML/')) {
             // Các trang khác trong HTML/ (login, gioithieu...) cũng cùng cấp với navigation.html
             navPath = 'navigation.html';
        }
         else {
            // Các trang sâu hơn (như trang truyện)
            navPath = COMMON_HTML_PREFIX + 'navigation.html'; // Ví dụ: '../../HTML/navigation.html'
        }
        console.log("Script.js: Fetching navigation from:", navPath);

        fetch(navPath)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}, tried to fetch: ${navPath}`);
                }
                return response.text();
            })
            .then(data => {
                navigationPlaceholder.innerHTML = data;
                console.log("Script.js: Navigation HTML injected.");

                // --- Bắt đầu xử lý nội dung bên trong navigation ---

                // 2.1 Xử lý trạng thái đăng nhập & User Icon/Menu
                const loginButtonContainer = navigationPlaceholder.querySelector(".btn-login") || navigationPlaceholder.querySelector(".user-icon-container");
                if (loginButtonContainer) {
                    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
                    const userName = localStorage.getItem("userName");
                    // Xác định đường dẫn TỪ trang hiện tại đến các trang user.html, login.html, index.html
                    let userPagePath = COMMON_HTML_PREFIX + 'user.html';
                    let loginPagePath = COMMON_HTML_PREFIX + 'login.html';
                    let homePagePath = COMMON_HTML_PREFIX + 'index.html';
                     // Điều chỉnh nếu trang hiện tại đã ở trong HTML/
                    if (window.location.pathname.includes('/HTML/')) {
                       userPagePath = 'user.html';
                       loginPagePath = 'login.html';
                       homePagePath = 'index.html';
                    }


                    if (isLoggedIn) {
                        // Đã đăng nhập: Hiển thị icon và dropdown
                        console.log("Script.js: User logged in. Creating user icon menu.");
                        loginButtonContainer.innerHTML = ''; // Xóa text "Đăng Nhập" cũ
                        loginButtonContainer.className = 'user-icon-container'; // Đảm bảo đúng class
                        loginButtonContainer.removeAttribute('href'); // Không cần href cho container

                        const iconButton = document.createElement('span');
                        iconButton.className = 'user-icon-button';
                        iconButton.innerHTML = '<i class="bx bxs-user"></i>';

                        const dropdownMenu = document.createElement('div');
                        dropdownMenu.className = 'user-menu-dropdown';
                        dropdownMenu.innerHTML = `
                            <a href="${userPagePath}">Tài khoản</a>
                            <a href="#" id="logout-link">Đăng xuất</a>
                        `;

                        loginButtonContainer.appendChild(iconButton);
                        loginButtonContainer.appendChild(dropdownMenu);

                        // Listener mở/đóng dropdown
                        loginButtonContainer.addEventListener('click', function(event) {
                            if (!event.target.closest('.user-menu-dropdown a')) {
                                event.preventDefault();
                                event.stopPropagation();
                                closeOtherDropdowns(dropdownMenu);
                                dropdownMenu.classList.toggle('active');
                            }
                        });

                        // Listener đăng xuất
                        const logoutLink = dropdownMenu.querySelector('#logout-link');
                        if (logoutLink) {
                            logoutLink.addEventListener('click', function(event) {
                                event.preventDefault();
                                localStorage.removeItem('isLoggedIn');
                                localStorage.removeItem('userName');
                                localStorage.removeItem('isAdmin'); // Quan trọng: Xóa cả trạng thái admin
                                console.log("Script.js: User logged out.");
                                alert('Bạn đã đăng xuất thành công.');
                                window.location.href = homePagePath; // Về trang chủ
                            });
                        }

                    } else {
                        // Chưa đăng nhập: Hiển thị nút "Đăng Nhập"
                        console.log("Script.js: User not logged in. Displaying login button.");
                        loginButtonContainer.className = 'btn-login'; // Đảm bảo đúng class
                        loginButtonContainer.textContent = 'Đăng Nhập';
                        loginButtonContainer.href = loginPagePath; // Đặt link đến trang đăng nhập
                    }
                } else {
                    console.warn("Script.js: Login button/User icon container not found in fetched navigation.");
                }

                // 2.2 Gắn sự kiện CHANGE cho các Select để điều hướng trang
                const theLoaiSelect = navigationPlaceholder.querySelector('#the-loai');
                if (theLoaiSelect) {
                    theLoaiSelect.addEventListener('change', function() {
                        if (this.value) { // Giá trị là URL trang thể loại
                            console.log("Script.js: Genre changed, navigating to:", this.value);
                            window.location.href = this.value;
                        }
                    });
                } else {
                    console.warn("Script.js: Genre select (#the-loai) not found.");
                }

                const loaiTruyenSelect = navigationPlaceholder.querySelector('.search-container select[name="loaitruyen"]');
                if (loaiTruyenSelect) {
                    loaiTruyenSelect.addEventListener('change', function() {
                        if (this.value) { // Giá trị là URL trang loại truyện
                            console.log("Script.js: Story type changed, navigating to:", this.value);
                            window.location.href = this.value;
                        }
                    });
                } else {
                    console.warn("Script.js: Story type select ([name='loaitruyen']) not found.");
                }

                // 2.3 Xử lý SUBMIT cho Form Tìm kiếm (Chỉ dùng ô input)
                const searchForm = navigationPlaceholder.querySelector('.search-container form');
                const searchInput = navigationPlaceholder.querySelector('.search-container input[name="q"]');
                const searchButton = navigationPlaceholder.querySelector('.search-container button[type="submit"]');

                if (searchForm && searchInput && searchButton) {
                    // Bật/tắt nút tìm dựa trên nội dung input
                    const updateSearchButtonState = () => {
                        searchButton.disabled = searchInput.value.trim() === '';
                    };
                    searchInput.addEventListener('input', updateSearchButtonState);
                    updateSearchButtonState(); // Cập nhật trạng thái ban đầu

                    // Listener cho sự kiện SUBMIT
                    searchForm.addEventListener('submit', function(event) {
                        event.preventDefault(); // Ngăn form gửi đi theo cách mặc định

                        const searchTerm = searchInput.value.trim();
                        if (!searchTerm) {
                            console.log("Script.js: Search term is empty, submit prevented.");
                            searchInput.focus();
                            return; // Không làm gì nếu ô tìm kiếm trống
                        }

                        // Lấy đường dẫn trang kết quả từ action của form
                        // *** Quan trọng: Đảm bảo 'action' trong navigation.html là đúng ***
                        // Ví dụ: action="../../HTML/search-results.html"
                        const targetAction = searchForm.getAttribute('action');
                         if (!targetAction) {
                            console.error("Script.js: Search form is missing 'action' attribute!");
                            alert("Lỗi: Không thể xác định trang kết quả tìm kiếm.");
                            return;
                        }

                         // Xác định đường dẫn cuối cùng đến trang kết quả TỪ trang hiện tại
                         let searchResultPageUrl;
                         if (targetAction.startsWith('../')) {
                             // Nếu action là tương đối (ví dụ: ../../HTML/search-results.html)
                             // Chúng ta cần tính toán dựa trên vị trí hiện tại, nhưng thường action đã đúng sẵn
                             // Chỉ cần đảm bảo action trong navigation.html là đúng từ vị trí của navigation.html
                             // Ví dụ: Nếu nav ở HTML/, action='search-results.html'
                             // Nếu nav ở gốc, action='HTML/search-results.html'
                             // --> Giả định action trong navigation.html đã đúng
                             // --> Cần phân giải nó dựa trên vị trí trang hiện tại
                             // Cách đơn giản nhất: nếu navPath được tính đúng, thì action cũng phải đúng tương đối
                             // Ví dụ nếu đang ở trang truyện, navPath là ../../HTML/navigation.html
                             // action trong nav là ../../HTML/search-results.html => giữ nguyên là đúng
                             searchResultPageUrl = targetAction;

                             // Tuy nhiên, để chắc chắn hơn, ta có thể xây dựng từ BASE_PATH
                             // searchResultPageUrl = BASE_PATH + 'HTML/search-results.html';
                             // -> Cách này có thể không linh hoạt bằng việc tin vào action trong HTML

                             // Kiểm tra lại logic action của bạn trong navigation.html
                             // Nó phải đúng tương đối từ VỊ TRÍ CỦA navigation.html
                             // Ví dụ: Nếu navigation.html ở thư mục gốc, action nên là "HTML/search-results.html"
                             // Nếu navigation.html ở thư mục HTML, action nên là "search-results.html"

                             // Giữ nguyên cách dùng action trực tiếp, nhưng log ra để kiểm tra
                             console.log("Script.js: Using form action directly:", targetAction);
                             searchResultPageUrl = targetAction;

                         } else {
                             // Nếu action là tuyệt đối hoặc chỉ là tên file (cùng thư mục)
                             searchResultPageUrl = targetAction;
                         }


                        // Tạo URL cuối cùng chỉ với tham số 'q'
                        const finalSearchUrl = `${searchResultPageUrl}?q=${encodeURIComponent(searchTerm)}`;

                        console.log("Script.js: Search submitted. Navigating to:", finalSearchUrl);
                        window.location.href = finalSearchUrl; // Điều hướng thủ công
                    });
                } else {
                    console.warn("Script.js: Search form components (form, input[q], button) not all found.");
                }

                console.log("Script.js: Navigation setup complete.");
                // --- Kết thúc xử lý nội dung bên trong navigation ---

            })
            .catch(error => {
                console.error('Script.js: Error fetching or processing navigation:', error);
                navigationPlaceholder.innerHTML = `<p style="color:red; text-align:center; border: 1px solid red; padding: 10px;">Lỗi tải thanh điều hướng: ${error.message}. Vui lòng kiểm tra Console (F12).</p>`;
            });
    } else {
        console.error("Script.js: Critical Error! Navigation placeholder <div id='navigation'> not found in this HTML.");
    }

    // --- Phần 3: Slideshow (Chỉ chạy trên trang chủ) ---
    let slideIndex = 1;
    let slideInterval;
    const slideshowContainer = document.querySelector('.slideshow-container');

    function showSlides(n) {
        if (!slideshowContainer) return; // Chỉ chạy nếu có container
        let slides = slideshowContainer.getElementsByClassName("mySlides");
        let dots = slideshowContainer.getElementsByClassName("dot");
        if (slides.length === 0) return; // Không có slide thì dừng

        if (n > slides.length) { slideIndex = 1 }
        if (n < 1) { slideIndex = slides.length }

        for (let i = 0; i < slides.length; i++) {
            slides[i].style.display = "none";
        }
        for (let i = 0; i < dots.length; i++) {
            dots[i].className = dots[i].className.replace(" active", "");
        }

        slides[slideIndex - 1].style.display = "block";
        if (dots[slideIndex - 1]) {
             dots[slideIndex - 1].className += " active";
        }
    }

    function plusSlides(n) {
        stopSlideShow();
        showSlides(slideIndex += n);
        startSlideShow();
    }

    function currentSlide(n) {
        stopSlideShow();
        showSlides(slideIndex = n);
        startSlideShow();
    }

    function startSlideShow() {
        if (!slideshowContainer || slideshowContainer.getElementsByClassName("mySlides").length === 0) return;
        stopSlideShow(); // Xóa interval cũ trước khi tạo mới
        slideInterval = setInterval(() => {
            showSlides(slideIndex += 1);
        }, 3000); // 3 giây
    }

    function stopSlideShow() {
        clearInterval(slideInterval);
    }

    // Gán hàm vào window để HTML có thể gọi qua onclick
    window.plusSlides = plusSlides;
    window.currentSlide = currentSlide;

    // Khởi chạy slideshow và xử lý hover sau khi trang tải xong
    window.addEventListener('load', () => {
        if (isHomePage() && slideshowContainer) {
            console.log("Script.js: Initializing slideshow on homepage.");
            showSlides(slideIndex); // Hiển thị slide đầu
            startSlideShow(); // Bắt đầu tự động chạy
            slideshowContainer.addEventListener('mouseenter', stopSlideShow);
            slideshowContainer.addEventListener('mouseleave', startSlideShow);
        }

        // --- Phần 4: Preloader (Sau khi trang load xong) ---
        const preloader = document.getElementById('preloader');
        if (preloader) {
            console.log("Script.js: Hiding preloader.");
            preloader.style.opacity = '0';
            // Nên dùng event 'transitionend' thay vì setTimeout để đảm bảo khớp CSS
            preloader.addEventListener('transitionend', () => {
                preloader.style.display = 'none';
            }, { once: true }); // Chỉ chạy 1 lần
             // Fallback nếu không có transition hoặc trình duyệt cũ
             setTimeout(() => {
                 if (preloader.style.display !== 'none'){ // Kiểm tra nếu chưa ẩn
                     preloader.style.display = 'none';
                 }
             }, 500); // Giữ lại fallback 500ms
        }
    });

    // --- Phần 5: Helper đóng dropdown và Listener toàn cục ---
    function closeOtherDropdowns(currentDropdown = null) {
        const allActiveDropdowns = document.querySelectorAll('.user-menu-dropdown.active');
        allActiveDropdowns.forEach(dropdown => {
            if (dropdown !== currentDropdown) {
                dropdown.classList.remove('active');
            }
        });
    }

    // Đóng dropdown khi click ra ngoài
    document.addEventListener('click', function(event) {
        const clickedInsideUserIcon = event.target.closest('.user-icon-container');
        if (!clickedInsideUserIcon) {
            closeOtherDropdowns();
        }
    });

    console.log("Script.js: Execution finished.");

})(); // Kết thúc IIFE

// --- END OF FILE script.js ---
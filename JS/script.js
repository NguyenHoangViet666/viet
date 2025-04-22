(function() {

    // --- NEW: Function to calculate the correct base path ---
    function calculateBasePath() {
        const path = window.location.pathname;
        // Check if we are at the root level (e.g., /, /index.html, /repository-name/, /repository-name/index.html)
        // Handles common GitHub Pages scenarios.
        const pathSegments = path.split('/').filter(segment => segment !== ''); // Get non-empty segments

        if (path.endsWith('/') || path.endsWith('/index.html')) {
            // If it ends with / or /index.html
            if (pathSegments.length === 0) { // True root: http://domain.com/
                 return './'; // Use relative paths from root
            } else if (pathSegments.length === 1 && path.includes('.')) { // Might be index.html at root
                 return './';
            } else if (pathSegments.length === 1 && !path.includes('.')) { // Likely /repository-name/
                 // GitHub Pages repo subfolder case requires slightly different handling for JS/CSS etc.
                 // But for fetching HTML/nav.html, this relative path works from the repo root index.
                 return './';
            } else if (pathSegments.length === 2 && pathSegments[1] === 'index.html') { // Likely /repository-name/index.html
                 return './';
            }
        }

        // Check if inside /HTML/ subdirectory
        if (path.includes('/HTML/')) {
            return '../'; // Go up one level from HTML to the root
        }

        // Check if inside /TRUYEN/ subdirectory (adjust depth if needed)
        if (path.includes('/TRUYEN/')) {
            // Count segments after TRUYEN to determine depth, might need adjustment
            // Simple case: Assume /TRUYEN/TRUYENXX/page.html -> needs ../../
            return '../../';
        }

        // Default fallback (might need adjustment based on your exact structure)
        console.warn("Could not determine base path reliably for:", path, "Defaulting to './'");
        return './'; // Default to relative from current if unsure
    }

    const BASE_PATH = calculateBasePath(); // Use the calculated base path
    console.log("Calculated BASE_PATH:", BASE_PATH);

    // --- Helper Function to create absolute URLs (Relative to root) ---
    // Needed for navigation links etc. when called from different depths
    function getCorrectPath(relativePathFromRoot) {
        // If BASE_PATH is already going up levels, adjust the final path
        if (BASE_PATH === '../') { // Inside HTML
            return relativePathFromRoot; // Path is already relative from HTML
        } else if (BASE_PATH === '../../') { // Inside TRUYEN
            return '../' + relativePathFromRoot; // Go up one more level
        } else { // At Root (BASE_PATH is './')
             // Need to prepend HTML/ for subpages, or keep root paths as is
             if(relativePathFromRoot.startsWith('HTML/') || relativePathFromRoot.startsWith('JS/') || relativePathFromRoot.startsWith('CSS/') || relativePathFromRoot.startsWith('Ảnh/') || relativePathFromRoot === 'index.html') {
                 return relativePathFromRoot; // Already correct from root
             } else {
                 // Assume it's a page inside HTML/ if not explicitly rooted
                 // This might need refinement depending on link structure
                 return 'HTML/' + relativePathFromRoot;
             }
        }
    }
     // Simplified version for paths relative *from the script's current context*
     function resolvePath(relativePath) {
         // If the relative path already accounts for going up (like ../../HTML/...)
         if (relativePath.startsWith('../')) {
            // Let's assume it's calculated correctly elsewhere for deep paths
            return relativePath;
         }
         // For simple paths like 'HTML/navigation.html' or 'CSS/style.css'
         // prepend the base path if needed
         if (BASE_PATH === './') {
             return relativePath; // Already relative to root
         } else {
             // For ../ or ../../, combine them.
             // Example: BASE_PATH = ../, relativePath = HTML/file.html -> ../HTML/file.html (correct)
             // Example: BASE_PATH = ../, relativePath = navigation.html -> ../navigation.html (INCORRECT for nav)
             // This needs careful handling based on *what* you are resolving.

             // Let's try a specific approach for known files like navigation
             if (relativePath === 'HTML/navigation.html' && BASE_PATH !== './') {
                 return BASE_PATH + relativePath; // e.g. ../HTML/navigation.html
             }
              // Default attempt: Combine base and relative
             // This might be wrong in some cases, requires testing.
             // return BASE_PATH + relativePath;

             // More robust: Use URL constructor if possible (browser only)
             try {
                let baseUrl = window.location.href;
                // If we are in HTML/, go up for the base
                if(BASE_PATH === '../'){
                    baseUrl = new URL('..', window.location.href).href;
                } else if (BASE_PATH === '../../') {
                    baseUrl = new URL('../..', window.location.href).href;
                }
                return new URL(relativePath, baseUrl).pathname;
             } catch (e) {
                 console.error("URL constructor failed, falling back to simple path join:", e);
                 return BASE_PATH + relativePath; // Fallback
             }

         }
     }


    // --- Check if on Home Page ---
    function isHomePage() {
        const path = window.location.pathname;
        // Check for root index.html or just the root path /
        // Or /repo-name/ or /repo-name/index.html for GitHub Pages
        return path === '/' || path.endsWith('/index.html') || /^\/[^\/.]+\/?$/.test(path) || /^\/[^\/.]+\/index\.html$/.test(path);
     }
     console.log("Is Home Page?", isHomePage());


    // --- "Xem thêm" Button Logic ---
    if (isHomePage()) {
        const xemThemButton = document.getElementById('xem-them');
        const truyenAnSection = document.getElementById('truyen-an');
        if (xemThemButton && truyenAnSection) {
            xemThemButton.addEventListener('click', function() {
                console.log("Xem thêm button clicked"); // Debug
                truyenAnSection.style.display = 'block';
                this.style.display = 'none';
            });
        } else {
            console.warn("Xem thêm button or section not found on home page."); // More informative warning
        }
    }

    // --- Navigation Loading ---
    const navigationPlaceholder = document.getElementById('navigation');
    if (navigationPlaceholder) {
        // Determine the correct path to navigation.html relative TO THE CURRENT FILE (script.js)
        // This path is *always* the same relative to script.js, regardless of where index.html is.
        // Assuming script.js is in JS/, and navigation.html is in HTML/
        const navFileRelativePath = '../HTML/navigation.html'; // Path from JS/script.js to HTML/navigation.html

        console.log("Attempting to fetch navigation from:", navFileRelativePath);

        fetch(navFileRelativePath)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}, tried to fetch: ${navFileRelativePath}`);
                }
                return response.text();
            })
            .then(data => {
                console.log("Navigation HTML fetched successfully.");
                navigationPlaceholder.innerHTML = data;

                // --- Re-attach logic that depends on navigation elements ---
                // Note: Paths inside the *fetched* navigation.html are relative to *its* location (HTML/)
                // But paths we set *here* in JS need to be relative to the *current page*.

                const loginButtonContainer = navigationPlaceholder.querySelector(".btn-login") || navigationPlaceholder.querySelector(".user-icon-container");
                if (loginButtonContainer) {
                    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
                    const userName = localStorage.getItem("userName");

                    // Calculate paths relative to the *current page* using BASE_PATH
                    let userPagePath, loginPagePath, homePagePath;

                    if (isHomePage()) { // We are at the root
                        userPagePath = 'HTML/user.html';
                        loginPagePath = 'HTML/login.html';
                        homePagePath = 'index.html'; // Link to root index
                    } else if (BASE_PATH === '../') { // We are inside HTML/
                        userPagePath = 'user.html';   // Already in HTML
                        loginPagePath = 'login.html';  // Already in HTML
                        homePagePath = '../index.html'; // Go up to root index
                    } else { // Assume deeper path like TRUYEN/
                        // Adjust based on actual depth if needed
                        userPagePath = '../../HTML/user.html';
                        loginPagePath = '../../HTML/login.html';
                        homePagePath = '../../index.html';
                    }
                     console.log("Paths set for user:", { userPagePath, loginPagePath, homePagePath });


                    if (isLoggedIn) {
                        // (Keep the existing logic for displaying user icon and dropdown)
                        loginButtonContainer.innerHTML = '';
                        loginButtonContainer.className = 'user-icon-container';
                        loginButtonContainer.removeAttribute('href');

                        const iconButton = document.createElement('span');
                        iconButton.className = 'user-icon-button';
                        iconButton.innerHTML = '<i class="bx bxs-user"></i>';

                        const dropdownMenu = document.createElement('div');
                        dropdownMenu.className = 'user-menu-dropdown';
                        // Use the calculated paths
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
                                window.location.href = homePagePath; // Use calculated home path
                            });
                        }
                    } else {
                        // (Keep the existing logic for displaying login button)
                        loginButtonContainer.className = 'btn-login';
                        loginButtonContainer.textContent = 'Đăng Nhập';
                        loginButtonContainer.href = loginPagePath; // Use calculated login path
                    }
                } else {
                    console.error("Could not find login button/user icon container in fetched navigation.");
                }

                // --- Search and Category Dropdown Logic (Check paths inside navigation.html itself) ---
                // The JS logic here just handles interaction, the *values* in the <option> tags
                // inside navigation.html must point correctly *relative to the HTML folder*.

                const theLoaiSelect = navigationPlaceholder.querySelector('#the-loai');
                if (theLoaiSelect) {
                    theLoaiSelect.addEventListener('change', function() {
                        if (this.value) {
                            // Value should be like "hanh-dong.html". Construct full path *relative to current page*
                            let targetPath;
                            if (isHomePage()){
                                targetPath = 'HTML/' + this.value;
                            } else if (BASE_PATH === '../') { // Inside HTML/
                                targetPath = this.value; // Already relative within HTML/
                            } else { // Deeper
                                targetPath = BASE_PATH + 'HTML/' + this.value; // e.g., ../../HTML/hanh-dong.html
                            }
                            console.log("Navigating to category:", targetPath);
                            window.location.href = targetPath;
                        }
                    });
                } else {
                     console.warn("Category select '#the-loai' not found in navigation.");
                }

                const loaiTruyenSelect = navigationPlaceholder.querySelector('.search-container select[name="loaitruyen"]');
                 if (loaiTruyenSelect) {
                     loaiTruyenSelect.addEventListener('change', function() {
                         if (this.value) {
                              // Value should be like "oneshot.html". Construct full path *relative to current page*
                             let targetPath;
                             if (isHomePage()){
                                 targetPath = 'HTML/' + this.value;
                             } else if (BASE_PATH === '../') { // Inside HTML/
                                 targetPath = this.value; // Already relative within HTML/
                             } else { // Deeper
                                 targetPath = BASE_PATH + 'HTML/' + this.value; // e.g., ../../HTML/oneshot.html
                             }
                             console.log("Navigating to type:", targetPath);
                             window.location.href = targetPath;
                         }
                     });
                 } else {
                     console.warn("Story type select not found in navigation.");
                 }

                const searchForm = navigationPlaceholder.querySelector('.search-container form');
                const searchInput = navigationPlaceholder.querySelector('.search-container input[name="q"]');
                const searchButton = navigationPlaceholder.querySelector('.search-container button[type="submit"]');

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

                        // Action should be "search-results.html" (relative to HTML/)
                        const targetAction = searchForm.getAttribute('action');
                        if (!targetAction) {
                            alert("Lỗi: Không thể xác định trang kết quả tìm kiếm.");
                            return;
                        }

                        // Construct full path to search results relative to *current page*
                        let searchResultPageUrl;
                         if (isHomePage()){
                            searchResultPageUrl = 'HTML/' + targetAction;
                         } else if (BASE_PATH === '../') { // Inside HTML/
                            searchResultPageUrl = targetAction; // Already relative within HTML/
                         } else { // Deeper
                            searchResultPageUrl = BASE_PATH + 'HTML/' + targetAction;
                         }

                        const finalSearchUrl = `${searchResultPageUrl}?q=${encodeURIComponent(searchTerm)}`;
                        console.log("Navigating to search results:", finalSearchUrl);
                        window.location.href = finalSearchUrl;
                    });
                } else {
                    console.error("Search form elements not found in navigation.");
                }

            })
            .catch(error => {
                console.error("Error loading navigation:", error); // Log the error
                navigationPlaceholder.innerHTML = `<p style="color:red; text-align:center; border: 1px solid red; padding: 10px;">Lỗi tải thanh điều hướng: ${error.message}. Vui lòng kiểm tra Console (F12) và đường dẫn fetch.</p>`;
            });
    } else {
        console.error("Navigation placeholder '#navigation' not found.");
    }

    // --- Slideshow Logic ---
    let slideIndex = 1;
    let slideInterval;
    const slideshowContainer = document.querySelector('.slideshow-container'); // Find it globally

    function showSlides(n) {
        // Check if slideshowContainer exists *before* using it
        if (!slideshowContainer) {
            // console.warn("Slideshow container not found when trying to show slides.");
            return;
        }
        let slides = slideshowContainer.getElementsByClassName("mySlides");
        let dots = document.getElementsByClassName("dot"); // Dots might be outside container
        if (slides.length === 0) {
            // console.warn("No slides found inside the slideshow container.");
            return; // Exit if no slides
        }

        if (n > slides.length) { slideIndex = 1 }
        if (n < 1) { slideIndex = slides.length }

        for (let i = 0; i < slides.length; i++) {
            slides[i].style.display = "none";
        }
        // Check if dots exist before trying to modify
        if (dots && dots.length > 0) {
             for (let i = 0; i < dots.length; i++) {
                dots[i].className = dots[i].className.replace(" active", "");
            }
            // Check index bounds for dots
             if (dots[slideIndex - 1]) {
                dots[slideIndex - 1].className += " active";
            }
        }


        // Check index bounds for slides
        if (slides[slideIndex - 1]) {
             slides[slideIndex - 1].style.display = "block";
        } else {
             console.error(`Slide index ${slideIndex-1} is out of bounds.`);
        }

    }

    function plusSlides(n) {
        stopSlideShow(); // Stop first
        showSlides(slideIndex += n);
        startSlideShow(); // Restart
    }

    function currentSlide(n) {
        stopSlideShow();
        showSlides(slideIndex = n);
        startSlideShow();
    }

    function startSlideShow() {
        // Check container and slides again before starting interval
         if (!slideshowContainer || slideshowContainer.getElementsByClassName("mySlides").length === 0) {
              console.warn("Cannot start slideshow - container or slides missing.");
              return;
          }
        stopSlideShow(); // Clear any existing interval
        console.log("Starting slideshow timer"); // Debug
        slideInterval = setInterval(() => {
            // console.log("Slideshow timer tick"); // Debug timer
            showSlides(slideIndex += 1);
        }, 3000); // 3 seconds interval
    }

    function stopSlideShow() {
         console.log("Stopping slideshow timer"); // Debug
        clearInterval(slideInterval);
    }

    // Make slideshow functions globally accessible for onclick handlers
    window.plusSlides = plusSlides;
    window.currentSlide = currentSlide;

    // --- Window Load Event ---
    window.addEventListener('load', () => {
        console.log("Window loaded."); // Debug

        // Start slideshow only if on home page AND container exists
        if (isHomePage() && slideshowContainer) {
            console.log("Initializing slideshow on home page."); // Debug
            showSlides(slideIndex); // Show initial slide
            startSlideShow();       // Start automatic cycling
            // Add hover effects
            slideshowContainer.addEventListener('mouseenter', stopSlideShow);
            slideshowContainer.addEventListener('mouseleave', startSlideShow);
        } else if (isHomePage()) {
             console.warn("Slideshow container not found on home page during load event.");
        }


        // Preloader logic (should be less affected by paths, but good to keep)
        const preloader = document.getElementById('preloader');
        if (preloader) {
            console.log("Hiding preloader."); // Debug
            preloader.style.opacity = '0';
            preloader.addEventListener('transitionend', () => {
                preloader.style.display = 'none';
            }, { once: true });
            // Fallback timeout
             setTimeout(() => {
                 if (preloader.style.display !== 'none'){
                     preloader.style.display = 'none';
                 }
             }, 600); // Slightly longer timeout just in case
        }
    });

    // --- Helper to close user dropdown ---
    function closeOtherDropdowns(currentDropdown = null) {
        const allActiveDropdowns = document.querySelectorAll('.user-menu-dropdown.active');
        allActiveDropdowns.forEach(dropdown => {
            if (dropdown !== currentDropdown) {
                dropdown.classList.remove('active');
            }
        });
    }

    // Close dropdown if clicking outside
    document.addEventListener('click', function(event) {
        const clickedInsideUserIcon = event.target.closest('.user-icon-container');
        if (!clickedInsideUserIcon) {
            closeOtherDropdowns();
        }
    });

    console.log("script.js executed."); // Final debug message

})(); // End of IIFE

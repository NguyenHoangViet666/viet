// --- START OF FILE u-pro.js ---

document.addEventListener('DOMContentLoaded', () => {
    // ... (1. Kiểm tra đăng nhập, 1.1 Admin Check, 1.2 Add Class - KEEP AS IS) ...
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn !== 'true') {
        console.warn("Người dùng chưa đăng nhập. Chuyển hướng đến login.html");
        alert("Vui lòng đăng nhập để truy cập trang cá nhân.");
        window.location.href = 'login.html';
        return;
    }
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    console.log("Vai trò Admin:", isAdmin);
    if (isAdmin) {
        document.body.classList.add('user-is-admin');
        console.log("Đã thêm class 'user-is-admin' vào body.");
    }

    // --- Elements (KEEP AS IS) ---
    const usernameDisplay = document.getElementById('username-display');
    const logoutButton = document.getElementById('logout-button');
    const mainContentArea = document.querySelector('.main-content');
    const sidebarLinks = document.querySelectorAll('.nav-section ul li a[data-section]');
    const settingsList = document.querySelector('.settings ul');

    // --- 2. Hiển thị tên người dùng (KEEP AS IS) ---
    const storedUsername = localStorage.getItem('userName');
    if (usernameDisplay) {
        usernameDisplay.textContent = storedUsername ? `${storedUsername}${isAdmin ? ' (Admin)' : ''}` : "Người dùng";
    } else {
        console.error("Không tìm thấy phần tử #username-display.");
    }

    // --- 3. Xử lý nút Đăng xuất (KEEP AS IS) ---
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            console.log("Nút đăng xuất được nhấn.");
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userName');
            localStorage.removeItem('isAdmin');
            console.log("Đã xóa trạng thái Admin (nếu có) khỏi localStorage.");
            alert('Bạn đã đăng xuất thành công.');
            window.location.href = '../index.html';
        });
    } else {
        console.error("Không tìm thấy phần tử #logout-button.");
    }

    // --- 3.1 THÊM MỤC MENU CHO ADMIN (KEEP AS IS, but ensure addEventListenersToLinks is called correctly) ---
    let allSidebarLinks = sidebarLinks; // Start with existing links
    if (isAdmin && settingsList) {
        const adminMenuItem = document.createElement('li');
        adminMenuItem.classList.add('admin-only-item');
        adminMenuItem.innerHTML = `<a href="#" data-section="admin-management"><i class='bx bxs-shield-alt-2'></i> Quản lý (Admin)</a>`;
        settingsList.appendChild(adminMenuItem);
        console.log("Đã thêm mục menu Quản lý (Admin).");
        // Query again to include the new admin link
        allSidebarLinks = document.querySelectorAll('.nav-section ul li a[data-section]');
    }

    // Add listeners AFTER potential admin menu addition
    addEventListenersToLinks(allSidebarLinks);


    // --- Constants for LocalStorage Keys ---
    const SAVED_STORIES_KEY = 'userSavedStories';
    const LIKED_STORIES_KEY = 'userLikedStories';

    // --- Helper to get stored list (Avoid code duplication) ---
    function getStoredList(key) {
        const storedJson = localStorage.getItem(key);
        let list = [];
        if (storedJson) {
            try {
                list = JSON.parse(storedJson);
                 if (!Array.isArray(list)) list = []; // Ensure array
            } catch (error) {
                console.error(`Lỗi phân tích cú pháp ${key}:`, error);
                 list = []; // Reset on error
            }
        }
        return list;
    }

    // --- 4. Function to generate Saved Stories HTML (Updated: Use helper, key constant) ---
    function getSavedStoriesHTML() {
        const savedItems = getStoredList(SAVED_STORIES_KEY);
        let html = '<h2><i class="bx bx-bookmark"></i> Truyện đã lưu</h2>';
        const _isAdmin = localStorage.getItem('isAdmin') === 'true'; // Re-check admin status

        if (savedItems && savedItems.length > 0) {
            html += '<ul class="content-list saved-list">'; // Add class for specific styling/selection
            savedItems.forEach((item, index) => {
                // Ensure item structure is valid before accessing properties
                if (item && typeof item === 'object') {
                    const url = item.url || '#';
                    const title = item.title || 'Truyện không tên';
                    // Use item.id directly, fallback needed if id is missing in older data
                    const storyId = item.id || `saved-item-${index}`; // Fallback using index

                    html += `<li>
                               <a href="${url}" title="ID: ${storyId}">${title}</a>`;
                    if (_isAdmin) {
                        html += ` <button class="admin-delete-button" data-list-key="${SAVED_STORIES_KEY}" data-story-id="${storyId}" title="Xóa truyện này khỏi danh sách Lưu (Admin)">Xóa</button>`;
                    }
                    html += `</li>`;
                } else {
                     console.warn("Found invalid item in saved stories list:", item);
                     // Optionally add placeholder or skip
                     html += `<li>Mục không hợp lệ trong danh sách đã lưu.</li>`;
                }
            });
            html += '</ul>';
        } else {
            html += '<p>Chưa có truyện nào được lưu.</p>';
        }
        return html;
    }

    // --- 5. Function to generate Read History HTML (Placeholder - Keep as is) ---
    function getReadHistoryHTML() {
        let html = '<h2><i class="bx bx-history"></i> Lịch sử đọc</h2>';
        html += '<p>Chức năng xem lịch sử đọc hiện chưa được triển khai.</p>';
        return html;
    }

    // --- 6. Function to generate Liked Stories HTML (<<< NEW/UPDATED >>>) ---
    function getLikedStoriesHTML() {
        const likedItems = getStoredList(LIKED_STORIES_KEY); // Use helper
        let html = '<h2><i class="bx bx-heart"></i> Truyện đã thích</h2>';
        const _isAdmin = localStorage.getItem('isAdmin') === 'true'; // Re-check admin status

        if (likedItems && likedItems.length > 0) {
            html += '<ul class="content-list liked-list">'; // Add class for specific styling/selection
            likedItems.forEach((item, index) => {
                 // Ensure item structure is valid
                if (item && typeof item === 'object') {
                    const url = item.url || '#';
                    const title = item.title || 'Truyện không tên';
                    const storyId = item.id || `liked-item-${index}`; // Fallback using index

                    html += `<li>
                               <a href="${url}" title="ID: ${storyId}">${title}</a>`;
                    if (_isAdmin) {
                        // Use the LIKED_STORIES_KEY in data attribute
                        html += ` <button class="admin-delete-button" data-list-key="${LIKED_STORIES_KEY}" data-story-id="${storyId}" title="Xóa truyện này khỏi danh sách Thích (Admin)">Xóa</button>`;
                    }
                    html += `</li>`;
                } else {
                    console.warn("Found invalid item in liked stories list:", item);
                    html += `<li>Mục không hợp lệ trong danh sách đã thích.</li>`;
                }
            });
            html += '</ul>';
        } else {
            html += '<p>Chưa có truyện nào được thích.</p>';
        }
        return html;
    }

    // --- 7. Function to generate Settings HTML (KEEP AS IS) ---
    function getSettingsHTML(section) {
        let html = '';
        // Add actual forms here later if needed
        switch (section) {
            case 'change-password':
                html = `<h2><i class='bx bx-lock-alt'></i> Đổi mật khẩu</h2>
                        <form id="change-password-form">
                          <div class="form-group">
                            <label for="current-password">Mật khẩu hiện tại</label>
                            <input type="password" id="current-password" name="current-password" required>
                          </div>
                          <div class="form-group">
                            <label for="new-password">Mật khẩu mới</label>
                            <input type="password" id="new-password" name="new-password" required>
                          </div>
                          <div class="form-group">
                            <label for="confirm-password">Xác nhận mật khẩu mới</label>
                            <input type="password" id="confirm-password" name="confirm-password" required>
                          </div>
                          <button type="submit">Lưu thay đổi</button>
                          <p style="font-style: italic; margin-top: 10px;">Yêu cầu Backend.</p>
                        </form>`;
                break;
            case 'update-profile':
                 html = `<h2><i class='bx bx-user'></i> Cập nhật hồ sơ</h2>
                         <form id="update-profile-form">
                           <div class="form-group">
                             <label for="profile-email">Email</label>
                             <input type="email" id="profile-email" name="profile-email" value="${localStorage.getItem('userEmail') || ''}" disabled>
                             <small>Không thể thay đổi email (cần Backend).</small>
                           </div>
                           <div class="form-group">
                             <label for="profile-username">Tên hiển thị</label>
                             <input type="text" id="profile-username" name="profile-username" value="${localStorage.getItem('userName') || ''}">
                           </div>
                           <div class="form-group">
                             <label for="profile-avatar">Ảnh đại diện</label>
                             <input type="file" id="profile-avatar" name="profile-avatar" accept="image/*">
                           </div>
                           <button type="submit">Lưu thay đổi</button>
                           <p style="font-style: italic; margin-top: 10px;">Yêu cầu Backend.</p>
                         </form>`;
                 break;
            case 'notifications':
                 html = `<h2><i class='bx bx-bell'></i> Thông báo</h2>
                         <form id="notifications-form">
                            <p>Quản lý cài đặt thông báo của bạn (Yêu cầu Backend).</p>
                            <div class="form-group">
                                <label>
                                    <input type="checkbox" name="email-new-chapter" checked>
                                    Nhận email khi có chương mới của truyện đã lưu
                                </label>
                            </div>
                            <div class="form-group">
                                <label>
                                    <input type="checkbox" name="email-updates">
                                    Nhận email về cập nhật và tin tức từ BetoBook
                                </label>
                            </div>
                            <button type="submit">Lưu cài đặt</button>
                         </form>`;
                 break;
            default: html = '<h2>Lỗi</h2><p>Không tìm thấy mục cài đặt này.</p>';
        }
        return html;
    }


    // --- 7.1 Function to generate Admin Management HTML (KEEP AS IS) ---
    function getAdminManagementHTML() {
        // ... (keep existing admin management HTML) ...
        let html = `
            <h2><i class='bx bxs-shield-alt-2'></i> Quản lý (Admin)</h2>
            <p>Đây là khu vực dành cho quản trị viên.</p>
            <div class="admin-section">
                <h3>Quản lý Người dùng</h3>
                <p>Chức năng thêm, sửa, xóa người dùng sẽ được hiển thị ở đây.</p>
                <button disabled>Thêm User (Chưa hoạt động)</button>
                 <p style="font-style: italic;">Yêu cầu Backend.</p>
            </div>
            <div class="admin-section" style="margin-top: 20px;">
                <h3>Quản lý Truyện</h3>
                <p>Chức năng quản lý danh sách truyện, phê duyệt, xóa truyện...</p>
                 <button disabled>Quản lý Truyện (Chưa hoạt động)</button>
                 <p style="font-style: italic;">Yêu cầu Backend.</p>
            </div>
        `;
        return html;
    }

    // --- 8. Function to Update Main Content (Updated: Add 'liked-stories' case) ---
    function updateMainContent(sectionId) {
        if (!mainContentArea) { console.error("Không tìm thấy khu vực .main-content"); return; }

        let contentHTML = '';
        console.log(`Updating content for section: ${sectionId}`);

        switch (sectionId) {
            case 'saved-stories': contentHTML = getSavedStoriesHTML(); break;
            case 'read-history': contentHTML = getReadHistoryHTML(); break;
            case 'liked-stories': contentHTML = getLikedStoriesHTML(); break; // <<< ADDED CASE
            case 'change-password':
            case 'update-profile':
            case 'notifications': contentHTML = getSettingsHTML(sectionId); break;
            case 'admin-management':
                if (isAdmin) { contentHTML = getAdminManagementHTML(); }
                else { contentHTML = '<h2>Lỗi</h2><p>Bạn không có quyền truy cập mục này.</p>'; }
                break;
            default:
                // Load saved stories by default if sectionId is unknown or null
                if (!sectionId) sectionId = 'saved-stories'; // Default to saved stories
                if (sectionId === 'saved-stories') {
                     contentHTML = getSavedStoriesHTML();
                } else {
                     contentHTML = `<h2>Chào mừng ${storedUsername || 'bạn'}!</h2><p>Chọn một mục từ menu bên trái.</p>`;
                     console.warn(`Section ID "${sectionId}" chưa được xử lý hoặc là default view.`);
                }
        }

        mainContentArea.innerHTML = contentHTML;
        attachDynamicEventListeners(sectionId); // Attach listeners AFTER content is set
    }

    // --- 8.1 Function to attach dynamic listeners (Updated: Handle admin delete for both lists) ---
    function attachDynamicEventListeners(sectionId) {
        // Listeners for forms (Keep as is)
        if (sectionId === 'change-password') { /* ... form listener ... */ }
        if (sectionId === 'update-profile') { /* ... form listener ... */ }
        if (sectionId === 'notifications') { /* ... form listener ... */ }

        // --- Listener cho NÚT XÓA ADMIN (cho cả Saved và Liked) ---
        // Check if the current section is one that might contain delete buttons AND if user is admin
        if (isAdmin && (sectionId === 'saved-stories' || sectionId === 'liked-stories')) {
            // Select buttons ONLY within the current active list (saved-list or liked-list)
            const deleteButtons = mainContentArea.querySelectorAll(`.content-list .admin-delete-button`);

            deleteButtons.forEach(button => {
                // Prevent attaching multiple listeners if updateMainContent is called rapidly
                if (button.dataset.listenerAttached === 'true') return;

                button.addEventListener('click', (e) => {
                    const storyIdToDelete = e.target.getAttribute('data-story-id');
                    const listKey = e.target.getAttribute('data-list-key'); // Get which list to modify (SAVED_STORIES_KEY or LIKED_STORIES_KEY)
                    const listName = listKey === SAVED_STORIES_KEY ? 'đã lưu' : 'đã thích'; // For confirmation message

                    if (!listKey || !storyIdToDelete) {
                        console.error("Nút xóa thiếu data-list-key hoặc data-story-id.");
                        return;
                    }

                    if (confirm(`(Admin) Bạn có chắc muốn xóa truyện (ID: ${storyIdToDelete}) khỏi danh sách ${listName} của người dùng này không? (Chỉ xóa khỏi trình duyệt này)`)) {
                        console.log(`Admin yêu cầu xóa truyện ${storyIdToDelete} khỏi danh sách ${listKey}`);

                        // --- Logic xóa khỏi localStorage (Front-end demo) ---
                        const currentList = getStoredList(listKey); // Get the correct list using the key
                        // Filter out the item to delete based on its ID
                        const updatedList = currentList.filter(item => item && item.id !== storyIdToDelete);

                        // Save the updated list back to localStorage
                        localStorage.setItem(listKey, JSON.stringify(updatedList));
                        console.log(`Đã cập nhật danh sách ${listKey} trong localStorage.`);

                        // Reload the current section to reflect the change
                        updateMainContent(sectionId);
                        alert(`Đã xóa truyện ${storyIdToDelete} khỏi danh sách ${listName}.`);
                        // ----------------------------------------------------
                    }
                });
                button.dataset.listenerAttached = 'true'; // Mark as attached
            });
            console.log(`Đã gắn listener cho ${deleteButtons.length} nút xóa admin trong section '${sectionId}'.`);
        }
        // --- End Admin Delete Listener ---

        // Add listeners for other dynamic elements if needed
    }


    // --- 9. Add Click Event Listeners to Sidebar Links (Keep mostly as is, uses allSidebarLinks) ---
     function addEventListenersToLinks(linksNodeList) {
         linksNodeList.forEach(link => {
            if (link.dataset.listenerAttached === 'true') return;

            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');

                 // Use the potentially updated allSidebarLinks NodeList
                 const allLinks = document.querySelectorAll('.nav-section ul li a[data-section]');
                 allLinks.forEach(l => l.classList.remove('active'));

                link.classList.add('active');
                updateMainContent(section); // Call update with the section id
            });
             link.dataset.listenerAttached = 'true';
         });
         console.log(`Đã gắn/cập nhật listener cho ${linksNodeList.length} link sidebar.`);
    }

    // --- 10. Initial Content Load (Keep as is - defaults to saved-stories) ---
    // Determine initial section from URL hash or default
    let initialSection = window.location.hash.substring(1) || 'saved-stories';
    updateMainContent(initialSection);

    // Highlight the correct sidebar link on initial load
     const activeLink = document.querySelector(`.nav-section ul li a[data-section="${initialSection}"]`);
     if (activeLink) {
         // Remove active from all first
         document.querySelectorAll('.nav-section ul li a[data-section]').forEach(l => l.classList.remove('active'));
         activeLink.classList.add('active');
     }


    console.log("u-pro.js loaded and interactions enabled.");

}); // Kết thúc DOMContentLoaded
// --- END OF FILE u-pro.js ---

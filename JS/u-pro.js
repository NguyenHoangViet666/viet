document.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn !== 'true') {
        alert("Vui lòng đăng nhập để truy cập trang cá nhân.");
        window.location.href = 'login.html';
        return;
    }
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    if (isAdmin) document.body.classList.add('user-is-admin');
    const storedUsername = localStorage.getItem('userName');

    const usernameDisplay = document.getElementById('username-display');
    const logoutButton = document.getElementById('logout-button');
    const mainContentArea = document.querySelector('.main-content');
    const sidebarLinks = document.querySelectorAll('.nav-section ul li a[data-section]');
    const settingsList = document.querySelector('.settings ul');

    if (usernameDisplay) {
        usernameDisplay.textContent = storedUsername ? `${storedUsername}${isAdmin ? ' (Admin)' : ''}` : "Người dùng";
    }
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userName');
            localStorage.removeItem('isAdmin');
            alert('Bạn đã đăng xuất thành công.');
            window.location.href = '../index.html';
        });
    }

    let allSidebarLinks = sidebarLinks;
    if (isAdmin && settingsList && !settingsList.querySelector('a[data-section="admin-management"]')) {
        const adminMenuItem = document.createElement('li');
        adminMenuItem.classList.add('admin-only-item');
        adminMenuItem.innerHTML = `<a href="#" data-section="admin-management"><i class='bx bxs-shield-alt-2'></i> Quản lý (Admin)</a>`;
        settingsList.appendChild(adminMenuItem);
        allSidebarLinks = document.querySelectorAll('.nav-section ul li a[data-section]');
    }
    addEventListenersToLinks(allSidebarLinks);

    const SAVED_STORIES_KEY = 'userSavedStories';
    const LIKED_STORIES_KEY = 'userLikedStories';
    const ADMIN_USERS_KEY = 'adminDemoUsers';
    const ADMIN_STORIES_KEY = 'adminDemoStories';

    function getStoredList(key) {
        const storedJson = localStorage.getItem(key);
        let list = [];
        if (storedJson) {
            try {
                list = JSON.parse(storedJson);
                 if (!Array.isArray(list)) list = [];
            } catch (error) {
                 list = [];
            }
        }
        return list;
    }
    function saveStoredList(key, list) {
        try {
            localStorage.setItem(key, JSON.stringify(list));
        } catch (e) {
            console.error(`Error saving to localStorage key "${key}":`, e);
            alert("Lỗi: Không thể lưu dữ liệu vào bộ nhớ cục bộ.");
        }
    }

    function initializeAdminData() {
        if (!localStorage.getItem(ADMIN_USERS_KEY)) {
            const sampleUsers = [
                { id: 'user001', username: 'user_a', email: 'user_a@example.com', isAdmin: false, createdAt: Date.now() - 200000000 },
                { id: 'user002', username: 'admin_main', email: 'admin@example.com', isAdmin: true, createdAt: Date.now() - 500000000 },
                { id: 'user003', username: 'test_user', email: 'test@sample.org', isAdmin: false, createdAt: Date.now() - 10000000 },
            ];
            saveStoredList(ADMIN_USERS_KEY, sampleUsers);
        }
        if (!localStorage.getItem(ADMIN_STORIES_KEY)) {
            const sampleStories = [
                { id: 'truyen_01', title: '5 cm trên giây', author: 'Shinkai Makoto', genre: 'Tình cảm', status: 'Hoàn thành', chapterCount: 1, url: '../TRUYEN/TRUYEN01/trang_truyen_1.html' },
                { id: 'truyen_02', title: 'Your Name', author: 'Shinkai Makoto', genre: 'Tình cảm, Giả tưởng', status: 'Hoàn thành', chapterCount: 5, url: '#' },
                { id: 'truyen_03', title: 'Truyện Demo Khác', author: 'Tác giả Demo', genre: 'Hành động', status: 'Đang tiến hành', chapterCount: 15, url: '#' },
            ];
            saveStoredList(ADMIN_STORIES_KEY, sampleStories);
        }
    }
    if(isAdmin) initializeAdminData();

    function getSavedStoriesHTML() {
        const savedItems = getStoredList(SAVED_STORIES_KEY);
        let html = '<h2><i class="bx bx-bookmark"></i> Truyện đã lưu</h2>';
        const _isAdmin = isAdmin;

        if (savedItems && savedItems.length > 0) {
            html += '<ul class="content-list saved-list">';
            savedItems.forEach((item) => {
                if (item && typeof item === 'object') {
                    const url = item.url || '#';
                    const title = item.title || 'Truyện không tên';
                    const storyId = item.id;
                    html += `<li>
                               <a href="${url}" title="ID: ${storyId}">${title}</a>`;
                    html += `</li>`;
                } else {
                    html += `<li>Mục không hợp lệ.</li>`;
                }
            });
            html += '</ul>';
        } else {
            html += '<p>Chưa có truyện nào được lưu.</p>';
        }
        return html;
    }

    function getLikedStoriesHTML() {
        const likedItems = getStoredList(LIKED_STORIES_KEY);
        let html = '<h2><i class="bx bx-heart"></i> Truyện đã thích</h2>';
        const _isAdmin = isAdmin;

        if (likedItems && likedItems.length > 0) {
            html += '<ul class="content-list liked-list">';
            likedItems.forEach((item) => {
                 if (item && typeof item === 'object') {
                    const url = item.url || '#';
                    const title = item.title || 'Truyện không tên';
                    const storyId = item.id;
                    html += `<li>
                               <a href="${url}" title="ID: ${storyId}">${title}</a>`;
                    html += `</li>`;
                } else {
                    html += `<li>Mục không hợp lệ.</li>`;
                }
            });
            html += '</ul>';
        } else {
            html += '<p>Chưa có truyện nào được thích.</p>';
        }
        return html;
    }

    function getSettingsHTML(section) {
        let html = '';
        switch (section) {
            case 'change-password':
                html = `<h2><i class='bx bx-lock-alt'></i> Đổi mật khẩu</h2>
                        <form id="change-password-form">
                          <div class="form-group"> <label for="current-password">Mật khẩu hiện tại</label> <input type="password" id="current-password" required> </div>
                          <div class="form-group"> <label for="new-password">Mật khẩu mới</label> <input type="password" id="new-password" required> </div>
                          <div class="form-group"> <label for="confirm-password">Xác nhận mật khẩu mới</label> <input type="password" id="confirm-password" required> </div>
                          <button type="submit" disabled>Lưu thay đổi</button>
                        </form>`;
                break;
            case 'update-profile':
                 html = `<h2><i class='bx bx-user'></i> Cập nhật hồ sơ</h2>
                         <form id="update-profile-form">
                           <div class="form-group"> <label for="profile-email">Email</label> <input type="email" id="profile-email" value="${localStorage.getItem('userEmail') || ''}" disabled></div>
                           <div class="form-group"> <label for="profile-username">Tên hiển thị</label> <input type="text" id="profile-username" value="${storedUsername || ''}"> </div>
                           <div class="form-group"> <label for="profile-avatar">Ảnh đại diện</label> <input type="file" id="profile-avatar" accept="image/*" disabled> </div>
                           <button type="submit" disabled>Lưu thay đổi</button>
                         </form>`;
                 break;
            case 'notifications':
                 html = `<h2><i class='bx bx-bell'></i> Thông báo</h2>
                         <form id="notifications-form">
                            <div class="form-group"> <label> <input type="checkbox" name="email-new-chapter"> Nhận email khi có chương mới </label> </div>
                            <div class="form-group"> <label> <input type="checkbox" name="email-updates"> Nhận email về cập nhật </label> </div>
                            <button type="submit" disabled>Lưu cài đặt</button>
                         </form>`;
                 break;
            default: html = '<h2>Lỗi</h2><p>Không tìm thấy mục cài đặt này.</p>';
        }
        return html;
    }

    function getAdminManagementHTML() {
        let html = `
            <h2><i class='bx bxs-shield-alt-2'></i> Quản lý (Admin)</h2>

            <!-- === User Management Section === -->
            <div class="admin-section user-management" style="margin-bottom: 40px;">
                <h3><i class='bx bxs-user-account'></i> Quản lý Người dùng</h3>
                <div class="admin-actions">
                    <input type="text" id="admin-user-search" placeholder="Tìm theo tên hoặc email..." style="margin-right: 10px;">
                    <button id="admin-user-search-btn"><i class='bx bx-search'></i> Tìm</button>
                    <button id="admin-user-add-btn" style="margin-left: 20px;"><i class='bx bx-plus'></i> Thêm người dùng</button>
                </div>

                <form id="admin-user-form" class="admin-form">
                    <input type="hidden" id="user-edit-id">
                    <h4><span id="user-form-title">Thêm người dùng mới</span></h4>
                    <div class="form-group">
                        <label for="user-form-username">Tên đăng nhập:</label>
                        <input type="text" id="user-form-username" required>
                    </div>
                    <div class="form-group">
                        <label for="user-form-email">Email:</label>
                        <input type="email" id="user-form-email" required>
                    </div>
                    <div class="form-group">
                        <label for="user-form-password">Mật khẩu:</label>
                        <input type="password" id="user-form-password">
                    </div>
                    <div class="form-group">
                        <label for="user-form-isAdmin">Vai trò:</label>
                        <select id="user-form-isAdmin">
                            <option value="false">Người dùng (User)</option>
                            <option value="true">Quản trị viên (Admin)</option>
                        </select>
                    </div>
                    <button type="submit" id="user-form-save-btn">Lưu</button>
                    <button type="button" id="user-form-cancel-btn" style="margin-left: 10px;">Hủy</button>
                </form>

                <table id="admin-user-table" class="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tên đăng nhập</th>
                            <th>Email</th>
                            <th>Vai trò</th>
                            <th>Ngày tạo</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody id="admin-user-list">
                        <tr><td colspan="6">Đang tải danh sách người dùng...</td></tr>
                    </tbody>
                </table>
            </div>

            <!-- === Story Management Section === -->
            <div class="admin-section story-management">
                <h3><i class='bx bxs-book-content'></i> Quản lý Truyện</h3>
                 <div class="admin-actions">
                    <input type="text" id="admin-story-search" placeholder="Tìm theo tên hoặc tác giả..." style="margin-right: 10px;">
                    <button id="admin-story-search-btn"><i class='bx bx-search'></i> Tìm</button>
                    <button id="admin-story-add-btn" style="margin-left: 20px;"><i class='bx bx-plus'></i> Thêm truyện mới</button>
                </div>

                 <form id="admin-story-form" class="admin-form">
                    <input type="hidden" id="story-edit-id">
                    <h4><span id="story-form-title">Thêm truyện mới</span></h4>
                    <div class="form-group"> <label for="story-form-title-input">Tên truyện:</label> <input type="text" id="story-form-title-input" required> </div>
                    <div class="form-group"> <label for="story-form-author">Tác giả:</label> <input type="text" id="story-form-author"> </div>
                    <div class="form-group"> <label for="story-form-genre">Thể loại:</label> <input type="text" id="story-form-genre" placeholder="Ví dụ: Tình cảm, Hành động"> </div>
                    <div class="form-group"> <label for="story-form-status">Tình trạng:</label>
                        <select id="story-form-status">
                            <option value="Đang tiến hành">Đang tiến hành</option>
                            <option value="Hoàn thành">Hoàn thành</option>
                            <option value="Tạm dừng">Tạm dừng</option>
                        </select>
                    </div>
                     <div class="form-group"> <label for="story-form-url">URL Trang truyện:</label> <input type="text" id="story-form-url" placeholder="Ví dụ: ../TRUYEN/TRUYEN01/trang_truyen_1.html"> </div>
                     <div class="form-group"> <label for="story-form-chapterCount">Số chương (ước tính):</label> <input type="number" id="story-form-chapterCount" min="0" value="0"> </div>
                    <button type="submit" id="story-form-save-btn">Lưu</button>
                    <button type="button" id="story-form-cancel-btn" style="margin-left: 10px;">Hủy</button>
                 </form>

                <table id="admin-story-table" class="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tên truyện</th>
                            <th>Tác giả</th>
                            <th>Thể loại</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody id="admin-story-list">
                       <tr><td colspan="6">Đang tải danh sách truyện...</td></tr>
                    </tbody>
                </table>
            </div>
        `;
        return html;
    }

    function renderUserList(users) {
        const userListBody = document.getElementById('admin-user-list');
        if (!userListBody) return;
        userListBody.innerHTML = '';

        if (!users || users.length === 0) {
            userListBody.innerHTML = '<tr><td colspan="6">Không tìm thấy người dùng nào.</td></tr>';
            return;
        }

        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${user.isAdmin ? '<strong>Admin</strong>' : 'User'}</td>
                <td>${user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</td>
                <td>
                    <button class="admin-edit-user-btn" data-user-id="${user.id}" title="Sửa"><i class='bx bx-edit'></i></button>
                    <button class="admin-delete-user-btn" data-user-id="${user.id}" title="Xóa"><i class='bx bx-trash'></i></button>
                    <button class="admin-toggle-role-btn" data-user-id="${user.id}" title="${user.isAdmin ? 'Đặt làm User' : 'Đặt làm Admin'}">
                        <i class='bx ${user.isAdmin ? 'bx-user-minus' : 'bx-user-plus'}'></i>
                    </button>
                </td>
            `;
            userListBody.appendChild(row);
        });
        attachAdminUserActionListeners();
    }

     function renderStoryList(stories) {
        const storyListBody = document.getElementById('admin-story-list');
        if (!storyListBody) return;
        storyListBody.innerHTML = '';

        if (!stories || stories.length === 0) {
            storyListBody.innerHTML = '<tr><td colspan="6">Không tìm thấy truyện nào.</td></tr>';
            return;
        }

        stories.forEach(story => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${story.id}</td>
                <td>${story.title}</td>
                <td>${story.author || 'N/A'}</td>
                <td>${story.genre || 'N/A'}</td>
                <td>${story.status || 'N/A'}</td>
                <td>
                    <button class="admin-edit-story-btn" data-story-id="${story.id}" title="Sửa"><i class='bx bx-edit'></i></button>
                    <button class="admin-delete-story-btn" data-story-id="${story.id}" title="Xóa"><i class='bx bx-trash'></i></button>
                    <button disabled title="Quản lý chương"><i class='bx bx-list-ul'></i></button>
                </td>
            `;
            storyListBody.appendChild(row);
        });
        attachAdminStoryActionListeners();
    }

    function updateMainContent(sectionId) {
        if (!mainContentArea) { return; }

        let contentHTML = '';

        switch (sectionId) {
            case 'saved-stories': contentHTML = getSavedStoriesHTML(); break;
            case 'liked-stories': contentHTML = getLikedStoriesHTML(); break;
            case 'change-password':
            case 'update-profile':
            case 'notifications': contentHTML = getSettingsHTML(sectionId); break;
            case 'admin-management':
                if (isAdmin) {
                    contentHTML = getAdminManagementHTML();
                    setTimeout(() => {
                         renderUserList(getStoredList(ADMIN_USERS_KEY));
                         renderStoryList(getStoredList(ADMIN_STORIES_KEY));
                         attachAdminGeneralActionListeners();
                    }, 0);
                }
                else { contentHTML = '<h2>Lỗi</h2><p>Bạn không có quyền truy cập mục này.</p>'; }
                break;
            default:
                if (!sectionId || sectionId === '#') sectionId = 'saved-stories';
                if (sectionId === 'saved-stories') contentHTML = getSavedStoriesHTML();
                else if (sectionId === 'liked-stories') contentHTML = getLikedStoriesHTML();
                else {
                    contentHTML = `<h2>Chào mừng ${storedUsername || 'bạn'}!</h2><p>Chọn một mục từ menu bên trái.</p>`;
                }
        }

        mainContentArea.innerHTML = contentHTML;

        if (['change-password', 'update-profile', 'notifications'].includes(sectionId)) {
             attachStaticFormListeners(sectionId);
        }
    }

    function attachStaticFormListeners(sectionId) {
         const formIdMap = {
             'change-password': 'change-password-form',
             'update-profile': 'update-profile-form',
             'notifications': 'notifications-form'
         };
         const formId = formIdMap[sectionId];
         if (formId) {
             const form = document.getElementById(formId);
             if (form && !form.dataset.listenerAttached) {
                 form.addEventListener('submit', (e) => {
                     e.preventDefault();
                     // No alert needed as buttons are disabled
                 });
                 form.dataset.listenerAttached = 'true';
             }
         }
    }

    function attachAdminGeneralActionListeners() {
        const userSearchBtn = document.getElementById('admin-user-search-btn');
        const userSearchInput = document.getElementById('admin-user-search');
        if (userSearchBtn && userSearchInput && !userSearchBtn.dataset.listenerAttached) {
            userSearchBtn.addEventListener('click', () => {
                const searchTerm = userSearchInput.value.toLowerCase();
                const allUsers = getStoredList(ADMIN_USERS_KEY);
                const filteredUsers = allUsers.filter(u =>
                    u.username.toLowerCase().includes(searchTerm) || u.email.toLowerCase().includes(searchTerm)
                );
                renderUserList(filteredUsers);
            });
            userSearchInput.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') userSearchBtn.click();
            });
            userSearchBtn.dataset.listenerAttached = 'true';
        }

        const storySearchBtn = document.getElementById('admin-story-search-btn');
        const storySearchInput = document.getElementById('admin-story-search');
         if (storySearchBtn && storySearchInput && !storySearchBtn.dataset.listenerAttached) {
             storySearchBtn.addEventListener('click', () => {
                 const searchTerm = storySearchInput.value.toLowerCase();
                 const allStories = getStoredList(ADMIN_STORIES_KEY);
                 const filteredStories = allStories.filter(s =>
                     s.title.toLowerCase().includes(searchTerm) || (s.author && s.author.toLowerCase().includes(searchTerm))
                 );
                 renderStoryList(filteredStories);
             });
             storySearchInput.addEventListener('keyup', (e) => {
                 if (e.key === 'Enter') storySearchBtn.click();
             });
             storySearchBtn.dataset.listenerAttached = 'true';
         }

        const addUserBtn = document.getElementById('admin-user-add-btn');
        const userForm = document.getElementById('admin-user-form');
        const userFormTitle = document.getElementById('user-form-title');
        const userFormPasswordEl = document.getElementById('user-form-password');
        if (addUserBtn && userForm && !addUserBtn.dataset.listenerAttached) {
            addUserBtn.addEventListener('click', () => {
                userForm.reset();
                document.getElementById('user-edit-id').value = '';
                userFormTitle.textContent = 'Thêm người dùng mới';
                 if(userFormPasswordEl) userFormPasswordEl.required = true;
                userForm.style.display = 'block';
            });
            addUserBtn.dataset.listenerAttached = 'true';
        }

         const addStoryBtn = document.getElementById('admin-story-add-btn');
         const storyForm = document.getElementById('admin-story-form');
         const storyFormTitle = document.getElementById('story-form-title');
         if (addStoryBtn && storyForm && !addStoryBtn.dataset.listenerAttached) {
             addStoryBtn.addEventListener('click', () => {
                 storyForm.reset();
                 document.getElementById('story-edit-id').value = '';
                 storyFormTitle.textContent = 'Thêm truyện mới';
                 storyForm.style.display = 'block';
             });
             addStoryBtn.dataset.listenerAttached = 'true';
         }

        const userFormSaveBtn = document.getElementById('user-form-save-btn');
        const userFormCancelBtn = document.getElementById('user-form-cancel-btn');
        if (userForm && userFormSaveBtn && userFormCancelBtn && !userForm.dataset.listenerAttached) {
            userForm.addEventListener('submit', handleUserFormSubmit);
            userFormCancelBtn.addEventListener('click', () => userForm.style.display = 'none');
            userForm.dataset.listenerAttached = 'true';
        }

        const storyFormSaveBtn = document.getElementById('story-form-save-btn');
        const storyFormCancelBtn = document.getElementById('story-form-cancel-btn');
        if (storyForm && storyFormSaveBtn && storyFormCancelBtn && !storyForm.dataset.listenerAttached) {
            storyForm.addEventListener('submit', handleStoryFormSubmit);
            storyFormCancelBtn.addEventListener('click', () => storyForm.style.display = 'none');
            storyForm.dataset.listenerAttached = 'true';
        }
    }

    function attachAdminUserActionListeners() {
        const editUserBtns = document.querySelectorAll('.admin-edit-user-btn');
        const deleteUserBtns = document.querySelectorAll('.admin-delete-user-btn');
        const toggleRoleBtns = document.querySelectorAll('.admin-toggle-role-btn');

        editUserBtns.forEach(btn => {
             if (btn.dataset.listenerAttached) return;
            btn.addEventListener('click', handleEditUserClick);
            btn.dataset.listenerAttached = 'true';
        });
        deleteUserBtns.forEach(btn => {
            if (btn.dataset.listenerAttached) return;
            btn.addEventListener('click', handleDeleteUserClick);
            btn.dataset.listenerAttached = 'true';
        });
        toggleRoleBtns.forEach(btn => {
            if (btn.dataset.listenerAttached) return;
            btn.addEventListener('click', handleToggleUserRoleClick);
            btn.dataset.listenerAttached = 'true';
        });
    }

    function attachAdminStoryActionListeners() {
        const editStoryBtns = document.querySelectorAll('.admin-edit-story-btn');
        const deleteStoryBtns = document.querySelectorAll('.admin-delete-story-btn');

        editStoryBtns.forEach(btn => {
            if (btn.dataset.listenerAttached) return;
            btn.addEventListener('click', handleEditStoryClick);
            btn.dataset.listenerAttached = 'true';
        });
         deleteStoryBtns.forEach(btn => {
            if (btn.dataset.listenerAttached) return;
             btn.addEventListener('click', handleDeleteStoryClick);
             btn.dataset.listenerAttached = 'true';
         });
    }

    function handleUserFormSubmit(e) {
        e.preventDefault();
        const userId = document.getElementById('user-edit-id').value;
        const username = document.getElementById('user-form-username').value.trim();
        const email = document.getElementById('user-form-email').value.trim();
        const password = document.getElementById('user-form-password').value;
        const isAdminRole = document.getElementById('user-form-isAdmin').value === 'true';

        if (!username || !email) {
            alert("Vui lòng nhập tên đăng nhập và email.");
            return;
        }

        let users = getStoredList(ADMIN_USERS_KEY);
        const emailExists = users.some(u => u.email === email && u.id !== userId);
        if (emailExists) {
            alert("Email này đã được sử dụng bởi người dùng khác.");
            return;
        }

        if (userId) {
            const userIndex = users.findIndex(u => u.id === userId);
            if (userIndex > -1) {
                users[userIndex].username = username;
                users[userIndex].email = email;
                users[userIndex].isAdmin = isAdminRole;
                if (password) {
                     users[userIndex].password_demo = password; // Still storing plain text for demo
                }
            }
        } else {
            if (!password) {
                alert("Vui lòng nhập mật khẩu cho người dùng mới.");
                return;
            }
            const newUser = {
                id: 'user' + Date.now(),
                username: username,
                email: email,
                isAdmin: isAdminRole,
                password_demo: password, // Still storing plain text for demo
                createdAt: Date.now()
            };
            users.push(newUser);
        }

        saveStoredList(ADMIN_USERS_KEY, users);
        renderUserList(users);
        document.getElementById('admin-user-form').style.display = 'none';
        document.getElementById('admin-user-form').reset();
        alert(userId ? "Cập nhật người dùng thành công!" : "Thêm người dùng mới thành công!");
    }

    function handleEditUserClick(e) {
        const userId = e.currentTarget.getAttribute('data-user-id');
        const users = getStoredList(ADMIN_USERS_KEY);
        const user = users.find(u => u.id === userId);
        const passwordInput = document.getElementById('user-form-password');

        if (user) {
            const form = document.getElementById('admin-user-form');
            document.getElementById('user-edit-id').value = user.id;
            document.getElementById('user-form-title').textContent = `Sửa người dùng: ${user.username}`;
            document.getElementById('user-form-username').value = user.username;
            document.getElementById('user-form-email').value = user.email;
            document.getElementById('user-form-isAdmin').value = user.isAdmin.toString();
            if(passwordInput) {
                passwordInput.value = '';
                passwordInput.required = false; // Password not required when editing
            }
            form.style.display = 'block';
        }
    }

    function handleDeleteUserClick(e) {
        const userId = e.currentTarget.getAttribute('data-user-id');
        if (confirm(`Bạn có chắc muốn xóa người dùng ID: ${userId} không?`)) {
            let users = getStoredList(ADMIN_USERS_KEY);
            const updatedUsers = users.filter(u => u.id !== userId);
            saveStoredList(ADMIN_USERS_KEY, updatedUsers);
            renderUserList(updatedUsers);
            alert("Đã xóa người dùng.");
        }
    }

     function handleToggleUserRoleClick(e) {
         const userId = e.currentTarget.getAttribute('data-user-id');
         let users = getStoredList(ADMIN_USERS_KEY);
         const userIndex = users.findIndex(u => u.id === userId);

         if (userIndex > -1) {
             const currentRole = users[userIndex].isAdmin;
             const newRole = !currentRole;
             if (confirm(`Bạn có chắc muốn đổi vai trò của user ID: ${userId} thành ${newRole ? 'Admin' : 'User'} không?`)) {
                 users[userIndex].isAdmin = newRole;
                 saveStoredList(ADMIN_USERS_KEY, users);
                 renderUserList(users);
                 alert("Đã đổi vai trò người dùng.");
             }
         }
     }

    function handleStoryFormSubmit(e) {
        e.preventDefault();
        const storyId = document.getElementById('story-edit-id').value;
        const title = document.getElementById('story-form-title-input').value.trim();
        const author = document.getElementById('story-form-author').value.trim();
        const genre = document.getElementById('story-form-genre').value.trim();
        const status = document.getElementById('story-form-status').value;
        const url = document.getElementById('story-form-url').value.trim();
        const chapterCount = parseInt(document.getElementById('story-form-chapterCount').value, 10) || 0;


        if (!title) {
            alert("Vui lòng nhập tên truyện.");
            return;
        }

        let stories = getStoredList(ADMIN_STORIES_KEY);

        if (storyId) {
             const storyIndex = stories.findIndex(s => s.id === storyId);
             if (storyIndex > -1) {
                 stories[storyIndex] = {
                     ...stories[storyIndex],
                     title, author, genre, status, url, chapterCount
                 };
             }
        } else {
            const newStory = {
                id: 'story' + Date.now(),
                title, author, genre, status, url, chapterCount
            };
            stories.push(newStory);
        }

        saveStoredList(ADMIN_STORIES_KEY, stories);
        renderStoryList(stories);
        document.getElementById('admin-story-form').style.display = 'none';
        document.getElementById('admin-story-form').reset();
         alert(storyId ? "Cập nhật truyện thành công!" : "Thêm truyện mới thành công!");
    }

    function handleEditStoryClick(e) {
        const storyId = e.currentTarget.getAttribute('data-story-id');
        const stories = getStoredList(ADMIN_STORIES_KEY);
        const story = stories.find(s => s.id === storyId);

        if (story) {
            const form = document.getElementById('admin-story-form');
            document.getElementById('story-edit-id').value = story.id;
            document.getElementById('story-form-title').textContent = `Sửa truyện: ${story.title}`;
            document.getElementById('story-form-title-input').value = story.title;
            document.getElementById('story-form-author').value = story.author || '';
            document.getElementById('story-form-genre').value = story.genre || '';
            document.getElementById('story-form-status').value = story.status || 'Đang tiến hành';
            document.getElementById('story-form-url').value = story.url || '';
            document.getElementById('story-form-chapterCount').value = story.chapterCount || 0;
            form.style.display = 'block';
        }
    }

    function handleDeleteStoryClick(e) {
        const storyId = e.currentTarget.getAttribute('data-story-id');
        if (confirm(`Bạn có chắc muốn xóa truyện ID: ${storyId} khỏi hệ thống không?`)) {
             let stories = getStoredList(ADMIN_STORIES_KEY);
             const updatedStories = stories.filter(s => s.id !== storyId);
             saveStoredList(ADMIN_STORIES_KEY, updatedStories);
             renderStoryList(updatedStories);
             alert("Đã xóa truyện.");
        }
    }

     function addEventListenersToLinks(linksNodeList) {
         linksNodeList.forEach(link => {
            if (link.dataset.listenerAttached === 'true') return;
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                 const allLinks = document.querySelectorAll('.nav-section ul li a[data-section]');
                 allLinks.forEach(l => l.classList.remove('active'));
                 link.classList.add('active');
                updateMainContent(section);
            });
             link.dataset.listenerAttached = 'true';
         });
    }

    let initialSection = window.location.hash.substring(1);
    if (!initialSection || initialSection === '#') initialSection = 'saved-stories';
    updateMainContent(initialSection);
    const activeLink = document.querySelector(`.nav-section ul li a[data-section="${initialSection}"]`);
    if (activeLink) {
         document.querySelectorAll('.nav-section ul li a[data-section]').forEach(l => l.classList.remove('active'));
         activeLink.classList.add('active');
    } else {
         const defaultLink = document.querySelector('.nav-section ul li a[data-section="saved-stories"]');
         if(defaultLink) defaultLink.classList.add('active');
    }

});

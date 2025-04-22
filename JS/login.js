// --- START OF FILE login.js ---

document.addEventListener('DOMContentLoaded', () => {

    // --- KHÓA LƯU TRỮ CHO USER THƯỜNG ---
    const USERS_STORAGE_KEY = 'betoBookRegisteredUsers'; // Key cho user thường

    // --- HÀM TIỆN ÍCH CHO LOCALSTORAGE (Giữ nguyên) ---
    function getRegisteredUsersFromStorage() {
        const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
        try {
            if (usersJson) { return JSON.parse(usersJson); }
        } catch (error) {
            console.error("Lỗi parse JSON users thường từ localStorage:", error);
            localStorage.removeItem(USERS_STORAGE_KEY);
        }
        return [];
    }

    function saveRegisteredUsersToStorage(usersArray) {
        try {
            const usersJson = JSON.stringify(usersArray);
            localStorage.setItem(USERS_STORAGE_KEY, usersJson);
        } catch (error) {
            console.error("Lỗi stringify JSON users thường để lưu:", error);
            alert("Đã xảy ra lỗi khi lưu dữ liệu người dùng đăng ký.");
        }
    }

    // --- LẤY CÁC PHẦN TỬ DOM (Giữ nguyên) ---
    const container = document.querySelector(".container");
    const registerBtn = document.querySelector(".register-btn");
    const loginBtn = document.querySelector(".login-btn");
    const loginForm = document.querySelector(".form-box.login form");
    const loginUsernameInput = loginForm?.querySelector('input[name="loginUsername"]');
    const loginPasswordInput = loginForm?.querySelector('input[name="loginPassword"]');
    const registerForm = document.querySelector(".form-box.register form");
    const registerUsernameInput = registerForm?.querySelector('input[name="registerUsername"]');
    const registerPasswordInput = registerForm?.querySelector('input[name="registerPassword"]');
    const confirmPasswordInput = registerForm?.querySelector('input[name="confirmPassword"]');

    // Kiểm tra DOM elements (Quan trọng)
    if (!container || !registerBtn || !loginBtn || !loginForm || !loginUsernameInput || !loginPasswordInput || !registerForm || !registerUsernameInput || !registerPasswordInput || !confirmPasswordInput) {
        console.error("Lỗi: Một hoặc nhiều phần tử DOM cần thiết cho login/register không tồn tại!");
        // Có thể thêm thông báo cho người dùng ở đây nếu cần
        return; // Dừng thực thi nếu thiếu phần tử quan trọng
    }

    // --- XỬ LÝ CHUYỂN ĐỔI FORM (Giữ nguyên) ---
    registerBtn.addEventListener('click', () => container.classList.add('active'));
    loginBtn.addEventListener('click', () => container.classList.remove('active'));

    // --- XỬ LÝ SUBMIT FORM ĐĂNG NHẬP (Cập nhật: Thêm isAdmin) ---
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const enteredUsername = loginUsernameInput.value.trim();
        const enteredPassword = loginPasswordInput.value.trim();

        if (!enteredUsername || !enteredPassword) {
            alert("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.");
            return;
        }

        let isLoginSuccessful = false;
        let loggedInUsername = null;
        let isUserAdmin = false; // Biến để đánh dấu admin

        // 1. KIỂM TRA VỚI DANH SÁCH ADMIN (từ users.js)
        if (typeof adminUsers !== 'undefined') {
            for (const admin of adminUsers) {
                if (admin.username === enteredUsername && admin.password === enteredPassword) {
                    isLoginSuccessful = true;
                    loggedInUsername = admin.username;
                    isUserAdmin = true; // Đánh dấu là admin
                    break;
                }
            }
        } else {
            console.warn("Mảng adminUsers chưa được tải hoặc không tồn tại. Bỏ qua kiểm tra admin.");
            // Không nên báo lỗi nghiêm trọng ở đây nếu adminUsers không phải lúc nào cũng có
        }


        // 2. NẾU KHÔNG PHẢI ADMIN, KIỂM TRA VỚI USER THƯỜNG (từ localStorage)
        if (!isLoginSuccessful) {
            const registeredUsers = getRegisteredUsersFromStorage();
            for (const user of registeredUsers) {
                if (user.username === enteredUsername && user.password === enteredPassword) {
                    isLoginSuccessful = true;
                    loggedInUsername = user.username;
                    isUserAdmin = false; // Đánh dấu không phải admin
                    break;
                }
            }
        }

        // Xử lý kết quả đăng nhập
        if (isLoginSuccessful) {
            alert(`Đăng nhập thành công! ${isUserAdmin ? '(Admin)' : ''}`);
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("userName", loggedInUsername);

            // ---> LƯU/XÓA TRẠNG THÁI ADMIN <---
            if (isUserAdmin) {
                localStorage.setItem("isAdmin", "true");
                console.log("Đã lưu trạng thái Admin vào localStorage.");
            } else {
                localStorage.removeItem("isAdmin");
                console.log("Đã xóa trạng thái Admin (nếu có) khỏi localStorage cho user thường.");
            }
            // ------------------------------------

            window.location.href = "/viet/index.html"; // Chuyển hướng sau khi xử lý xong localStorage

        } else {
            alert("Tên đăng nhập hoặc mật khẩu không đúng!");
            // ---> ĐẢM BẢO XÓA KHI LOGIN THẤT BẠI <---
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userName');
            localStorage.removeItem('isAdmin'); // Quan trọng: Xóa cả trạng thái admin
            //----------------------------------------
        }
    });


    // --- XỬ LÝ SUBMIT FORM ĐĂNG KÝ (Cập nhật: Kiểm tra trùng admin) ---
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newUsername = registerUsernameInput.value.trim();
        const newPassword = registerPasswordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();

        // --- KIỂM TRA DỮ LIỆU (Giữ nguyên) ---
        if (!newUsername || !newPassword || !confirmPassword) {
             alert("Vui lòng điền đầy đủ thông tin đăng ký.");
             return;
        }
        if (newPassword !== confirmPassword) {
             alert("Mật khẩu xác nhận không khớp!");
             confirmPasswordInput.focus();
             return;
        }
        // (Thêm kiểm tra độ dài, độ phức tạp mật khẩu nếu cần)

        // 1. KIỂM TRA TRÙNG VỚI ADMIN
        let usernameExists = false;
        if (typeof adminUsers !== 'undefined') {
            usernameExists = adminUsers.some(admin => admin.username.toLowerCase() === newUsername.toLowerCase());
            if (usernameExists) {
               alert(`Tên đăng nhập "${newUsername}" đã được sử dụng bởi quản trị viên. Vui lòng chọn tên khác.`);
               registerUsernameInput.focus();
               return;
            }
        } else {
             console.warn("Mảng adminUsers chưa tải, không thể kiểm tra trùng tên admin khi đăng ký.");
        }


        // 2. KIỂM TRA TRÙNG VỚI USER THƯỜNG (localStorage)
        const registeredUsers = getRegisteredUsersFromStorage();
        usernameExists = registeredUsers.some(user => user.username.toLowerCase() === newUsername.toLowerCase());
        if (usernameExists) {
            alert(`Tên đăng nhập "${newUsername}" đã tồn tại. Vui lòng chọn tên khác.`);
            registerUsernameInput.focus();
            return;
        }

        // --- NẾU KHÔNG TRÙNG VÀ DỮ LIỆU HỢP LỆ ---
        const newUser = { username: newUsername, password: newPassword };
        registeredUsers.push(newUser);
        saveRegisteredUsersToStorage(registeredUsers); // Lưu user thường

        console.log("Đăng ký user thường thành công!:", newUser);
        alert("Đăng ký thành công! Bạn có thể đăng nhập.");
        registerForm.reset();
        container.classList.remove('active'); // Chuyển về form đăng nhập
    });

}); // Kết thúc DOMContentLoaded

// --- END OF FILE login.js ---

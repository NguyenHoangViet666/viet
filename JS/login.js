// --- bắt đầu file login.js ---

document.addEventListener('DOMContentLoaded', () => {

    // --- khóa để lưu danh sách user thường vào localstorage ---
    const USERS_STORAGE_KEY = 'betoBookRegisteredUsers'; // tên khóa

    // --- hàm lấy danh sách user thường từ localstorage ---
    function getRegisteredUsersFromStorage() {
        const usersJson = localStorage.getItem(USERS_STORAGE_KEY); // đọc dữ liệu từ khóa
        try {
            if (usersJson) { return JSON.parse(usersJson); } // chuyển json thành mảng/đối tượng
        } catch (error) {
            console.error("lỗi khi đọc json users thường từ localStorage:", error);
            localStorage.removeItem(USERS_STORAGE_KEY); // xóa nếu dữ liệu lỗi
        }
        return []; // trả về mảng rỗng nếu không có gì hoặc lỗi
    }

    // --- hàm lưu danh sách user thường vào localstorage ---
    function saveRegisteredUsersToStorage(usersArray) {
        try {
            const usersJson = JSON.stringify(usersArray); // chuyển mảng/đối tượng thành json
            localStorage.setItem(USERS_STORAGE_KEY, usersJson); // lưu vào localstorage
        } catch (error) {
            console.error("lỗi khi chuyển json users thường để lưu:", error);
            alert("đã xảy ra lỗi khi lưu dữ liệu người dùng đăng ký.");
        }
    }

    // --- lấy các thẻ html cần thiết ---
    const container = document.querySelector(".container"); // thẻ bao ngoài
    const registerBtn = document.querySelector(".register-btn"); // nút chuyển sang đăng ký
    const loginBtn = document.querySelector(".login-btn"); // nút chuyển sang đăng nhập
    const loginForm = document.querySelector(".form-box.login form"); // form đăng nhập
    const loginUsernameInput = loginForm?.querySelector('input[name="loginUsername"]'); // ô nhập tên đăng nhập (login)
    const loginPasswordInput = loginForm?.querySelector('input[name="loginPassword"]'); // ô nhập mật khẩu (login)
    const registerForm = document.querySelector(".form-box.register form"); // form đăng ký
    const registerUsernameInput = registerForm?.querySelector('input[name="registerUsername"]'); // ô nhập tên đăng nhập (register)
    const registerPasswordInput = registerForm?.querySelector('input[name="registerPassword"]'); // ô nhập mật khẩu (register)
    const confirmPasswordInput = registerForm?.querySelector('input[name="confirmPassword"]'); // ô nhập lại mật khẩu (register)

    // kiểm tra xem có lấy được hết các thẻ html không
    if (!container || !registerBtn || !loginBtn || !loginForm || !loginUsernameInput || !loginPasswordInput || !registerForm || !registerUsernameInput || !registerPasswordInput || !confirmPasswordInput) {
        console.error("lỗi: thiếu một hoặc nhiều thẻ html cần cho login/register!");
        // có thể thêm thông báo cho người dùng ở đây nếu cần
        return; // dừng chạy code nếu thiếu thẻ quan trọng
    }

    // --- xử lý khi bấm nút chuyển đổi giữa form đăng nhập và đăng ký ---
    registerBtn.addEventListener('click', () => container.classList.add('active')); // hiện form đăng ký
    loginBtn.addEventListener('click', () => container.classList.remove('active')); // hiện form đăng nhập

    // --- xử lý khi gửi form đăng nhập ---
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault(); // chặn gửi form theo cách mặc định
        const enteredUsername = loginUsernameInput.value.trim(); // lấy tên đăng nhập, bỏ khoảng trắng thừa
        const enteredPassword = loginPasswordInput.value.trim(); // lấy mật khẩu, bỏ khoảng trắng thừa

        // kiểm tra nhập đủ chưa
        if (!enteredUsername || !enteredPassword) {
            alert("vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.");
            return;
        }

        let isLoginSuccessful = false; // biến cờ báo đăng nhập thành công hay chưa
        let loggedInUsername = null; // lưu tên người đăng nhập thành công
        let isUserAdmin = false; // biến cờ báo có phải admin không

        // 1. kiểm tra với danh sách admin (từ file users.js)
        // kiểm tra xem biến adminusers có tồn tại không (đã được nạp từ file khác chưa)
        if (typeof adminUsers !== 'undefined') {
            // duyệt qua từng admin trong danh sách
            for (const admin of adminUsers) {
                // nếu tên đăng nhập và mật khẩu khớp
                if (admin.username === enteredUsername && admin.password === enteredPassword) {
                    isLoginSuccessful = true; // đặt cờ thành công
                    loggedInUsername = admin.username; // lưu tên admin
                    isUserAdmin = true; // đặt cờ là admin
                    break; // thoát vòng lặp vì đã tìm thấy
                }
            }
        } else {
            console.warn("mảng adminUsers chưa được tải hoặc không tồn tại. bỏ qua kiểm tra admin.");
            // không nên báo lỗi nghiêm trọng ở đây nếu adminUsers không phải lúc nào cũng có
        }


        // 2. nếu không phải admin, kiểm tra với user thường (từ localstorage)
        if (!isLoginSuccessful) { // chỉ kiểm tra user thường nếu chưa đăng nhập thành công với tư cách admin
            const registeredUsers = getRegisteredUsersFromStorage(); // lấy danh sách user thường
            // duyệt qua từng user thường
            for (const user of registeredUsers) {
                 // nếu tên đăng nhập và mật khẩu khớp
                if (user.username === enteredUsername && user.password === enteredPassword) {
                    isLoginSuccessful = true; // đặt cờ thành công
                    loggedInUsername = user.username; // lưu tên user
                    isUserAdmin = false; // đặt cờ không phải admin
                    break; // thoát vòng lặp
                }
            }
        }

        // xử lý kết quả sau khi kiểm tra xong cả admin và user thường
        if (isLoginSuccessful) {
            alert(`đăng nhập thành công! ${isUserAdmin ? '(admin)' : ''}`); // thông báo thành công (thêm chữ admin nếu là admin)
            // lưu trạng thái đăng nhập vào localstorage
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("userName", loggedInUsername);

            // ---> lưu hoặc xóa trạng thái admin trong localstorage <---
            if (isUserAdmin) {
                localStorage.setItem("isAdmin", "true"); // lưu nếu là admin
                console.log("đã lưu trạng thái admin vào localStorage.");
            } else {
                localStorage.removeItem("isAdmin"); // xóa nếu là user thường (đảm bảo không còn trạng thái admin cũ)
                console.log("đã xóa trạng thái admin (nếu có) khỏi localStorage cho user thường.");
            }
            // ------------------------------------

            window.location.href = "/viet/index.html"; // chuyển hướng về trang chủ sau khi đăng nhập

        } else { // nếu đăng nhập thất bại
            alert("tên đăng nhập hoặc mật khẩu không đúng!");
            // ---> đảm bảo xóa hết thông tin đăng nhập cũ khi đăng nhập thất bại <---
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userName');
            localStorage.removeItem('isAdmin'); // quan trọng: xóa cả trạng thái admin nếu đăng nhập sai
            //----------------------------------------
        }
    });


    // --- xử lý khi gửi form đăng ký ---
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault(); // chặn gửi form mặc định
        const newUsername = registerUsernameInput.value.trim(); // lấy tên đăng ký
        const newPassword = registerPasswordInput.value.trim(); // lấy mật khẩu
        const confirmPassword = confirmPasswordInput.value.trim(); // lấy mật khẩu xác nhận

        // --- kiểm tra dữ liệu nhập vào ---
        if (!newUsername || !newPassword || !confirmPassword) {
             alert("vui lòng điền đầy đủ thông tin đăng ký.");
             return;
        }
        if (newPassword !== confirmPassword) {
             alert("mật khẩu xác nhận không khớp!");
             confirmPasswordInput.focus(); // focus vào ô nhập lại mk
             return;
        }
        // (có thể thêm kiểm tra độ dài, độ phức tạp mật khẩu nếu cần)

        // 1. kiểm tra xem tên đăng ký có trùng với admin không
        let usernameExists = false; // biến cờ báo tên đã tồn tại chưa
        // kiểm tra biến adminusers có tồn tại không
        if (typeof adminUsers !== 'undefined') {
            // dùng some để kiểm tra nhanh xem có admin nào trùng tên không (không phân biệt hoa thường)
            usernameExists = adminUsers.some(admin => admin.username.toLowerCase() === newUsername.toLowerCase());
            if (usernameExists) {
               alert(`tên đăng nhập "${newUsername}" đã được sử dụng bởi quản trị viên. vui lòng chọn tên khác.`);
               registerUsernameInput.focus(); // focus vào ô tên đăng nhập
               return; // dừng lại
            }
        } else {
             console.warn("mảng adminUsers chưa tải, không thể kiểm tra trùng tên admin khi đăng ký.");
        }


        // 2. kiểm tra xem tên đăng ký có trùng với user thường đã đăng ký không (trong localstorage)
        const registeredUsers = getRegisteredUsersFromStorage(); // lấy danh sách user thường
         // dùng some để kiểm tra nhanh xem có user nào trùng tên không (không phân biệt hoa thường)
        usernameExists = registeredUsers.some(user => user.username.toLowerCase() === newUsername.toLowerCase());
        if (usernameExists) {
            alert(`tên đăng nhập "${newUsername}" đã tồn tại. vui lòng chọn tên khác.`);
            registerUsernameInput.focus(); // focus vào ô tên đăng nhập
            return; // dừng lại
        }

        // --- nếu không trùng tên và dữ liệu hợp lệ ---
        const newUser = { username: newUsername, password: newPassword }; // tạo đối tượng user mới
        registeredUsers.push(newUser); // thêm user mới vào mảng
        saveRegisteredUsersToStorage(registeredUsers); // lưu lại mảng vào localstorage

        console.log("đăng ký user thường thành công!:", newUser);
        alert("đăng ký thành công! bạn có thể đăng nhập.");
        registerForm.reset(); // xóa trắng form đăng ký
        container.classList.remove('active'); // tự động chuyển về form đăng nhập
    });

}); // kết thúc sự kiện domcontentloaded

// --- kết thúc file login.js ---
// --- START OF FILE users.js ---

// Danh sách các tài khoản Admin mặc định (luôn tồn tại)
// Dùng const vì danh sách này sẽ không bị thay đổi bởi logic đăng ký.
const adminUsers = [
    { username: "admin1", password: "adminpass1" },
    { username: "sudo", password: "rootpassword" },
    { username: "sysadmin", password: "complexpass" },
    // Đảm bảo tên admin không quá phổ biến để tránh trùng với user thường
];

// Log để biết file đã load
console.log("users.js loaded. Admin accounts defined:", adminUsers.length);

// --- END OF FILE users.js ---
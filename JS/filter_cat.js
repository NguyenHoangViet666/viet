// --- bắt đầu file filter_cat.js ---

document.addEventListener('DOMContentLoaded', function() {
    // lấy các thẻ html cần dùng
    const loaiTruyenSelect = document.getElementById('filter-loai-truyen');
    const tinhTrangSelect = document.getElementById('filter-tinh-trang');
    const truyenListContainer = document.getElementById('truyen-list-container');

    // kiểm tra xem các thẻ và dữ liệu có tồn tại không, nếu thiếu thì dừng
    if (!loaiTruyenSelect || !tinhTrangSelect || !truyenListContainer || typeof allTruyen === 'undefined') {
        console.warn("Thiếu phần tử HTML hoặc biến allTruyen cho việc lọc.");
        return; // dừng nếu thiếu
    }

    // lấy tất cả các thẻ li chứa truyện từ html gốc
    const allTruyenItemsHTML = Array.from(truyenListContainer.querySelectorAll('li'));

    // tạo map để tra cứu dữ liệu truyện nhanh bằng url (href)
    const truyenDataMap = new Map();
    // duyệt qua mảng dữ liệu truyện gốc (allTruyen)
    allTruyen.forEach(truyen => {
        // chỉ thêm vào map nếu truyện có url
        if (truyen.url) {
            truyenDataMap.set(truyen.url, truyen); // lưu thông tin truyện vào map với key là url
        }
    });

    // hàm chính để lọc truyện dựa vào lựa chọn
    function applyFilters() {
        // lấy giá trị đang chọn từ 2 ô lọc
        const selectedLoaiTruyen = loaiTruyenSelect.value;
        const selectedTinhTrang = tinhTrangSelect.value;
        let visibleCount = 0; // đếm số truyện được hiển thị

        // duyệt qua từng thẻ li truyện trong danh sách html
        allTruyenItemsHTML.forEach(itemLi => {
            const linkElement = itemLi.querySelector('a');
            let truyenInfo = null;
            let shouldShow = false; // mặc định là ẩn truyện này đi

            // kiểm tra xem thẻ li có chứa link hợp lệ không
            if (linkElement && linkElement.getAttribute('href')) {
                const itemUrl = linkElement.getAttribute('href'); // lấy link của truyện
                truyenInfo = truyenDataMap.get(itemUrl); // tìm thông tin truyện trong map dựa vào link

                // nếu tìm thấy thông tin truyện (có trong file truyen-data.js)
                if (truyenInfo) {
                    // lấy loại truyện và tình trạng từ dữ liệu đã tìm được (nếu không có thì là chuỗi rỗng)
                    const itemLoaiTruyen = truyenInfo.loaitruyen || '';
                    const itemTinhTrang = truyenInfo.tinhtrang || '';

                    // kiểm tra xem có khớp với bộ lọc không (' ' nghĩa là chọn "tất cả")
                    const loaiTruyenMatch = selectedLoaiTruyen === '' || itemLoaiTruyen === selectedLoaiTruyen;
                    const tinhTrangMatch = selectedTinhTrang === '' || itemTinhTrang === selectedTinhTrang;

                    // nếu khớp cả hai (hoặc không lọc) thì cho phép hiển thị
                    if (loaiTruyenMatch && tinhTrangMatch) {
                        shouldShow = true;
                    }
                } else {
                    // nếu không tìm thấy thông tin truyện trong map (truyện chỉ có trong html, không có trong data js)
                    // kiểm tra xem người dùng có đang lọc gì không
                    if (selectedLoaiTruyen === '' && selectedTinhTrang === '') {
                        // nếu không lọc (chọn tất cả ở cả 2 ô) => thì vẫn hiển thị truyện này
                        shouldShow = true;
                    } else {
                        // nếu đang lọc một tiêu chí cụ thể => ẩn truyện này đi (vì không có dữ liệu để so sánh)
                        shouldShow = false;
                    }
                    // console.warn(`Không tìm thấy dữ liệu cho URL: ${itemUrl}`); // có thể bật để debug
                }
            } else {
                // nếu thẻ li không hợp lệ (không có thẻ a hoặc href) => ẩn đi
                shouldShow = false;
                // console.warn("Thẻ <li> không có link hợp lệ:", itemLi); // có thể bật để debug
            }

            // áp dụng việc ẩn/hiện cho thẻ li dựa vào biến shouldshow
            if (shouldShow) {
                itemLi.style.display = 'list-item'; // hiện thẻ li (hoặc 'block', 'flex', tùy css)
                visibleCount++; // tăng biến đếm
            } else {
                itemLi.style.display = 'none'; // ẩn thẻ li
            }
        });

        // hiển thị thông báo nếu không có truyện nào được hiện (visiblecount = 0)
        displayNoResultMessage(visibleCount === 0);
    }

    // hàm hiển thị hoặc ẩn thông báo "không tìm thấy kết quả"
    function displayNoResultMessage(show) {
        let messageElement = document.getElementById('no-filter-results-message');
        // nếu cần hiện thông báo
        if (show) {
            // nếu thẻ thông báo chưa có thì tạo mới
            if (!messageElement) {
                messageElement = document.createElement('p');
                messageElement.id = 'no-filter-results-message';
                messageElement.textContent = 'Không tìm thấy truyện nào phù hợp với bộ lọc.';
                messageElement.style.textAlign = 'center';
                messageElement.style.marginTop = '20px';
                messageElement.style.fontWeight = 'bold';
                // chèn thẻ thông báo vào sau danh sách truyện
                truyenListContainer.parentNode.insertBefore(messageElement, truyenListContainer.nextSibling);
            }
            // đảm bảo thẻ thông báo được hiển thị
            messageElement.style.display = 'block';
        } else { // nếu cần ẩn thông báo
            // nếu thẻ thông báo đã tồn tại thì ẩn nó đi
            if (messageElement) {
                messageElement.style.display = 'none';
            }
        }
    }

    // thêm sự kiện 'change' cho 2 ô lọc, khi người dùng thay đổi lựa chọn thì gọi hàm applyfilters
    loaiTruyenSelect.addEventListener('change', applyFilters);
    tinhTrangSelect.addEventListener('change', applyFilters);

    // tùy chọn: chạy lọc ngay khi tải trang (hiện tại đang tắt, nếu muốn thì bỏ dấu // ở dòng dưới)
    // applyFilters();

});

// --- kết thúc file filter_cat.js ---
// --- START OF FILE filter_cat.js ---

document.addEventListener('DOMContentLoaded', function() {
    const loaiTruyenSelect = document.getElementById('filter-loai-truyen');
    const tinhTrangSelect = document.getElementById('filter-tinh-trang');
    const truyenListContainer = document.getElementById('truyen-list-container');

    if (!loaiTruyenSelect || !tinhTrangSelect || !truyenListContainer || typeof allTruyen === 'undefined') {
        return;
    }

    const allTruyenItemsHTML = Array.from(truyenListContainer.querySelectorAll('li'));

    const truyenDataMap = new Map();
    allTruyen.forEach(truyen => {
        if (truyen.url) {
            truyenDataMap.set(truyen.url, truyen);
        }
    });

    function applyFilters() {
        const selectedLoaiTruyen = loaiTruyenSelect.value;
        const selectedTinhTrang = tinhTrangSelect.value;
        let visibleCount = 0;

        allTruyenItemsHTML.forEach(itemLi => {
            const linkElement = itemLi.querySelector('a');
            let truyenInfo = null;
            let shouldShow = false; // Mặc định ẩn

            if (linkElement && linkElement.getAttribute('href')) {
                const itemUrl = linkElement.getAttribute('href');
                truyenInfo = truyenDataMap.get(itemUrl);

                if (truyenInfo) {
                    // Có data, kiểm tra khớp bộ lọc
                    const itemLoaiTruyen = truyenInfo.loaitruyen || '';
                    const itemTinhTrang = truyenInfo.tinhtrang || '';
                    const loaiTruyenMatch = selectedLoaiTruyen === '' || itemLoaiTruyen === selectedLoaiTruyen;
                    const tinhTrangMatch = selectedTinhTrang === '' || itemTinhTrang === selectedTinhTrang;

                    if (loaiTruyenMatch && tinhTrangMatch) {
                        shouldShow = true;
                    }
                } else {
                    // *** SỬA ĐỔI QUAN TRỌNG ***
                    // Không có data, kiểm tra xem có đang lọc không
                    if (selectedLoaiTruyen === '' && selectedTinhTrang === '') {
                        // Nếu KHÔNG lọc (chọn Tất cả) => HIỂN THỊ
                        shouldShow = true;
                    } else {
                        // Nếu ĐANG lọc tiêu chí cụ thể => ẨN (vì không có data để so sánh)
                        shouldShow = false;
                    }
                    // console.warn(`Không tìm thấy dữ liệu cho URL: ${itemUrl}`);
                }
            } else {
                // Thẻ li không hợp lệ => Ẩn
                shouldShow = false;
                // console.warn("Thẻ <li> không có link hợp lệ:", itemLi);
            }

            // Áp dụng display
            if (shouldShow) {
                itemLi.style.display = 'list-item'; // Hoặc 'block', 'flex', tùy CSS
                visibleCount++;
            } else {
                itemLi.style.display = 'none';
            }
        });

        displayNoResultMessage(visibleCount === 0);
    }

    function displayNoResultMessage(show) {
        let messageElement = document.getElementById('no-filter-results-message');
        if (show) {
            if (!messageElement) {
                messageElement = document.createElement('p');
                messageElement.id = 'no-filter-results-message';
                messageElement.textContent = 'Không tìm thấy truyện nào phù hợp với bộ lọc.';
                messageElement.style.textAlign = 'center';
                messageElement.style.marginTop = '20px';
                messageElement.style.fontWeight = 'bold';
                truyenListContainer.parentNode.insertBefore(messageElement, truyenListContainer.nextSibling);
            }
            messageElement.style.display = 'block';
        } else {
            if (messageElement) {
                messageElement.style.display = 'none';
            }
        }
    }

    loaiTruyenSelect.addEventListener('change', applyFilters);
    tinhTrangSelect.addEventListener('change', applyFilters);

    // Optional: Initial filter call on page load if needed
    // applyFilters();

});
// --- END OF FILE filter_cat.js ---
document.addEventListener('DOMContentLoaded', function() {
    let urlParams = new URLSearchParams(window.location.search);
    let keyword = urlParams.get('q'); // Chỉ lấy 'q'

    function createTruyenList(truyenData) {
        let ul = document.createElement('ul');
        ul.className = 'truyen-list';
        truyenData.forEach(function(truyen) {
            let li = document.createElement('li');
            let a = document.createElement('a');
            // *** Đảm bảo URL truyện và ảnh trong truyen-data.js là chính xác
            // *** so với vị trí của search-results.html
            a.href = truyen.url;
            let img = document.createElement('img');
            img.src = truyen.image; // Đường dẫn này phải đúng từ search-results.html
            img.alt = "Bìa truyện " + truyen.title;
            img.width = 100;
            img.height = 150;
            a.appendChild(img);
            let titleSpan = document.createElement('span');
            titleSpan.textContent = truyen.title;
            a.appendChild(titleSpan);
            li.appendChild(a);
            ul.appendChild(li);
        });
        return ul;
    }

    let filteredTruyen = allTruyen.filter(function(truyen) {
       let matchKeyword = !keyword || (truyen.title && typeof truyen.title === 'string' && truyen.title.toLowerCase().includes(keyword.toLowerCase()));
       return matchKeyword; // Chỉ lọc theo keyword
    });

    let searchResultsList = document.getElementById('search-results-list');
    if (searchResultsList) {
        if (filteredTruyen.length > 0) {
            let truyenList = createTruyenList(filteredTruyen);
            searchResultsList.innerHTML = '';
            searchResultsList.appendChild(truyenList);
        } else {
            searchResultsList.innerHTML = `<p>Không tìm thấy truyện nào với từ khóa: "<strong>${keyword || ''}</strong>".</p>`;
        }
    } else {
        console.error("Không tìm thấy phần tử #search-results-list.");
    }
});
// Các biến toàn cục được nhóm lại và đặt tên rõ ràng hơn
let state = {
    currentPage: 1,
    lastPage: 1,
    urlParamType: '',
    urlParamValue: ''
};

const storyListElement = document.getElementById('storyList');
const loadMoreButton = document.getElementById('loadMore');
const listTitleElement = document.getElementById('listTitle');
const pageTitleElement = document.getElementById('pageTitle');

/**
 * Tải danh sách truyện từ API dựa trên trang hiện tại.
 * @param {number} page - Số trang cần tải. Mặc định là 1.
 */
async function fetchStoryList(page = 1) {
    const { urlParamType, urlParamValue } = state;
    const url = `https://truyenx.link/truyensextv/channels?${urlParamType}=${urlParamValue}&page=${page}`;

    // Hiển thị trạng thái đang tải
    if (page === 1) {
        storyListElement.innerHTML = '<li>Đang tải danh sách truyện...</li>';
    } else {
        // Tùy chọn: Thêm hiệu ứng loading cho nút "Tải thêm"
        loadMoreButton.textContent = 'Đang tải...';
        loadMoreButton.disabled = true;
    }

    try {
        const response = await fetch(url);
        // Kiểm tra lỗi HTTP trước khi xử lý JSON
        if (!response.ok) {
            throw new Error(`Lỗi HTTP: ${response.status}`);
        }
        const data = await response.json();
        
        displayStoryList(data.channels, page === 1);
        
        // Cập nhật state phân trang
        state.currentPage = data.load_more.pageInfo.current_page;
        state.lastPage = data.load_more.pageInfo.last_page;
        
    } catch (error) {
        console.error('Lỗi khi lấy danh sách truyện:', error);
        storyListElement.innerHTML = `<li>Không thể tải danh sách truyện. Vui lòng thử lại sau.</li>`;
        loadMoreButton.style.display = 'none'; // Ẩn nút nếu có lỗi
    } finally {
        // Cập nhật trạng thái của nút "Tải thêm" sau khi hoàn tất
        updateLoadMoreButton();
    }
}

/**
 * Hiển thị danh sách truyện lên giao diện.
 * @param {Array} channels - Mảng các đối tượng truyện.
 * @param {boolean} isNewList - Xác định xem có phải là danh sách mới (trang 1) hay không.
 */
function displayStoryList(channels, isNewList) {
    if (isNewList) {
        storyListElement.innerHTML = ''; // Xóa danh sách cũ nếu là trang đầu tiên
    }
    
    if (channels && channels.length > 0) {
        channels.forEach(story => {
            const li = document.createElement('li');
            li.className = 'story-item';
            
            // Lấy chuỗi slug từ URL share
            const shareUrlParts = story.share.url.split('/');
            const storySlug = shareUrlParts[shareUrlParts.length - 1];

            // Sử dụng slug trong đường dẫn
            li.innerHTML = `
                <a href="story.html?id=${encodeURIComponent(storySlug)}">
                    <h3>${story.name}</h3>
                    <p>${story.description}</p>
                </a>
            `;
            storyListElement.appendChild(li);
        });
    } else if (isNewList) {
        // Chỉ hiển thị thông báo "Không có truyện" khi không có dữ liệu ở trang đầu tiên
        storyListElement.innerHTML = '<li>Không có truyện nào để hiển thị.</li>';
    }
}

/**
 * Cập nhật trạng thái hiển thị của nút "Tải thêm".
 */
function updateLoadMoreButton() {
    const { currentPage, lastPage } = state;
    if (currentPage < lastPage) {
        loadMoreButton.textContent = 'Tải thêm';
        loadMoreButton.disabled = false;
        loadMoreButton.style.display = 'block';
    } else {
        loadMoreButton.textContent = 'Đã tải hết';
        loadMoreButton.disabled = true;
        loadMoreButton.style.display = 'none';
    }
}

/**
 * Xử lý sự kiện click cho nút "Tải thêm".
 */
function handleLoadMoreClick() {
    const { currentPage, lastPage } = state;
    if (currentPage < lastPage) {
        fetchStoryList(currentPage + 1);
    }
}

/**
 * Hàm khởi tạo khi trang được tải.
 */
function initializePage() {
    const params = new URLSearchParams(window.location.search);
    state.urlParamType = params.has('c') ? 'c' : 't';
    state.urlParamValue = params.get(state.urlParamType);

    if (state.urlParamValue) {
        const title = state.urlParamValue
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

        listTitleElement.textContent = `Truyện ${title}`;
        pageTitleElement.textContent = `Truyện ${title}`;
        fetchStoryList();
    } else {
        storyListElement.innerHTML = '<li>Không tìm thấy thẻ hoặc thể loại.</li>';
        loadMoreButton.style.display = 'none';
    }
}

// Gắn sự kiện và khởi chạy
if (loadMoreButton) {
    loadMoreButton.addEventListener('click', handleLoadMoreClick);
}

document.addEventListener('DOMContentLoaded', initializePage);

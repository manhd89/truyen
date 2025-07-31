let currentPage = 1;
let lastPage = 1;

async function fetchStoryList(page = 1) {
    const url = `https://truyenx.link/truyensextv/channels?page=${page}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Lỗi HTTP! Trạng thái: ${response.status}`);
        }
        const data = await response.json();
        
        displayStoryList(data.channels);
        
        // Cập nhật thông tin phân trang
        currentPage = data.load_more.pageInfo.current_page;
        lastPage = data.load_more.pageInfo.last_page;

        // Hiển thị/ẩn nút "Tải thêm"
        const loadMoreButton = document.getElementById('loadMore');
        if (currentPage < lastPage) {
            loadMoreButton.style.display = 'block';
        } else {
            loadMoreButton.style.display = 'none';
        }
        
    } catch (error) {
        console.error('Lỗi khi lấy danh sách truyện:', error);
        document.getElementById('storyList').innerHTML = '<li>Không thể tải danh sách truyện.</li>';
    }
}

function displayStoryList(channels) {
    const storyListElement = document.getElementById('storyList');
    if (channels && channels.length > 0) {
        channels.forEach(story => {
            const li = document.createElement('li');
            li.className = 'story-item';
            const storyId = story.remote_data.url.split('/').pop();
            li.innerHTML = `
                <a href="story.html?id=${storyId}">
                    <h3>${story.name || 'Không có tiêu đề'}</h3>
                    <p>${story.description || 'Không có mô tả'}</p>
                </a>
            `;
            storyListElement.appendChild(li);
        });
    } else if (currentPage === 1) {
        storyListElement.innerHTML = '<li>Không có truyện nào để hiển thị.</li>';
    }
}

// Xử lý sự kiện khi click nút "Tải thêm"
document.getElementById('loadMore').addEventListener('click', () => {
    if (currentPage < lastPage) {
        fetchStoryList(currentPage + 1);
    }
});

// Chạy khi trang tải xong
fetchStoryList();

let allChapters = [];
let currentChapterIndex = -1;
let storyId = '';

async function fetchStoryDetails(id, chapterIdToLoad) {
    const url = `https://truyenx.link/truyensextv/channels/${id}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        // Sắp xếp chương theo index để dễ điều hướng
        allChapters = data.sources[0].contents[0].streams.sort((a, b) => a.index - b.index);
        
        // Cập nhật thông tin truyện và liên kết quay lại
        const title = id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        document.getElementById('storyTitle').textContent = title;
        document.getElementById('backToStory').href = `story.html?id=${id}`;
        document.getElementById('pageTitle').textContent = `Đọc ${title}`;

        // Tìm chapter hiện tại để tải nội dung
        const chapter = allChapters.find(chap => chap.id === chapterIdToLoad);
        if (chapter) {
            currentChapterIndex = allChapters.findIndex(chap => chap.id === chapterIdToLoad);
            document.getElementById('chapterTitle').textContent = chapter.name;
            fetchChapterContent(chapter.remote_data.url);
            updateNavigationButtons();
        } else {
            document.getElementById('chapterContent').innerHTML = '<p>Không tìm thấy chương này.</p>';
        }
    } catch (error) {
        console.error('Lỗi khi lấy thông tin truyện:', error);
        document.getElementById('chapterContent').innerHTML = '<p>Không thể tải thông tin truyện.</p>';
    }
}

async function fetchChapterContent(url) {
    document.getElementById('chapterContent').innerHTML = '<p>Đang tải nội dung...</p>';
    try {
        const response = await fetch(url);
        const data = await response.json();
        let content = data.text || '<p>Không có nội dung.</p>';
        
        // Loại bỏ thông báo quảng cáo
        content = content.replace(/<em[^>]*>[\s\S]*?truyensex[\s\S]*?<\/em>/g, '');
        document.getElementById('chapterContent').innerHTML = content;
        
        window.scrollTo(0, 0); // Cuộn lên đầu trang

    } catch (error) {
        console.error('Lỗi khi lấy nội dung chương:', error);
        document.getElementById('chapterContent').innerHTML = '<p>Không thể tải nội dung chương.</p>';
    }
}

function updateNavigationButtons() {
    const prevButton = document.getElementById('prevChapter');
    const nextButton = document.getElementById('nextChapter');
    
    // Vô hiệu hóa nút "Chương trước" nếu đang ở chương đầu
    prevButton.disabled = (currentChapterIndex <= 0);
    
    // Vô hiệu hóa nút "Chương sau" nếu đang ở chương cuối
    nextButton.disabled = (currentChapterIndex >= allChapters.length - 1);
}

function navigateChapter(direction) {
    const newIndex = currentChapterIndex + (direction === 'next' ? 1 : -1);
    
    if (newIndex >= 0 && newIndex < allChapters.length) {
        currentChapterIndex = newIndex;
        const newChapter = allChapters[currentChapterIndex];
        
        document.getElementById('chapterTitle').textContent = newChapter.name;
        
        // Cập nhật URL trình duyệt
        const newUrl = `reader.html?id=${storyId}&chapterId=${newChapter.id}`;
        window.history.pushState({ path: newUrl }, '', newUrl);

        fetchChapterContent(newChapter.remote_data.url);
        updateNavigationButtons();
    }
}

// Gắn sự kiện click cho các nút điều hướng
document.getElementById('prevChapter').addEventListener('click', () => navigateChapter('prev'));
document.getElementById('nextChapter').addEventListener('click', () => navigateChapter('next'));

// Lấy thông tin từ URL và khởi chạy
const params = new URLSearchParams(window.location.search);
storyId = params.get('id');
const chapterId = params.get('chapterId');
if (storyId && chapterId) {
    fetchStoryDetails(storyId, chapterId);
}

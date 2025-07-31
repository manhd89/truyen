async function fetchStoryDetails(id) {
    const url = `https://truyenx.link/truyensextv/channels/${id}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        displayStoryDetails(data, id);
    } catch (error) {
        console.error('Lỗi khi lấy thông tin truyện:', error);
        document.getElementById('storyDescription').innerHTML = 'Không thể tải thông tin truyện.';
    }
}

function displayStoryDetails(data, id) {
    // Tạo tiêu đề từ ID và hiển thị
    const title = id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    document.getElementById('storyTitle').textContent = title;
    document.getElementById('pageTitle').textContent = title;
    document.getElementById('storyDescription').textContent = data.description || 'Không có mô tả.';

    // Hiển thị thể loại (keys) và tạo liên kết tới trang list.html
    const keys = data.keys.map(key => `<a href="list.html?c=${key.text.replace(/ /g, '-')}" class="tag-link">${key.text}</a>`).join(', ');
    document.getElementById('storyKeys').innerHTML = keys || 'Không có thể loại.';

    // Hiển thị thẻ (tags) và tạo liên kết tới trang list.html
    const tags = data.tags.map(tag => `<a href="list.html?t=${tag.text.replace(/ /g, '-')}" class="tag-link">${tag.text}</a>`).join(', ');
    document.getElementById('storyTags').innerHTML = tags || 'Không có thẻ.';

    // Hiển thị danh sách chương
    const chapterList = document.getElementById('chapterList');
    const chapters = data.sources[0].contents[0].streams.sort((a, b) => a.index - b.index);
    chapters.forEach(chapter => {
        const li = document.createElement('li');
        li.innerHTML = `<a href="reader.html?id=${id}&chapterId=${chapter.id}">${chapter.name}</a>`;
        chapterList.appendChild(li);
    });
}

// Lấy storyId từ URL và gọi hàm tải dữ liệu
const params = new URLSearchParams(window.location.search);
const storyId = params.get('id');
if (storyId) {
    fetchStoryDetails(storyId);
}

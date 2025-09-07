let currentPage = 1;
let lastPage = 1;
let isSearching = false;
let searchQuery = '';

async function fetchStoryList(page = 1, query = '') {
    let url;
    if (query) {
        // Encode the query to handle special characters and spaces
        url = `https://truyenx.link/truyensextv/channels/search?q=${encodeURIComponent(query)}&page=${page}`;
        isSearching = true;
        searchQuery = query;
    } else {
        url = `https://truyenx.link/truyensextv/channels?page=${page}`;
        isSearching = false;
        searchQuery = '';
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Lỗi HTTP! Trạng thái: ${response.status}`);
        }
        const data = await response.json();

        // If it's the first page, clear the existing list
        if (page === 1) {
            document.getElementById('storyList').innerHTML = '';
        }

        displayStoryList(data.channels);

        // Update pagination info
        currentPage = data.load_more.pageInfo.current_page;
        lastPage = data.load_more.pageInfo.last_page;

        // Show/hide the "Load More" button
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

// Handle "Load More" button click
document.getElementById('loadMore').addEventListener('click', () => {
    if (currentPage < lastPage) {
        fetchStoryList(currentPage + 1, searchQuery);
    }
});

// Handle search button click
document.getElementById('searchButton').addEventListener('click', () => {
    const query = document.getElementById('searchInput').value.trim();
    if (query) {
        currentPage = 1; // Reset to first page for new search
        fetchStoryList(1, query);
    } else {
        // If search input is empty, load the default story list
        currentPage = 1;
        fetchStoryList(1);
    }
});

// Handle Enter key press in search input
document.getElementById('searchInput').addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        const query = document.getElementById('searchInput').value.trim();
        if (query) {
            currentPage = 1; // Reset to first page for new search
            fetchStoryList(1, query);
        } else {
            // If search input is empty, load the default story list
            currentPage = 1;
            fetchStoryList(1);
        }
    }
});

// Run when the page loads
fetchStoryList();

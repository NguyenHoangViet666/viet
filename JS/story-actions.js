document.addEventListener('DOMContentLoaded', () => {
    const storyContainer = document.querySelector('.truyen-container[data-story-id]');
    const saveButton = document.getElementById('save-story-button');
    const likeButton = document.getElementById('like-story-button');
    const feedbackSpan = document.getElementById('action-feedback');

    if (!storyContainer || !saveButton || !likeButton || !feedbackSpan) {
        console.error("Story action elements not found. Ensure .truyen-container has [data-story-id], and buttons/feedback span have correct IDs.");
        return;
    }

    const storyId = storyContainer.getAttribute('data-story-id');
    // Attempt to get title from h1, provide fallback
    const storyTitleElement = storyContainer.querySelector('.truyen-info h1');
    const storyTitle = storyTitleElement ? storyTitleElement.textContent.trim() : "Truyện không tên";
    const storyUrl = storyContainer.getAttribute('data-story-url') || window.location.href; // Fallback to current page

    const storyData = { id: storyId, title: storyTitle, url: storyUrl };

    const SAVED_STORIES_KEY = 'userSavedStories';
    const LIKED_STORIES_KEY = 'userLikedStories';

    // --- Helper Functions ---
    function getStoredList(key) {
        const storedJson = localStorage.getItem(key);
        let list = [];
        if (storedJson) {
            try {
                list = JSON.parse(storedJson);
                if (!Array.isArray(list)) { // Ensure it's an array
                    console.warn(`localStorage item "${key}" is not an array. Resetting.`);
                    list = [];
                }
            } catch (e) {
                console.error(`Error parsing localStorage item "${key}":`, e);
                list = []; // Reset on error
            }
        }
        return list;
    }

    function saveStoredList(key, list) {
        try {
            localStorage.setItem(key, JSON.stringify(list));
        } catch (e) {
            console.error(`Error saving to localStorage key "${key}":`, e);
            showFeedback("Lỗi: Không thể lưu vào bộ nhớ cục bộ.", true);
        }
    }

    function findIndexInList(list, storyId) {
        return list.findIndex(item => item && item.id === storyId);
    }

    function showFeedback(message, isError = false) {
        feedbackSpan.textContent = message;
        feedbackSpan.className = isError ? 'action-feedback error' : 'action-feedback success';
        // Clear feedback after a few seconds
        setTimeout(() => {
            feedbackSpan.textContent = '';
            feedbackSpan.className = 'action-feedback';
        }, 3000);
    }

    function updateButtonState(button, isToggled, iconClassActive, iconClassInactive, textActive, textInactive) {
        const icon = button.querySelector('i');
        const text = button.querySelector('span');
        if (isToggled) {
            button.classList.add('active');
            if (icon) icon.className = iconClassActive; // Update class directly
            if (text) text.textContent = textActive;
        } else {
            button.classList.remove('active');
            if (icon) icon.className = iconClassInactive; // Update class directly
            if (text) text.textContent = textInactive;
        }
    }

    // --- Initial Button State ---
    function checkInitialStates() {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

        if (!isLoggedIn) {
            saveButton.disabled = true;
            likeButton.disabled = true;
            saveButton.title = "Bạn cần đăng nhập để lưu truyện";
            likeButton.title = "Bạn cần đăng nhập để thích truyện";
            // Optionally change text/style for disabled state
             const saveText = saveButton.querySelector('span');
             const likeText = likeButton.querySelector('span');
             if(saveText) saveText.textContent = "Lưu (Đăng nhập)";
             if(likeText) likeText.textContent = "Thích (Đăng nhập)";
            return; // Stop if not logged in
        }

        // Enable buttons if logged in
        saveButton.disabled = false;
        likeButton.disabled = false;
        saveButton.title = ""; // Clear title tooltip
        likeButton.title = "";

        // Check Saved State
        const savedList = getStoredList(SAVED_STORIES_KEY);
        const isSaved = findIndexInList(savedList, storyId) > -1;
        updateButtonState(saveButton, isSaved, 'bx bxs-bookmark', 'bx bx-bookmark', 'Đã lưu', 'Lưu truyện');

        // Check Liked State
        const likedList = getStoredList(LIKED_STORIES_KEY);
        const isLiked = findIndexInList(likedList, storyId) > -1;
        updateButtonState(likeButton, isLiked, 'bx bxs-heart', 'bx bx-heart', 'Đã thích', 'Thích');
    }

    // --- Event Listeners ---
    saveButton.addEventListener('click', () => {
        if (localStorage.getItem('isLoggedIn') !== 'true') {
            showFeedback("Vui lòng đăng nhập để lưu truyện.", true);
            // Optionally redirect to login: window.location.href = '../../HTML/login.html';
            return;
        }

        const savedList = getStoredList(SAVED_STORIES_KEY);
        const existingIndex = findIndexInList(savedList, storyId);

        if (existingIndex > -1) { // Already saved -> Unsave
            savedList.splice(existingIndex, 1);
            saveStoredList(SAVED_STORIES_KEY, savedList);
            updateButtonState(saveButton, false, 'bx bxs-bookmark', 'bx bx-bookmark', 'Đã lưu', 'Lưu truyện');
            showFeedback("Đã bỏ lưu truyện.");
            console.log("Story unsaved:", storyId);
        } else { // Not saved -> Save
            savedList.push(storyData);
            saveStoredList(SAVED_STORIES_KEY, savedList);
            updateButtonState(saveButton, true, 'bx bxs-bookmark', 'bx bx-bookmark', 'Đã lưu', 'Lưu truyện');
            showFeedback("Đã lưu truyện thành công!");
            console.log("Story saved:", storyData);
        }
    });

    likeButton.addEventListener('click', () => {
        if (localStorage.getItem('isLoggedIn') !== 'true') {
             showFeedback("Vui lòng đăng nhập để thích truyện.", true);
            // Optionally redirect to login: window.location.href = '../../HTML/login.html';
            return;
        }

        const likedList = getStoredList(LIKED_STORIES_KEY);
        const existingIndex = findIndexInList(likedList, storyId);

        if (existingIndex > -1) { // Already liked -> Unlike
            likedList.splice(existingIndex, 1);
            saveStoredList(LIKED_STORIES_KEY, likedList);
            updateButtonState(likeButton, false, 'bx bxs-heart', 'bx bx-heart', 'Đã thích', 'Thích');
            showFeedback("Đã bỏ thích truyện.");
            console.log("Story unliked:", storyId);
        } else { // Not liked -> Like
            likedList.push(storyData);
            saveStoredList(LIKED_STORIES_KEY, likedList);
            updateButtonState(likeButton, true, 'bx bxs-heart', 'bx bx-heart', 'Đã thích', 'Thích');
            showFeedback("Đã thích truyện!");
            console.log("Story liked:", storyData);
        }
    });

    // --- Initialize ---
    checkInitialStates();

    // Listen for login/logout events from other tabs/windows (optional but good practice)
    window.addEventListener('storage', (event) => {
        if (event.key === 'isLoggedIn' || event.key === SAVED_STORIES_KEY || event.key === LIKED_STORIES_KEY) {
            console.log("Storage changed, re-checking button states...");
            checkInitialStates();
        }
    });

});
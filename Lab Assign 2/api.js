$(document).ready(function () {
    fetchAllStories(); // Initial load of stories

    $('#addStoryBtn').on('click', submitNewStory);
    $('#storyContainer').on('click', '.btn-remove', deleteStory);
    $('#storyContainer').on('click', '.btn-edit', startEditStory);
    $('#storyContainer').on('click', '.btn-save-changes', saveEditedStory);
});

// Fetch stories from the server and display them
function fetchAllStories() {
    $.get("https://usmanlive.com/wp-json/api/stories", function (response) {
        let storyContainer = $('#storyContainer');
        storyContainer.empty(); // Clear the list before appending new items

        if (response.length === 0) {
            storyContainer.html("<p class='text-muted'>No stories available. Feel free to add one!</p>");
        } else {
            response.forEach(story => {
                storyContainer.append(`
                    <div class="story-item border p-3 mb-3" data-id="${story.id}">
                        <h4>${story.title}</h4>
                        <p>${story.content}</p>
                        <input type="text" class="form-control mb-2 edit-title" value="${story.title}" style="display: none;">
                        <textarea class="form-control mb-2 edit-content" rows="3" style="display: none;">${story.content}</textarea>
                        <button class="btn btn-primary btn-sm btn-edit me-2">Edit</button>
                        <button class="btn btn-success btn-sm btn-save-changes me-2" style="display: none;">Save</button>
                        <button class="btn btn-danger btn-sm btn-remove">Delete</button>
                    </div>
                `);
            });
        }
    });
}

// Add a new story by making a POST request
function submitNewStory() {
    let titleInput = $('#storyTitle').val().trim();
    let contentInput = $('#storyBody').val().trim();

    if (!titleInput || !contentInput) {
        alert('Please provide both a title and content for the story.');
        return;
    }

    $.post("https://usmanlive.com/wp-json/api/stories", { title: titleInput, content: contentInput }, function () {
        $('#storyTitle').val(''); // Clear input fields
        $('#storyBody').val('');
        fetchAllStories(); // Reload the stories
    });
}

// Delete a story by making a DELETE request
function deleteStory() {
    let storyElement = $(this).closest('.story-item');
    let storyId = storyElement.data('id');

    $.ajax({
        url: `https://usmanlive.com/wp-json/api/stories/${storyId}`,
        method: "DELETE",
        success: function () {
            storyElement.remove(); // Remove the story from the DOM
        }
    });
}

// Show edit fields for a story
function startEditStory() {
    let storyElement = $(this).closest('.story-item');
    
    storyElement.find('h4, p').hide(); // Hide original text
    storyElement.find('.edit-title, .edit-content').show(); // Show edit fields

    $(this).hide(); // Hide "Edit" button
    storyElement.find('.btn-save-changes').show(); // Show "Save" button
}

// Save edited story by making a PUT request
function saveEditedStory() {
    let storyElement = $(this).closest('.story-item');
    let storyId = storyElement.data('id');

    let newTitle = storyElement.find('.edit-title').val().trim();
    let newContent = storyElement.find('.edit-content').val().trim();

    if (!newTitle || !newContent) {
        alert('Please provide both title and content.');
        return;
    }

    $.ajax({
        url: `https://usmanlive.com/wp-json/api/stories/${storyId}`,
        method: "PUT",
        data: { title: newTitle, content: newContent },
        success: function () {
            storyElement.find('h4').text(newTitle).show();
            storyElement.find('p').text(newContent).show();

            storyElement.find('.edit-title, .edit-content').hide(); // Hide edit fields
            storyElement.find('.btn-save-changes').hide(); // Hide "Save" button
            storyElement.find('.btn-edit').show(); // Show "Edit" button
        }
    });
}
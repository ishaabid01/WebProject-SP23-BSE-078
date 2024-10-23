document.querySelectorAll('.show-description').forEach(button => {
    button.addEventListener('click', function() {
        const projectDiv = this.closest('.project'); // Find the closest project div
        const dataFile = projectDiv.getAttribute('data-file'); // Get the associated file name
        
        // Fetch the content of the text file
        fetch(dataFile)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text(); // Return the text content
            })
            .then(data => {
                // Display the content in the description div
                const descriptionDiv = projectDiv.querySelector('.description');
                descriptionDiv.textContent = data; // Set the text content
            })
            .catch(error => {
                console.error('There has been a problem with your fetch operation:', error);
            });
    });
});

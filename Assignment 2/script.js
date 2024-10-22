document.getElementById("checkoutForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent the form from submitting the traditional way

    // Collect form data
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const address = document.getElementById("address").value;
    const city = document.getElementById("city").value;

    // Display confirmation message
    const confirmationDiv = document.getElementById("confirmation");
    const submittedInfo = document.getElementById("submitted-info");
    submittedInfo.innerHTML = `
        <strong>Name:</strong> ${name}<br>
        <strong>Email:</strong> ${email}<br>
        <strong>Address:</strong> ${address}<br>
        <strong>City:</strong> ${city}
    `;
    confirmationDiv.classList.remove("hidden");

    // Optionally, you can also clear the form
    document.getElementById("checkoutForm").reset();
});

function displayErrorMessage(message, container) {
	container.slideUp();
	container.html('<p class="text-danger">' + message + '</p>');
	container.slideDown();
}
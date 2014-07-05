function reloadUserLoginForm(url, container) {
	$.get(url, function (data) {
		container.html(data);
	});
}



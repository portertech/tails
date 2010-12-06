$(document).ready(function() {
	$('div#alertstext').toggle(
		function() {
			$('div#alertscontainer').slideDown('slow', function() {
				$(this).removeClass('container_hidden');
			});
		},
		function() {
			$('div#alertscontainer').slideUp('slow', function() {
				$(this).addClass('container_hidden');
			});
		}
	);
});
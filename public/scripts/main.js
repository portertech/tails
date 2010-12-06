$(document).ready(function() {
	$('div#alerts_text').click(function() {
		if (!$(this).hasClass('tab_selected')) {
			$('div#all_text').removeClass('tab_selected', 'normal');
			$('div#all').fadeOut('normal', function() {
				$('div#alerts_text').addClass('tab_selected', 'normal');
				$('div#alerts').fadeIn('normal');
			});
		}
	});
	$('div#all_text').click(function() {
		if (!$(this).hasClass('tab_selected')) {
			$('div#alerts_text').removeClass('tab_selected', 'normal');
			$('div#alerts').fadeOut('normal', function() {
				$('div#all_text').addClass('tab_selected', 'normal');
				$('div#all').fadeIn('normal');
			});
		}
	});
});
var inAnimation = false;

$(document).ready(function() {
	$('div#alerts_text').click(function() {
		if ((!$(this).hasClass('tab_selected')) && inAnimation == false) {
			inAnimation = true;
			$('div#all_text').removeClass('tab_selected', 'normal');
			$('div#all').fadeOut('normal', function() {
				$('div#alerts_text').addClass('tab_selected', 'normal');
				$('div#alerts').fadeIn('normal', function() {
					inAnimation = false;
				});
			});
		}
	});
	$('div#all_text').click(function() {
		if ((!$(this).hasClass('tab_selected')) && inAnimation == false) {
			inAnimation = true;
			$('div#alerts_text').removeClass('tab_selected', 'normal');
			$('div#alerts').fadeOut('normal', function() {
				$('div#all_text').addClass('tab_selected', 'normal');
				$('div#all').fadeIn('normal', function() {
					inAnimation = false;
				});
			});
		}
	});
});
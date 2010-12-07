var terms = new Array();

var inAnimation = false;

function addedTerm() {
	$('div.tag > a').click(function() {
		var deletion_id = $(this).parent().attr('id');
		$.ajax({ url: '/terms/'+deletion_id, type: 'DELETE', timeout: 6000, success: function(data, textStatus, XMLHttpRequest) {
			$('div.tag#'+deletion_id).fadeOut('normal', function() {
				$(this).remove();
				terms = new Array();
				getTermsForArray();
			});
		}});
	});
}

function getTermsForArray() {
	$.ajax({ url: '/terms', type: 'GET', timeout: 6000, success: function(data, textStatus, XMLHttpRequest) {
		// success
		for (var key in data) {
			terms.push(data[key].term);
		}
	}});
}

function addTerm() {
	var new_tag_val = $('div.tag_adder > input').val();
	if (terms.indexOf(new_tag_val) == -1) {
		$.ajax({ url: '/terms', type: 'POST', data: { term: new_tag_val }, timeout: 6000, success: function(data, textStatus, XMLHttpRequest) {
			// success
			$('div.tag_adder > input').val('');
			terms.push(new_tag_val);
			$('div#tags').append('<div id="'+data+'" class="tag" style="display: none;">'+new_tag_val+' <a href="#">x</a>');
			$('div#'+data).fadeIn('normal');
			addedTerm();
			$.jGrowl('The term "'+new_tag_val+'" was added successfully!');
		}});
	} else {
		$('div.tag_adder > input').val('');
		$.jGrowl('The term "'+new_tag_val+'" already exists!');
	}
}

function getTerms() {
	$.ajax({ url: '/terms', type: 'GET', timeout: 6000, success: function(data, textStatus, XMLHttpRequest) {
		// success
		for (var key in data) {
			$('div#tags').append('<div id="'+key+'" class="tag">'+data[key].term+' <a href="#">x</a>');
			terms.push(data[key].term);
		}
		addedTerm();
	}});
}

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
	
	getTerms();
	
	$('div.tag_adder > input').keyup(function(e) {
		var new_tag_val = $('div.tag_adder > input').val();
		if((e.keyCode == 13) && (new_tag_val != '')) {
			addTerm();
		}
	});
	
	$('div.tag_adder > a').click(function() {
		addTerm();
	});
});

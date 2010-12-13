function Stream()
{
	// Properties
	this.s_id = null;
	this.s_name = null;
	this.s_terms = null;
	
	// Getter Methods
	this.getId = function() { return s_id; };
	this.getName = function() { return s_name; };
	this.getTerms = function() { return s_terms; };
	
	// Setter Methods
	this.setId = function(id) { s_id = id; };
	this.setName = function(name) { s_name = name; };
	this.setTerms = function(terms) { s_terms = terms; };
}

var streams = new Array();
var inAnimation = false;

function switchToStream(stream) {
	var selected_tab = $('ul.tabs').find('.selected');
	if (inAnimation == false) {
		inAnimation = true;
		selected_tab.removeClass('selected', 'normal');
		stream.addClass('selected', 'normal');
		$("div#logs_container").children("div:not(.logs_hidden)").fadeOut('normal', function() {
			$(this).addClass('logs_hidden', 'normal');
			$("div#logs_container > div#"+stream.parent().attr('id')+"_logs").fadeIn('normal', function() {
				$(this).removeClass('logs_hidden', 'normal');
			});
		});
		inAnimation = false;
	}
}

function tabClick() {
	/* Tab switching */
	$('ul.tabs > div#streams > li:last > a').click(function() {
		var stream = $(this);
		switchToStream(stream);
	});
}

function addStream(s) {
	$('div#streams').append('<li id="'+s.getId()+'"><a href="#">'+s.getName()+'</a></li>');
	$('div#streams li:last').fadeIn('normal');
	$('div#logs_container').append('<div id="'+s.getId()+'_logs" class="logs_hidden">'+
		'<div class="terms"></div>'+
		'<div class="term_adder"><input type="text" name="term_field"/><a href="#">+</a></div>'+
		'<div class="clear"></div>'+
		'<table><thead><tr>'+
		'<th class="dat_col">Date</th>'+
		'<th class="hos_col">Host</th>'+
		'<th class="sev_col">Severity</th>'+
		'<th class="fac_col">Facility</th>'+
		'<th class="msg_col">Message</th>'+
		'</tr></thead>'+
		'<tbody></tbody></table>');
	tabClick();
}

function getStreams() {
	$.ajax({ url: '/streams', type: 'GET', timeout: 6000, success: function(data, textStatus, XMLHttpRequest) {
		// success
		for (var key in data) {
			var stream = new Stream();
			stream.setId(key);
			stream.setName(data[key].name);
			addStream(stream);
		}
	}});
}

$(window).load(function() {
	$("#add_tab[rel]").overlay({effect: 'apple'});
});

$(document).ready(function() {
	
	/* Get existing stream */
	getStreams();
	
	/* Erase values & errors from modal dialog if closed */
	$(document).bind('onClose', function() {
		$('div#new_stream_form > div.error').hide();
		$('input#stream_name').val('');
	});
	
	/* Try to create a new stream when the create button is pressed */
	$('input#create_stream').click(function() {
		$('div#new_stream_form > div.error').hide();
		var stream_name = $('input#stream_name').val();
		if (stream_name == '') {
			$('div#new_stream_form > div.error').html('Stream name must not be empty').show();
		} else {
			$.ajax({ url: '/streams', type: 'POST', data: { name: stream_name }, timeout: 6000, success: function(data, textStatus, XMLHttpRequest) {
				if (XMLHttpRequest.status == '201') {
					// Created
					var stream = new Stream();
					stream.setId(data);
					stream.setName(stream_name);
					addStream(stream);
					$("#add_tab[rel]").overlay().close();
				} else {
					// Something seriously went wrong
					$('div#new_stream_form > div.error').html('Whoops... something went wrong!').show();
				}
			}, error: function(XMLHttpRequest) {
				if (XMLHttpRequest.status == '409') {
					// Duplicate / Conflict
					$('div#new_stream_form > div.error').html('That stream already exists!').show();
				} else {
					// Something seriously went wrong
					$('div#new_stream_form > div.error').html('Whoops... something went wrong!').show();
				}
			}});
		}
	});
	
	/* Handle tab clicks for all / alerts */
	$('ul.tabs > li > a').click(function() {
		var stream = $(this);
		if (stream.attr('id') != 'add_tab') {
			switchToStream(stream);
		}
	});
	
	/* All logs and alerts */
	/*$('div#alerts_text').click(function() {
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
	});*/
});

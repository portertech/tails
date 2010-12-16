function Stream()
{
	// Properties
	this.s_id = null;
	this.s_name = null;
	this.s_terms = new Array();
	
	// Getter Methods
	this.getId = function() { return s_id; };
	this.getName = function() { return s_name; };
	this.getTerms = function() { return s_terms; };
	
	// Setter Methods
	this.setId = function(id) { s_id = id; };
	this.setName = function(name) { s_name = name; };
	this.setTerms = function(terms) { s_terms = terms; };
	
	// Other Methods
	this.addTerm = function(term) { s_terms.push(term); }
}


var streams = new Array();
var inAnimation = false;

function displayTerm(element, term) {
	element.append('<div id="'+term+'" class="term">'+term+' <a href="#">x</a></div>');
	
	/* Term deletion */
 	element.find('div#'+term+' > a').click(function() {
		var term_name = $(this).parent().attr('id');
		$.ajax({ url: '/streams/'+getCurrentStreamId()+'/terms/'+term_name, type: 'DELETE', timeout: 6000, success: function(data, textStatus, XMLHttpRequest) {
			if (XMLHttpRequest.status == '204') {
				// Deleted
				$('div#logs_container > div:not(.logs_hidden) > div.terms > div#'+term_name).fadeOut('normal', function() {
					$(this).remove();
				});
			} else {
				// Something seriously went wrong
			}
		}});
	});
}

function addTerm(element, term) {
	$.ajax({ url: '/streams/'+getCurrentStreamId()+'/terms',  data: { term: term }, type: 'POST', timeout: 6000, success: function(data, textStatus, XMLHttpRequest) {
		if (XMLHttpRequest.status == '201') {
			// Created
			streams[getCurrentStreamId()].Terms.push(term);
			displayTerm(element, term);
			element.parent().find('input').val('');
		} else {
			// Something seriously went wrong
		}
	}});
}

function getCurrentStreamId() {
	return $('ul.tabs').find('.selected').parent().attr('id');
}

function switchToStream(stream) {
	var selected_tab = $('ul.tabs').find('.selected');
	selected_tab.removeClass('selected');
	stream.addClass('selected');
	$("div#logs_container").children("div:not(.logs_hidden)").addClass('logs_hidden');
	$("div#logs_container > div#"+stream.parent().attr('id')+"_logs").removeClass('logs_hidden');
}

function setupTabs() {
	/* Tab switching */
	$('ul.tabs > div#streams > li:last > a').click(function() {
		if ((!$(this).hasClass('selected')) && (inAnimation == false)) {
			var stream = $(this);
			switchToStream(stream);
		}
	});
	
	/* Tab deletion */
	$('ul.tabs > div#streams > li:last > div.stream_delete').click(function() {
		var list_element = $(this).parent();
		$.ajax({ url: '/streams/'+list_element.attr('id'), type: 'DELETE', timeout: 6000, success: function(data, textStatus, XMLHttpRequest) {
			// Deleted
			var stream = $('ul.tabs > li#all > a');
			switchToStream(stream);
			$('div#logs_container > div#'+list_element.attr('id')+'_logs').remove();
			list_element.remove();
		}});
	});
	
	/* Term creation */
	$('div#logs_container > div:last > div.term_adder > input').keyup(function(e) {
		var new_term_val = $(this).val();
		var terms_container = $('div#logs_container > div:not(.logs_hidden) > div.terms');
		if((e.keyCode == 13) && (new_term_val != '')) {
			addTerm(terms_container, new_term_val);
		}
	});
	
	$('div#logs_container > div:last > div.term_adder > a').click(function() {
		var new_term_val = $(this).parent().children('input').val();
		var terms_container = $('div#logs_container > div:not(.logs_hidden) > div.terms');
		addTerm(terms_container, new_term_val);
	});
}

function addStream(s) {
	if (s.ID == 'alerts') {
		$('div#streams').append('<li id="'+s.ID+'" class="alerts"><a href="#">'+s.Name+'(<span id="alertsnum">0</span>)</a></li>');
	} else {
		$('div#streams').append('<li id="'+s.ID+'"><a href="#">'+s.Name+'</a><div class="stream_delete">x</div></li>');
	}
	
	$('div#streams li:last').fadeIn('normal');
	$('div#logs_container').append('<div id="'+s.ID+'_logs" class="logs_hidden">'+
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
	var terms_container = $('div#logs_container > div:last > div.terms');
	for (var t in s.Terms) {
		displayTerm(terms_container, s.Terms[t]);
	}
	setupTabs();
}

function getStreams() {
	$.ajax({ url: '/streams', type: 'GET', timeout: 6000, success: function(data, textStatus, XMLHttpRequest) {
		// success
		for (var key in data) {
			var stream = {
				'ID': key,
				'Name': data[key].name,
				'Terms': data[key].terms,
			}
			streams[key] = stream;
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
					var stream = {
						'ID': data,
						'Name': stream_name,
						'Terms': new Array(),
					}
					streams[stream.ID] = stream;
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
		if((!$(this).hasClass('selected')) && (inAnimation == false)) {
			var stream = $(this);
			if (stream.attr('id') != 'add_tab') {
				switchToStream(stream);
			}
		}
	});
});

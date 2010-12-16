var conn;
var maxNumRows = 200;
var alertsCount = 0;

var connect = function() {
  if (window['WebSocket']) {
    conn = new WebSocket('ws://' + location.hostname + ':8000');
	conn.onopen = function() {
		//alert('Connected to the WebSocket!!'); // Uncomment this if you're in doubt that your browser supports WebSockets
	};
	conn.onmessage = function(evt) {
		data = JSON.parse(evt.data);
		
		for (var stream in streams) {
			if (streams[stream].Terms.length > 0) {
				var matchedTerms = 0;
				var message = data['message'];
				
				for (var term in streams[stream].Terms) {
					var re = new RegExp(streams[stream].Terms[term], 'i');
					if (re.test(data['message'])) {
						message = message.replace(streams[stream].Terms[term], '<span style="background-color: #fd8645;">'+
							streams[stream].Terms[term]+'</span>');
						matchedTerms++;
					}
				}
				
				if (matchedTerms > 0) {
					if (stream == 'alerts')
						$('#alertsnum').html(++alertsCount);
					
					var num_rows = $('#div#logs_container > div#'+stream+'_logs > table > tbody:last > tr').size();
					if (num_rows > maxNumRows) {
						$('#div#logs_container > div#'+stream+'_logs > table > tbody:last > tr:last').remove();
					}
					
					$('div#logs_container > div#'+stream+'_logs > table > tbody:last').prepend('<tr class="row"><td>'+
						data['date']+'</td><td>'+
						data['host']+'</td><td>'+
						data['severity']+'</td><td>'+
						data['facility']+'</td><td class="message"><div class="hideextra">'+
						message+'</div></td></tr>');
					
					$('div#logs_container > div#'+stream+'_logs > table > tbody:last > tr.row:first').click(function() {
						$(this).toggleClass('message_expanded');
						$(this).children('td.message').children('div').toggleClass('hideextra');
					});
				}
			}
		}
		
		/* Remove the last line if there are more than maxNumRows */
		var num_rows = $('div#logs_container > div#all_logs > table > tbody:last > tr').size();
		if (num_rows > maxNumRows) {
			$('#div#logs_container > div#all_logs > table > tbody:last > tr:last').remove();
		}
		
		/* Show all logs in the main div */
		$('div#logs_container > div#all_logs > table > tbody:last').prepend('<tr class="row"><td>'+
			data['date']+'</td><td>'+
			data['host']+'</td><td>'+
			data['severity']+'</td><td>'+
			data['facility']+'</td><td class="message"><div class="hideextra">'+data['message']+'</div></td></tr>');
		
		$('div#logs_container > div#all_logs > table > tbody:last > tr.row:first').click(function() {
			$(this).toggleClass('message_expanded');
			$(this).children('td.message').children('div').toggleClass('hideextra');
		});
	};
  }
};

window.onload = connect;

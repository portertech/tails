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
		
		var matchedTag = 0;
		if (terms.length > 0) {
			for (key in terms) {
				var re = new RegExp(terms[key], 'i');
				if (re.test(data['message'])) {
					matchedTag = 1;
					data['message'] = data['message'].replace(terms[key], '<span style="background-color: #fd8645;">'+terms[key]+'</span>');
				}
			}
		}
		
		if (matchedTag == 1) {
			$('#alertsnum').html(++alertsCount);
			
			$('#alertsTable > tbody:last').prepend('<tr class="row"><td>'+
			data['date']+'</td><td>'+
			data['host']+'</td><td>'+
			data['severity']+'</td><td>'+
			data['facility']+'</td><td class="message"><div class="hideextra">'+
			data['message']+'</div></td></tr>');
			
			$('#alertsTable > tbody > tr.row:first').click(function() {
				$(this).toggleClass('message_expanded');
				$(this).children('td.message').children('div').toggleClass('hideextra');
			});
			
			var alerts_num_rows = $('#alertsTable > tbody > tr').size();
			if (alerts_num_rows > maxNumRows) {
				$('#alertsTable > tbody:last > tr:last').remove();
			}
		}
		
		$('#messagesTable > tbody:last').prepend('<tr class="row"><td>'+
		data['date']+'</td><td>'+
		data['host']+'</td><td>'+
		data['severity']+'</td><td>'+
		data['facility']+'</td><td class="message"><div class="hideextra">'+
		data['message']+'</div></td></tr>');
		
		$('#messagesTable > tbody > tr.row:first').click(function() {
			$(this).toggleClass('message_expanded');
			$(this).children('td.message').children('div').toggleClass('hideextra');
		});
		var num_rows = $('#messagesTable > tbody > tr').size();
		if (num_rows > maxNumRows) {
			$('#messagesTable > tbody:last > tr:last').remove();
		}
	};
  }
};

window.onload = connect;

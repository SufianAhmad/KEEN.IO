(function(){

		$('button').on('submit', function(){
			
			$.ajax({
				url:"http://api.openweathermap.org/data/2.5/weather?zip=38000,PK&APPID=bb1804c0a316a1fbfb1c52231879c19d",
				success: function(result){	
					
						$('h3.city').text(result.name);
						$('h4.country').text(result['sys'].country);
						$('h4.temprature').text(result['main'].temp);
					
				}
			});		
		});
	})();
//
//	Begin Geo Location
//

Titanium.Geolocation.purpose = "Receive User Location";
Titanium.Geolocation.accuracy = Titanium.Geolocation.ACCURACY_NEAREST_TEN_METERS;
//	Set Distance filter. This dictates how often an event fires based on the distance the device moves. This value is in meters. 30.48 meters = 100 feet.
Titanium.Geolocation.distanceFilter = 30.48;

if (Titanium.Geolocation.locationServicesEnabled)
{
	Titanium.API.info('Geolocation services are on.');
	} else {
	Titanium.UI.createAlertDialog({title:'Geolocation Off', message:'Your device has location services turned off - please turn it on.'}).show();
}; //	end of Alert to see if you have geolocaiton turned on.

function currentLocation(_callback){
	Ti.Geolocation.getCurrentPosition(function(e) {
		if (e.error) {
			Ti.API.error('Can not get your current location: ' + e.error);
//  If the App can not get a current position when it has launched, we need to tell the user there is a problem.
			var lostSignal = Ti.UI.createAlertDialog({
			title:'GPS unavailable',
			message:'Check to see that you have a phone signal or Wi-Fi connection.'
			});
			lostSignal.show();
		} else {
			//Ti.API.info('got a location from currentPosition from function currentLocation :' + JSON.stringify(e));
			//Ti.App.fireEvent('current.position',e.coords);
			
			if (_callback) {
				_callback(e.coords);
			}
			
			return;
		}
	});	
}

//Make the API call
function movingLocation(_callback){
	Ti.Geolocation.addEventListener('location', function(e) {
		if (e.error) {
		Ti.API.error('Error: ' + e.error);
	//  If the App can not get a current position when it has launched, we need to tell the user there is a problem.
		var lostSignal = Ti.UI.createAlertDialog({
		title:'GPS unavailable',
		message:'Check to see that you have a phone signal or Wi-Fi connection.'
		});
		lostSignal.show();
		return;
		} else {
		
		if (_callback) {
			_callback(e.coords);
			}
			return;
		}
	});
}
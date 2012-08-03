/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//	The followin2g script showcases the Map Google API and current position of the user.						  //
//	There is also a listener event that will change the way the map behaves in accordance to					  //
//	the GPS location of the user by shifting the view to their location on "eventListener('location')"			  //
//																												  //
//	The PHP script will update the annotations on the map of the most up to date locations of other recordings.   //
//																												  //
//	Hector Leiva - 2011 - 2012																					  //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
win2.backgroundColor = 'black';

//	The Ti.include() includes these functions currentLocation() and function movingLocation() which calls the GPS locations of the user;
Ti.include('currentLocation.js');
Titanium.Media.audioSessionMode = Ti.Media.AUDIO_SPEAKER;
//	Top label for the very top of the app that will show where the user is located throughout the app.
var titleLabel = Titanium.UI.createLabel({
    color:'#333333',
    height:18,
    width:210,
    top:10,
    text:'Map',
    textAlign:'center',
    font:{fontFamily:'Arial',fontSize:20,fontWeight:'bold'},
    shadowColor:'#eee',shadowOffset:{x:0,y:1}
});
//	Setting the label and putting it to the top of the window.
win2.setTitleControl(titleLabel);

//
//	Globally Declared Variables
//

//	Variables that are needed to accept the incoming JSON data and create arrays needed to make map annotations
var currentLatitude;
var currentLongitude;
var easyClock = [];
var audioURL = [];
var miniMapLatitude = [];
var miniMapLongitude = [];
var annotations = [];

// Button to allow the user to manually refresh the map for memory locations

//	Reload Button

var reloadButton = Titanium.UI.createButton({
	systemButton:Titanium.UI.iPhone.SystemButton.REFRESH,
	right:50
	});
win2.setRightNavButton(reloadButton);

// Create audio streaming player
// load from remote url

var sound = Titanium.Media.createAudioPlayer({
	allowBackground: true,
	preload:true
});


//	Start by creating the Map with these current coordinates.
var mapView = Titanium.Map.createView({
	mapType: Titanium.Map.STANDARD_TYPE,
    animate:true,
    regionFit: true,
    userLocation:true
});

// Create an event where once the map loads or if the region changes, to bring up a search button that will look on the map for near-by annotations. To
// load it from just the map loading would cause too many calls if you are zoomed in - maybe overloading the amount of requests.
mapView.addEventListener('complete', function(e){
	Ti.API.info('mapView completed.');
});

mapView.addEventListener('error', function(e) {
	Ti.API.info('Error with mapView: ' + e.error);
});

/*	Getting a location now is in its own file and it is called by using a function onto the page. 
 *	Below is an example of setting the Map View to run everytime there is a movement on the screen.
 *	There are two functions that call for the location services. This is required or else the function
 *	will only work for one of the calls. That is why there is a gpsCallback & gpsAnnotations function
 *	running at the same time.
 */

movingLocation(gpsCallback);
movingLocation(gpsAnnotations);


// To center the map whenever there is movement from the user. Helpful if the user is travelling at higher speeds, this will continue to the center the map.
function gpsCallback(_coords){
	Ti.API.info('win2.js gpsCallback(_coords) function affecting mapView.setLocation() Latitude: ' + _coords.latitude + ' Longitude: ' + _coords.longitude);
	mapView.setLocation({
	latitude: _coords.latitude,
	longitude: _coords.longitude,
	//	The latitude and longitude deltas below indicate the zooming 
	//	in on the initial map creation in the app. This is a good zoom-in 
	//	to indicate where you are in not have to zoom in too much.
	latitudeDelta:0.01, longitudeDelta:0.01,
	animate: true
	});

}


//	gpsAnnotations() will whenever the user moves a certain amount of space (dictated in meters from the 'currentLocation.js'), this function will run
//	and do the following; remove all the annotations that it may have listed before hand, get the current latitude & longitude coordinates, make a call
//	to the server for what are the closest annotations from the user's location.
function gpsAnnotations(_coords){
	
	//	Runs the above function which goes through all the annotations and removes them and makes the array empty.

	currentLatitude = _coords.latitude;
	currentLongitude = _coords.longitude;

	//	URL that will be sent to the server to request all annotations closest to the user. The _coords.latitude & _coords.longitude values are created
	//	by using the movingLocation() function from the 'currentLocation.js' file and having it run through all of this once the function goes through.	
	var geturl="http://thematterofmemory.com/masterGPSCoordinatesDirectory/memorymappingcoordinates.php?latitude=" + _coords.latitude + "&longitude=" + _coords.longitude;
	Titanium.API.info('The region changed on the map: ' + geturl);
	
	var xhr = Titanium.Network.createHTTPClient();
	xhr.open('GET', geturl, false);
	xhr.onerror = function(e){
		//	Adding an alert to tell the user that there was an error trying to get the annotations from their current position that recently moved.
		var lostSignal = Ti.UI.createAlertDialog({
			title:'Unable to update map',
			message:'Check to see that you have a phone signal or Wi-Fi connection.'
		});
		//	The alert will stay up for about 3 seconds and then go away.
		setTimeout(function(){
			lostSignal.show();
		},3000);
		
		Ti.API.info('There was an error trying to connect to the server.' + e.error);
		};
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//	Upon getting a server response, the function will make that response equal to an array and run through the array until the response is empty.	 //
	//	For each latitude and longitude value that is returned from the server, they will be a latitude and longitude value to set for the annotations.	 //
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	xhr.onload = function(){
	Titanium.API.info('From win2.js & The Matter of Memory.com: ' + this.responseText);
	var incomingData = JSON.parse(this.responseText);
	for (var i = 0; i < incomingData.length; i++){
	var recorded = incomingData[i];
	var plotPoints = Titanium.Map.createAnnotation({
		latitude: recorded.Latitude,
		longitude: recorded.Longitude,
		miniMapLatitude: recorded.Latitude,
		miniMapLongitude: recorded.Longitude,
		title: 'Memory',
		subtitle: 'Click to listen',
		date: recorded.easytime,
		easyClock: recorded.easyclock,
		audioURL: recorded.AudioURL,
		rightButton: Titanium.UI.iPhone.SystemButton.DISCLOSURE,
		animate:true
		});
	
		plotPoints.pincolor = Titanium.Map.ANNOTATION_GREEN;

		mapView.addAnnotation(plotPoints);

		annotations.push(plotPoints);
		}; // end of for loop
    
	}; // end of xhr.onload()

	xhr.send();
};


var region_changing = function reloadGPSAnnotations(){	
	//	In this function, reloadGPSAnnotations, is going to be supplied within another function in order to be able to place it into the API for Titanium to engage
	//	a removal of all annotations and call out to the server for a new drawing of annotations. There will be a view created to prevent movement of the map
	//	and a loading symbol to indicate that the call is being made and awaiting a response.

	function removeAnnotations(){
		var annotations
    for (i=annotations.length-1;i>=0;i--) {
        mapView.removeAnnotations(annotations[i]);
    }
    	annotations = [];
	}
	removeAnnotations();

	//	Create view that will block out the map.
	var view = Titanium.UI.createView({
		backgroundColor:'black',
		width: '100%',
		height: '100%',
		opacity: 0.6
		});
	win2.add(view);

	//	Adding the Activity Indicator to showcase loading time for when the Refresh button is hit and to reload the pins.
	var activityIndicator = Ti.UI.createActivityIndicator({
		color: 'white',
		font: {fontFamily:'Helvetica Neue', fontSize:20, fontWeight:'normal'},
		message: 'Loading...',
		style:Ti.UI.iPhone.ActivityIndicatorStyle.PLAIN,
		top:'auto', /* needs to have a value other than 'auto', what value would that be then to center it? */
		left:'auto', /* needs to have a value other than 'auto', what value would that be then to center it? */
		height:'auto',
		width:'auto'
		});
	//	Both of the methods below need to occur to add the activity indicator. Adding it to the current window and then placing a show() method.
	win2.add(activityIndicator);
	activityIndicator.show();
	
	//	Setting up the URL for the GET request where we will be supplying our GPS location in order to receive back the closest memories from our current location
	//	in a radius.
	var geturl="http://thematterofmemory.com/masterGPSCoordinatesDirectory/memorymappingcoordinates.php?latitude=" + currentLatitude + "&longitude=" + currentLongitude;
	Titanium.API.info('Reloading the annotations, this is the current URL including current GPS coordinates: ' + geturl);
	
	//	Opening the request to the server.
	var xhr = Titanium.Network.createHTTPClient();
	
	//	Saying that it is a GET request, our URL was supplied above as a variable 'geturl'
	xhr.open('GET', geturl, false);
	
	//	If the request causes an error of any sort, we will remove the view that is blocking out the map and the activity indicator and return with an
	//	alert that will tell the user that there was an issue with the connection.
	
	xhr.onerror = function()
		{
			//	Removing the activityIndicator from view, and then also hiding it.
			activityIndicator.hide();
			win2.remove(activityIndicator);
			
			//	Removing the view that is blocking the map.
			win2.remove(view);
			
			//	Adding an alert to tell the user that there was an error trying to refresh the page.
			var lostSignal = Ti.UI.createAlertDialog({
			title:'Connection Lost',
			message:'Check to see that you have a phone signal or Wi-Fi connection.'
			});
			
			//	The alert will stay up for about 3 seconds and then go away.
			setTimeout(function(){
				lostSignal.show();
			},3000);

		//	This is for us on the Titanium Development side, this will list explicitly what the error was, it will then return and stop any other processes.
		Titanium.API.info('IN ERROR' + e.error);
		return;
		}
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//	Upon getting a server response, the function will make that response equal to an array and run through the array until the response is empty.	 //
	//	For each latitude and longitude value that is returned from the server, they will be a latitude and longitude value to set for the annotations.	 //
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	xhr.onload = function(){
		//	The response was successful, we will remove the activityIndicator and view and begin to add the annotations.
		//	Removing the activityIndicator
		win2.remove(activityIndicator);
		activityIndicator.hide();
		//	Removing the view that is blocking the map
		win2.remove(view);
		Titanium.API.info('Response from the Reload button: ' + this.responseText);
		
		//	incomingData is now a set-up variable that will absorb the response from the server which was in JSON format, and then parse it
		//	to have the array labelled and added to the annotation properties.
		//var annotations = [];

		var incomingData = JSON.parse(this.responseText);
		for (var i = 0; i < incomingData.length; i++){
			var recorded = incomingData[i];
			plotPoints = Titanium.Map.createAnnotation({
				latitude: recorded.Latitude,
				longitude: recorded.Longitude,
				miniMapLatitude: recorded.Latitude,
				miniMapLongitude: recorded.Longitude,
				title: 'Memory',
				subtitle: 'Click to listen',
				date: recorded.easytime,
				easyClock: recorded.easyclock,
				audioURL: recorded.AudioURL,
				rightButton: Titanium.UI.iPhone.SystemButton.DISCLOSURE,
				animate:true
				});
		
			plotPoints.pincolor = Titanium.Map.ANNOTATION_GREEN;
	
			mapView.addAnnotation(plotPoints);
	
			annotations.push(plotPoints);
			}; // end of for loop
		}; // end of xhr.onload()

	xhr.send();
};

reloadButton.addEventListener('click', region_changing);

//	If the annotation is pressed, the user is given a small flag that states 'Memory: Click here to listen' which once it is clicked, the user
//	is moved to a 'detail_window' which is a sub-window to the map window. What happens here is the app will build a new window and create
//	a view to block the user from moving anything while the sound loads. Once the sound is done loading, all views/activityIndiactors will be removed
//	allowing the user to see a miniature map of where the memory was made (and an annotation being more specific as to where) and also list the
//	date/time that annotation was made above the map. There will be audio controllers at the bottom of the screen (above the tabs) to allow the user
//	to replay the memory if they wish.

//	User presses the 'Memory: Click here to listen' annotation, we will now build the window.
mapView.addEventListener('click', function(e) {
	//	This is the window that is created when you 'click' on a pin and go for the detail of the memory. In this window, 
	//	the audio file will load and showcase the time/date and a mini-map of where that memory was created.
	var detail_win2 = Titanium.UI.createWindow({
		title:'Map View', 
		backgroundColor:'#999', 
		barColor: '#999999'
		});
	
	//	That right-arrow symbol that locates above the annotation is the 'rightButton'
    if (e.clicksource == 'rightButton') {
		Ti.API.info('Opening the mapView annotation details.');
	
		//	This label is specific to the date of the memory. These are all the properties of that label.
		var dateLabel = Titanium.UI.createLabel({
   			text: '',
   			color:'#ffffff',
  			height: 'auto',
   			width: 'auto',
   			font:{fontFamily:'Arial',fontSize:'20%',fontWeight:'normal'},
   			top: '5%',
   			textAlign: 'TEXT_ALIGNMENT_CENTER'
			});
    
    	//	This label is specific to the time (in terms of Eastern Standard Time)
		var clockLabel = Titanium.UI.createLabel({
	   		text: '',
   			color:'#ffffff',
   			height: 'auto',
	   		font:{fontFamily:'Arial',fontSize:'28%',fontWeight:'normal'},
   			top: '18%',
	   		textAlign: 'TEXT_ALIGNMENT_CENTER'
			});
		
		//	Activity Indicator for when the sound is beginning to be loaded.
		var activityIndicator = Ti.UI.createActivityIndicator({
			color: 'white',
			font: {fontFamily:'Helvetica Neue', fontSize:20, fontWeight:'normal'},
			message: 'Loading...',
			style:Ti.UI.iPhone.ActivityIndicatorStyle.PLAIN,
			});
			
		//	I believe this is to indicate how far in front the activityIndicator is against all the other elements in the app. This puts it 9 levels
		//	in front of the base level.
		activityIndicator.zIndex = 9;
		
    	//	View to load in front of all the other details to block the user from being able to access the map before the audio has fully loaded.
    	var loadingView = Titanium.UI.createView({
			backgroundColor:'black',
			width: '100%',
			height: '100%',
			opacity: 0.6
			});
		
		
		//////////////////////////////
		//	BUTTONS FOR STREAMING  //
		/////////////////////////////

		//
		//	PLAY
		//
		var playButton = Titanium.UI.createButton({
			systemButton:Titanium.UI.iPhone.SystemButton.PLAY,
			left:30,
			enabled:true
			});
			
			function playAudio(){
				sound.start();
				}

		playButton.addEventListener('click', playAudio);

		//
		//	PAUSE
		//

		var pauseButton = Titanium.UI.createButton({
			systemButton:Titanium.UI.iPhone.SystemButton.PAUSE,
			enabled:true
			});
			
			function pauseAudio(){
				sound.pause();
				}
			
		pauseButton.addEventListener('click', pauseAudio);

		//
		//	REWIND
		//

		var rewindButton = Titanium.UI.createButton({
			systemButton:Titanium.UI.iPhone.SystemButton.REWIND,
			left:50,
			enabled:true
			});
			
			function rewindAudio(){
				sound.stop();
				sound.start();
				}

		rewindButton.addEventListener('click', rewindAudio);
			
		//	Adding all of these elements together at the bottom of the screen above the main buttons
		var flexSpace = Titanium.UI.createButton({
			systemButton:Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
			});
	
		//	The window that was just created when the user pressed the 'right-Button' will now add the following elements.
		detail_win2.add(dateLabel);
		detail_win2.add(clockLabel);
		detail_win2.setToolbar([playButton,flexSpace,pauseButton,flexSpace,rewindButton], {translucent:true});
		
		
	//If there is sound playing from the memory you just recorded and are about to listen to a recording someone else made - let us stop your playback.
	//	if (sound_01 != null) {
	//		sound_01.stop();
	//	} else {
		
	//	Calls the 'date' array from when the annotations was being created and will substitute the 'text' field
	//	within the 'dateLabel'. It will be replaced everytime without overlap.
		dateLabel.text = e.annotation.date;
		clockLabel.text = e.annotation.easyClock;
		annotationURL = e.annotation.audioURL;
		
		//	This puts the URL location of where the soundPlayer (that streams the audio as oppose to downloading it) will be getting the
		//	audio. As of July 2012, all of these URLs now come from an Amazon S3 server specific to this project.
		sound.url = e.annotation.audioURL;

		//	Within the 'miniMap' there will also be another annotation only specific to the one that the user picked to listen to.
		//	MiniPlotPoints will create that annotation.
		var miniPlotPoints = Titanium.Map.createAnnotation({
			latitude: e.annotation.latitude,
			longitude: e.annotation.longitude,
			title: 'Memory',
			animate:true
			});
	
		miniPlotPoints.pincolor = Titanium.Map.ANNOTATION_GREEN;

		//	The miniMap that will show a very zoomed-in location of the annotation/memory that the user picked.
		var mapMiniView = Ti.Map.createView({
			bottom: '13%',
			height: '50%',
			width: '98%',
			userLocation: false,
			mapType: Ti.Map.STANDARD_TYPE,
			animate: false,
			regionFit: true,
			borderColor: 'black',
			borderWidth: 4,
			region: {latitude: e.annotation.miniMapLatitude, longitude: e.annotation.miniMapLongitude, latitudeDelta: 0.0001, longitudeDelta: 0.0001}
			});
	
		//	The miniMap will now add the annotation as soon as the mapView has finished loading.
		mapMiniView.addAnnotation(miniPlotPoints);
		//	Detail window now adds all of this together.
		detail_win2.add(mapMiniView);

		//	tabGroup.activeTab.open() is the function that allows the window to open another window within a window. Having it 'animated:true' set
		//	means that it'll slide from the right-to-left animation and create a tab on the top-left to allow the user to move back to the main
		//	map.
		tabGroup.activeTab.open(detail_win2,{animated:true})
	
		//	A 'trick' that may or may not cause memory leaks, but it will help in determining if the screen is still loading
		//	in order to be able to remove it if need be.
		detail_win2.add(loadingView);
		detail_win2.Loading_View = loadingView;
		
		
		//	A 'trick' that may or may not cause memory leaks, but it will help in determining if the screen is still loading
		//	in order to be able to remove it if need be.
		detail_win2.add(activityIndicator);
		activityIndicator.show();
		detail_win2.Activity_Indicator = activityIndicator;
		
		//	The sound will begin to stream now.
		sound.start();
		
	}	//	END if (e.clicksource == 'rightButton')

	//	The sound event will determine if there is any progress in the playing going on indicating that there is playback.
	//	If there is playback, the following things will happen.
		
	sound.addEventListener('progress', function(e){
		Ti.API.info('Time Player: ' + Math.round(e.progress) + ' milliseconds');
		//	If the playing has progressed beyond 100 milliseconds, that means that audio is playing.
		if (e.progress > 10){
			if (detail_win2.Loading_View) {
				detail_win2.remove(loadingView);
				detail_win2.Loading_View = null;
				}
			if (detail_win2.Activity_Indicator){
				activityIndicator.hide();
				detail_win2.remove(activityIndicator);
				detail_win2.Activity_Indicator = null;
				}
			}
		}); //	END sound.addEventListener('progress', function(e));

	detail_win2.addEventListener('close', function(){
		//	The sound stream will close the stream and terminate all audio.
		sound.stop();
		
		//	Once detecting that the detail_window has been closed, we can remove all of the items that we added above in order to free up memory.
		detail_win2.remove(dateLabel);
		detail_win2.remove(clockLabel);
		detail_win2.remove(mapMiniView);
		
		//	The last stage in the 'trick' of determining if these objects have loaded or not. If yes to either of these cases, it will remove
		//	either the Activity Indicator or the Loading View or both.
		if (detail_win2.Loading_View) {
			detail_win2.remove(loadingView);
			detail_win2.Loading_View = null;
		}
		
		if (detail_win2.Activity_Indicator){
			activityIndicator.hide();
			detail_win2.remove(activityIndicator);
			detail_win2.Activity_Indicator = null;
		}
		
		//	Removing all the eventlisteners that we established with the audio buttons as well to free up memory.
		rewindButton.removeEventListener('click', rewindAudio);
		pauseButton.removeEventListener('click', pauseAudio);
		playButton.removeEventListener('click', playAudio);
		
		Ti.API.info('detail_win2 has closed.');
	});

}); // END mapView.addEventListener('click', function(e))

//
// SOUND EVENTS
//

sound.addEventListener('resume', function()
{
	Titanium.API.info('RESUME CALLED');
});

win2.add(mapView);
//win2.setToolbar([flexSpace,searchButton,flexSpace]);

Ti.App.addEventListener('pause', function(e) {
    // app is paused during phone call, so pause the stream
    sound.setPaused(true);
    // you could also use streamer.pause()
});

Ti.App.addEventListener('resume', function(e) {
    // app resumes when call ends, so un-pause the stream
    sound.setPaused(false);
    // or use streamer.start()
});

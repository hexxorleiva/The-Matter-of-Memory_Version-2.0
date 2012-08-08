/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//	This section of the code will do the following: 															   //
//	Audio:  																									   //
//	- Record an audio file with a ".mp4" extension																   //
//	- Playback immediate file																					   //
//	- Send audio file to a server that will interpert through a PHP script as where to save it on the server       //
//	GPS: 																										   //
//	- Log current GPS coordinates																				   //
//	- Button press to send GPS coordinates																		   //
//	Hector Leiva - 2011-2012																					   //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
win3.backgroundColor = '#333';

Titanium.Media.audioSessionMode = Ti.Media.AUDIO_SESSION_MODE_PLAY_AND_RECORD;

var titleLabel = Titanium.UI.createLabel({
    color:'#333333',
    height:18,
    width:210,
    top:10,
    text:'Record',
    textAlign:'center',
    font:{fontFamily:'Arial',fontSize:20,fontWeight:'bold'},
    shadowColor:'#eee',shadowOffset:{x:0,y:1}
});
win3.setTitleControl(titleLabel);

// Creating the modal window that will come up once the "Record" button is pressed
var modal = Ti.UI.createWindow({
	navBarHidden:false,
	backgroundColor:'#333',
	barColor: '#CC0000'
});

//
//	Recording Audio Global Identifiers
//

var recording = Ti.Media.createAudioRecorder();
var file;
var sound_01;
var audioName = 'recording';
var newAudiofile = 'recording.mp4';
var file_recorded = Titanium.Filesystem.getFile(newDir.nativePath, newAudiofile);
upload_audio = file_recorded.read();

//
// Countdown Timer
//
var countDown =  function( m , s, fn_tick, fn_end  ) {
	return {
		total_sec:m*60+s,
		timer:this.timer,
		set: function(m,s) {
			this.total_sec = parseInt(m)*60+parseInt(s);
			this.time = {m:m,s:s};
			return this;
		},
		start: function() {
			var self = this;
			this.timer = setInterval( function() {
				if (self.total_sec) {
					self.total_sec--;
					self.time = { m : parseInt(self.total_sec/60), s: (self.total_sec%60) };
					if (self.total_sec < 70 && self.total_sec >= 60){
						self.time = { m : parseInt(self.total_sec/60), s: "0" + (self.total_sec%60) };
					}
					if (self.total_sec < 10) {
						self.time = { m : parseInt(self.total_sec/60), s:"0" + (self.total_sec%60) };
					}
					fn_tick();
				}
				else {
					self.stop();
					fn_end();
					modal.close();
				}
				}, 1000 );
			return this;
		},
		stop: function() {
			clearInterval(this.timer)
			this.time = {m:0,s:0};
			this.total_sec = 0;
			return this;
		}
	}
}

var my_timer = new countDown(2,00, 
		function() {
			display_lbl.text = my_timer.time.m+" : "+my_timer.time.s;
		},
		function (){
			if (my_timer.time.m == 0 && my_timer.time.s == 0) {
			alert("The time is up!");
			modal.close();
			stopRecording();
			}
		} 
	);

var display_lbl =  Titanium.UI.createLabel({
	text:"2 : 00",
	height:50,
	width:240,
	top:60,
	color:'#fff',
	borderRadius:10,
	backgroundColor:'#333',
	font:{
		fontSize:60,
		fontWeight:'bold'
	},
	textAlign:'center'
});
	my_timer.set(2,00);
	

// default compression is Ti.Media.AUDIO_FORMAT_LINEAR_PCM
// default format is Ti.Media.AUDIO_FILEFORMAT_CAF

// this will give us a wave file with µLaw compression which
// is a generally small size and suitable for telephony recording
// for high end quality, you'll want LINEAR PCM - however, that
// will result in uncompressed audio and will be very large in size

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
// In addition, for the "createAudioPlayer()" function to read any audio created through Titanium. It seems	//
// that the audio needs to have ACC - format, and MP4 - fileformat. Otherwise it will NOT read correctly	//
// and return "Parse Errors" within the player. This has been my experience.								//
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

recording.compression = Ti.Media.AUDIO_FORMAT_AAC; //Was Ti.Media.AUDIO_FORMAT_ULAW
recording.format = Ti.Media.AUDIO_FILEFORMAT_MP4; //Was Ti.Media.AUDIO_FILEFORMAT_WAVE

//
//	Geolocation Global Identifiers
//
var uploadGPS = '';
var updatedLocation;
var updatedLatitude;
var latitude;
var longitude;
var datatoWrite;
var coordinates = 'coordinates';

/*
Titanium.Geolocation.purpose = "Recieve User Location";
Titanium.Geolocation.accuracy = Titanium.Geolocation.ACCURACY_BEST;
//	Set Distance filter. This dictates how often an event fires based on the distance the device moves. This value is in meters. 50 meters = 33 feet.
Titanium.Geolocation.distanceFilter = 10;
*/
//	Getting the files - GPS
var gps_recorded = Titanium.Filesystem.getFile(newDir.nativePath, "coordinates.JSON");
//	Loading file into a variable
var uploadGPS = gps_recorded.read();
//Outputting Variable into Titanium GUI for debugging
Titanium.API.info(uploadGPS);


//	Activity Indicator
var actInd = Titanium.UI.createActivityIndicator({ 
	height:50,
	width:10,
	bottom:10,
	style:Titanium.UI.iPhone.ActivityIndicatorStyle.PLAIN
});

win3.add(actInd);

//	View to stop anyone from submitting when they are recording
var view = Titanium.UI.createView({
	backgroundColor:'black',
	width: 320,
	height: 480,
	opacity: 0.5,
	bottom:0
});

//	Progress Bar
var progressBar = Titanium.UI.createProgressBar({
	width:250,
	min:0,
	max:1,
	value:0,
	color:'#fff',
	message:'Uploading ... Please Be Patient.',
	font:{fontSize:12, fontWeight:'bold'}
});

//
//	Timeout - Functions and alerts
//
		
		
var lostSignal = Ti.UI.createAlertDialog({
		title:'Connection Lost',
		message:'Check to see that you have a phone signal or Wi-Fi connection.'
});

var lostServer = Ti.UI.createAlertDialog({
		title:'Timed Out',
		message:'There was an issue connecting to the server, please wait and try again.'
});


//
//	HTTPClient "Payload" Global Identifiers
//

var postData = {
	"media": upload_audio, //These need to be in double quotes to be accepted in the PHP script
	//"name": audioName, //These need to be in double quotes to be accepted in the PHP script
	"coords": uploadGPS //These need to be in double quotes to be accepted in the PHP script
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//	Geolocation is triggered within 30.48 meters. That location is written onto a writeable directory within Titanium Appcelerator's file structure //
//	and have it saved to then be uploaded whenever.																								 //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

movingLocation(gpsCallback);

function gpsCallback(_coords){
	Ti.API.info(' Recording Window : Latitude : ' + _coords.latitude + ' Longitude : ' + _coords.longitude);
	datatoWrite = {
	"latitude": _coords.latitude,
	"longitude": _coords.longitude
	};
	//This data will be written into a JSON file once the 'Done' button is hit while in Record mode.
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//																													  	  //
//	The Following Section are for the Buttons to do one of the following: Record, Playback Recording, Submit to Server	  //
//																													      //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//
//	Button - Ready to Record
//

var record = Titanium.UI.createButton({
	title:'Record',	
	backgroundColor:"#990000",
	borderRadius: 7,
	borderWidth: 1,
	borderColor: "#fff",
	style:'none',
	height:40,
	width:190,
	left:30,
	top:30, // top:60
	color:"#fff",
	enabled: true
});

win3.add(record);

//
//	Label Title - Ready to Record
//
var describeTitle = Titanium.UI.createLabel({
	text: 'Before Recording:',
	left:30,
	top:70,
	width:300,
	textAlign:'left',
	font:{fontSize:14,fontfamily:'Helvetica Neue'},
	height:'auto',
	color:'#CCC'
});

win3.add(describeTitle);

//
//	Label Body - Ready to Record
//
var describeText = Titanium.UI.createLabel({
	text: 'Why is this place important to you?',
	left:30,
	top:85,
	width:300,
	textAlign:'left',
	font:{fontSize:14,fontfamily:'Helvetica Neue'},
	height:'auto',
	color:'#CCC'
});

win3.add(describeText);

//
//	Label for Modal window - Why is this place important to you?
//

var describeTextModal = Titanium.UI.createLabel({
	text: 'Why is this place important to you?',
	top:200,
	width:300,
	textAlign:'center',
	font:{fontSize:18,fontfamily:'Helvetica Neue'},
	height:'auto',
	color:'#CCC'
});

//
//	Button - Playback Recording
//

var playback = Titanium.UI.createButton({
	title:"Playback Recording",
	backgroundColor:"#009900",
	borderRadius: 7,
	borderWidth: 1,
	borderColor: "#fff",
	style: "none",
	height:40,
	width:220,
	top:140,
	left:30,
	color:"fff",
	enabled: true
});

win3.add(playback);

//
//	Label: Playback Body
//
var playbackText = Titanium.UI.createLabel({
	text: 'Listen to your memory before submitting.',
	left:30,
	top:180,
	width:250,
	textAlign:'left',
	font:{fontSize:14,fontfamily:'Helvetica Neue'},
	height:'auto',
	color:'#CCC'
});

win3.add(playbackText);

//
//	Button - Submit Recording
//

var upload = Titanium.UI.createButton({
	title:"Submit Memory",
	backgroundColor:"#0066cc",
	borderRadius: 7,
	borderWidth: 1,
	borderColor: "#fff",
	style: "none",
	height:40,
	width:200,
	top:250,
	left:30,
	color:"#fff",
	enabled: true
});

win3.add(upload);

//
//	Label: Submit Recording Body
//
var submitText = Titanium.UI.createLabel({
	text: 'Submit your memory.',
	left:30,
	top:290,
	width:220,
	textAlign:'left',
	font:{fontSize:14,fontfamily:'Helvetica Neue'},
	height:'auto',
	color:'#CCC'
});

win3.add(submitText);

//
//	Label: Warning about Time Limit - Modal Window
//
//var timeLimitModal = Titanium.UI.createLabel({
//	text: 'There is a limit of 2 minutes for recording time.',
//	bottom:50,
//	width:300,
//	textAlign:'center',
//	font:{fontSize:12,fontfamily:'Helvetica Neue',fontWeight:'bold'},
//	height:'auto',
//	color:'#fff'
//});

var timeRemaining = Titanium.UI.createLabel({
	text: 'Time Remaining',
	top:115,
	width:200,
	textAlign:'center',
	font:{fontSize:19,fontfamily:'Helvetica Neue',fontWeight:'normal'},
	height:'auto',
	color:'#fff'
});

function stopRecording(){
	file = recording.stop();
	newAudiofile = Titanium.Filesystem.getFile(newDir.nativePath, 'recording.mp4');
	if (newAudiofile.exists()) {
		newAudiofile.deleteFile();
		newAudiofile.write(file.toBlob);
		} else {
		newAudiofile.write(file.toBlob);
		}
	//startLabel.text = 'Ready to Record';
	Ti.Media.stopMicrophoneMonitor();
}

/////////////////////////////////////////////////////////
//													  //
//	The Following Section are for the Button Events	  //
//												      //
////////////////////////////////////////////////////////

//
//	Button - Ready to Record - Event!
//
record.addEventListener('click', function(){
	//If the device is unable to record
	if (!Ti.Media.canRecord) {
		Ti.UI.createAlertDialog({
		title:'Error!',
		message:'No audio recording hardware is currently connected.'
		}).show();
	} else {
	//In case someone is listening to a memory on the other tab group - let us stop that.
	sound.stop();
	// Once you've hit the record button, the modal window will come up with all of these options.	
	var done = Titanium.UI.createButton({
		systemButton:Titanium.UI.iPhone.SystemButton.DONE
		});
	modal.setRightNavButton(done);
	modal.add(describeTextModal);
	//modal.add(timeLimitModal);
	modal.add(timeRemaining);
	//Setting up timer
	my_timer.set(2,00);
	my_timer.start();
	//Recording now
	recording.start();
	Ti.Media.startMicrophoneMonitor();
	duration = 0;
	modal.add(display_lbl);
		done.addEventListener('click',function()
		{
		my_timer.stop();
		modal.close();
		stopRecording();
		//Writing the coordinate information once the 'Done' button has been pressed to the variable 'datatoWrite'.
		var newFile = Titanium.Filesystem.getFile(newDir.nativePath,"coordinates.JSON");
		newFile.write(JSON.stringify(datatoWrite));
		});
	// This is the actual part that opens the Modal window.
	modal.open({modal:true});
	}	
});


//
//	Button - Playback Recording - Event!
//
	
playback.addEventListener('click', function(){
	// If there is no file that has been recorded.
	if (file == null) 
		{
		Titanium.UI.createAlertDialog({
		title:'Error',
		message:'You need to record something first!'
		}).show();
		return;
		} else if (sound_01 && sound_01.playing){
			//If the button has already been hit and there is sound playing. We make it go back to normal.
			sound_01.stop();
			sound_01.release();
			playback.title = 'Playback Recording';
			//Re-enabling the Record Button
			record.enabled = true;
			record.color = "#fff"; 
			//Re-enabled the Submit Button
			upload.enabled = true;
			upload.color = "#fff";
			Ti.API.info('Sound exists and is playing; it should now be stopped and returned to normal.');
			//If someone has already hit the record button and is recording a memory.
		} else if (recording.recording) {
			Ti.API.info('It was recording and you hit this? Why?');
			playback.enabled = false;
			playback.color = "#333333";
		} else {
			//There was something recorded, now we are playing it back.
			//Making an instance in case someone recorded something. Then decided to go back and listen to a memory,
			//and then try and listen to the very recording they just did? We will have to stop that sound from coming through.
			sound.stop();
			sound_01 = Titanium.Media.createSound({url:newAudiofile});
			sound_01.play();
			Ti.API.info('Sound should be coming out now.');
			playback.enabled = true;
			//Disabling the Record button while it is playing back
			record.enabled = false;
			record.color = "#333";
			//Disabling the Submit button while it is playing back
			upload.enabled = false;
			upload.color = "#333";
			//Changing the playback title to reflect that now the audio is playing.
			playback.title = 'Stop Playback';
				//Once the playback has finised. We are going to return everything back to normal.
				sound_01.addEventListener('complete', function(){
				//playback title goes back to normal
				playback.title = 'Playback Recording';
				//Re-enabling the Record Button
				record.enabled = true;
				record.color = "#fff"; 
				//Re-enabled the Submit Button
				upload.enabled = true;
				upload.color = "#fff";
				Ti.API.info('Yay, back to normal')
				});
		}
});

//
//	Function to send to server
//
function sendtoserver() {
	
	var lostServer = Ti.UI.createAlertDialog({
		title:'Timed Out',
		message:'There was an issue connecting to the server, please wait and try again.'
		});
		
	var xhr = Titanium.Network.createHTTPClient();
//	Create view that will block out the other Table options while sending to the server.
	try {
		
		var successDisplay = Ti.UI.createAlertDialog({
		title:'Success', 
		message:'Your audio has been uploaded to the server'
		});
		
		var view = Titanium.UI.createView({
			backgroundColor:'black',
			width: 320,
			height: 460,
			opacity: 0.9
			});
		
		win3.add(view);
			
		//	Activity Indicator
		actInd.show();

		//	Progress Bar
		win3.add(progressBar);
		progressBar.show();
			
		xhr.onerror = function(e)
			{
			//	If there is an error in the upload , alert to say "Connection Lost" and restore controls and remove activity indicator
			setTimeout(function(){
				lostServer.show();
				},500);
		
			setTimeout(function(){
				lostServer.hide();
				},3000);
			
			Titanium.API.info('IN ERROR' + e.error);
			//Restorting everything back to normal after error.
			//Taking out blocking view
			win3.remove(view);
			//Hiding activity view
			actInd.hide();
			//Taking out the progress bar completely.
			progressBar.hide();
			progressBar.value = 0;
			win3.remove(progressBar);
			};
		
		//	Setting up timeout function for 25 seconds
		xhr.setTimeout(25000);
		
		xhr.onload = function(e)
			{
			if (this.status == '404') {
				//	If the upload results in a not found page
				Ti.API.info('error: http status code ' + this.status);
				
				setTimeout(function(){
					lostServer.show(); // was successDisplay.show
					},500);
	
				setTimeout(function(){
					lostServer.hide();
					},3000);

				win3.remove(view);
				actInd.hide();

				progressBar.hide();
				progressBar.value = 0;
				win3.remove(progressBar);
				file = null;
					} else {
						Ti.API.info('http status code ' + this.status);
						setTimeout(function(){
							successDisplay.show();
							},500);
	
						setTimeout(function(){
							successDisplay.hide();
							},3000);
						//	If the upload is successful, alert to say "Success" and restore controls and remove activity indicator
						win3.remove(view);
						actInd.hide();

						progressBar.hide();
						progressBar.value = 0;
						win3.remove(progressBar);
						file = null;
						}
			};

		xhr.onsendstream = function(e)
			{
				progressBar.value = e.progress;
				Titanium.API.info('ONSENDSTREAM - PROGRESS: ' + e.progress);
				};
		
		//	To affect where the POST operation for the PHP page will be executed, change the URL here.
		//	was "http://thematterofmemory.com/thematterofmemory_scripts/uploadaudio.php"
		var posturl="http://thematterofmemory.com/masterAudioDirectory/S3_audio_upload.php";
		
		//	open the client
		xhr.open('POST', posturl);
		
		xhr.send(postData);

	} catch(e) {
		Ti.API.info("In Error: " + e.error);
		setTimeout(function(){
			lostServer.show();
			},1000);
	
		setTimeout(function(){
			lostServer.hide();
			},3000);
		Titanium.API.info(e.error);
	}

}; // end of Sendtoserver function


//
//	Button - Upload - Event!
//
	
upload.addEventListener('click', function(e){
	if (file == null)
		{
		Titanium.UI.createAlertDialog({
		title:'Error',
		message:'You need to record something first!'
		}).show();
		return;
		} else if (sound_01 && sound_01.playing || recording.recording) {
			upload.enabled = false;
			upload.color = "#333333";
			Titanium.UI.createAlertDialog({title:'To Submit', message:'Make sure to stop recording and stop playback before submitting.'}).show();
				} else if (file != null){
				sendtoserver();
				}
});
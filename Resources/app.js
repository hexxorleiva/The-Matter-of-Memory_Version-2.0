// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Titanium.UI.setBackgroundColor('#000');

Titanium.Media.audioSessionMode = Titanium.Media.AUDIO_SPEAKER;

//	Creation of a new Directory to store both GPS and audio files. Will check if directory exists.
var newDir = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory,'mydir');
if (newDir.exists('mydir')){
Titanium.API.info('Directory already exists');
} else {
newDir.createDirectory();
Titanium.API.info('Path to newdir: ' + newDir.nativePath);
};

// create tab group
var tabGroup = Titanium.UI.createTabGroup();


//
// create base UI tab and root window
//

var win1 = Titanium.UI.createWindow({  
    backgroundColor:'#000000',
    barColor: '#999999'
});
var tab1 = Titanium.UI.createTab({  
    icon:'introduction_thumbnail.png',
    title:'Introduction',
    window:win1
});
Ti.include('win1.js');
//
// create controls tab and root window
//
var win2 = Titanium.UI.createWindow({  
    backgroundColor:'#000000',
    barColor: '#999999'
});
var tab2 = Titanium.UI.createTab({  
    icon:'compass_rose_thumbnail.png',
    title:'Map',
    window:win2
});
Ti.include('win2.js');


var win3 = Titanium.UI.createWindow({  
    backgroundColor:'#000000',
    barColor: '#999999'
});

var tab3 = Titanium.UI.createTab({  
    icon:'microphone_thumbnail.png',
    title:'Record',
    window:win3
});
Ti.include('win3.js');

//
//  add tabs
//
tabGroup.addTab(tab1);  
tabGroup.addTab(tab2);
tabGroup.addTab(tab3);

// open tab group
tabGroup.open();

// blur event listener for tracking tab changes, this is to make sure that if someone is playing audio from the "record" tab, that it won't bleed over if they tried to listen ot a memory at the same time.
tabGroup.addEventListener('blur', function(e)
{
	//if there is information in the sound_01 variable, proceed with stopping it and resetting everything in the win3.js window
	if (sound_01 != null) {
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
	}
	Titanium.API.info('tab blur - new index ' + e.index + ' old index ' + e.previousIndex);
});
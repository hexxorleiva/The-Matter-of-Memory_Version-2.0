//
//	Introduction
//
win1.backgroundColor = 'black';

var view1 = Ti.UI.createView({
	backgroundColor:'black'
});

//	create the label - Introduction
var titleLabel = Titanium.UI.createLabel({
    color:'#333333',
    height:18,
    width:210,
    top:10,
    text:'Introduction',
    textAlign:'center',
    font:{fontFamily:'Arial',fontSize:20,fontWeight:'bold'},
    shadowColor:'#eee',shadowOffset:{x:0,y:1}
});
win1.setTitleControl(titleLabel);

var labelTitle = Ti.UI.createLabel({
	text:'The Matter of Memory',
	color:'#999',
	textAlign:'center',
	font:{fontSize: 22, fontfamily:'Helvetica Neue'},
	width: 300,
	height:'auto',
	top: 40
});
view1.add(labelTitle);

var subLabel1 = Titanium.UI.createLabel({
	text:'This work has been created to explore the complex relationship between place and memory.',
	color:'#999',
	font:{fontSize:14,fontfamily:'Helvetica Neue'},
	textAlign:'left',
	width: 300,
	height:'auto',
	top: 100
});
view1.add(subLabel1);

var subLabel2 = Ti.UI.createLabel({
	text:'By requiring you to be within a certain radius of the origin of the recording, this work imposes questions of how memories are created and affected by time and space.',
	color:'#999',
	font:{fontSize:14,fontfamily:'Helvetica Neue'},
	textAlign:'left',
	width: 300,
	height:'auto',
	top: 200
})
view1.add(subLabel2);

var view2 = Ti.UI.createView({
	backgroundColor:'black'
});

var l2 = Ti.UI.createLabel({
	text:'The spaces we inhabit, and the histories that exist within these spaces can be examined through the audio recordings made by the public. The smart-phone is a unique tool that expands this art work beyond the limiting space of an installation.',
	color:'#999',
	font:{fontSize:14,fontfamily:'Helvetica Neue'},
	textAlign:'left',
	width: 300,
	height:'auto',
	top:30
});
view2.add(l2);

var l3 = Ti.UI.createLabel({
	text:'The intersection of memory and the physical space where these memories exist are things that I find the most fascinating. I invite you to leave behind a recording of a place of significance that you would want to share with others.',
	color:'#999',
	font:{fontSize:14,fontfamily:'Helvetica Neue'},
	textAlign:'left',
	width: 300,
	height:'auto',
	top:160
});
view2.add(l3);

var l4 = Ti.UI.createLabel({
	text:'Hector Leiva © 2012',
	color:'#999',
	font:{fontSize:14,fontfamily:'Helvetica Neue'},
	textAlign:'center',
	width: 300,
	height:'auto',
	top:320
});
view2.add(l4);

var scrollView = Titanium.UI.createScrollableView({
	views:[view1,view2],
	showPagingControl:true,
	pagingControlHeight:30,
	maxZoomScale:2.0,
	currentPage:0
});

win1.add(scrollView);

var i=1;
var activeView = view1;

scrollView.addEventListener('scroll', function(e)
{
    activeView = e.view;  // the object handle to the view that is about to become visible
	i = e.currentPage;
	Titanium.API.info("scroll called - current index " + i + ' active view ' + activeView);
});
scrollView.addEventListener('click', function(e)
{
	Ti.API.info('ScrollView received click event, source = ' + e.source);
});
scrollView.addEventListener('touchend', function(e)
{
	Ti.API.info('ScrollView received touchend event, source = ' + e.source);
});

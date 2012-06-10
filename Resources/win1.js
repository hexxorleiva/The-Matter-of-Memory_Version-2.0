//
//	Introduction
//
win1.backgroundColor = 'black';

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

var sublabel1 = Titanium.UI.createLabel({
	text:'This work has been created to explore the complex relationship between place and memory. The following introduction will help guide you in how to use this app to participate.',
	color:'#999',
	font:{fontSize:14,fontfamily:'Helvetica Neue'},
	textAlign:'center',
	width: 300,
	height:'auto',
	top: 130
});
win1.add(sublabel1);
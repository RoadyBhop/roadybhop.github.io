var lastRand;
var i = 0;
var x = 0;
var current = new Array(500).fill(0);
var list = [];
var imageid = '';
var _2shinylist = [
	'images/2shinyimage1.jpg',
	'images/2shinyimage2.jpg',
	'images/2shinyimage3.jpg',
	'images/2shinyimage4.jpg',
	'images/2shinyimage5.jpg'
];
var frigpxlist = [
	'images/frigpximage1.jpg',
	'images/frigpximage2.jpg',
	'images/frigpximage3.jpg',
	'images/frigpximage4.jpg',
	'images/frigpximage5.jpg'
];
var floodwaterslist = [
	'images/floodwatersimage1.jpg',
	'images/floodwatersimage2.jpg',
	'images/floodwatersimage3.jpg',
	'images/floodwatersimage4.jpg',
	'images/floodwatersimage5.jpg'
];
var offstyleslist = [
	'images/offstylesimage1.jpg',
	'images/offstylesimage2.jpg',
	'images/offstylesimage3.jpg',
	'images/offstylesimage4.jpg',
	'images/offstylesimage5.jpg'
];
var flythinglist = [
	'images/flythingimage1.jpg',
	'images/flythingimage2.jpg',
	'images/flythingimage3.jpg',
	'images/flythingimage4.jpg',
	'images/flythingimage5.jpg'
];
var souptop_2023list = [
	'https://images.gamebanana.com/img/ss/mods/530-90_644d5fca24e00.jpg',
	'https://images.gamebanana.com/img/ss/mods/644d5fc9a4282.jpg',
	'https://images.gamebanana.com/img/ss/mods/644d5fca1d80f.jpg',
	'https://images.gamebanana.com/img/ss/mods/644d5fca77e5c.jpg',
	'https://images.gamebanana.com/img/ss/mods/644d5fca2ba9e.jpg',
	'https://images.gamebanana.com/img/ss/mods/644d5fca187cb.jpg',
	'https://images.gamebanana.com/img/ss/mods/644d61599ed21.jpg',
	'https://images.gamebanana.com/img/ss/mods/644d615a072cb.jpg',
	'https://images.gamebanana.com/img/ss/mods/644d6159ee079.jpg',
	'https://images.gamebanana.com/img/ss/mods/644d6159ed47a.jpg'
];
var relentlesslist = [
	'https://images.gamebanana.com/img/ss/mods/619fd0e2e5458.jpg',
	'https://images.gamebanana.com/img/ss/mods/619fd0e30742c.jpg',
	'https://images.gamebanana.com/img/ss/mods/619fd0e2cf4b1.jpg',
	'https://images.gamebanana.com/img/ss/mods/619fd0e3008ac.jpg',
	'https://images.gamebanana.com/img/ss/mods/619fd0e316c61.jpg',
	'https://images.gamebanana.com/img/ss/mods/619fd0e2cc21f.jpg',
	'https://images.gamebanana.com/img/ss/mods/619fd0e286097.jpg',
	'https://images.gamebanana.com/img/ss/mods/619fd0e34737a.jpg',
	'https://images.gamebanana.com/img/ss/mods/619fd0e336cb2.jpg',
	'https://images.gamebanana.com/img/ss/mods/619fd0e32caaa.jpg'
];
var fullList = [];
fullList = fullList.concat(
	_2shinylist,
	frigpxlist,
	floodwaterslist,
	offstyleslist,
	flythinglist,
	souptop_2023list,
	relentlesslist
);
function changeImage(imageNum, direction) {
	switch (imageNum) {
		case '2shiny':
			imageid = '2shinyid';
			list = _2shinylist;
			x = 0;
			break;
		case 'frigpx':
			imageid = 'frigpxid';
			list = frigpxlist;
			x = 1;
			break;
		case 'floodwaters':
			imageid = 'floodwatersid';
			list = floodwaterslist;
			x = 2;
			break;
		case 'offstyles':
			imageid = 'offstylesid';
			list = offstyleslist;
			x = 3;
			break;
		case 'flything':
			imageid = 'flythingid';
			list = flythinglist;
			x = 4;
			break;
		case 'souptop_2023':
			imageid = 'souptop_2023id';
			list = souptop_2023list;
			x = 5;
			break;
		case 'relentless':
			imageid = 'relentlessid';
			list = relentlesslist;
			x = 6;
			break;
	}
	i = current[x];
	if (direction == 1) {
		i++;
	}
	if (direction == -1) {
		i--;
	}
	if (i == -1) {
		i = list.length - 1;
	}
	if (i == list.length) {
		i = 0;
	}
	document.getElementById(imageid).src = list[i];
	current[x] = i;
}
function changeBackground() {
	var randNum = Math.floor(Math.random() * fullList.length);
	if (randNum == lastRand) {
		changeBackground();
	} else {
		document.body.style.backgroundImage = 'url(' + fullList[randNum] + ')';
		lastRand = randNum;
	}
}

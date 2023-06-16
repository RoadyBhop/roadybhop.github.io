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
var _4loshadkalist = [
	'https://images.gamebanana.com/img/ss/mods/629738285d57f.jpg',
	'https://images.gamebanana.com/img/ss/mods/629738270bea9.jpg',
	'https://images.gamebanana.com/img/ss/mods/6297382721386.jpg',
	'https://images.gamebanana.com/img/ss/mods/629738271cda1.jpg'
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
var _4matanlist = [
	'https://images.gamebanana.com/img/ss/mods/61585fac7dbba.jpg',
	'https://images.gamebanana.com/img/ss/mods/61585fad5de0c.jpg',
	'https://images.gamebanana.com/img/ss/mods/61585facd4536.jpg',
	'https://images.gamebanana.com/img/ss/mods/61585fad9e76a.jpg',
	'https://images.gamebanana.com/img/ss/mods/61585fada565e.jpg',
	'https://images.gamebanana.com/img/ss/mods/61585fada21dd.jpg',
	'https://images.gamebanana.com/img/ss/mods/61585fadaba81.jpg'
];
var _4jukedlist = [
	'https://images.gamebanana.com/img/ss/mods/6126ad7edaa30.jpg',
	'https://images.gamebanana.com/img/ss/mods/6126ad7ec7652.jpg',
	'https://images.gamebanana.com/img/ss/mods/6126ad7f26a6d.jpg',
	'https://images.gamebanana.com/img/ss/mods/6126ad7f16f95.jpg',
	'https://images.gamebanana.com/img/ss/mods/6126ad7f0fe2a.jpg',
	'https://images.gamebanana.com/img/ss/mods/6126ad7f61d33.jpg'
];
var appanice4list = [
	'https://images.gamebanana.com/img/ss/mods/61216331ea782.jpg',
	'https://images.gamebanana.com/img/ss/mods/612163326dc60.jpg',
	'https://images.gamebanana.com/img/ss/mods/612163330c5d0.jpg',
	'https://images.gamebanana.com/img/ss/mods/61216332dcc3d.jpg',
	'https://images.gamebanana.com/img/ss/mods/61216332b947b.jpg',
	'https://images.gamebanana.com/img/ss/mods/6121633643b4a.jpg',
	'https://images.gamebanana.com/img/ss/mods/61216332600b1.jpg'
];
var _3muddzlist = [
	'https://images.gamebanana.com/img/ss/mods/60d78b0a20627.jpg',
	'https://images.gamebanana.com/img/ss/mods/60d78b09bf387.jpg',
	'https://images.gamebanana.com/img/ss/mods/60d78b0a77152.jpg',
	'https://images.gamebanana.com/img/ss/mods/60d78b0a75d4d.jpg'
];
var _4azzlackzlist = [
	'https://images.gamebanana.com/img/ss/mods/60d3fc81ce970.jpg',
	'https://images.gamebanana.com/img/ss/mods/60d3fc8274a98.jpg',
	'https://images.gamebanana.com/img/ss/mods/60d3fc8276ac5.jpg',
	'https://images.gamebanana.com/img/ss/mods/60d3fc8281d3a.jpg',
	'https://images.gamebanana.com/img/ss/mods/60d3fc825c242.jpg',
	'https://images.gamebanana.com/img/ss/mods/60d3fc8260367.jpg',
	'https://images.gamebanana.com/img/ss/mods/60d3fc826f9a6.jpg'
];
var _4pilflist = [
	'https://images.gamebanana.com/img/ss/mods/60afabf9e0bea.jpg',
	'https://images.gamebanana.com/img/ss/mods/60afabfad1032.jpg',
	'https://images.gamebanana.com/img/ss/mods/60afabfb0404a.jpg',
	'https://images.gamebanana.com/img/ss/mods/60afabf9d9993.jpg',
	'https://images.gamebanana.com/img/ss/mods/60afabf9e1a6b.jpg',
	'https://images.gamebanana.com/img/ss/mods/60afabfa49dae.jpg',
	'https://images.gamebanana.com/img/ss/mods/60afabfaa6f8b.jpg'
];
var _4appalist = [
	'https://images.gamebanana.com/img/ss/mods/6098e2e2b096f.jpg',
	'https://images.gamebanana.com/img/ss/mods/6098e2e391b2f.jpg',
	'https://images.gamebanana.com/img/ss/mods/6098e2e397aaa.jpg',
	'https://images.gamebanana.com/img/ss/mods/6098e2e3645ae.jpg',
	'https://images.gamebanana.com/img/ss/mods/6098e2e3da687.jpg',
	'https://images.gamebanana.com/img/ss/mods/6098e2e3a2e56.jpg',
	'https://images.gamebanana.com/img/ss/mods/6098e2e34992a.jpg',
	'https://images.gamebanana.com/img/ss/mods/6098e2e3da874.jpg',
	'https://images.gamebanana.com/img/ss/mods/6098e2e40c570.jpg',
	'https://images.gamebanana.com/img/ss/mods/6098e2e45c806.jpg',
	'https://images.gamebanana.com/img/ss/mods/6098e2e437336.jpg',
	'https://images.gamebanana.com/img/ss/mods/6098e2e448d81.jpg',
	'https://images.gamebanana.com/img/ss/mods/6098e2e477a5e.jpg',
	'https://images.gamebanana.com/img/ss/mods/6098e2e487182.jpg',
	'https://images.gamebanana.com/img/ss/mods/6098e2e4bc578.jpg',
	'https://images.gamebanana.com/img/ss/mods/6098e2e4a4f46.jpg',
	'https://images.gamebanana.com/img/ss/mods/6098e2e4bbe7a.jpg'
];
var _4muddzlist = [
	'https://images.gamebanana.com/img/ss/mods/607709f186d82.jpg',
	'https://images.gamebanana.com/img/ss/mods/607709f2557d9.jpg',
	'https://images.gamebanana.com/img/ss/mods/607709f2253d4.jpg',
	'https://images.gamebanana.com/img/ss/mods/607709f211115.jpg',
	'https://images.gamebanana.com/img/ss/mods/607709f20f374.jpg',
	'https://images.gamebanana.com/img/ss/mods/607709f22857e.jpg',
	'https://images.gamebanana.com/img/ss/mods/607709f2c4960.jpg',
	'https://images.gamebanana.com/img/ss/mods/607709f28b2b3.jpg',
	'https://images.gamebanana.com/img/ss/mods/607709f290a32.jpg',
	'https://images.gamebanana.com/img/ss/mods/607709f2b4934.jpg',
	'https://images.gamebanana.com/img/ss/mods/607709f2ddd89.jpg'
];
var egyptianlist = [
	'https://images.gamebanana.com/img/ss/mods/601276587a394.jpg',
	'https://images.gamebanana.com/img/ss/mods/601276589fa22.jpg',
	'https://images.gamebanana.com/img/ss/mods/6012765898c8a.jpg',
	'https://images.gamebanana.com/img/ss/mods/60127658d4f8c.jpg',
	'https://images.gamebanana.com/img/ss/mods/60127658d355c.jpg',
	'https://images.gamebanana.com/img/ss/mods/601276588a735.jpg',
	'https://images.gamebanana.com/img/ss/mods/60127658b64e4.jpg',
	'https://images.gamebanana.com/img/ss/mods/60127658cb642.jpg',
	'https://images.gamebanana.com/img/ss/mods/6012765920f78.jpg'
];
var appanice2list = [
	'https://images.gamebanana.com/img/ss/mods/6011300013006.jpg',
	'https://images.gamebanana.com/img/ss/mods/601130002978f.jpg',
	'https://images.gamebanana.com/img/ss/mods/601130001797e.jpg',
	'https://images.gamebanana.com/img/ss/mods/6011300029983.jpg',
	'https://images.gamebanana.com/img/ss/mods/601130007d6a8.jpg',
	'https://images.gamebanana.com/img/ss/mods/6011300085079.jpg',
	'https://images.gamebanana.com/img/ss/mods/6011300076060.jpg'
];
var awtoplist = [
	'https://images.gamebanana.com/img/ss/mods/60052218243d8.jpg',
	'https://images.gamebanana.com/img/ss/mods/6005221886ccb.jpg',
	'https://images.gamebanana.com/img/ss/mods/6005221878c71.jpg',
	'https://images.gamebanana.com/img/ss/mods/600522187f677.jpg',
	'https://images.gamebanana.com/img/ss/mods/600522187d928.jpg',
	'https://images.gamebanana.com/img/ss/mods/600522186115c.jpg',
	'https://images.gamebanana.com/img/ss/mods/600522189de66.jpg',
	'https://images.gamebanana.com/img/ss/mods/60052218bd81c.jpg',
	'https://images.gamebanana.com/img/ss/mods/60052218beeee.jpg',
	'https://images.gamebanana.com/img/ss/mods/60052218c50df.jpg'
];
var appanicelist = [
	'https://images.gamebanana.com/img/ss/mods/5fd289dc24346.jpg',
	'https://images.gamebanana.com/img/ss/mods/5fd289dca8075.jpg',
	'https://images.gamebanana.com/img/ss/mods/5fd289dcda862.jpg',
	'https://images.gamebanana.com/img/ss/mods/5fd289dd1338f.jpg',
	'https://images.gamebanana.com/img/ss/mods/5fd289dd08543.jpg',
	'https://images.gamebanana.com/img/ss/mods/5fd289dce8796.jpg',
	'https://images.gamebanana.com/img/ss/mods/5fd289dc66ebe.jpg',
	'https://images.gamebanana.com/img/ss/mods/5fd289dcadfad.jpg',
	'https://images.gamebanana.com/img/ss/mods/5fd289dd03ad2.jpg',
	'https://images.gamebanana.com/img/ss/mods/5fd289dd04e46.jpg',
	'https://images.gamebanana.com/img/ss/mods/5fd289dd4749b.jpg',
	'https://images.gamebanana.com/img/ss/mods/5fd289dd48415.jpg',
	'https://images.gamebanana.com/img/ss/mods/5fd289dd49cfa.jpg',
	'https://images.gamebanana.com/img/ss/mods/5fd289dd4eac8.jpg'
];
var fullList = [];
fullList = fullList.concat(
	_2shinylist,
	frigpxlist,
	floodwaterslist,
	offstyleslist,
	flythinglist,
	souptop_2023list,
	_4loshadkalist,
	relentlesslist,
	_4matanlist,
	_4jukedlist,
	appanice4list,
	_3muddzlist,
	_4azzlackzlist,
	_4pilflist,
	_4appalist,
	_4muddzlist,
	egyptianlist,
	appanice2list,
	awtoplist,
	appanicelist
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
		case '4loshadka':
			imageid = '4loshadkaid';
			list = _4loshadkalist;
			x = 6;
			break;
		case 'relentless':
			imageid = 'relentlessid';
			list = relentlesslist;
			x = 7;
			break;
		case '4matan':
			imageid = '4matanid';
			list = _4matanlist;
			x = 8;
			break;
		case '4juked':
			imageid = '4jukedid';
			list = _4jukedlist;
			x = 9;
			break;
		case 'appanice4':
			imageid = 'appanice4id';
			list = appanice4list;
			x = 10;
			break;
		case '3muddz':
			imageid = '3muddzid';
			list = _3muddzlist;
			x = 11;
			break;
		case '4azzlackz':
			imageid = '4azzlackzid';
			list = _4azzlackzlist;
			x = 12;
			break;
		case '4pilf':
			imageid = '4pilfid';
			list = _4pilflist;
			x = 13;
			break;
		case '4appa':
			imageid = '4appaid';
			list = _4appalist;
			x = 14;
			break;
		case '4muddz':
			imageid = '4muddzid';
			list = _4muddzlist;
			x = 15;
			break;
		case 'egyptian':
			imageid = 'egyptianid';
			list = egyptianlist;
			x = 16;
			break;
		case 'appanice2':
			imageid = 'appanice2id';
			list = appanice2list;
			x = 17;
			break;
		case 'awtop':
			imageid = 'awtopid';
			list = awtoplist;
			x = 18;
			break;
		case 'appanice':
			imageid = 'appaniceid';
			list = appanicelist;
			x = 19;
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

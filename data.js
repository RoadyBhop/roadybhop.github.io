const PROFILE = {
  fullName: "Road2SilverEagleMaster",
  tagline: "Bunny-hop cartographer since 2013 // pushing the Source engine to its limits",
  heroImage: "https://roadybhop.github.io/images/2shinyimage1.jpg",
};

const STATS = [
  { value: "100+", label: "Maps Created" },
  { value: "2013", label: "Bhopping Since" },
  { value: "100%", label: "Vertices Used" },
  { value: "3", label: "4matan Completions" },
];

const MOMENTUM_MAPS = [
  { title:"bhop_2shiny2shuckle", image:"https://roadybhop.github.io/images/2shinyimage1.jpg", description:"Are you ready to put your mathematical prowess, strategic mind, and quick reflexes to the test? Gear up to enter the captivating world of Shuckle Labs where you'll encounter seven thrilling stages that will challenge your intellect and entertain your senses. If you ever find yourself stumped, there are plenty of helpful hints to assist you on your journey to becoming a master of Shuckle Labs.", releaseDate:"03/05/2023", download:"https://momentum-mod.org/dashboard/maps/223", showcase:null },
  { title:"bhop_frigpx", image:"https://roadybhop.github.io/images/frigpximage1.jpg", description:"6 stages on the inside of a cube ;)", releaseDate:"18/09/2022", download:"https://momentum-mod.org/dashboard/maps/208", showcase:null },
  { title:"bhop_floodwaters", image:"https://roadybhop.github.io/images/floodwatersimage1.jpg", description:"~30 seconds with mega speedy boosts", releaseDate:"05/09/2022", download:"https://momentum-mod.org/dashboard/maps/204", showcase:null },
  { title:"bhop_offstyles", image:"https://roadybhop.github.io/images/offstylesimage1.jpg", description:"Shoutout to the offstyles community", releaseDate:"10/04/2022", download:"https://momentum-mod.org/dashboard/maps/179", showcase:null },
  { title:"bhop_flything", image:"https://roadybhop.github.io/images/flythingimage1.jpg", description:"Half bhop half fly map experimenting with momentum entities :)", releaseDate:"08/02/2022", download:"https://momentum-mod.org/dashboard/maps/130", showcase:"RsQ7j4q9Lj8" },
];

const CSS_MAPS = [
  { title:"bhop_souptop_2023 Pack", image:"https://images.gamebanana.com/img/ss/mods/530-90_644d5fca24e00.jpg", description:"Remaster of my first bhop maps that were all dev texture and some fullbright. Contains 10 maps each short, likely 20-50 seconds. After I saw Snippsku get record on all of them I figured it was time.", releaseDate:"29/04/2023", download:"https://gamebanana.com/mods/440888", showcase:"SnTj9lh66is" },
  { title:"bhop_4loshadka", image:"https://images.gamebanana.com/img/ss/mods/629738285d57f.jpg", description:"Hard 1 shot bhop map ~2 min", releaseDate:"01/06/2022", download:"https://gamebanana.com/mods/381052", showcase:"kJBxa7nnwMU" },
  { title:"bhop_relentless", image:"https://images.gamebanana.com/img/ss/mods/619fd0e2e5458.jpg", description:"1 and a half min map with lots of spins as requested by jolux", releaseDate:"25/11/2021", download:"https://gamebanana.com/mods/338571", showcase:"AD5YD4nplIE" },
  { title:"bhop_4matan", image:"https://images.gamebanana.com/img/ss/mods/61585fac7dbba.jpg", description:"A very long and hard bhop map. 69 short hard stages each being 1 shot. Segment time was 40 min. Uses the full limit of the Source engine \u2014 vertexes 65524/65536 (100.0%) VERY FULL! :)", releaseDate:"03/10/2021", download:"https://gamebanana.com/mods/325367", showcase:"uO3f32RqGTc" },
  { title:"bhop_4juked", image:"https://images.gamebanana.com/img/ss/mods/6126ad7edaa30.jpg", description:"90+ second bhop map cuz thats the best length. Shout out to juked the best south african bhopper.", releaseDate:"28/08/2021", download:"https://gamebanana.com/mods/316931", showcase:"LjgS6MbzIr0" },
  { title:"bhop_appaisaniceman4", image:"https://images.gamebanana.com/img/ss/mods/61216331ea782.jpg", description:"1 min long bhop map made months ago but appa just got around to running the showcase now :pensive:", releaseDate:"21/08/2021", download:"https://gamebanana.com/mods/315795", showcase:"XRmNc5OrpzA" },
  { title:"bhop_3muddz", image:"https://images.gamebanana.com/img/ss/mods/60d78b0a20627.jpg", description:"Muddz keeps asking for harder maps so i hope this is enough. Probably possible and probably still too easy for him. ~1:10 on a good run", releaseDate:"26/06/2021", download:"https://gamebanana.com/mods/299176", showcase:null },
  { title:"bhop_4azzlackz", image:"https://images.gamebanana.com/img/ss/mods/60d3fc81ce970.jpg", description:'"Road make some bs map climbing with spikes" - azzlackz. ~1:40 long', releaseDate:"24/06/2021", download:"https://gamebanana.com/mods/298357", showcase:null },
  { title:"bhop_4pilfkcab", image:"https://images.gamebanana.com/img/ss/mods/60afabf9e0bea.jpg", description:"2 minute bhop map with a heavy amount of surf cuz pilfkcab loves surf :pensive:.", releaseDate:"27/05/2021", download:"https://gamebanana.com/mods/290012", showcase:"vuELPbBNJ4g" },
  { title:"bhop_4appa", image:"https://images.gamebanana.com/img/ss/mods/6098e2e2b096f.jpg", description:"Just under 2 min bhop map made for the sourcejump.net mapping contest. Thanks to TraZox for the sick texture pack.", releaseDate:"10/05/2021", download:"https://gamebanana.com/mods/285012", showcase:"mADmbe4Nf24" },
  { title:"bhop_4muddz", image:"https://images.gamebanana.com/img/ss/mods/607709f186d82.jpg", description:"A long hard map made for the Sourcejump.net 2021 mapping contest. Not sure what tier but I did finish the map on segment in 29:57 with ~1400 checkpoints. Thanks to samurai and ta de hack for testing.", releaseDate:"14/04/2021", download:"https://gamebanana.com/mods/124341", showcase:"gxeXvFQJbr8" },
  { title:"bhop_egyptian_ruins", image:"https://images.gamebanana.com/img/ss/mods/601276587a394.jpg", description:"~1 min long map with some beautiful details thanks to FOOL", releaseDate:"28/01/2021", download:"https://gamebanana.com/mods/124928", showcase:"dc9fvZwuwcc" },
  { title:"bhop_appaisaniceman2", image:"https://images.gamebanana.com/img/ss/mods/6011300013006.jpg", description:"1 min bhop map for the one and only appa 2nd best canadian bhopper", releaseDate:"27/01/2021", download:"https://gamebanana.com/mods/124453", showcase:"a_kKnLI1bY4" },
  { title:"bhop_awtop Pack", image:"https://images.gamebanana.com/img/ss/mods/60052218243d8.jpg", description:"11 bhop maps dedicated to the best under 30 second map bhopper in the USA", releaseDate:"18/01/2021", download:"https://gamebanana.com/mods/124511", showcase:"1yOjk_HjFB8" },
  { title:"bhop_appaisaniceman_extended", image:"https://images.gamebanana.com/img/ss/mods/5fd289dc24346.jpg", description:"~2:40 map not very challenging", releaseDate:"10/12/2020", download:"https://gamebanana.com/mods/124455", showcase:"kYfimYgxdJY" },
];

const ABOUT = [
  { heading:"About Me", body:"My name is Road2SilverEagleMaster \u2014 or Roady for short \u2014 and I have been bhopping since 2013. I have experimented with Hammer over the years and started to make maps for bhop in 2020. While these were shit, it was fun, and I have continued to do so. In this time I have made over 100 maps and a few of them are even good." },
  { heading:"Mapping Style", body:"My mapping style has always put more emphasis on gameplay than aesthetics. While many maps use very basic texturing, detailing and lighting, they usually make up for this with unique and sometimes enjoyable gameplay. I also have a tendency to make very challenging maps that only a select handful of players are able to complete \u2014 such as bhop_4matan, which had only been beaten by 3 people after being out since 2021. This map also shows my other tendency: trying to push the Source engine to its limits. bhop_4matan uses 100% of the available vertices and adding 1 more block would cause the map not to compile." },
  { heading:"Uniqueness", body:"This mapping style makes my maps unique as they do not follow the standard method to make a bhop map. This can be seen in maps like bhop_2shiny2shuckle, composed of 7 puzzle stages that need to be solved while giving hints along the way. Once completed, the player can use the solutions to play it as a standard bhop map." },
  { heading:"Special Thanks", body:"I would like to thank all those who have helped me with mapping over these years \u2014 whether it be the basics of detailing or the intricate details of entities in the Source engine, just so I can have a silly idea work." },
];

const CONTACTS = [
  { label:"Discord", value:"Road2SilverEagleMaster#7148", icon:"https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a69f118df70ad7828d4_icon_clyde_blurple_RGB.svg", href:null },
  { label:"Steam", value:"Road2SilverEagleMaster", icon:"https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Steam_icon_logo.svg/768px-Steam_icon_logo.svg.png", href:"https://steamcommunity.com/id/BeeHawper/" },
];

const OTHER_LINKS = [
  { label:"GameBanana", value:"Roady", icon:"https://images.gamebanana.com/static/img/favicon/256x256.png", href:"https://gamebanana.com/members/1731881" },
  { label:"Momentum Mod", value:"Road2SilverEagleMaster", icon:"https://avatars.githubusercontent.com/u/11344047?s=200&v=4", href:"https://momentum-mod.org/dashboard/profile/3416" },
  { label:"YouTube", value:"Jessica Bhop", icon:"https://roadybhop.github.io/images/youtube.png", href:"https://www.youtube.com/@JessicaBhop" },
];

/* Workbook order and word lists. Groups correspond to the printed Day 1 page.
   Sorting keys are explicit so a word's spelling is never guessed at runtime. */
'use strict';
const LESSONS = {
  vce: {
    name:'Vowel–consonant–e', groups:['brave flute tone cake mine kite cute drone','pouch gorge bet stay flood lock itch bent'],
    rule:'In Group A, a final silent e helps the vowel say its name. In Group B, the words use other spelling patterns.',
    labels:['VCE','Not VCE'],
    sorts:['gripe:0 charge:1 grip:1 stem:1 stack:1 cut:1 stake:0 cute:0 stripe:0 plate:0','pack:1 tote:0 clutch:1 sprite:0 stake:0 bent:1 nice:0 time:0 slick:1 fast:1']
  },
  'final-k':{
    name:'Final /k/', groups:['sock neck kick shock luck black stack yuck','seek strike brake poke look soak steak fluke'],
    rule:'Group A uses ck right after a short vowel. Group B spells the same final sound with k, sometimes followed by a silent e.',
    labels:['ck','k or ke'], sorts:['lack:0 block:0 book:1 check:0 spike:1 speak:1 cloak:1 cake:1 trick:0 stuck:0','back:0 pluck:0 spook:1 shock:0 spoke:1 thick:0 broke:1 evoke:1 slick:0 make:1']
  },
  'final-j':{
    name:'Final /j/', groups:['bridge ledge edge lodge ridge badge dodge budge','cage gorge page mange rage barge siege gouge'],
    rule:'Group A spells /j/ with dge right after a short vowel. Group B spells /j/ with ge.',
    labels:['dge','ge'], sorts:['fudge:0 charge:1 page:1 sledge:0 nudge:0 dodge:0 huge:1 large:1 merge:1 lodge:0','verge:1 outrage:1 pledge:0 trudge:0 engage:1 judge:0 badge:0 nudge:0 forge:1 sage:1']
  },
  'final-ch':{
    name:'Final /ch/', groups:['latch hutch hitch etch match wretch pitch Dutch','pouch torch beach ouch screech coach each peach'],
    rule:'Group A uses tch after one short vowel. In Group B a vowel team or another consonant comes before ch.',
    labels:['tch','ch'], sorts:['catch:0 teach:1 bleach:1 lurch:1 porch:1 patch:0 crouch:1 perch:1 ditch:0 witch:0','reach:1 fetch:0 ouch:1 beseech:1 stitch:0 batch:0 hatch:0 mooch:1 leech:1 watch:0']
  },
  'sound-c':{
    name:'Sounds of c',groups:['space city spicy cent cyst mice lace cite','couch cast clean pact cream cone cute cap'],
    rule:'The c in Group A sounds like /s/ before e, i or y. In Group B it sounds like /k/.',
    labels:['c as in city','c as in cat'], sorts:['bounce:0 count:1 spice:0 click:1 can’t:1 pencil:0 lacy:0 cite:0 cuddle:1 crouch:1','came:1 ceiling:0 pace:0 scam:1 cause:1 voice:0 sentence:0 camp:1 icy:0 clip:1']
  },
  'sound-g':{
    name:'Sounds of g',groups:['gem page hedge gist germ gym ledge edge','gap ghost goalie garden grab giggle glide gopher'],
    rule:'In Group A, g sounds like the j in jam. In Group B it sounds like the g in go.',
    labels:['g as in gem','g as in go'],sorts:['galaxy:1 gather:1 gentle:0 energy:0 get:1 goblin:1 gel:0 large:0 goggles:1 glass:1','game:1 gym:0 grace:1 stage:0 genuine:0 goat:1 go:1 brag:1 guess:1 gesture:0']
  },
  'vowel-teams':{
    name:'Vowel teams',groups:['bait chain drain snail','day stay play tray'],
    rule:'Group A uses ai inside the word. Group B uses ay at the end. Both spell the long a sound.',
    labels:['ai','ay'],sorts:['day:1 train:0 snail:0 play:1 chain:0 clay:1 stay:1 grain:0 tray:1 rain:0','meat:1 tree:0 bead:1 sheep:0 green:0 heat:1 seat:1 sweet:0 creek:0 treat:1'],
    secondLabels:['ee','ea']
  },
  ed:{
    name:'Past tense · -ed',groups:['decided baked closed graded','carried hurried babied muddied','sipped trapped mapped robbed','munched crashed folded needed'],
    rule:'Before -ed, Group A drops e, Group B changes y to i, and Group C doubles the last consonant. Group D just adds -ed.',
    labels:['Drop e','Change y to i','Double the consonant','Just add -ed'],
    sorts:['smiled:0 married:1 changed:0 chatted:2 washed:3 jogged:2 applied:1 raced:0 worried:1 stopped:2 looked:3 denied:1 planned:2 closed:0 walked:3 needed:3']
  },
  plurals:{
    name:'Plurals · -s and -es',groups:['puppies ladies daisies berries','boxes messes dresses patches','videos clocks cowboys painters'],
    rule:'In Group A, change y to i and add -es. In Group B, add -es. In Group C, add -s.',
    labels:['Change y to i + es','Add -es','Add -s'],
    sorts:['kisses:1 cherries:0 wishes:1 stories:0 dogs:2 chairs:2 pennies:0 fans:2 families:0 lashes:1 sacks:2 foxes:1 stitches:1 songs:2 duties:0 apples:2']
  },
  ing:{
    name:'Adding -ing',groups:['baking smiling dancing naming','snapping chatting grabbing digging','listening jumping opening fixing'],
    rule:'Before -ing, Group A drops a silent e. Group B doubles the last consonant. Group C just adds -ing.',
    labels:['Drop e','Double the consonant','Just add -ing'],
    sorts:['snowing:2 changing:0 typing:0 sailing:2 closing:0 grinning:1 trading:0 running:1 rubbing:1 sliding:0 yawning:2 loving:0 drumming:1 playing:2 knitting:1 painting:2']
  },
  ly:{
    name:'Adding -ly',groups:['messily angrily busily easily','graphically basically tragically historically','gently humbly adorably simply','bashfully unfairly commonly quickly'],
    rule:'Group A changes y to i. Group B adds -ally to bases ending in -ic. Group C changes -le to -ly. Group D just adds -ly.',
    labels:['Change y to i','Add -ally after -ic','Change -le to -ly','Just add -ly'],
    sorts:['politically:1 flexibly:2 specifically:1 easily:0 slowly:3 luckily:0 smartly:3 possibly:2 happily:0 scientifically:1 reliably:2 carefully:3 terribly:2 calmly:3 noisily:0 statistically:1']
  }
};
const ACTIVITY_NAMES = {pattern:'Identify the pattern',review:'Review the pattern',sort:'Word sort',spell:'Speech to spelling',analogy:'Word analogies',words:'Word writing',sentences:'Sentence writing',sums:'Word sums',build:'Word building',bank:'Word bank',end:'Day complete'};
function activities(topic,day){
  if(topic.type==='morphology') return day===1?['pattern','sort']:['sums','build'];
  return day===1?['pattern','sort','spell']:day===2?['review','sort','spell','analogy']:['review','spell','words','sentences'];
}
function sortItems(id,day){
  return LESSONS[id].sorts[day-1].split(' ').map(entry=>{const [word,group]=entry.split(':');return {word,group:Number(group)};});
}
function sortLabels(id,day){return day===2&&LESSONS[id].secondLabels?LESSONS[id].secondLabels:LESSONS[id].labels;}
const VCE_FIRST_DAY = ['s p i ke','f l a me','s t o ke','b r i de','g r i m'].map(s=>({word:s.replaceAll(' ',''),boxes:s.split(' ')}));
function spellingItems(topic,day){
  if(topic.id==='vce'&&day===1)return VCE_FIRST_DAY;
  return topic.maps.slice((day-1)*5,day*5).map(item=>{
    let silent='';
    const boxes=item.graphemes.map(sound=>{
      if(!sound.includes('…'))return sound;
      const parts=sound.split('…');silent=parts[1];return parts[0];
    });
    boxes[boxes.length-1]+=silent;
    return {word:item.word,boxes};
  });
}
// The printed prompts invite more than one answer. Students compare with a possible match.
const OPEN_PAIRS={
  vce:[['tack','take','back','bake'],['same','cope','Sam','cop'],['mitt','mite','rid','ride'],['cut','cute','hop','hope'],['chat','chide','van','vine']],
  'final-j':[['page','ledge','rage','ridge'],['large','badge','barge','budge'],['judge','plunge','ridge','range'],['lodge','verge','dodge','gorge'],['trudge','huge','fudge','cage']],
  'final-ch':[['patch','bleach','match','beach'],['punch','hitch','cinch','pitch'],['couch','itch','pouch','etch'],['each','fetch','peach','patch'],['belch','bench','gulch','lunch']],
  'sound-c':[['cat','city','cup','cent'],['cereal','cold','circle','cap'],['ceiling','cake','celery','cat'],['cork','center','crate','city'],['celebrate','crop','fancy','clap']],
  'sound-g':[['giraffe','garden','gem','get'],['go','gym','gift','gist'],['general','gallop','germ','goat'],['golden','genius','gutter','gentle'],['goggles','ginger','girl','giant']]
};
function pairs(topic){return OPEN_PAIRS[topic.id]||topic.analogies.map(q=>[q.a,q.b,q.c,q.answer]);}
function sumParts(topic,item){
  if(topic.id==='ly'&&item.word==='graphically')return ['graphic','al','ly'];
  if(topic.id==='ly'&&item.word==='historically')return ['historic','al','ly'];
  return item.parts;
}
if(typeof module!=='undefined')module.exports={LESSONS,activities,spellingItems,sortItems,sortLabels,pairs,sumParts};

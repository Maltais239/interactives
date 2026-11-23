/* Adapted for educational use from Dr. Shelley Blackwell's 2025 resources.
   Spellings and categories are explicit; no suffix guessing or generated answer keys. */
'use strict';
const COURSE = [];
const words = s => s.trim().split(/\s+/);
function phonics(id,title,short,group,rule,notes,categories,sets,pages){
 const m={id,title,short,group,rule,notes,categories,words:[],days:3,pages,type:'phonics',maps:[],analogies:[],sentences:[]};
 sets.forEach((s,c)=>words(s).forEach(word=>m.words.push({word,c}))); COURSE.push(m); return m;
}
function morphology(id,title,short,suffix,rule,notes,categories,sets,pages){
 const m={id,title,short,group:'Word building',suffix,rule,notes,categories,words:[],days:2,pages,type:'morphology',maps:[],analogies:[],sentences:[]};
 sets.forEach((s,c)=>words(s).forEach(pair=>{const [base,word]=pair.split(':');m.words.push({base,word,c});})); COURSE.push(m);return m;
}
const vce=phonics('vce','Vowel–consonant–e','Vowel–consonant–e','Sounds & spellings',
 'A final silent e can help an earlier vowel say its name across one consonant: cap becomes cape.',
 ['The two letters a…e, i…e, o…e, and u…e can work together to spell one vowel sound. The final e does not get its own sound box.','Not every word ending in e follows this pattern: have, give, and love are useful counterexamples. Vowel teams such as oa can also spell long vowels.','Talk about why the vowel changes in cap/cape. Read and spell both words.'],
 ['Vowel–consonant–e','Other spellings'],[
 'bake bike cone cube dive gate hike joke kite lake line make note pace pine race rope side tape time vote wave wide wipe zone case face hope mule name brace crave glide gripe spade flame prize slide stroke trade twine skate smile stage stripe',
 'cap hop cut kit pin rid back pack sick clutch mitt have give love book rain boat'
 ],{workbook:'2–8',manual:'6–9'});
const finalk=phonics('final-k','Final /k/: ck or k','Final /k/: ck or k','Helper letters',
 'Right after one short vowel, final /k/ is usually spelled ck. After a vowel team or another consonant, use k.',
 ['Compare back/book and sick/silk. Look immediately before the final /k/.','Milk, sink, ask, and park have another consonant before the final /k/. They do not need ck. A split vowel spelling also appears in words such as like.','There are exceptions outside this practice set. The pattern is a useful guide, not a rule for every English word.'],
 ['ck','k'],[
 'back pack sack tack rack neck deck peck tick kick black block brick clock crack snack stack smack slack track trick knock shock chick check thick whack cluck pluck quack lick mock nick rick muck truck sock struck speck flick luck',
 'ask milk bark bank beak peek book pork brake quake cake reek chalk rook cheek seek clerk shake cook shark wake mask creek dark silk desk sink drink sleek flake smirk freak snake Greek hark speak hook stork joke strike leak take like tweak look spook spike'
 ],{workbook:'9–15',manual:'11–14'});
const finalj=phonics('final-j','Final /j/: dge or ge','Final /j/: dge or ge','Helper letters',
 'Right after one short vowel, final /j/ is usually spelled dge. Otherwise, it is usually spelled ge.',
 ['In badge, the short vowel is immediately before /j/. The letters dge spell one sound.','In cage, the vowel is long. In bulge and hinge, another consonant comes before /j/. These words use ge.','The e in ge helps g represent /j/. Read the word before deciding what its vowel is doing.'],
 ['dge','ge'],[
 'badge bridge dodge edge fudge grudge hedge judge ledge nudge pledge ridge sedge sludge smudge trudge budge wedge dredge begrudge abridge misjudge rejudge',
 'age cage page rage sage wage stage huge lunge bulge hinge charge barge gorge verge urge surge merge purge splurge unhinge engage outrage'
 ],{workbook:'16–22',manual:'15–18'});
const finalch=phonics('final-ch','Final /ch/: tch or ch','Final /ch/: tch or ch','Helper letters',
 'Right after one short vowel, final /ch/ is usually spelled tch. After a vowel team or another consonant, it is usually ch.',
 ['The three letters tch spell one sound in catch. The letters ch spell one sound in beach.','Lunch, bench, and mulch use ch after a consonant. Rich, such, much, and which are common exceptions: learn their spellings.','Discuss why match and teach use different spellings for the same final sound.'],
 ['tch','ch'],[
 'batch catch hatch latch match patch snatch scratch fetch retch hitch snitch ditch pitch stitch twitch glitch botch notch Scotch clutch hutch blotch Dutch switch',
 'beach peach reach leach teach bleach screech speech breach preach coach poach roach broach crouch pouch ouch slouch arch march lurch perch torch porch church search scorch starch smirch lunch bench mulch rich such much which'
 ],{workbook:'23–29',manual:'19–22'});
const soundc=phonics('sound-c','The sounds of c','Sounds of c','Sounds & spellings',
 'The letter c usually spells /s/ before e, i, or y. Before other letters, it usually spells /k/.',
 ['Look at the letter immediately after c: cent, city, cyst.','Some words contain more than one c. Here, sort by the highlighted c, which is the first c in the word. Each c may represent a different sound.','The /k/ sound before e, i, or y is often written k, as in kept, kit, and sky.'],
 ['c says /s/','c says /k/'],[
 'cent cell cite cyst cease ace ice face race lace mice dice slice place peace pencil circus celery silence notice surface distance justice embrace replace recent decent princess fancy spicy trace bounce pace space nice voice sentence ceiling',
 'cat cap cup cut cot cook crab clap clip crack club crop climb creep cactus cabin candy captain carpet cookie coffee culture calendar costume copper cracker climate crayon closet cart clamp case cake come'
 ],{workbook:'30–36',manual:'24–27'});
const soundg=phonics('sound-g','The sounds of g','Sounds of g','Sounds & spellings',
 'Before e, i, or y, g can spell /j/ or /g/. Before other letters, it usually spells /g/. Read the word to check.',
 ['Gem, giant, and gym have a soft /j/. Get, gift, and give keep the hard /g/, even before e or i.','The following letter narrows the possibilities but does not decide every pronunciation. Practise both groups.','For sorting here, decide which sound the highlighted g makes. It is the first g in the word.'],
 ['g says /j/','g says /g/'],[
 'gem gist gym age ledge badge cage germ gel splurge giraffe rigid agile digital gentle legend vegetable gesture gymnast energy gyroscope allergy general genuine giant ginger genius stage edge',
 'gig gift twig get gimp giggle grasp grind gland glint grudge glimpse grief go gap gum grin glide grape golf gush rug tag garden garment garbage gargle guitar begin forget agree magnet bargain gallop gadget gamble eagerly lagging give girl goat goggles golden gutter game grade groan'
 ],{workbook:'37–43',manual:'28–31'});
const vowel=phonics('vowel-teams','Vowel teams','Vowel teams','Sounds & spellings',
 'A vowel team uses letters together to spell a vowel sound. The same sound can have different spellings, so learn each word.',
 ['Ai and ay often spell long a. Ee and ea often spell long e. Oa often spells long o.','Ea can also spell short e, as in head and bread. Ow can spell /ou/ in cow or long o in snow.','Use word meanings and repeated practice. A sound alone does not tell you whether a word needs ee or ea.'],
 ['ai','ay','ee','ea','oa','ou','ow','oi'],[
 'bait brain chain claim drain faint flail frail grain hail jail laid maid main paid plain quail snail stain trail rain',
 'bay day hay jay lay may nay pay ray say stay sway tray way bray clay flay gray play',
 'bee see tree free flee three green queen cheek creek sheep sleep steep sweep sweet speech teeth speed bleed sneeze',
 'beat seat meat heat neat bead dead head bread spread tread plead cheat treat wheat feat leak peak',
 'boat coat goat float moat gloat throat croak soak cloak oak loaf roam foam toad load road goal coal shoal',
 'found sound round bound mound count shout scout cloud proud trout flout snout grout spout clout doubt pouch couch',
 'how now cow plow brow vow wow chow dowel growl scowl prowl howl jowl yowl snow grow',
 'boil coil foil oil soil toil broil spoil hoist point joint voice choice noise poise loin coin groin'
 ],{workbook:'44–47',manual:'33'});
const ed=morphology('ed','Past tense: -ed','Past tense: -ed','ed',
 'Regular past-tense verbs use ed. Check the base: drop final e, change consonant + y to i, double when needed, or just add ed.',
 ['Change y to i only after a consonant: carry → carried, but play → played.','Double the final consonant in a stressed vowel–consonant ending after one short vowel: hop → hopped, admit → admitted. Do not double w, x, or y. Do not double an unstressed final syllable, as in open → opened.','Ed can sound like /t/, /d/, or an extra syllable /id/. Its spelling still carries past-tense meaning. Slide → slid is irregular and does not use ed.'],
 ['Drop final e','Change y to i','Double the consonant','Just add ed'],[
 'bake:baked smile:smiled dance:danced hope:hoped love:loved move:moved live:lived close:closed race:raced change:changed shave:shaved chase:chased wave:waved escape:escaped type:typed trade:traded decide:decided invite:invited arrive:arrived use:used grade:graded',
 'cry:cried try:tried fry:fried reply:replied carry:carried hurry:hurried marry:married worry:worried deny:denied apply:applied multiply:multiplied clarify:clarified terrify:terrified simplify:simplified identify:identified notify:notified qualify:qualified rectify:rectified beautify:beautified modify:modified study:studied bury:buried scurry:scurried',
 'hop:hopped plan:planned stop:stopped rub:rubbed slip:slipped drop:dropped grab:grabbed jog:jogged chat:chatted flip:flipped drum:drummed clap:clapped slam:slammed tap:tapped knit:knitted nod:nodded pat:patted plug:plugged trip:tripped snap:snapped admit:admitted jam:jammed sip:sipped trap:trapped map:mapped rob:robbed',
 'jump:jumped help:helped play:played call:called need:needed look:looked walk:walked talk:talked push:pushed wash:washed mix:mixed fix:fixed yawn:yawned rain:rained boil:boiled snow:snowed sail:sailed paint:painted shout:shouted hunt:hunted comment:commented present:presented bleach:bleached bless:blessed match:matched munch:munched crash:crashed fold:folded open:opened'
 ],{workbook:'48–52',manual:'35–37'});
const plural=morphology('plurals','Plurals: -s and -es','Plurals: -s and -es','s',
 'For regular plurals, usually add s. After s, sh, ch, x, or z sounds, add es. After consonant + y, change y to i and add es.',
 ['Keep y after a vowel: boy → boys, key → keys, donkey → donkeys.','The extra syllable in wishes and boxes helps us say the plural ending. Quiz → quizzes also doubles z.','These are regular plurals. Words such as children and mice have different histories and need separate practice.'],
 ['Add s','Add es','Change y to i + es'],[
 'cat:cats dog:dogs book:books car:cars tree:trees boy:boys toy:toys key:keys day:days monkey:monkeys apple:apples chair:chairs desk:desks shoe:shoes hat:hats pencil:pencils flower:flowers house:houses game:games star:stars horse:horses donkey:donkeys graph:graphs goat:goats sack:sacks song:songs fan:fans hide:hides',
 'bus:buses box:boxes fox:foxes dish:dishes wish:wishes church:churches bench:benches match:matches buzz:buzzes quiz:quizzes glass:glasses class:classes brush:brushes lash:lashes peach:peaches watch:watches stitch:stitches kiss:kisses patch:patches torch:torches tax:taxes batch:batches',
 'baby:babies lady:ladies city:cities puppy:puppies party:parties story:stories berry:berries cherry:cherries family:families hobby:hobbies pony:ponies army:armies country:countries fairy:fairies diary:diaries enemy:enemies mystery:mysteries balcony:balconies duty:duties activity:activities dairy:dairies candy:candies penny:pennies'
 ],{workbook:'53–57',manual:'38–40'});
const ing=morphology('ing','Adding -ing','Adding -ing','ing',
 'Before adding ing, check the base: drop a final silent e, double a final consonant when needed, or just add ing.',
 ['Keep y: party → partying and play → playing. Unlike ed, ing does not need y to change to i.','Double after one short vowel in a stressed final vowel–consonant ending: run → running. Do not double w, x, or y; do not double the last consonant in open → opening.','Some final e words keep e, such as seeing. Words ending ie change ie to y, as in tie → tying. These need separate practice.'],
 ['Just add ing','Double the consonant','Drop final e'],[
 'play:playing jump:jumping help:helping walk:walking talk:talking look:looking shout:shouting rain:raining boil:boiling snow:snowing sail:sailing paint:painting hunt:hunting yawn:yawning mix:mixing fix:fixing open:opening listen:listening learn:learning work:working comment:commenting present:presenting party:partying sing:singing bring:bringing match:matching',
 'hop:hopping run:running sit:sitting swim:swimming jog:jogging clap:clapping tap:tapping nod:nodding rub:rubbing drop:dropping flip:flipping plan:planning stop:stopping drum:drumming knit:knitting grab:grabbing beg:begging chat:chatting trim:trimming snap:snapping put:putting grin:grinning',
 'bake:baking smile:smiling dance:dancing hope:hoping love:loving move:moving live:living close:closing race:racing change:changing shave:shaving chase:chasing wave:waving escape:escaping slide:sliding type:typing trade:trading decide:deciding invite:inviting arrive:arriving fuse:fusing make:making'
 ],{workbook:'58–62',manual:'41–43'});
const ly=morphology('ly','Adding -ly','Adding -ly','ly',
 'To add ly, usually keep the base. Some words change y to i, change le to ly, or add al before ly after ic.',
 ['Happy → happily changes y to i. Gentle → gently changes the final le to ly.','Basic → basically adds al and then ly. Public → publicly is a useful exception. True → truly also needs a special spelling change.','Ly often makes an adverb from an adjective: quick → quickly. It can also make an adjective from a noun: brother → brotherly. It is a derivational suffix.'],
 ['Change y to i','Add al + ly','Change le to ly','Just add ly'],[
 'happy:happily angry:angrily lucky:luckily busy:busily noisy:noisily crazy:crazily lazy:lazily funny:funnily greedy:greedily speedy:speedily moody:moodily ready:readily steady:steadily stormy:stormily thirsty:thirstily gloomy:gloomily hasty:hastily clumsy:clumsily grumpy:grumpily easy:easily messy:messily',
 'basic:basically historic:historically scientific:scientifically economic:economically academic:academically dramatic:dramatically automatic:automatically politic:politically strategic:strategically specific:specifically graphic:graphically realistic:realistically statistic:statistically athletic:athletically linguistic:linguistically symbolic:symbolically tropic:tropically genetic:genetically organic:organically phonetic:phonetically tragic:tragically',
 'gentle:gently simple:simply humble:humbly noble:nobly subtle:subtly single:singly double:doubly ample:amply possible:possibly responsible:responsibly terrible:terribly visible:visibly horrible:horribly incredible:incredibly legible:legibly edible:edibly flexible:flexibly sensible:sensibly reliable:reliably adorable:adorably',
 'quick:quickly slow:slowly loud:loudly soft:softly bright:brightly dark:darkly warm:warmly cold:coldly clear:clearly neat:neatly kind:kindly brave:bravely sad:sadly safe:safely calm:calmly smart:smartly rough:roughly sweet:sweetly annoying:annoyingly brother:brotherly ghost:ghostly delightful:delightfully careful:carefully bashful:bashfully unfair:unfairly common:commonly'
 ],{workbook:'63–67',manual:'44–46'});
function mappings(m,lines){m.maps=lines.trim().split('\n').map(line=>{const [word,graphemes,context]=line.split('|');return {word,graphemes:graphemes.split(' '),context};});}
mappings(vce,`lane|l a…e n|We walked down the narrow ____.
cape|c a…e p|The superhero wears a red ____.
bike|b i…e k|I ride my ____ to the park.
cube|c u…e b|A ____ has six square faces.
mule|m u…e l|The ____ carried a pack up the hill.
gate|g a…e t|Please close the garden ____.
rope|r o…e p|We tied the boat with a ____.
kite|k i…e t|The ____ flew high in the wind.
flame|f l a…e m|The candle has a small ____.
grade|g r a…e d|Our class is in the same ____.
spade|s p a…e d|Dig the soil with a ____.
prize|p r i…e z|She won first ____ in the race.
hope|h o…e p|I ____ we can play outside.
slide|s l i…e d|We went down the playground ____.
name|n a…e m|Write your ____ on the page.`);
mappings(finalk,`cook|c oo k|The ____ makes lunch in the kitchen.
sock|s o ck|I found one missing ____.
spook|s p oo k|A sudden noise can ____ the cat.
back|b a ck|Put your bag on your ____.
book|b oo k|I borrowed a ____ from the library.
struck|s t r u ck|The bell ____ at noon.
spike|s p i…e k|The fence has a pointed ____.
dark|d ar k|We turn on a light when it is ____.
snack|s n a ck|I ate an apple for a ____.
truck|t r u ck|The delivery ____ brought our parcel.
shark|sh ar k|A ____ swam in the ocean.
pluck|p l u ck|Gently ____ a string on the guitar.
cheek|ch ee k|A tear rolled down her ____.
creek|c r ee k|We crossed the small ____.
stick|s t i ck|The dog fetched a ____.`);
mappings(finalj,`ledge|l e dge|The bird sat on a narrow ____.
cage|c a…e g|The animal was safely inside its ____.
grudge|g r u dge|Try not to hold a ____ after an argument.
page|p a…e g|Turn to the next ____.
badge|b a dge|The helper wore a name ____.
barge|b ar ge|A flat boat called a ____ carried the load.
dodge|d o dge|We tried to ____ the soft ball.
bridge|b r i dge|We walked across the ____.
sage|s a…e g|The gardener grows a herb called ____.
trudge|t r u dge|We had to ____ through deep snow.
wedge|w e dge|Use a ____ to hold the door open.
pledge|p l e dge|We made a ____ to help one another.
hedge|h e dge|A tall ____ grows around the garden.
stage|s t a…e g|The actors stood on the ____.
fudge|f u dge|We made chocolate ____ for a treat.`);
mappings(finalch,`batch|b a tch|We baked a ____ of muffins.
beach|b ea ch|We built a sandcastle on the ____.
fetch|f e tch|Can you ____ the ball for me?
coach|c oa ch|The ____ helped the team practise.
match|m a tch|We watched a tennis ____.
snitch|s n i tch|A person who secretly tells on others may be called a ____.
latch|l a tch|Lift the ____ to open the gate.
teach|t ea ch|Can you ____ me this game?
porch|p or ch|We left our boots on the ____.
smooch|s m oo ch|An informal word for a kiss is a ____.
switch|s w i tch|Press the ____ to turn on the light.
catch|c a tch|I can ____ the ball.
pitch|p i tch|It is your turn to ____ the ball.
peach|p ea ch|A ____ is a juicy fruit with fuzzy skin.
patch|p a tch|We sewed a ____ over the hole.`);
mappings(soundc,`trace|t r a…e c|Use your pencil to ____ the line.
crib|c r i b|The baby sleeps in a ____.
mice|m i…e c|Two little ____ ran past the barn.
cinch|c i n ch|Something very easy can be called a ____.
cart|c ar t|Put the groceries in the ____.
bounce|b ou n ce|The ball will ____ on the floor.
cot|c o t|We slept on a small camp ____.
pace|p a…e c|We walked at a steady ____.
ice|i…e c|Water can freeze into ____.
clamp|c l a m p|Hold the wood with a ____.
space|s p a…e c|Leave a ____ between your words.
crack|c r a ck|There is a ____ in the old cup.
face|f a…e c|Wash your hands and ____.
clap|c l a p|We will ____ after the performance.
nice|n i…e c|Thank you for your ____ note.`);
mappings(soundg,`glad|g l a d|I am ____ to see you.
gift|g i f t|We wrapped a ____ for our friend.
gem|ge e m|A polished precious stone is a ____.
grin|g r i n|A big smile is a ____.
game|g a…e m|We played a board ____.
grade|g r a…e d|Our class is in the same ____.
germ|g er m|Washing hands helps remove a ____.
goat|g oa t|The ____ ate some hay.
gym|g y m|We play basketball in the ____.
groan|g r oa n|The heavy lift made him ____.
gear|g ear|We packed our camping ____.
gap|g a p|There is a ____ in the fence.
gum|g u m|I chewed a piece of ____.
gist|g i s t|The main idea is the ____ of a story.
get|g e t|Please ____ your coat.`);
// A g spelling /j/ is still written g in a sound box (not ge unless that e is part of the spelling).
soundg.maps.find(x=>x.word==='gem').graphemes=['g','e','m'];
mappings(vowel,`rain|r ai n|The ____ made the garden wet.
play|p l ay|We can ____ outside today.
green|g r ee n|Grass is often ____.
bread|b r ea d|We used two slices of ____.
boat|b oa t|We rowed a ____ on the lake.
cloud|c l ou d|A white ____ floated in the sky.
cow|c ow|The ____ gives milk.
coin|c oi n|I found a shiny ____.
chain|ch ai n|The bike has a metal ____.
sweet|s w ee t|The honey tastes ____.
head|h ea d|Wear a helmet on your ____.
coat|c oa t|Put on a warm ____.
shout|sh ou t|We do not need to ____ indoors.
snow|s n ow|Soft white ____ fell in winter.
point|p oi n t|Please ____ to the answer.`);
function analogies(m,rows){m.analogies=rows.map(([a,b,c,answer,why])=>({a,b,c,answer,why}));}
analogies(vce,[['cap','cape','tap','tape','Add final e to change the short vowel to a long vowel.'],['hop','hope','cop','cope','Add final e: o now says its name.'],['kit','kite','bit','bite','Final e helps i say its name.'],['cut','cute','cub','cube','Add final e to make a long u spelling.'],['pin','pine','fin','fine','Change short i to long i by adding e.']]);
analogies(finalk,[['back','beak','pack','peak','Both pairs change from ck after a short vowel to k after a vowel team.'],['snack','snake','lack','lake','Both pairs change a short vowel + ck to a split vowel spelling with k.'],['lock','look','sock','soak','Both pairs change ck to k after a two-letter vowel spelling.'],['neck','seek','deck','meek','The first word has ck after a short vowel; the second has k after ee.'],['tack','take','rack','rake','Adding final e changes the vowel spelling, and ck becomes k.']]);
analogies(finalj,[['badge','cage','wedge','page','Each pair moves from dge after a short vowel to ge in a long-vowel word.'],['ridge','stage','fudge','huge','Compare the short vowel + dge with a long vowel and ge.'],['age','edge','page','pledge','Each pair changes from ge to dge after one short vowel.'],['dodge','gorge','badge','barge','In the second word, r comes before ge.'],['ledge','cage','hedge','sage','Both pairs contrast short e + dge with long a and ge.']]);
analogies(finalch,[['patch','peach','match','teach','Each pair changes from tch after a short vowel to ch after a vowel team.'],['coach','catch','poach','patch','Each pair changes from oa + ch to a short vowel + tch.'],['beach','batch','teach','hatch','Both pairs compare vowel team + ch with short a + tch.'],['fetch','speech','hitch','peach','The first word uses tch; the second uses ch after a vowel team.'],['ditch','porch','pitch','torch','Each pair changes from short vowel + tch to r + ch.']]);
analogies(soundc,[['cat','city','cup','cent','Hard c /k/ changes to soft c /s/.'],['ice','cap','face','clap','Soft c /s/ changes to hard c /k/.'],['cot','cent','crab','cell','The sound changes from /k/ to /s/.'],['pace','cake','mice','crop','The sound changes from /s/ to /k/.'],['cold','cease','cart','cyst','C is soft before e, i, or y.']]);
analogies(soundg,[['goat','gem','gap','gym','The sound of g changes from /g/ to /j/.'],['giant','grin','germ','game','The sound of g changes from /j/ to /g/.'],['get','gem','gift','gist','Both pairs show hard and soft g before e or i.'],['garden','gentle','gum','giraffe','The sound changes from hard g to soft g.'],['gym','go','gel','gap','Soft g changes to hard g.']]);
analogies(vowel,[['rain','day','train','play','Ai and ay can both spell long a.'],['see','sea','meet','meat','Ee and ea can spell the same long e sound.'],['boat','snow','coat','grow','Oa and ow can both spell long o.'],['coin','boy','soil','toy','Oi and oy can spell the same vowel sound.'],['cloud','cow','shout','how','Ou and ow can spell the /ou/ sound.']]);
vce.sentences=['Jake will hop on the bike and ride to the shop.','I will cut the cake and pack it in a box.','The cat sat near the gate and watched the mule.'];
finalk.sentences=['Blake took his bike to the park by the pond.','Nick took a quick look at the back of the truck.','Rick wore a dark cloak and held a stick by the creek.'];
finalj.sentences=['He made a pledge to never dodge the truth.','The judge stood on the ridge near the old cage.','She wore a badge and stood near the ledge of the stage.'];
finalch.sentences=['He sat on the porch to watch the match.','She will teach each child to catch the ball.','They will reach the hatch and latch it shut.'];
soundc.sentences=['He gave a nice clap for the show.','Trace the path with a quick pace.','She saw a crack in the ice.'];
soundg.sentences=['Give the page to the girl.','Gus saw a cage near the gum tree.','She gave the edge of the game to Greg.'];
vowel.sentences=['The green boat floats on the creek.','Rain fell on the road all day.','The cow stood by a mound of soil.'];
ed.sentences=['We played a game and then packed our bags.','She smiled as the puppy hopped onto the rug.'];
plural.sentences=['The puppies played with the toys.','We packed the boxes and washed the dishes.'];
ing.sentences=['The children are running and playing.','I am making a card while she is singing.'];
ly.sentences=['She gently placed the cup on the table.','He happily waved to his brotherly friend.'];
// Canonical word sums: preserve the full spelling of each base and suffix.
ed.sums=words('dance:danced live:lived bury:buried jam:jammed scurry:scurried bless:blessed match:matched').map(s=>{const [base,word]=s.split(':');return {base,word,parts:[base,'ed']};});
plural.sums=words('tax:taxes batch:batches desk:desks dairy:dairies goat:goats day:days candy:candies').map(s=>{const [base,word]=s.split(':');return {base,word,parts:[base,word.endsWith('es')&&!base.endsWith('e')?'es':'s']};});
ing.sums=words('bring:bringing match:matching stop:stopping chase:chasing rain:raining look:looking plan:planning').map(s=>{const [base,word]=s.split(':');return {base,word,parts:[base,'ing']};});
ly.sums=[{base:'gentle',word:'gently',parts:['gentle','ly']},{base:'graphic',word:'graphically',parts:['graph','ic','al','ly']},{base:'clear',word:'clearly',parts:['clear','ly']},{base:'clumsy',word:'clumsily',parts:['clumsy','ly']},{base:'simple',word:'simply',parts:['simple','ly']},{base:'historic',word:'historically',parts:['histor','ic','al','ly']},{base:'neat',word:'neatly',parts:['neat','ly']}];
ed.build=words('play comment present bleach use study admit identify').map(base=>ed.words.find(w=>w.base===base));
plural.build=words('horse watch donkey graph party apple dish city').map(base=>plural.words.find(w=>w.base===base));
ing.build=words('comment present fuse trim party make put sing').map(base=>ing.words.find(w=>w.base===base));
ly.build=words('annoying brother quick ghost delightful slow tragic').map(base=>ly.words.find(w=>w.base===base));
ly.pos={annoying:['adjective','adverb'],brother:['noun','adjective'],quick:['adjective','adverb'],ghost:['noun','adjective'],delightful:['adjective','adverb'],slow:['adjective','adverb'],tragic:['adjective','adverb']};
const RULE_QUIZZES={
 'vce':{prompt:'Which pair shows final e helping a vowel say its name?',options:['cap → cape','have → give','book → cook'],correct:0,why:'Cap has short a. In cape, a…e spells long a.'},
 'final-k':{prompt:'Why does milk end in k instead of ck?',options:['Every short vowel word uses k.','The consonant l is between the vowel and /k/.','Milk has a silent e.'],correct:1,why:'The /k/ is not immediately after the short vowel: l comes between them.'},
 'final-j':{prompt:'Which ending usually follows one short vowel to spell final /j/?',options:['j','ge','dge'],correct:2,why:'Dge spells /j/ directly after a short vowel, as in badge.'},
 'final-ch':{prompt:'Which word is a common exception to the usual tch pattern?',options:['patch','much','match'],correct:1,why:'Much has a short vowel but uses ch. Learn this exception.'},
 'sound-c':{prompt:'Which letters usually make c soft, as in cent and city?',options:['a, o, u','e, i, y','b, d, f'],correct:1,why:'C usually says /s/ before e, i, or y.'},
 'sound-g':{prompt:'Does g always say /j/ before e, i, or y?',options:['Yes, always.','No. Get and gift keep the hard /g/.','No. It is always silent.'],correct:1,why:'G can say /j/ or /g/ before e, i, or y. Read the word to check.'},
 'vowel-teams':{prompt:'Which statement is true?',options:['Ea always says long e.','A long e sound must use ee.','Ea spells long e in team but short e in head.'],correct:2,why:'Vowel teams can have more than one sound. Learn the spelling in each word.'},
 'ed':{prompt:'Which past-tense spelling is correct?',options:['plaied','played','playyed'],correct:1,why:'Keep y after a vowel. Play + ed becomes played.'},
 'plurals':{prompt:'Which regular plural is correct?',options:['citys','cityes','cities'],correct:2,why:'After a consonant, change y to i and add es: city → cities.'},
 'ing':{prompt:'Which spelling keeps the y correctly?',options:['partiing','partying','parttying'],correct:1,why:'Keep y when adding ing: party → partying.'},
 'ly':{prompt:'What happens in basic → basically?',options:['Add al, then ly.','Double c, then add ly.','Change ic to y.'],correct:0,why:'Many ic words add al before ly. Publicly is an exception.'}
};
// Additional mapped examples from the teaching activities.
for(const [m,c,list] of [[vce,0,'lane cape'],[finalk,0,'stick'],[finalch,1,'smooch'],[soundc,1,'crib'],[soundc,0,'cinch'],[soundg,1,'glad gear']])for(const word of words(list))if(!m.words.some(w=>w.word===word))m.words.push({word,c});
function normalise(s){return String(s).toLowerCase().replace(/[’‘]/g,"'").trim().replace(/\s+/g,' ');}
function spellingMatch(a,b){return normalise(a)===normalise(b);}
function sentenceMatch(a,b){return normalise(a).replace(/[^a-z0-9' ]/g,'')===normalise(b).replace(/[^a-z0-9' ]/g,'');}
function sumMatch(a,parts){return normalise(a).replace(/\s/g,'')===parts.join('+').toLowerCase();}
function getModule(id){return COURSE.find(m=>m.id===id)||COURSE[0];}
function balanced(m,count,offset=0){const buckets=m.categories.map((_,c)=>m.words.filter(w=>w.c===c));const result=[];for(let i=0;result.length<count&&i<count*2;i++){const c=i%buckets.length,b=buckets[c];const e=b[(Math.floor(i/buckets.length)+offset)%b.length];if(!result.some(x=>x.word===e.word))result.push(e);}return result;}
if(typeof module!=='undefined')module.exports={COURSE,RULE_QUIZZES,normalise,spellingMatch,sentenceMatch,sumMatch,balanced};

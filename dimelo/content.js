// A language pack: curriculum stays separate from the practice engine.
export const pack = {id:'es', name:'Español', locale:'es-MX', nativeName:'Spanish', version:1};
export const lessons = [
  {id:1,title:'Hello & how are you?',short:'Greetings'},
  {id:2,title:'Greetings & introductions',short:'Introductions'},
  {id:3,title:'Names & where you’re from',short:'Where you’re from'},
  {id:4,title:'Where you live',short:'Where you live'},
  {id:5,title:'Meet the family',short:'Family'},
  {id:6,title:'Family, numbers & identity',short:'Family & identity'},
  {id:7,title:'Work & occupations',short:'Work'},
  {id:8,title:'Things you enjoy',short:'Interests'},
  {id:9,title:'Cumulative review · episodes 1–8',short:'Review',review:true},
  {id:'helpers',title:'Keep the conversation going',short:'Conversation helpers'},
  {id:'travel',title:'Prices & travel essentials',short:'Travel essentials'},
  {id:'numbers',title:'Numbers, from zero to a million',short:'Numbers'}
];
// Original notes are retained so every supplied expression can be audited.
export const sourceNotes = [
  ['1','hola','Qué tal?','como estás','Bien','gracias','muy Bien','Fatal','y tu','yo Bien','Estupendo','phenomenal'],
  ['2','Buenos dias','buenas tardes','buenas noches','adios','hasta luego','hasta pronto','mañana','me llamo','encantada'],
  ['3','usted','y usted?','como te llamas','de donde Eres','soy de Canada','espana','tambien','de donde es usted','me llamo Darren','soy de Canada también','de donde es usted'],
  ['4','sí','Non','eres de Canada?','No me llamo Mark','vivo en Edmonton','donde vives?','Pero','ahora'],
  ['5','hermano','hermana','madre','padre','marido','mujer','hijo','hija','Este es mi hermano','Esta es mi hermana','se llama'],
  ['6','tu padre','Mamá','papá','tengo','tengo una hermana','tu vs tú','Uno','dos','tres','cuatro','Cinco','seis','siete','ocho','nueve','dies','tengo un hermano se llama Jorge','Quién eres?'],
  ['7','soy profesor','estudiante','inhero','Fontanero','trabajo en una officina','una tienda','un restaurante','No te gusta tu trabajo?','Sí me gusta mi trabajo'],
  ['8','Te gusta tu trabajo?','Le gusta su trabajo','Me gusta la literatura','La fotografia','me gusta mucho el chocolate','el cine','el deporte','Me gusta cantar','bailar','salir','leer','Me encanta','aprender español']
];
const bank = new Map();
const key = s => s.normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase().replace(/[¿?¡!.,;:]/g,'').trim();
function add(es,en,lesson,extra={}) {
  const k=key(es), existing=bank.get(k);
  if(existing){ if(!existing.lessons.includes(lesson))existing.lessons.push(lesson); if(extra.source)existing.sources.push(extra.source); return existing; }
  const e={id:'es-'+k.replace(/[^a-z0-9]+/g,'-'),es,en,lessons:[lesson],kind:es.split(' ').length>1?'phrase':'word',answers:[],notes:'',sources:extra.source?[extra.source]:[],...extra};
  bank.set(k,e);return e;
}
function list(lesson,rows){for(const row of rows){const [es,en,notes='',answers=[]]=row;add(es,en,lesson,{notes,answers});}}
list(1,[
 ['Hola.','Hello.'],['¿Qué tal?','How’s it going?'],['¿Cómo estás?','How are you?','Informal: speaking to one person you know.'],
 ['Bien.','Well / fine.'],['Gracias.','Thank you.'],['Muy bien.','Very well.'],['Fatal.','Terrible.'],['¿Y tú?','And you?','Informal tú has an accent.'],
 ['Yo, bien.','I’m fine.','A natural short answer in this exchange.',['yo bien','bien']],['Estupendo.','Great / wonderful.'],['¡Fenomenal!','Fantastic / phenomenal.','Spelling corrected from “phenomenal”.']
]);
list(2,[
 ['Buenos días.','Good morning.'],['Buenas tardes.','Good afternoon.'],['Buenas noches.','Good evening / good night.'],['Adiós.','Goodbye.'],['Hasta luego.','See you later.'],['Hasta pronto.','See you soon.'],['Mañana.','Tomorrow.'],['Me llamo…','My name is…','Follow with your name.'],['Encantada.','Pleased to meet you (female speaker).','Encantado is the corresponding masculine form.']
]);
list(3,[
 ['Usted.','You (formal singular).'],['¿Y usted?','And you? (formal)'],['¿Cómo te llamas?','What’s your name? (informal)'],['¿De dónde eres?','Where are you from? (informal)'],['Soy de Canadá.','I’m from Canada.'],['España.','Spain.'],['También.','Also / too.'],['¿De dónde es usted?','Where are you from? (formal)'],['Me llamo Darren.','My name is Darren.'],['Soy de Canadá también.','I’m from Canada too.']
]);
list(4,[
 ['Sí.','Yes.','Sí with an accent means yes.'],['No.','No.','Spanish “no”; corrected from “Non”.'],['¿Eres de Canadá?','Are you from Canada?'],
 ['No me llamo Mark.','My name is not Mark.','Your note is preserved literally. “No, me llamo Mark” would mean “No, my name is Mark.” Check which you intended.'],
 ['Vivo en Edmonton.','I live in Edmonton.'],['¿Dónde vives?','Where do you live? (informal)'],['Pero.','But.'],['Ahora.','Now.']
]);
list(5,[
 ['Hermano.','Brother.'],['Hermana.','Sister.'],['Madre.','Mother.'],['Padre.','Father.'],['Marido.','Husband.'],['Mujer.','Woman / wife.','Mujer can mean woman or wife; context makes it clear.'],['Hijo.','Son.'],['Hija.','Daughter.'],['Este es mi hermano.','This is my brother.'],['Esta es mi hermana.','This is my sister.'],['Se llama…','His / her name is…']
]);
list(6,[
 ['Tu padre.','Your father.','Tu without an accent means your.'],['Mamá.','Mum / mom.'],['Papá.','Dad.'],['Tengo.','I have.'],['Tengo una hermana.','I have a sister.'],['Tu.','Your (informal singular).','Compare tú = you.'],['Tú.','You (informal singular).','Compare tu = your.'],['Tengo un hermano. Se llama Jorge.','I have a brother. His name is Jorge.'],['¿Quién eres?','Who are you?']
]);
list(7,[
 ['Soy profesor.','I’m a teacher (male).','Profesora is the corresponding feminine form.'],['Estudiante.','Student.'],
 ['Ingeniero.','Engineer (male).','Interpreted your note “inhero” as ingeniero. Check this correction in My vocabulary.'],['Fontanero.','Plumber.','Plomero is also common in Mexico.'],
 ['Trabajo en una oficina.','I work in an office.','Oficina: corrected spelling.'],['Una tienda.','A shop / a store.'],['Un restaurante.','A restaurant.'],['¿No te gusta tu trabajo?','Don’t you like your job?'],['Sí, me gusta mi trabajo.','Yes, I like my job.']
]);
list(8,[
 ['¿Te gusta tu trabajo?','Do you like your job? (informal)'],['¿Le gusta su trabajo?','Do you like your job? (formal)','Le / su match usted in this question.'],['Me gusta la literatura.','I like literature.'],['La fotografía.','Photography.'],['Me gusta mucho el chocolate.','I really like chocolate.'],['El cine.','Cinema / the movies.'],['El deporte.','Sport / sports.'],['Me gusta cantar.','I like singing.'],['Bailar.','To dance.'],['Salir.','To go out / to leave.'],['Leer.','To read.'],['Me encanta.','I love it.'],['Aprender español.','To learn Spanish.']
]);
// Individual components remain available alongside complete expressions.
const components=[
 ['qué','what',1],['tal','such / so (in qué tal: how’s it going?)',1],['cómo','how',1],['estás','you are (from estar)',1],['muy','very',1],['y','and',1],['yo','I',1],
 ['buenos','good (masculine plural)',2],['días','days',2],['buenas','good (feminine plural)',2],['tardes','afternoons / evenings',2],['noches','nights',2],['hasta','until / up to',2],['luego','later / then',2],['pronto','soon',2],['me','me / to me',2],['llamo','I call / name',2],
 ['te','you / to you (object pronoun)',3],['llamas','you call / name',3],['de','from / of',3],['dónde','where',3],['eres','you are (from ser)',3],['soy','I am (from ser)',3],['Canadá','Canada',3],['es','is / you are (formal)',3],['Darren','Darren (a name)',3],
 ['vivo','I live',4],['en','in / at',4],['Edmonton','Edmonton (a city)',4],['vives','you live',4],['Mark','Mark (a name)',4],
 ['este','this (masculine)',5],['esta','this (feminine)',5],['mi','my',5],['se','reflexive pronoun (as in se llama)',5],['llama','calls / names (as in se llama)',5],
 ['una','a / an / one (feminine)',6],['un','a / an / one (masculine)',6],['Jorge','Jorge (a name)',6],['quién','who',6],
 ['profesor','teacher (male)',7],['trabajo','work / job / I work',7],['oficina','office',7],['tienda','shop / store',7],['restaurante','restaurant',7],['gusta','is pleasing (me gusta: I like)',7],
 ['le','to you (formal) / to him / to her',8],['su','your (formal) / his / her / their',8],['la','the (feminine singular)',8],['literatura','literature',8],['fotografía','photography',8],['mucho','a lot / much',8],['el','the (masculine singular)',8],['chocolate','chocolate',8],['cine','cinema / movies',8],['deporte','sport',8],['cantar','to sing',8],['encanta','delights (me encanta: I love)',8],['aprender','to learn',8],['español','Spanish',8]
];
for(const [es,en,lesson] of components){
  // tu and tú must stay distinct, despite accent-tolerant answer checking.
  if(es==='tú')continue;
  add(es,en,lesson,{kind:'word'});
}
// The two possessive/pronoun entries deliberately have distinct IDs and keys.
const tu=bank.get('tu');if(tu){tu.es='Tu.';tu.en='Your (informal singular).';tu.notes='Tu = your. Tú = you. The accent changes the meaning.';}
bank.set('tu-pronoun',{id:'es-tu-pronoun',es:'Tú.',en:'You (informal singular).',lessons:[1,6],kind:'word',answers:[],notes:'Tú = you. Tu = your. For this distinction the accent is required.',sources:[]});
list('helpers',[
 ['Estoy aprendiendo español.','I’m learning Spanish.'],['Hablo un poco de español.','I speak a little Spanish.'],['Soy principiante.','I’m a beginner.'],['No entiendo.','I don’t understand.'],['Entiendo un poco.','I understand a little.'],
 ['¿Puede repetirlo, por favor?','Could you repeat that, please?','Formal, polite request.',['puede repetir por favor','repita por favor']],['Más despacio, por favor.','More slowly, please.'],['¿Puede hablar más despacio, por favor?','Could you speak more slowly, please?'],['¿Qué significa…?','What does … mean?'],['¿Cómo se dice… en español?','How do you say … in Spanish?'],['¿Puede escribirlo, por favor?','Could you write it down, please?'],['¿Lo dije bien?','Did I say it correctly?'],['¿Habla inglés?','Do you speak English? (formal)'],['¿Cómo se escribe?','How is it written / spelled?'],['Encantado.','Pleased to meet you (male speaker).'],['Profesora.','Teacher (female).'],['Plomero.','Plumber (common in Mexico).'],['Por favor.','Please.']
]);
list('travel',[
 ['¿Cuánto cuesta?','How much does it cost?'],['¿Cuánto es?','How much is it?'],['La cuenta, por favor.','The bill, please.'],['Un taxi.','A taxi.'],['Un peso.','One peso.'],['Pesos.','Pesos.'],['En total.','In total.'],['Por persona.','Per person.'],['Son doscientos cincuenta pesos.','It’s 250 pesos.'],['¿Doscientos cincuenta?','Two hundred and fifty?','Repeat an amount as a question to confirm it.'],['Con tarjeta.','By card.'],['En efectivo.','In cash.']
]);
list('helpers',[
 ['¿Tienes hermanos?','Do you have siblings?'],['¿Cómo se llama?','What is his / her name?'],['¿Cómo se llama usted?','What is your name? (formal)'],
 ['Estoy.','I am (from estar).'],['Aprendiendo.','Learning.'],['Hablo.','I speak.'],['Poco.','A little / not much.'],['Principiante.','Beginner.'],['Entiendo.','I understand.'],['Puede.','You can (formal) / he or she can.'],['Repetirlo.','To repeat it.'],['Por.','For / by / per.'],['Favor.','Favour (por favor = please).'],['Más.','More.'],['Despacio.','Slowly.'],['Hablar.','To speak.'],['Significa.','Means.'],['Dice.','Says (cómo se dice = how do you say).'],['Escribirlo.','To write it.'],['Lo.','It (object pronoun).'],['Dije.','I said.'],['Inglés.','English.'],['Habla.','You speak (formal) / he or she speaks.'],['Escribe.','Writes / you write (formal).'],['Tienes.','You have (informal).'],['Hermanos.','Brothers / siblings.']
]);
list('travel',[
 ['Cuánto.','How much.'],['Cuesta.','Costs.'],['Cuenta.','Bill / account.'],['Taxi.','Taxi.'],['Peso.','Peso.'],['Total.','Total.'],['Persona.','Person.'],['Son.','They are / it is (with an amount).'],['Tarjeta.','Card.'],['Efectivo.','Cash.'],['México.','Mexico.']
]);
export function numberEs(n,{apocope=false}={}){
  if(!Number.isInteger(n)||n<0||n>1000000)throw new RangeError('Use a whole number from 0 to 1,000,000.');
  const small=['cero','uno','dos','tres','cuatro','cinco','seis','siete','ocho','nueve','diez','once','doce','trece','catorce','quince','dieciséis','diecisiete','dieciocho','diecinueve','veinte','veintiuno','veintidós','veintitrés','veinticuatro','veinticinco','veintiséis','veintisiete','veintiocho','veintinueve'];
  let out;
  if(n<30)out=small[n];
  else if(n<100){const tens=['','','','treinta','cuarenta','cincuenta','sesenta','setenta','ochenta','noventa'];out=tens[Math.floor(n/10)]+(n%10?' y '+small[n%10]:'');}
  else if(n===100)out='cien';
  else if(n<1000){const h=['','ciento','doscientos','trescientos','cuatrocientos','quinientos','seiscientos','setecientos','ochocientos','novecientos'];out=h[Math.floor(n/100)]+(n%100?' '+numberEs(n%100):'');}
  else if(n<1000000){const thousands=Math.floor(n/1000);out=(thousands===1?'mil':numberEs(thousands,{apocope:true})+' mil')+(n%1000?' '+numberEs(n%1000):'');}
  else out='un millón';
  if(apocope)out=out.replace(/veintiuno$/,'veintiún').replace(/ y uno$/,' y un').replace(/\buno$/,'un');
  return out;
}
export function moneyEs(n){if(n===1)return 'un peso';if(n===1000000)return 'un millón de pesos';return numberEs(n,{apocope:true})+' pesos';}
export const numberValues=[...Array.from({length:101},(_,i)=>i),...Array.from({length:9},(_,i)=>(i+2)*100),...Array.from({length:9},(_,i)=>(i+2)*1000),...Array.from({length:9},(_,i)=>(i+2)*10000),...Array.from({length:9},(_,i)=>(i+2)*100000),1000000];
for(const n of [...new Set(numberValues)]){
 const e=add(numberEs(n),String(n),'numbers',{kind:'number',number:n});
 if(n>=1&&n<=10&&!e.lessons.includes(6))e.lessons.push(6);
}
// Coverage records link every original note to a preserved canonical expression.
const sourceCanonical=[
 ['hola','qué tal','cómo estás','bien','gracias','muy bien','fatal','y tú','yo bien','estupendo','fenomenal'],
 ['buenos días','buenas tardes','buenas noches','adiós','hasta luego','hasta pronto','mañana','me llamo…','encantada'],
 ['usted','y usted','cómo te llamas','de dónde eres','soy de canadá','españa','también','de dónde es usted','me llamo darren','soy de canadá también','de dónde es usted'],
 ['sí','no','eres de canadá','no me llamo mark','vivo en edmonton','dónde vives','pero','ahora'],
 ['hermano','hermana','madre','padre','marido','mujer','hijo','hija','este es mi hermano','esta es mi hermana','se llama…'],
 ['tu padre','mamá','papá','tengo','tengo una hermana','tu','uno','dos','tres','cuatro','cinco','seis','siete','ocho','nueve','diez','tengo un hermano se llama jorge','quién eres'],
 ['soy profesor','estudiante','ingeniero','fontanero','trabajo en una oficina','una tienda','un restaurante','no te gusta tu trabajo','sí me gusta mi trabajo'],
 ['te gusta tu trabajo','le gusta su trabajo','me gusta la literatura','la fotografía','me gusta mucho el chocolate','el cine','el deporte','me gusta cantar','bailar','salir','leer','me encanta','aprender español']
];
export const sourceCoverage=sourceNotes.flatMap((row,i)=>row.slice(1).map((raw,j)=>{
 const canonical=sourceCanonical[i][j];const entry=bank.get(key(canonical));
 if(!entry)throw new Error('Missing note: '+raw+' => '+canonical);
 const ids=raw==='tu vs tú'?[entry.id,'es-tu-pronoun']:[entry.id];
 entry.sources.push('Episode '+(i+1)+': '+raw);
 if(!entry.lessons.includes(i+1))entry.lessons.push(i+1);
 return {episode:i+1,raw,ids};
}));
export const entries=[...bank.values()];
export const entryById=Object.fromEntries(entries.map(e=>[e.id,e]));
export const numberStages=[
 {id:'foundation',title:'Zero to twenty',label:'0–20',description:'Every number. Start with the sounds.',min:0,max:20,step:1,tip:'Learn 0–15, then notice dieciséis, diecisiete, dieciocho and diecinueve.'},
 {id:'hundred',title:'Every number to 100',label:'0–100',description:'Build and hear the full first hundred.',min:0,max:100,step:1,tip:'21–29 are written as one word. From 31: treinta y uno, treinta y dos…'},
 {id:'tens',title:'Counting by tens',label:'10, 20, 30…',description:'Hear the tens, then put them in order.',min:10,max:100,step:10,tip:'Listen for the difference between sesenta (60) and setenta (70).'},
 {id:'hundreds',title:'Counting by hundreds',label:'100–1,000',description:'Cien, doscientos, trescientos…',min:100,max:1000,step:100,tip:'The irregular forms are quinientos (500), setecientos (700) and novecientos (900). Use cien for exactly 100, ciento for 101–199.'},
 {id:'mixed',title:'Mixed hundreds',label:'101–999',description:'Prices like 125, 275 and 640.',min:101,max:999,step:1,tip:'Combine a hundred with the rest: doscientos + cincuenta = doscientos cincuenta.'},
 {id:'thousands',title:'Counting by thousands',label:'1,000–10,000',description:'Mil, dos mil, tres mil…',min:1000,max:10000,step:1000,tip:'Exactly 1,000 is mil, without uno. Then dos mil, tres mil…'},
 {id:'mixedThousands',title:'Mixed thousands',label:'1,001–9,999',description:'Hear the amount in meaningful chunks.',min:1001,max:9999,step:1,tip:'Listen for the thousands first: tres mil setecientos cincuenta = 3,750.'},
 {id:'large',title:'Larger amounts',label:'10,000–1,000,000',description:'Tens of thousands, hundreds of thousands, a million.',min:10000,max:1000000,step:1000,tip:'Cien mil = 100,000. Un millón = 1,000,000.'}
];
export const sentenceTasks=[
 {id:'name',lesson:3,prompt:'Introduce yourself as Darren.',es:'Me llamo Darren.',note:'Me llamo + your name.',words:['Me','llamo','Darren','.'],entry:'Me llamo Darren.'},
 {id:'country',lesson:3,prompt:'Say you’re from Canada.',es:'Soy de Canadá.',note:'Soy de + where you’re from.',words:['Soy','de','Canadá','.'],entry:'Soy de Canadá.'},
 {id:'countryToo',lesson:3,prompt:'Say you’re from Canada too.',es:'Soy de Canadá también.',note:'También adds “too / also”.',words:['Soy','de','Canadá','también','.'],entry:'Soy de Canadá también.'},
 {id:'home',lesson:4,prompt:'Say you live in Edmonton.',es:'Vivo en Edmonton.',note:'Vivo en + where you live. Soy de tells where you’re from.',words:['Vivo','en','Edmonton','.'],entry:'Vivo en Edmonton.'},
 {id:'brother',lesson:5,prompt:'Introduce your brother.',es:'Este es mi hermano.',note:'Este matches a masculine person or noun.',words:['Este','es','mi','hermano','.'],entry:'Este es mi hermano.'},
 {id:'sister',lesson:5,prompt:'Introduce your sister.',es:'Esta es mi hermana.',note:'Esta matches a feminine person or noun.',words:['Esta','es','mi','hermana','.'],entry:'Esta es mi hermana.'},
 {id:'have',lesson:6,prompt:'Say you have a sister.',es:'Tengo una hermana.',note:'Tengo + what you have.',words:['Tengo','una','hermana','.'],entry:'Tengo una hermana.'},
 {id:'familyName',lesson:6,prompt:'Say you have a brother called Jorge.',es:'Tengo un hermano. Se llama Jorge.',note:'Tengo introduces your family. Se llama gives his or her name.',words:['Tengo','un','hermano','.','Se','llama','Jorge','.'],entry:'Tengo un hermano. Se llama Jorge.'},
 {id:'office',lesson:7,prompt:'Say you work in an office.',es:'Trabajo en una oficina.',note:'Trabajo en + your workplace.',words:['Trabajo','en','una','oficina','.'],entry:'Trabajo en una oficina.'},
 {id:'job',lesson:7,prompt:'Say you like your job.',es:'Sí, me gusta mi trabajo.',note:'Me gusta + a singular thing or an activity.',words:['Sí',',','me','gusta','mi','trabajo','.'],entry:'Sí, me gusta mi trabajo.'},
 {id:'literature',lesson:8,prompt:'Say you like literature.',es:'Me gusta la literatura.',note:'Use the article: la literatura.',words:['Me','gusta','la','literatura','.'],entry:'Me gusta la literatura.'},
 {id:'chocolate',lesson:8,prompt:'Say you really like chocolate.',es:'Me gusta mucho el chocolate.',note:'Mucho adds “a lot / really”.',words:['Me','gusta','mucho','el','chocolate','.'],entry:'Me gusta mucho el chocolate.'},
 {id:'sing',lesson:8,prompt:'Say you like singing.',es:'Me gusta cantar.',note:'After me gusta, the activity stays in the infinitive: cantar.',words:['Me','gusta','cantar','.'],entry:'Me gusta cantar.'},
 {id:'learning',lesson:'helpers',prompt:'Say you’re learning Spanish.',es:'Estoy aprendiendo español.',note:'A useful whole phrase: estoy aprendiendo…',words:['Estoy','aprendiendo','español','.'],entry:'Estoy aprendiendo español.'}
];

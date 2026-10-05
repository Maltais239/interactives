(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./words.js'));else root.PluralLab=factory(root.PluralWords);})(typeof window!=='undefined'?window:this,function(words){
'use strict';
const rules={s:{name:'Add s',example:'toy → toys',note:'Most regular nouns add s. After a vowel + y, keep the y: toy → toys.'},es:{name:'Add es',example:'box → boxes',note:'These examples end in s, x, z, ch or sh. They add es. In quiz → quizzes, double the final z first.'},ies:{name:'Change y to i + es',example:'baby → babies',note:'After a consonant + y, change y to i and add es. Compare baby with boy.'},ves:{name:'Change f / fe to ves',example:'leaf → leaves',note:'Some nouns ending in f or fe use ves. This is not universal: roof → roofs and chief → chiefs.'},irregular:{name:'Other changes',example:'child → children',note:'These plurals do not follow the regular s/es patterns. Study and compare the whole words.'}};
function normalize(s){return String(s).trim().toLowerCase();}
function correct(word,input){return normalize(input)===word.plural;}
function explain(w){if(w.singular==='quiz')return 'quiz → quizzes: double the final z and add es.';if(w.rule==='ies')return `${w.singular} → ${w.plural}: a consonant comes before y, so change y to i and add es.`;if(w.rule==='s'&&w.singular.endsWith('y'))return `${w.singular} → ${w.plural}: a vowel comes before y, so keep y and add s.`;return `${w.singular} → ${w.plural}. ${rules[w.rule].note}`;}
return {words,rules,normalize,correct,explain};
});

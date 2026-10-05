(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.FunctionDetective=factory();})(typeof window!=='undefined'?window:this,function(){
'use strict';
const cases=[{a:1,b:1},{a:2,b:0},{a:2,b:-1},{a:3,b:1},{a:3,b:-2},{a:1,b:4},{a:2,b:-2},{a:4,b:0},{a:4,b:-3},{a:2,b:3},{a:3,b:-1},{a:5,b:0},{a:5,b:-4},{a:2,b:5},{a:4,b:-2},{a:3,b:4},{a:6,b:-5},{a:5,b:2},{a:4,b:-1},{a:6,b:-3}];
// Parse linear expressions without evaluating JavaScript or allowing function calls.
function parse(text){
 const s=String(text).toLowerCase().replace(/^\s*y\s*=/,'').replace(/\s+/g,'').replace(/[×·]/g,'*').replace(/÷/g,'/').replace(/−/g,'-');let index=0;
 function factor(){if(s[index]==='+'){index++;return factor();}if(s[index]==='-'){index++;const p=factor();return {a:-p.a,b:-p.b};}if(s[index]==='('){index++;const p=expression();if(s[index++]!==')')throw Error('Close every parenthesis.');return p;}if(s[index]==='x'){index++;return {a:1,b:0};}const m=s.slice(index).match(/^(?:\d+(?:\.\d*)?|\.\d+)/);if(!m)throw Error('Use x, numbers, +, −, ×, ÷ and parentheses.');index+=m[0].length;return {a:0,b:Number(m[0])};}
 function multiply(p,q){if(p.a&&q.a)throw Error('This set uses linear rules, so do not multiply x by x.');return {a:p.a*q.b+q.a*p.b,b:p.b*q.b};}
 function term(){let p=factor();while(index<s.length){const op=s[index];if(op==='*'||op==='/'){index++;const q=factor();if(op==='*')p=multiply(p,q);else{if(q.a||q.b===0)throw Error('Divide only by a non-zero number.');p={a:p.a/q.b,b:p.b/q.b};}}else if(op==='x'||op==='('||/\d|\./.test(op)){p=multiply(p,factor());}else break;}return p;}
 function expression(){let p=term();while(s[index]==='+'||s[index]==='-'){const sign=s[index++]==='+'?1:-1;const q=term();p={a:p.a+sign*q.a,b:p.b+sign*q.b};}return p;}
 if(!s)throw Error('Enter a rule first.');const result=expression();if(index!==s.length||!Number.isFinite(result.a)||!Number.isFinite(result.b)||Math.abs(result.a)>1000000||Math.abs(result.b)>1000000)throw Error('Check the expression. Try a rule such as 2x + 3.');return result;
}
function matches(rule,target){return Math.abs(rule.a-target.a)<1e-9&&Math.abs(rule.b-target.b)<1e-9;}
function output(rule,x){return rule.a*x+rule.b;}
function format(rule){return `${rule.a===1?'x':rule.a===-1?'−x':rule.a+'x'}${rule.b===0?'':rule.b>0?' + '+rule.b:' − '+Math.abs(rule.b)}`;}
return {cases,parse,matches,output,format};
});

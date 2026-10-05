window.MorphemeTiles = (() => {
  function route(set, word) {
    const suffixes=[...new Set([...(set.suffixes||[]),...(set.suffixRedHerrings||[])])];
    const memo=new Map();
    function tail(rest){if(!rest)return [];if(memo.has(rest))return memo.get(rest);for(const s of suffixes){if(s&&rest.startsWith(s)){const result=tail(rest.slice(s.length));if(result){const path=[{type:'suffix',text:s},...result];memo.set(rest,path);return path}}}memo.set(rest,null);return null}
    for(const prefix of ['',...(set.prefixes||[]),...(set.prefixRedHerrings||[])]){
      const start=prefix+set.root;if(!word.startsWith(start))continue;const ending=tail(word.slice(start.length));if(ending)return [...(prefix?[{type:'prefix',text:prefix}]:[]),{type:'root',text:set.root},...ending];
    }
    return null;
  }
  function validate(input){
    if(!input||typeof input!=='object'||Array.isArray(input))throw Error('Choose a JSON object describing one word family.');
    const data={root:String(input.root||'').trim().toLowerCase()};
    if(!/^[a-z]{1,30}$/.test(data.root))throw Error('Enter a base or root of 1–30 letters.');
    for(const key of ['prefixes','suffixes','prefixRedHerrings','suffixRedHerrings','validWords']){
      if(input[key]!==undefined&&!Array.isArray(input[key]))throw Error(key+' must be a list.');
      const values=input[key]||[];if(values.length>(key==='validWords'?160:40))throw Error('Too many entries in '+key+'.');
      data[key]=[...new Set(values.map(v=>typeof v==='string'?v.trim().toLowerCase():''))];
      if(data[key].some(v=>!new RegExp('^[a-z]{1,'+(key==='validWords'?60:20)+'}$').test(v)))throw Error('Use letters only in '+key+'.');
    }
    if(!data.validWords.length)throw Error('List at least one target word.');
    const unreachable=data.validWords.filter(word=>!route(data,word));
    if(unreachable.length)throw Error('These targets cannot be built from the supplied tiles: '+unreachable.slice(0,6).join(', ')+'. Add the missing parts or revise the word bank.');
    return data;
  }
  return {route,validate};
})();

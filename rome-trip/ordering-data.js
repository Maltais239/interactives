/* Published food names and original, combinable ordering practice. */
(() => {
  'use strict';
  const D=window.ROME;
  const row=(who,it,en)=>({who,it,en});
  const reply=(question,questionEn,it,en)=>({question,questionEn,it,en});
  const food=(id,label,one,two,enOne,enTwo)=>({id,label,it:[one,two],en:[enOne,enTwo]});
  const water=[['','No drink'],['una bottiglia d’acqua naturale','a bottle of still water'],['una bottiglia d’acqua frizzante','a bottle of sparkling water'],['due bottiglie d’acqua naturale','two bottles of still water'],['due bottiglie d’acqua frizzante','two bottles of sparkling water']];
  const coffee=[['un cappuccino','a cappuccino'],['due cappuccini','two cappuccinos'],['un espresso','an espresso'],['due espressi','two espressos'],['un caffè decaffeinato','a decaf coffee'],['','No drink']];
  const venues=[
    {
      id:'menu-sciascia',label:'Sciascia · coffee & maritozzo',title:'A coffee break at Sciascia.',
      context:'Build an order for cream-filled buns, a toast, and coffee.',
      menu:{venue:'Sciascia Caffè 1919 · Prati',address:'Via Fabio Massimo 80/a, Roma',url:'https://www.sciasciacaffe1919.it/menu/',locationSource:'https://www.sciasciacaffe1919.it/contatti/',sourceLabel:'Official café menu',checked:'10 October 2026',items:[['Maritozzo con panna','Sweet bun filled with whipped cream'],['Toast prosciutto e formaggio','Ham-and-cheese toast'],['Cappuccino','Coffee with steamed milk'],['Cappuccino con cioccolato','Chocolate cappuccino']]},
      requests:[['Avete ancora i maritozzi?','Do you still have cream-filled buns?'],['Posso pagare con la carta?','Can I pay by card?'],['Quanto costa un cappuccino?','How much is a cappuccino?'],['Da portare via, per favore.','To take away, please.']],
      dialogue:[row('Staff','Buongiorno, cosa desidera?','Good morning, what would you like?'),row('You','Due maritozzi con panna, per favore.','Two cream-filled buns, please.'),row('Staff','E da bere?','And to drink?'),row('You','Un cappuccino con cioccolato e un espresso, grazie.','A chocolate cappuccino and an espresso, thank you.'),row('Staff','Qui o da portare via?','For here or to take away?'),row('You','Qui, grazie.','For here, thank you.')],
      drills:[reply('Cosa desidera?','What would you like?','Un maritozzo con panna, per favore.','A cream-filled bun, please.'),reply('Quanti maritozzi?','How many cream-filled buns?','Due, grazie.','Two, thank you.'),reply('E da bere?','And to drink?','Un cappuccino con cioccolato, per favore.','A chocolate cappuccino, please.'),reply('Vuole qualcosa di salato?','Would you like something savoury?','Un toast prosciutto e formaggio, grazie.','A ham-and-cheese toast, thank you.'),reply('Qui o da portare via?','For here or to take away?','Qui, grazie.','For here, thank you.')],
      tip:'Maritozzo is singular; maritozzi is plural. Con panna means with whipped cream.'
    },
    {
      id:'menu-paninodivino',label:'Panino Divino · sandwiches',title:'Lunch at Panino Divino.',
      context:'Choose a named meat-and-cheese panino and practise ordering one or two.',
      menu:{venue:'Panino Divino',address:'Via dei Gracchi 11/A, Roma',url:'https://www.paninodivino.it/panini',locationSource:'https://www.paninodivino.it/',sourceLabel:'Official sandwich menu',checked:'10 October 2026',items:[['Sangiovese','Mortadella and Parmesan sandwich'],['Bonarda','Salami and Emmental sandwich'],['Campano','Parma ham and mozzarella sandwich'],['Cesanese','Turkey and fresh-cheese sandwich']]},
      requests:[['Che cosa c’è nel Sangiovese?','What is in the Sangiovese?'],['Quale panino mi consiglia?','Which sandwich do you recommend?'],['Un panino Campano senza rucola, per favore.','A Campano sandwich without rocket, please.'],['Posso pagare con la carta?','Can I pay by card?']],
      dialogue:[row('Staff','Quale panino desidera?','Which sandwich would you like?'),row('You','Un panino Campano, per favore.','A Campano sandwich, please.'),row('Staff','E per l’altra persona?','And for the other person?'),row('You','Un Sangiovese, grazie.','A Sangiovese, thank you.'),row('Staff','Da portare via?','To take away?'),row('You','Sì, grazie. Possiamo avere anche dell’acqua?','Yes, thank you. Could we also have some water?')],
      drills:[reply('Quale panino desidera?','Which sandwich would you like?','Un panino Campano, per favore.','A Campano sandwich, please.'),reply('E per l’altra persona?','And for the other person?','Un Sangiovese, grazie.','A Sangiovese, thank you.'),reply('Uno o due?','One or two?','Due panini Bonarda, per favore.','Two Bonarda sandwiches, please.'),reply('Lo vuole con la rucola?','Would you like it with rocket?','Senza rucola, grazie.','Without rocket, thank you.'),reply('Da portare via?','To take away?','Sì, da portare via, grazie.','Yes, to take away, thank you.')],
      tip:'The sandwich names stay the same in the plural: un panino Campano, due panini Campano. Ask what drinks are available.'
    },
    {
      id:'menu-200gradi',label:'200Gradi · meat & seafood panini',title:'A panino at 200Gradi.',
      context:'Practise ordering the meat and seafood sandwiches featured by Rome’s tourism office.',
      menu:{venue:'200Gradi',address:'Piazza del Risorgimento 3, Roma',url:'https://www.turismoroma.it/it/accoglienza/200-gradi',locationSource:'https://www.duecentogradi.it/',sourceLabel:'Rome tourism menu examples',checked:'10 October 2026',items:[['Pietra','Finocchiona salami and pecorino sandwich'],['Gesù','Octopus and potato sandwich'],['Succo di frutta','Fruit juice'],['Birra artigianale','Craft beer']]},
      requests:[['Avete il panino Pietra oggi?','Do you have the Pietra sandwich today?'],['Che panini con carne avete?','What meat sandwiches do you have?'],['Qual è il mio numero?','What is my order number?'],['Posso pagare con la carta?','Can I pay by card?']],
      dialogue:[row('You','Buongiorno, avete il panino Pietra oggi?','Good morning, do you have the Pietra sandwich today?'),row('Staff','Sì. Quanti ne desidera?','Yes. How many would you like?'),row('You','Due, da portare via, per favore.','Two, to take away, please.'),row('Staff','Desidera anche da bere?','Would you also like a drink?'),row('You','Un succo di frutta, grazie.','A fruit juice, thank you.'),row('You','Qual è il mio numero?','What is my order number?')],
      drills:[reply('Cosa desidera?','What would you like?','Avete il panino Pietra oggi?','Do you have the Pietra sandwich today?'),reply('Quanti panini?','How many sandwiches?','Due panini Pietra, per favore.','Two Pietra sandwiches, please.'),reply('E per l’altra persona?','And for the other person?','Un panino Gesù, grazie.','A Gesù sandwich, thank you.'),reply('Desidera da bere?','Would you like a drink?','Un succo di frutta, per favore.','A fruit juice, please.'),reply('Qui o da portare via?','For here or to take away?','Da portare via, grazie.','To take away, thank you.')],
      tip:'These named sandwiches are published examples from Rome’s tourism office. Ask whether they are on today’s menu. Keep your order number until collection.'
    }
  ];
  venues.forEach(s=>D.scenarios.push(s));

  const cream=food('cream','Custard cornetto','un cornetto alla crema','due cornetti alla crema','a custard-filled pastry','two custard-filled pastries');
  const apricot=food('apricot','Apricot cornetto','un cornetto all’albicocca','due cornetti all’albicocca','an apricot-filled pastry','two apricot-filled pastries');
  const tiramisu=food('tiramisu','Tiramisù','un tiramisù','due tiramisù','a tiramisu','two tiramisus');
  const sandwich=(id,name)=>food(id,name+' panino','un panino '+name,'due panini '+name,'a '+name+' sandwich','two '+name+' sandwiches');
  const builders={
    'menu-gianfornaio':{foods:[cream,apricot],drinks:coffee},
    'menu-archetto':{foods:[food('margherita','Margherita pizza','una pizza margherita','due pizze margherita','a margherita pizza','two margherita pizzas'),food('bufalina','Bufalina pizza','una pizza bufalina','due pizze bufalina','a buffalo mozzarella pizza','two buffalo mozzarella pizzas'),food('suppli','Supplì','un supplì','due supplì','a rice croquette','two rice croquettes'),tiramisu],drinks:water},
    'menu-zanzara':{foods:[food('cacio','Rigatoni cacio e pepe','una porzione di rigatoni cacio e pepe','due porzioni di rigatoni cacio e pepe','a portion of cacio e pepe rigatoni','two portions of cacio e pepe rigatoni'),food('carbonara','Rigatoni alla carbonara','una porzione di rigatoni alla carbonara','due porzioni di rigatoni alla carbonara','a portion of carbonara rigatoni','two portions of carbonara rigatoni'),food('bufala','Mozzarella di bufala','una mozzarella di bufala','due mozzarelle di bufala','a buffalo mozzarella','two buffalo mozzarellas'),tiramisu],drinks:water},
    'menu-sciascia':{foods:[food('maritozzo','Maritozzo with whipped cream','un maritozzo con panna','due maritozzi con panna','a cream-filled bun','two cream-filled buns'),food('toast','Ham-and-cheese toast','un toast prosciutto e formaggio','due toast prosciutto e formaggio','a ham-and-cheese toast','two ham-and-cheese toasts')],drinks:[...coffee.slice(0,-1),['un cappuccino con cioccolato','a chocolate cappuccino'],['due cappuccini con cioccolato','two chocolate cappuccinos'],['','No drink']]},
    'menu-paninodivino':{foods:[sandwich('sangiovese','Sangiovese'),sandwich('bonarda','Bonarda'),sandwich('campano','Campano'),sandwich('cesanese','Cesanese')],drinks:water},
    'menu-200gradi':{foods:[sandwich('pietra','Pietra'),sandwich('gesu','Gesù')],drinks:[['','No drink'],['un succo di frutta','a fruit juice'],['due succhi di frutta','two fruit juices'],['una birra artigianale','a craft beer'],['due birre artigianali','two craft beers']]}
  };
  D.scenarios.filter(s=>s.menu).forEach(s=>{
    s.requests??=s.fields?.find(f=>f.id==='request')?.options||[];
    if(s.id==='menu-gracchi'){
      s.builder={type:'gelato'};
      const flavours=s.menu.items.map(([it,en])=>[it.toLowerCase(),en.toLowerCase()]);
      s.fields=[
        {id:'serving',label:'Cup or cone',options:[['cup','Cup'],['cone','Cone']]},
        {id:'amount',label:'Quantity & size',options:[['1-small','One small'],['2-small','Two small'],['1-medium','One medium'],['2-medium','Two medium']]},
        {id:'flavour',label:'First flavour',options:flavours},
        {id:'second',label:'Second flavour',options:[['','Just one flavour'],...flavours]}
      ];
      return;
    }
    s.builder={type:'food',...builders[s.id]};
    s.fields=[
      {id:'food',label:'Food',options:[...s.builder.foods.map(f=>[f.id,f.label]),['','Just a drink']]},
      {id:'quantity',label:'Food quantity',options:[['1','One'],['2','Two']]},
      {id:'drink',label:'Drink request',options:s.builder.drinks},
      {id:'service',label:'Here or takeaway',options:[['','No preference'],['qui','For here'],['via','To take away']]}
    ];
  });

  window.ROME_MENU_ORDER=(s,v)=>{
    if(s.builder.type==='gelato'){
      const [number,size]=v.amount[0].split('-'),two=number==='2',cup=v.serving[0]==='cup';
      const itServe=cup?(two?'due coppette':'una coppetta'):(two?'due coni':'un cono');
      const itSize=size==='small'?(cup?(two?'piccole':'piccola'):(two?'piccoli':'piccolo')):(cup?(two?'medie':'media'):(two?'medi':'medio'));
      const enServe=`${two?'two':'a'} ${size} ${cup?'cup':'cone'}${two?'s':''}`;
      const second=v.second[0]&&v.second[0]!==v.flavour[0];
      const itFlavours=v.flavour[0]+(second?' e '+v.second[0]:'');
      const enFlavours=v.flavour[1]+(second?' and '+v.second[1]:'');
      return {it:`Vorrei ${itServe} ${itSize} con ${itFlavours}, per favore.`,en:`I’d like ${enServe} with ${enFlavours} gelato, please.`};
    }
    const selected=s.builder.foods.find(f=>f.id===v.food[0]),q=v.quantity[0]==='2'?1:0;
    const it=[],en=[];
    if(selected){it.push(selected.it[q]);en.push(selected.en[q]);}
    if(v.drink[0]){it.push(v.drink[0]);en.push(v.drink[1]);}
    if(!it.length)return {it:'Posso vedere il menù, per favore?',en:'Could I see the menu, please?'};
    const service=v.service[0],itService=service==='via'?', da portare via':service==='qui'?', da consumare qui':'';
    const enService=service==='via'?' to take away':service==='qui'?' for here':'';
    return {it:`Vorrei ${it.join(' e ')}${itService}, per favore.`,en:`I’d like ${en.join(' and ')}${enService}, please.`};
  };
})();

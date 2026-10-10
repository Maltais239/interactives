/* Published Prati menu items, with original Italian practice conversations. */
(() => {
  'use strict';
  const row=(who,it,en)=>({who,it,en});
  const reply=(question,questionEn,it,en)=>({question,questionEn,it,en});
  const venues=[
    {
      id:'menu-gianfornaio',label:'Gianfornaio · breakfast',title:'Breakfast at Gianfornaio.',
      context:'Order a coffee and a filled cornetto at the counter.',
      menu:{venue:'Il Gianfornaio · Prati',address:'Via dei Gracchi 179, Roma',url:'https://www.ilgianfornaio.com/prodotti',locationSource:'https://www.ilgianfornaio.com/contatti',sourceLabel:'Official food & coffee menu',checked:'9 October 2026',items:[['Cappuccino','Espresso with steamed milk'],['Espresso','A small espresso coffee'],['Cornetto alla crema','Pastry filled with custard'],['Cornetto all’albicocca','Pastry filled with apricot jam']]},
      options:[
        ['Un cappuccino e un cornetto alla crema, per favore.','A cappuccino and a custard-filled pastry, please.'],
        ['Un espresso e un cornetto all’albicocca, per favore.','An espresso and an apricot-filled pastry, please.'],
        ['Due cappuccini e due cornetti alla crema, per favore.','Two cappuccinos and two custard-filled pastries, please.'],
        ['Da portare via, per favore.','To take away, please.'],
        ['Quanto costa un cappuccino?','How much is a cappuccino?'],
        ['Posso pagare con la carta?','Can I pay by card?']
      ],
      dialogue:[row('Staff','Buongiorno, cosa prende?','Good morning, what would you like?'),row('You','Un cappuccino e un cornetto, per favore.','A cappuccino and a pastry, please.'),row('Staff','Il cornetto, alla crema o all’albicocca?','The pastry: custard or apricot?'),row('You','Alla crema, grazie.','Custard, thank you.'),row('Staff','Qui o da portare via?','For here or to take away?'),row('You','Qui, grazie. Posso pagare con la carta?','For here, thank you. Can I pay by card?')],
      drills:[reply('Buongiorno, cosa prende?','Good morning, what would you like?','Un cappuccino e un cornetto alla crema, per favore.','A cappuccino and a custard-filled pastry, please.'),reply('Come vuole il cornetto?','What filling would you like in your pastry?','All’albicocca, per favore.','Apricot, please.'),reply('Desidera anche un caffè?','Would you also like a coffee?','Sì, un espresso, grazie.','Yes, an espresso, thank you.'),reply('Qui o da portare via?','For here or to take away?','Da portare via, per favore.','To take away, please.'),reply('Come preferisce pagare?','How would you prefer to pay?','Con la carta, grazie.','By card, thank you.')],
      tip:'Cornetto alla crema means a pastry with custard. Ask “qui o da portare via?” to practise eating here or taking it away.'
    },
    {
      id:'menu-archetto',label:'L’Archetto · pizza',title:'Pizza at L’Archetto.',
      context:'Practise ordering pizza, a fried starter, water, and dessert.',
      menu:{venue:'L’Archetto',address:'Via Germanico 105, Roma',url:'https://www.larchetto.it/menu-al-tavolo/',locationSource:'https://www.larchetto.it/',sourceLabel:'Official dine-in menu',checked:'9 October 2026',items:[['Margherita','Tomato and mozzarella pizza'],['Marinara','Tomato, garlic and oregano pizza'],['Supplì','A fried rice croquette'],['Tiramisù','Coffee and mascarpone dessert']]},
      options:[
        ['Una margherita e un supplì, per favore.','A margherita pizza and a rice croquette, please.'],
        ['Una marinara, per favore.','A marinara pizza, please.'],
        ['Due margherite da portare via, per favore.','Two margherita pizzas to take away, please.'],
        ['Una bottiglia d’acqua frizzante, per favore.','A bottle of sparkling water, please.'],
        ['Un tiramisù da dividere, per favore.','One tiramisu to share, please.'],
        ['Il conto, per favore.','The bill, please.']
      ],
      dialogue:[row('Staff','Buonasera, avete prenotato?','Good evening, have you booked?'),row('You','No. Avete un tavolo per due?','No. Do you have a table for two?'),row('Staff','Che pizza desidera?','What pizza would you like?'),row('You','Una margherita e un supplì, per favore.','A margherita and a rice croquette, please.'),row('Staff','E da bere?','And to drink?'),row('You','Una bottiglia d’acqua frizzante, grazie.','A bottle of sparkling water, thank you.'),row('Staff','Desiderate un dolce?','Would you like a dessert?'),row('You','Un tiramisù da dividere, per favore.','One tiramisu to share, please.')],
      drills:[reply('Che pizza desidera?','What pizza would you like?','Una margherita, per favore.','A margherita pizza, please.'),reply('Desidera un antipasto?','Would you like a starter?','Un supplì, per favore.','A rice croquette, please.'),reply('E per l’altra persona?','And for the other person?','Una marinara, grazie.','A marinara pizza, thank you.'),reply('Naturale o frizzante?','Still or sparkling?','Frizzante, per favore.','Sparkling, please.'),reply('Desiderate un dolce?','Would you like a dessert?','Un tiramisù da dividere, grazie.','One tiramisu to share, thank you.')],
      tip:'The published dine-in menu lists fried starters for dinner and pasta for lunch. “Da dividere” means “to share”.'
    },
    {
      id:'menu-zanzara',label:'La Zanzara · lunch',title:'Lunch at La Zanzara.',
      context:'Order a Roman pasta dish, an appetizer, and something sweet.',
      menu:{venue:'La Zanzara',address:'Via Crescenzio 84, Roma',url:'https://www.lazanzararoma.com/menu_off/',locationSource:'https://www.lazanzararoma.com/menu_off/',sourceLabel:'Official lunch & dessert menus',checked:'9 October 2026',items:[['Rigatoni cacio e pepe','Pasta with pecorino cheese and black pepper'],['Rigatoni alla carbonara','Pasta with egg, cured pork and cheese'],['Mozzarella di bufala','Buffalo-milk mozzarella'],['Tiramisù','Coffee and mascarpone dessert']]},
      options:[
        ['Avete un tavolo per due?','Do you have a table for two?'],
        ['I rigatoni cacio e pepe, per favore.','The cacio e pepe rigatoni, please.'],
        ['I rigatoni alla carbonara, per favore.','The carbonara rigatoni, please.'],
        ['Una mozzarella di bufala, per favore.','A buffalo mozzarella, please.'],
        ['Un tiramisù, per favore.','A tiramisu, please.'],
        ['Possiamo avere il conto, per favore?','Could we have the bill, please?']
      ],
      dialogue:[row('Staff','Buongiorno, siete in due?','Good afternoon, are there two of you?'),row('You','Sì. Avete un tavolo libero?','Yes. Do you have a free table?'),row('Staff','Cosa desiderate come primo?','What would you like as your pasta course?'),row('You','I rigatoni cacio e pepe per me, grazie.','The cacio e pepe rigatoni for me, thank you.'),row('Staff','E per l’altra persona?','And for the other person?'),row('You','I rigatoni alla carbonara, per favore.','The carbonara rigatoni, please.'),row('Staff','Desiderate un dolce?','Would you like a dessert?'),row('You','Un tiramisù e due cucchiaini, grazie.','A tiramisu and two teaspoons, thank you.')],
      drills:[reply('Siete in due?','Are there two of you?','Sì, un tavolo per due, per favore.','Yes, a table for two, please.'),reply('Cosa desidera come primo?','What would you like as your pasta course?','I rigatoni cacio e pepe, per favore.','The cacio e pepe rigatoni, please.'),reply('E per l’altra persona?','And for the other person?','I rigatoni alla carbonara, grazie.','The carbonara rigatoni, thank you.'),reply('Desidera un antipasto?','Would you like an appetizer?','Una mozzarella di bufala, per favore.','A buffalo mozzarella, please.'),reply('Desiderate un dolce?','Would you like a dessert?','Un tiramisù e due cucchiaini, grazie.','A tiramisu and two teaspoons, thank you.')],
      tip:'Un primo is the first main course, often pasta. “Per me” means “for me”; “due cucchiaini” asks for two teaspoons.'
    },
    {
      id:'menu-gracchi',label:'Gracchi · gelato',title:'Gelato at Gracchi.',
      context:'Choose a cup, name two flavours, and order a second gelato.',
      menu:{venue:'Gelateria dei Gracchi',address:'Via dei Gracchi 272, Roma',url:'https://gelateriadeigracchi.it/gusti/',locationSource:'https://gelateriadeigracchi.it/contatti/',sourceLabel:'Official flavour list',checked:'9 October 2026',items:[['Pistacchio di Bronte','Bronte pistachio'],['Cioccolato fondente','Dark chocolate'],['Limone','Lemon'],['Nocciola','Hazelnut']]},
      options:[
        ['Una coppetta con pistacchio di Bronte e cioccolato fondente, per favore.','A cup with Bronte pistachio and dark chocolate, please.'],
        ['Una coppetta al limone, per favore.','A cup of lemon gelato, please.'],
        ['Una coppetta alla nocciola, per favore.','A cup of hazelnut gelato, please.'],
        ['Avete il pistacchio oggi?','Do you have pistachio today?'],
        ['Una coppetta piccola per lei, per favore.','A small cup for her, please.'],
        ['Quanto costa una coppetta piccola?','How much is a small cup?']
      ],
      dialogue:[row('Staff','Buonasera! Cono o coppetta?','Good evening! Cone or cup?'),row('You','Una coppetta, per favore.','A cup, please.'),row('Staff','Che gusti desidera?','What flavours would you like?'),row('You','Pistacchio di Bronte e cioccolato fondente, grazie.','Bronte pistachio and dark chocolate, thank you.'),row('Staff','Altro?','Anything else?'),row('You','Una coppetta piccola al limone per lei, per favore.','A small cup of lemon gelato for her, please.')],
      drills:[reply('Cono o coppetta?','Cone or cup?','Una coppetta, per favore.','A cup, please.'),reply('Che gusti desidera?','What flavours would you like?','Pistacchio di Bronte e cioccolato fondente, grazie.','Bronte pistachio and dark chocolate, thank you.'),reply('Vuole un altro gusto?','Would you like another flavour?','Nocciola, per favore.','Hazelnut, please.'),reply('Desidera un gusto alla frutta?','Would you like a fruit flavour?','Limone, grazie.','Lemon, thank you.'),reply('Altro?','Anything else?','Una coppetta piccola al limone per lei, per favore.','A small cup of lemon gelato for her, please.')],
      tip:'Gusti means flavours. Coppetta is a cup. Ask which flavours are available today before you choose.'
    }
  ];
  venues.forEach(v=>{
    v.fields=[{id:'request',label:'Choose your order or request',options:v.options}];
    delete v.options;
    window.ROME.scenarios.push(v);
  });
})();

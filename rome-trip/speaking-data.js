/* Travel Italian for listening, speaking aloud, and practising replies. */
(() => {
  const D=window.ROME;
  const row=(who,it,en)=>({who,it,en});
  const scenario=(id,label,title,context,options,dialogue,tip)=>({id,label,title,context,fields:[{id:'request',label:'What would you like to say?',options}],dialogue,tip});
  D.scenarios.push(
    scenario('stay','Checking in','Arrive and settle in','Practise the first conversation at your accommodation.',[
      ['Buongiorno, ho una prenotazione a nome Marco.','Good morning, I have a reservation under the name Marco.'],
      ['A che ora posso fare il check-in?','What time can I check in?'],
      ['Posso lasciare qui i bagagli?','Can I leave my luggage here?'],
      ['Qual è la password del Wi-Fi?','What is the Wi-Fi password?']
    ],[row('Host','A che nome è la prenotazione?','What name is the reservation under?'),row('You','A nome Marco.','Under the name Marco.'),row('Host','Ecco le chiavi.','Here are the keys.')],'A nome… means “under the name…” Keep your booking open while you ask.'),
    scenario('visit','Sightseeing','At the museum entrance','Ask about tickets, entrances, and what you can do inside.',[
      ['Ho già un biglietto. Dov’è l’ingresso?','I already have a ticket. Where is the entrance?'],
      ['Vorrei due biglietti, per favore.','I’d like two tickets, please.'],
      ['A che ora chiudete?','What time do you close?'],
      ['È permesso fare fotografie?','Is photography allowed?']
    ],[row('Staff','Ha una prenotazione?','Do you have a reservation?'),row('You','Sì, ecco il biglietto.','Yes, here is the ticket.'),row('Staff','L’ingresso è a destra.','The entrance is on the right.')],'Biglietto is a ticket; biglietti is plural. Chiedere—asking—is useful even when you already have a booking.'),
    scenario('metro','Metro & bus','Make the next connection','Practise asking about tickets and stops.',[
      ['Dove posso comprare un biglietto?','Where can I buy a ticket?'],
      ['Questo autobus va in centro?','Does this bus go to the city centre?'],
      ['Dove devo scendere?','Where should I get off?'],
      ['Come arrivo alla stazione Termini?','How do I get to Termini station?']
    ],[row('Someone helping','Deve cambiare alla prossima fermata.','You need to change at the next stop.'),row('You','Alla prossima fermata?','At the next stop?'),row('You','Grazie per l’aiuto.','Thank you for your help.')],'Fermata is a stop. Scendere means to get off; cambiare means to change.'),
    scenario('shop','Shopping','Ask before you buy','Practise prices, sizes, and payment.',[
      ['Quanto costa questo?','How much does this cost?'],
      ['Posso provarlo?','Can I try it on?'],
      ['Avete una taglia più grande?','Do you have a larger size?'],
      ['Posso pagare con la carta?','Can I pay by card?']
    ],[row('Shop assistant','Che taglia porta?','What size do you wear?'),row('You','Di solito porto una media.','I usually wear a medium.'),row('Shop assistant','Vuole una borsa?','Would you like a bag?')],'Questo is “this.” Pointing at the item makes a short question work well.'),
    scenario('pharmacy','Pharmacy','Explain what you need','Practise simple words for asking a pharmacist for help.',[
      ['Buongiorno, ho bisogno di aiuto.','Good morning, I need help.'],
      ['Ho mal di testa.','I have a headache.'],
      ['Ho mal di gola.','I have a sore throat.'],
      ['Può scriverlo, per favore?','Could you write it down, please?']
    ],[row('Pharmacist','Mi dica.','How can I help?'),row('You','Ho mal di gola.','I have a sore throat.'),row('You','Può parlare più lentamente?','Could you speak more slowly?')],'Ho means “I have.” You can point to a written phrase if the conversation gets difficult.'),
    scenario('food-needs','Food needs','Ask what’s in it','Practise explaining food preferences and checking ingredients.',[
      ['Questo piatto contiene carne?','Does this dish contain meat?'],
      ['Avete piatti vegetariani?','Do you have vegetarian dishes?'],
      ['Questo piatto contiene latte?','Does this dish contain milk?'],
      ['Senza formaggio, per favore.','Without cheese, please.']
    ],[row('Server','Ha qualche allergia?','Do you have any allergies?'),row('You','Può controllare gli ingredienti?','Could you check the ingredients?'),row('Server','Chiedo in cucina.','I’ll ask in the kitchen.')],'Contiene means “contains”; senza means “without.” Practise stating your own needs clearly.'),
    scenario('taxi','Getting home','Tell the driver where to go','Practise an address and a simple request.',[
      ['Vorrei andare a Piazza Navona.','I’d like to go to Piazza Navona.'],
      ['Può portarmi alla stazione, per favore?','Could you take me to the station, please?'],
      ['Posso pagare con la carta?','Can I pay by card?'],
      ['Può fermarsi qui, per favore?','Could you stop here, please?']
    ],[row('Driver','Dove vuole andare?','Where would you like to go?'),row('You','A Piazza Navona.','To Piazza Navona.'),row('Driver','Va bene.','All right.')],'Show the destination on your map as well as saying it.')
  );
  D.scenarios.find(s=>s.id==='cafe').fields[0].options.push(['un caffè decaffeinato','a decaf espresso'],['un tè','a tea'],['un succo d’arancia','an orange juice']);
  D.scenarios.find(s=>s.id==='gelato').fields[1].options.push(['alla fragola','strawberry'],['al limone','lemon'],['alla nocciola','hazelnut']);
  D.scenarios.find(s=>s.id==='meal').fields[0].options.push(['una cacio e pepe','a cacio e pepe'],['un’insalata','a salad']);
  D.scenarios.find(s=>s.id==='train').fields[0].options.push(['Tivoli','Tivoli'],['Pisa','Pisa'],['Caserta','Caserta']);
  D.scenarios.find(s=>s.id==='help').fields[0].options.push(['la farmacia','the pharmacy'],['la fermata dell’autobus','the bus stop'],['la biglietteria','the ticket office'],['Piazza Navona','Piazza Navona']);
  const reply=(question,questionEn,it,en)=>({question,questionEn,it,en});
  const drills={
    cafe:[
      reply('Buongiorno! Mi dica.','Good morning! What would you like?','Vorrei un cappuccino, per favore.','I’d like a cappuccino, please.'),
      reply('Al banco o al tavolo?','At the counter or at a table?','Al banco, grazie.','At the counter, thank you.'),
      reply('Vuole anche un cornetto?','Would you also like a croissant?','Sì, un cornetto, per favore.','Yes, a croissant, please.'),
      reply('Desidera altro?','Would you like anything else?','No, grazie. Quanto costa?','No, thank you. How much does it cost?'),
      reply('Come vuole pagare?','How would you like to pay?','Posso pagare con la carta?','Can I pay by card?')
    ],
    gelato:[
      reply('Cono o coppetta?','Cone or cup?','Una coppetta, per favore.','A small cup, please.'),
      reply('Quali gusti?','Which flavours?','Pistacchio e cioccolato, per favore.','Pistachio and chocolate, please.'),
      reply('Quanti gusti?','How many flavours?','Due gusti, grazie.','Two flavours, thank you.'),
      reply('Desidera altro?','Would you like anything else?','Una bottiglia d’acqua, per favore.','A bottle of water, please.'),
      reply('Tutto a posto?','Is everything all right?','Sì, è buonissimo. Grazie!','Yes, it’s delicious. Thank you!')
    ],
    meal:[
      reply('Avete una prenotazione?','Do you have a reservation?','No. Avete un tavolo per quattro?','No. Do you have a table for four?'),
      reply('Cosa prende?','What will you have?','Vorrei una carbonara, per favore.','I’d like a carbonara, please.'),
      reply('Naturale o frizzante?','Still or sparkling?','Acqua naturale, grazie.','Still water, thank you.'),
      reply('Vuole un dolce?','Would you like a dessert?','No, grazie. Il conto, per favore.','No, thank you. The bill, please.'),
      reply('Tutto bene?','Is everything all right?','Sì, grazie. Era molto buono.','Yes, thank you. It was very good.')
    ],
    train:[
      reply('Dove deve andare?','Where do you need to go?','Devo andare a Firenze.','I need to go to Florence.'),
      reply('Ha il biglietto?','Do you have your ticket?','Sì, ecco il mio biglietto.','Yes, here is my ticket.'),
      reply('Il treno parte dal binario otto.','The train leaves from platform eight.','Può ripetere il numero, per favore?','Could you repeat the number, please?'),
      reply('Mi dica.','How can I help?','Questo treno va a Napoli?','Does this train go to Naples?'),
      reply('Ha bisogno di aiuto?','Do you need help?','Sì. Dov’è il binario cinque?','Yes. Where is platform five?')
    ],
    help:[
      reply('Cerca qualcosa?','Are you looking for something?','Scusi, dov’è il bagno?','Excuse me, where is the toilet?'),
      reply('Sempre dritto, poi a destra.','Straight ahead, then right.','Può indicarmelo sulla mappa?','Could you show me on the map?'),
      reply('Ha capito?','Did you understand?','Non capisco. Può ripetere lentamente?','I don’t understand. Could you repeat slowly?'),
      reply('È vicino alla stazione.','It is near the station.','Quanto tempo ci vuole a piedi?','How long does it take on foot?'),
      reply('Parla italiano?','Do you speak Italian?','Un po’. Sto imparando.','A little. I’m learning.')
    ],
    stay:[
      reply('A che nome è la prenotazione?','What name is the reservation under?','A nome Marco.','Under the name Marco.'),
      reply('La camera non è ancora pronta.','The room isn’t ready yet.','Posso lasciare qui i bagagli?','Can I leave my luggage here?'),
      reply('Ecco le chiavi.','Here are the keys.','Grazie. A che ora devo lasciare la camera?','Thank you. What time do I need to leave the room?'),
      reply('Ha altre domande?','Do you have any other questions?','Qual è la password del Wi-Fi?','What is the Wi-Fi password?'),
      reply('Tutto bene con la camera?','Is everything all right with the room?','La chiave non funziona. Può aiutarmi?','The key doesn’t work. Can you help me?')
    ],
    visit:[
      reply('Ha una prenotazione?','Do you have a reservation?','Sì, ecco il biglietto.','Yes, here is the ticket.'),
      reply('Per quante persone?','For how many people?','Per due persone, grazie.','For two people, thank you.'),
      reply('Ha già il biglietto?','Do you already have a ticket?','Sì. Dov’è l’ingresso?','Yes. Where is the entrance?'),
      reply('Ha altre domande?','Do you have any other questions?','È permesso fare fotografie?','Is photography allowed?'),
      reply('Desidera un’audioguida?','Would you like an audio guide?','Sì. Avete un’audioguida in inglese?','Yes. Do you have an audio guide in English?')
    ],
    metro:[
      reply('Dove vuole andare?','Where would you like to go?','Devo andare alla stazione Termini.','I need to go to Termini station.'),
      reply('Mi dica.','How can I help?','Dove posso comprare un biglietto?','Where can I buy a ticket?'),
      reply('Questo autobus va in centro.','This bus goes to the city centre.','Dove devo scendere?','Where should I get off?'),
      reply('Deve cambiare alla prossima fermata.','You need to change at the next stop.','Alla prossima fermata?','At the next stop?'),
      reply('Ha capito?','Did you understand?','Sì, grazie per l’aiuto.','Yes, thank you for your help.')
    ],
    shop:[
      reply('Posso aiutarla?','Can I help you?','Quanto costa questo?','How much does this cost?'),
      reply('Che taglia cerca?','What size are you looking for?','Una media, per favore.','A medium, please.'),
      reply('Come va la taglia?','How does the size fit?','Avete una taglia più grande?','Do you have a larger size?'),
      reply('Vuole una borsa?','Would you like a bag?','No, grazie. Ho una borsa.','No, thank you. I have a bag.'),
      reply('Desidera altro?','Would you like anything else?','No, grazie. Posso pagare con la carta?','No, thank you. Can I pay by card?')
    ],
    pharmacy:[
      reply('Buongiorno, mi dica.','Good morning, how can I help?','Ho mal di testa.','I have a headache.'),
      reply('Come si sente?','How do you feel?','Non mi sento bene.','I don’t feel well.'),
      reply('Ha capito?','Did you understand?','Può scriverlo, per favore?','Could you write it down, please?'),
      reply('Ha altre domande?','Do you have any other questions?','Può parlare più lentamente?','Could you speak more slowly?'),
      reply('Ha bisogno di altro?','Do you need anything else?','Sì. Cerco dei cerotti.','Yes. I’m looking for some adhesive bandages.')
    ],
    'food-needs':[
      reply('Cosa desidera?','What would you like?','Avete piatti vegetariani?','Do you have vegetarian dishes?'),
      reply('Ha una domanda sul piatto?','Do you have a question about the dish?','Questo piatto contiene carne?','Does this dish contain meat?'),
      reply('Vuole del formaggio?','Would you like some cheese?','Senza formaggio, per favore.','Without cheese, please.'),
      reply('Posso aiutarla?','Can I help you?','Questo piatto contiene latte?','Does this dish contain milk?'),
      reply('Non sono sicuro.','I’m not sure.','Può controllare gli ingredienti?','Could you check the ingredients?')
    ],
    taxi:[
      reply('Dove vuole andare?','Where would you like to go?','A Piazza Navona.','To Piazza Navona.'),
      reply('A quale stazione?','To which station?','Alla stazione Termini, per favore.','To Termini station, please.'),
      reply('Ha l’indirizzo?','Do you have the address?','Sì, ecco l’indirizzo.','Yes, here is the address.'),
      reply('Qui va bene?','Is here all right?','Sì, può fermarsi qui. Grazie.','Yes, you can stop here. Thank you.'),
      reply('Come vuole pagare?','How would you like to pay?','Posso pagare con la carta?','Can I pay by card?')
    ]
  };
  D.scenarios.forEach(s=>s.drills=drills[s.id]);
  D.phrases.push(
    ['Può parlare più lentamente?','Could you speak more slowly?'],
    ['Può scriverlo, per favore?','Could you write it down, please?'],
    ['Dov’è la farmacia?','Where is the pharmacy?'],
    ['Dove posso comprare un biglietto?','Where can I buy a ticket?'],
    ['A che ora chiudete?','What time do you close?'],
    ['Posso lasciare qui i bagagli?','Can I leave my luggage here?'],
    ['Qual è la password del Wi-Fi?','What is the Wi-Fi password?'],
    ['Avete piatti vegetariani?','Do you have vegetarian dishes?'],
    ['Può controllare gli ingredienti?','Could you check the ingredients?'],
    ['Quanto tempo ci vuole a piedi?','How long does it take on foot?'],
    ['È permesso fare fotografie?','Is photography allowed?'],
    ['Grazie per l’aiuto.','Thank you for your help.']
  );
})();

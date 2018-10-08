// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';
 
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
const req = require('request-promise-native');
const baseUrl = "http://dbt.io/text/verse?key=e156ea7b4b70b7ffe7b7ca483715b3dc&callback=json&v=2"
 
process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
  

  function getWelcome() {
    agent.add(`<speak>Bienvenue dans la Bible.' <break time="500ms"/> </speak>`);
    agent.add(`<speak>David<break time="500ms"/>, je me réjouis que tu t'intéresses à la Bible. <break time="1000ms"/>Puis-je te lire le verset du jour ?</speak> `);
  }
  
  function getVdJOui() {
    agent.add(`<speak>
<p>Romains chapitre 10 verset 17 <break time="1000ms"/> Ainsi la foi vient de ce qu'on entend, et ce qu'on entend vient de la parole de Christ.<break time="2000ms"/></p>
<p>A part ça, comment te sens-tu aujourd'hui ?<break time="500ms"/></p>
<p>Plutôt promenade bucolique ou course de camion ?</p></speak> `);
  }
  
   function getVdJNon() {
    agent.add(`<speak>Pas de problème. Je reste disponible pour t'envourager à travers la Bible.</speak>`);
  }
  
  function getPromenadeBucolique() {
    agent.add(`<speak>D'accord. Te sens-tu plutôt paisible, dans l'harmonie ou joyeux ?</speak>`);
  }
  
  function getCourseCamion() {
    agent.add(`<speak>D'accord. Te sens-tu plutôt submergé, gagnant ou dépassé ?</speak>`);
  }
  
  function getPaisible() {
    agent.add(`<speak>La Bible dit dans le Psaume 119 au verset 165<break time="1000ms"/> Il y a beaucoup de paix pour ceux qui aiment ta loi, Et il ne leur arrive aucun malheur.</speak>`);
  }
  
  function getDepasse() {
    agent.add(`<speak>La Bible dit dans le livre de Josué au chapitre 1 verset 9 <break time="1000ms"/> N'oublie pas que je t'ai recommandé d'être courageux et fort. Ne tremble pas, ne te laisse pas abattre, car moi, le Seigneur ton Dieu, je serai avec toi</speak>`); 
  }
  
  
 
  function fallback(agent) {
    agent.add(`Je ne comprends pas qui est tu ?`);
    agent.add(`Je suis désolé, voulez-vous réessayer ?`);
  }

  function updateAgent(text) {
    agent.add(`<speak>`+text+`</speak>`);
  }
  
  function getVerseContent(book, chapter_number, verse_number) {
    let apiDamnId = 'FRNTLSN2ET';
    let url = baseUrl+"&dam_id="+apiDamnId;
    
    //const parameter = request.body.queryResult.parameters;
    
    agent.add(`<speak>Ne bouge pas, je me connecte<break time="1000ms"/></speak>`);
    
    return req({
      method: 'GET',
      uri: url,
      json: true
    })
    .then((body) => {
      var data = JSON.parse(JSON.stringify(body));
      console.log('======> '+book+' / '+chapter_number+' / '+verse_number);
      
      data.forEach(function(element) {
        if(element['book_name'] == book) {
          if(element['chapter_id'] == chapter_number) {
            if(element['verse_id'] == verse_number) {
              updateAgent(element['verse_text']);
            }
          }
        }
      });
      console.log('<======');
      return Promise.resolve(agent);
    })
    .catch((errors) => {
      console.log(errors);
    });
  }
  
  function triggerActionStart(agentTrigger, intentName, action) {
      agentTrigger.handleRequest(action);
      let intentMap = new Map();
      //intentMap.set('livre souhaite', welcome);
      //agentTrigger.add(`Bienvenu dans la Bible`);
     
      return agentTrigger;
  }
  
  function beginProcess() {
      return agent;
  }

   //triggerActionStart(agent, "livre souhaite", () => beginProcess());
   const intentName = request.body.queryResult.intent.displayName;
  
    switch (intentName) {
    case 'Default Welcome Intent':
      triggerActionStart(agent, intentName, getWelcome);
      break;
    case 'Verset du jour - Oui':
      triggerActionStart(agent, intentName, getVdJOui);
      break;
    case 'Verset du jour - Oui - Promenade bucolique':
      triggerActionStart(agent, intentName, getPromenadeBucolique);
      break;
    case 'Verset du jour - Oui - Course de camion':
      triggerActionStart(agent, intentName, getCourseCamion);
      break; 
    case 'Verset du jour - Oui - Promenade bucolique - Paisible' :
      triggerActionStart(agent, intentName, getPaisible);
      break;        
    case 'Verset du jour - Oui - Course de camion - Dépassé' :
      triggerActionStart(agent, intentName, getDepasse);
      break;
    case 'Verset du jour - Non' :
      triggerActionStart(agent, intentName, getVdJNon);
      break;
    case 'lis moi un verset' :
      triggerActionStart(agent, intentName, () => getVerseContent('Matthieu', '16', '16'));
      break;
    case 'Default Fallback Intent - no':
   //   triggerActionStart(agent, intentName, getDefaultReponseNo);
      break;
    case 'Default Fallback Intent - yes':
  //    triggerActionStart(agent, intentName, getAllTickets);
      break;
    default:
    //  triggerActionStart(agent, intentName, getDefaultReponse);
             break;
  }
});

/*  function getVerses(agentTrigger, bookId, chapterId) {
      let key = 'e156ea7b4b70b7ffe7b7ca483715b3dc';
      let apiVersion = '2';
      let apiReply = 'json';
      let apiDamnId = 'FRNTLSN2ET';

      let url = baseUrl+`&dam_id=`+apiDamnId;
      
      agentTrigger.add(url);
      
      req({
          method: 'GET',
          uri: url,
          json: true
        })
      .then(() => {
        agentTrigger.add('N\'hésitez pas à m\'interroger à nouveau, ce sera un plaisir pour moi de vous renseigner.');
        return Promise.resolve(agentTrigger);
      });
      return agentTrigger;
  }
  */

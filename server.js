var request = require('request');
var async = require('async');
var express = require('express');
var uuid = require('uuid');
const http = require("http");
const structuredData = require('./test');

var fs = require('fs');
const settings = require("./settings");
const HashMap = require('hashmap');

//Global variables and initialization
var map_node = new HashMap();
var relations_types=[]
// Hashmap containt array of nodes for eatch relation
var relation_node_couple = new Map();
//Initialization
for(let i=0; i<=156; i++){
  relation_node_couple.set(i, [])
  
}

function strMapToObj(strMap) {
  let obj = Object.create(null);
  for (let [k,v] of strMap) {
    // We don’t escape the key '__proto__'
    // which can cause problems on older engines
    obj[k] = v;
  }
  return obj;
}


var app=express();

 function makeCall(url, word) {
  return new Promise((resolve, reject) => {
      http.get(url,function (res) {
          res.setEncoding("binary");
          let data = '';
 
          // A chunk of data has been recieved.
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('end', ()=> {
     
              var content = data;
          
                  var src_code = content.substring(
                      content.lastIndexOf("<CODE>") , 
                      content.lastIndexOf("</CODE>")
                  );
          
                  let defs = src_code.substring( 
                          src_code.lastIndexOf("<def>") + 5, 
                          src_code.lastIndexOf("</def>")
                      );
                 
                   defs =defs.replace(/<[^>]*>/g, '');
                   defs =defs.replace('\ \n', '');
                   
                   const words = defs.split(/\d+/g);
                   //words.splice(0, 1); 
                   for( var i = 0; i < words.length; i++){ 
                                   
                    if ( words[i].length < 2) { 
                      words.splice(i, 1); 
                        i--; 
                    }
                }
                   //words =words.replace(/([0-9]+)/g,'');
                   let status;
                   if(defs.length == 1){
                    // no data for this word 
                    status = 404
                   }
                   else{
                     status =200
                   }
                   // Relations and rafinement
                   let nodes=  src_code.substring(
                    src_code.lastIndexOf("// les noeuds/termes (Entries) : e;eid;'name';type;w;'formated name' "),
                    src_code.lastIndexOf("// les types de relations (Relation Types) : rt;rtid;'trname';'trgpname';'rthelp'")

                 );
                 let nodes_splited= nodes.split('\n');
                 let semantic_refinements = new Array();
                 
                 nodes_splited.forEach(
                     element => {
                       let element_splited =  element.split(';')
                       if(element_splited.length == 6){
                        //e;213467;'chat>234460';1;86;'chat>communication textuelle'
                        const regex = word+'>[A-Za-zÀ-ÖØ-öø-ÿ- ]*\'$';
                        //const myRegexpRelSor=  new RegExp('+'>'+'[A-Za-zÀ-ÖØ-öø-ÿ-]*.*\'$','mg');
                           //
                           if(element_splited[5].match(regex) != null  ){
                            let word_matched=element_splited[5].match(regex)[0].split('>');
                            //console.log(element_splited[5].match(regex)[0]);
                            semantic_refinements.push(word_matched[1]);

                           }
                       }
                       map_node.set(element_splited[1], element_splited[2] );
                     }
                     );

                 let outgoing_relationships = src_code.substring(
                    src_code.lastIndexOf("// les relations sortantes : r;rid;node1;node2;type;w "),
                    src_code.lastIndexOf("// END")

                 );
                 let outgoing_relationships_splited = outgoing_relationships.split('\n');
                 let outgoing_relationships_array = new Array();
                 
                 outgoing_relationships_splited.forEach(
                    element => {
                      let element_splited =  element.split(';')
                      let current_id
                      if(element_splited.length == 6  && (element_splited[4] <= 156 )){
                         current_id=Number(element_splited[4])
                        relation_node_couple.get(current_id).push(map_node.get(element_splited[3]));
                      }
                      
                      if( (!relations_types.includes( element_splited[4]) ) && (element_splited[4] <= 156 ) ){
                        relations_types.push(element_splited[4])  
                      }
                    }
                    );
                   // Relations and rafinement
                   
                   let obj= strMapToObj(relation_node_couple)
                   infos = {
                     'status': status,
                    'defs': words, 
                    'ramifications':semantic_refinements,
                    'relations_types': relations_types, 
                    'relation_node_couple': obj        
                  }
                  //save before to send
                  fs = require('fs');
                    fs.writeFile('./cache/'+word+'.json', JSON.stringify(infos),function (err) {
                        if (err) return console.log(err);
                        console.log('Data saved');
                      });
                   resolve(infos);

                  
              })

          res.on('error', function (e) {
              reject(e)
          });
      });
  })

}




var invokeAndProcessAPIResponse =function getData(callback,word){
  console.log("word in getData:" + word);
  url = 'http://www.jeuxdemots.org/rezo-dump.php?gotermsubmit=Chercher&gotermrel='+word+'&rel=';
  console.log("url:" + url);
  makeCall(url,word)
 .then(function(results){
  callback(null,  results);
 })
 .catch(console.log)
 
 }

 function isInCache(word){
  const path = './cache/'+word+'.json'
  try {
      if (fs.existsSync(path)) {
          return true
      }
    } catch(err) {
      console.error(err)
      return false
    }
}


function readMyFile (path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path,'utf8',(err, data)=>{
      if (err) {
          reject(err); // in the case of error, control flow goes to the catch block with the error occured.
      }
      else{
        
          resolve(JSON.parse(data));  // in the case of success, control flow goes to the then block with the content of the file.
          //console.log("Resolve" + data)
        }
  });
  })

}



 app.get('/getData', function(req, res){
  var word= req.query['word']
  const path = './cache/'+word+'.json'
  //
if(isInCache(word)){
console.log("From cache")

readMyFile(path)
.then(function(results){
    //console.log( "data \n \n \n"+results);
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.status(200).json(results);
    
})
.catch(console.log)
      
}

  else{
    invokeAndProcessAPIResponse(function(err, result){
      if(err){
        res.send(500, { error: 'something blew up' });
      } else {
         // Website you wish to allow to connect
      res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
  
      // Request methods you wish to allow
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  
      // Request headers you wish to allow
      res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  
      // Set to true if you need the website to include cookies in the requests sent
      // to the API (e.g. in case you use sessions)
      res.setHeader('Access-Control-Allow-Credentials', true);
        res.status(200).json(result);
        
      }
    }, word);
  }
  
  

});




// Envoie
app.get('/', (req,res,next)=>{
    var m= req.params.mot; // get email 
    // var uid = uuid.v4();
    for (const key in req.query) {
      console.log(key, req.query[key])
    }
   
    res.status(200).json("m");
   
  })
    
  //
  

  
  
 
  
  // Démarre le serveur à l'adresse 127.0.0.1 sur le port 8000
  // Affiche un message dès que le serveur commence à écouter les requêtes
  // Start the server on port 3000
  app.listen(3000, ()=>{   
    console.log('Restful running on port 3000');
    var now = new Date();
  
  var annee   = now.getFullYear();
  var mois    = now.getMonth()+1;
  var jour    = ('0'+now.getDate()   ).slice(-2);
  var heure   = ('0'+now.getHours()  ).slice(-2);
  var minute  = ('0'+now.getMinutes()).slice(-2);
  var seconde = ('0'+now.getSeconds()).slice(-2);
  
  
  var DatesInscription =jour+"/"+mois+"/"+annee+" à "+heure+":"+minute+":"+seconde;
  console.log(DatesInscription);
  });
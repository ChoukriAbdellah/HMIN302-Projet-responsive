var request = require('request');
var async = require('async');
var express = require('express');
var uuid = require('uuid');
const http = require("http");
const structuredData = require('./test');

var app=express();

 function makeCall(url) {
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
                  
                   defs =defs.replace(/<[^>]*>/g, ' ');
                   
                   const words = defs.split('\n');
                   infos= {'defs': words}
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
  makeCall(url)
 .then(function(results){
  callback(null,  results);
 })
 .catch(console.log)
 
 }


 app.get('/getData', function(req, res){
  var word= req.query['word']
 
  console.log("word in query:" + word);
  invokeAndProcessAPIResponse(function(err, result){
    if(err){
      res.send(500, { error: 'something blew up' });
    } else {
      res.send(result);
    }
  }, word);

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
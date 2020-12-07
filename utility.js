

var fs = require('fs');
const settings = require("./settings");
const http = require('http');


var url;

function makeCall (url) {
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

function getData(word){
    url = 'http://www.jeuxdemots.org/rezo-dump.php?gotermsubmit=Chercher&gotermrel='+word+'&rel=';
   
    makeCall(url)
   .then(function(results){
       console.log(results)
   })
   .catch(console.log)
   
   }

//getData('musique');

  exports.get = getData;
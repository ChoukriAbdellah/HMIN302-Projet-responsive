
var fs = require('fs');
const settings = require("./settings");
const http = require('http');
const { get } = require('request');
const HashMap = require('hashmap');

// all globals variables
var url;
var map_node = new HashMap();

let start = new Date();




function makeCall (url, word) {
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
                     
                     const def_splited = defs.split('\n');
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
                          //.log( 'musique'+ '=> ' +map_node.get(element_splited[3]));
                          outgoing_relationships_array.push(map_node.get(element_splited[3])) ;
                        }
                        );

                     infos= {'defs': def_splited, 
                             'semantic_rafinements': semantic_refinements
                            }
                    resolve(infos);
                    console.log("array size = " + outgoing_relationships_array.length);
                    // fs = require('fs');
                    // fs.writeFile('helloworld.txt', outgoing_relationships_array,function (err) {
                    //     if (err) return console.log(err);
                    //     console.log('Hello World > helloworld.txt');
                    //   });
                    var end = new Date() - start ;
                    console.info('Execution time: %dms', end);

                    
                })

            res.on('error', function (e) {
                reject(e)
            });
        });
    })

}

function getData(word){
    url = 'http://www.jeuxdemots.org/rezo-dump.php?gotermsubmit=Chercher&gotermrel='+word+'&rel=';
   
    makeCall(url, word)
   .then(function(results){
       console.log( results);
   })
   .catch(console.log)
   
   }
//getData('chat')
exports.get = getData;


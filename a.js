'use strict'

const fs = require('fs')



function getFromCache(word){
    const path = './cache/'+word+'.json'
    try {
        if (fs.existsSync(path)) {
            fs.readFile(path, {encoding: 'utf-8'}, function(err,data){
                if (!err) {
                    console.log('received data: ' + data);
                    
                } else {
                    console.log(err);
                }
            });
        }
      } catch(err) {
        console.error(err)
      }
}

getFromCache('mot')
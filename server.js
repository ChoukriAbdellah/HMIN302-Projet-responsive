
const http = require('http')





http.get('http://www.jeuxdemots.org/rezo-dump.php?gotermsubmit=Chercher&gotermrel=musique&rel=&relout=norelout&relin=norelin',
 (resp) => {
    resp.setEncoding("binary");
    let data = '';

  // A chunk of data has been recieved.
  resp.on('data', (chunk) => {
    data += chunk;
  });

  // The whole response has been received. Print out the result.
  resp.on('end', () => {
    
    var content = data;

        var src_code = content.substring(
            content.lastIndexOf("<CODE>") , 
            content.lastIndexOf("</CODE>")
        );
    // console.log("defs: " + content);

        defs = src_code.substring( 
                src_code.lastIndexOf("<def>") + 5, 
                src_code.lastIndexOf("</def>")
            );
        
        defs =defs.replace(/<[^>]*>/g, ' ');
    });

}).on("error", (err) => {
  console.log("Error: " + err.message);
});


    







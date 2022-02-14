require('./socket_server')
var express = require("express");
var app = express();


app.get('/', (req, res) => {
    res.send('API CALLED')
})

app.get('/guess')
app.listen(5000, function(){
    console.log('so I guess this is node?');
})



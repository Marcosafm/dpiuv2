// Módulos
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var swig = require('swig');
var mongo = require('mongodb');
var gestorBD = require("./modules/gestorBD.js");
var crypto = require('crypto');
var expressSession = require('express-session');
var cors = require('cors');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200
}



//TODO: Reemplazar por puerto de heroku con su variable de sistema
app.set('port', process.env.PORT || 8081);
app.set('db','mongodb://dpiu:dpiu1234@ds125914.mlab.com:25914/bancaonline');
//app.set('port', 8081);
//app.set('db', 'mongodb://localhost:27017/bancaonline');
app.set('cors', cors(corsOptions));
app.set('clave', '8AEA3EAD0B4900E11FFE258DD5EBC068AC3667BD5016BD7079D095C16CCF55C4');
app.set('crypto', crypto);

app.use(express.static('public'));

app.get('/', app.get('cors'), function(req, res) {
    var respuesta = swig.renderFile('views/identificarse.html', {});
    res.send(respuesta);
})

app.use(expressSession({
    secret: app.get('clave'),
    resave: true,
    saveUninitialized: true
}));

var gestorBD = require("./modules/gestorBD.js");
gestorBD.init(app, mongo);


//Rutas/controladores por lógica
require("./routes/rusers.js")(app, swig, gestorBD);
require("./routes/raccounts.js")(app, swig, gestorBD);
// lanzar el servidor
app.listen(app.get('port'), function() {
    console.log("Servidor activo");
})
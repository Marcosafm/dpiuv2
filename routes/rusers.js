module.exports = function(app, swig, gestorBD) {

    var ExpressBrute = require('express-brute');
    var MongoStore = require('express-brute-mongo');
    var MongoClient = require('mongodb').MongoClient;
    var asserts = require("./asserts");

    var store = new MongoStore(function(ready) {
        MongoClient.connect(app.get('db'), function(err, db) {
            if (err) throw err;
            ready(db.collection('bruteforce-store'));
        });
    });

    var bruteforce = new ExpressBrute(store);

    //GET
    app.get("/inversion", app.get('cors'), function(req, res) {
        var respuesta = swig.renderFile('views/inversores.html', {});
        res.send(respuesta);
    });

    app.get("/registrarse", app.get('cors'), function(req, res) {
        var respuesta = swig.renderFile('views/registrarse.html', {});
        res.send(respuesta);
    });

    app.get("/identificarse", app.get('cors'), function(req, res) {
        var respuesta = swig.renderFile('views/identificarse.html', {});
        res.send(respuesta);
    });


    app.get("/modPerfil", app.get('cors'), function(req, res) {
        var criterio = { dni: req.session.user };
        if (criterio != null) {
            gestorBD.obtenerUsuarios(criterio, function(users) {
                if (users == null || users.length == 0) {
                    req.session.usuario = null;
                    res.redirect("/identificarse" +
                        "?mensaje=Error en el acceso" +
                        "&tipoMensaje=alert-danger ");
                } else {
                    var respuesta = swig.renderFile('views/modPerfil.html', {
                        user: users[0]
                    });
                    res.send(respuesta);
                }

            });
        }
    });

    app.get("/blanco", app.get('cors'), function(req, res) {
        var respuesta = swig.renderFile('views/blanco.html', {});
        res.send(respuesta);
    });

    app.get("/acercade", app.get('cors'), function(req, res) {
        var respuesta = swig.renderFile('views/acercade.html', {});
        res.send(respuesta);
    });
    
    app.get("/desconectar", app.get('cors'), function(req, res) {
        req.session.user = null;
        var respuesta = swig.renderFile('views/identificarse.html', {});
        res.send(respuesta);
    });

    //POST

    app.post('/modPerfil', app.get('cors'), function(req, res) {
        if (req.session.user != null) {
            console.log("Comienza proceso de registro");
            var seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
                .update(req.body.pwd1).digest('hex');

            var criterio = { dni: req.session.user };

            var usuario = {
                name: req.body.name[0],
                surname: req.body.name[1],
                dni: req.body.dni,
                phone: req.body.phone,
                street: req.body.street,
                gate: req.body.gate,
                floor: req.body.floor,
                email: req.body.email,
                password: seguro
            }


            if (!asserts.assertPropertiesAreNullOrEmpty(usuario, "floor"))
                res.redirect("/modPerfil?mensaje=Error en los campos, alguno de los requeridos no está completo");

            console.log("Usuario:" + usuario.name + " " + usuario.surname + "\nPassword:" + req.body.password);
            gestorBD.modificarUsuario(criterio, usuario, function(id) {
                if (id == null) {
                    res.redirect("/modPerfil?mensaje=Error al modificar usuario")
                } else {
                    res.redirect("/principal?mensaje=Datos modificados correctamente");
                }
            });
        } else {
            res.redirect("/identificarse");
        }
    });

    app.post("/identificarse", bruteforce.prevent, function(req, res) {
        var seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.pwd).digest('hex');

        var criterio = {
            dni: req.body.dni,
            password: seguro
        }

        gestorBD.obtenerUsuarios(criterio, function(users) {
            if (users == null || users.length == 0) {
                req.session.usuario = null;
                res.redirect("/identificarse" +
                    "?mensaje=dni o password incorrecto" +
                    "&tipoMensaje=alert-danger ");
            } else {
                req.session.user = users[0].dni;
                res.redirect("/principal");
            }

        });

    });


    app.post('/registrarse', app.get('cors'), function(req, res) {

        if (req.body.pwd1 != req.body.pwd2) {
            console.log("Contraseñas no coinciden");
            res.redirect("/registrarse?mensaje=Error al crear el usuario, passwords no coincidentes")
        } else {
            console.log("Comienza proceso de registro");
            var seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
                .update(req.body.pwd1).digest('hex');

            var usuario = {
                name: req.body.name[0],
                surname: req.body.name[1],
                dni: req.body.dni,
                phone: req.body.phone,
                street: req.body.street,
                gate: req.body.gate,
                floor: req.body.floor,
                email: req.body.email,
                password: seguro
            }

            if (!asserts.assertPropertiesAreNullOrEmpty(usuario, "floor"))
                res.redirect("/registrarse?mensaje=Error en los campos, alguno de los requeridos no está completo");

            console.log("Usuario:" + usuario.name + " " + usuario.surname + "\nPassword:" + req.body.password);
            gestorBD.insertarUsuario(usuario, function(id) {
                if (id == null) {
                    res.redirect("/registrarse?mensaje=Error al registrar usuario")
                } else {
                    res.redirect("/identificarse?mensaje=Nuevo usuario registrado");
                }
            });
        }
    });

}
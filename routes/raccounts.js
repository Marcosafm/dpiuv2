module.exports = function(app, swig, gestorBD) {
    var asserts = require("./asserts");

    //GET
    app.get("/principal", app.get('cors'), function(req, res) {
        var criterio = { ownerDNI: req.session.user, status: "activa" };

        gestorBD.obtenerCuentasDeUsuario(criterio, function(accounts) {
            if (accounts == null) {
                res.send("Error al listar ");
            } else {
                var respuesta = swig.renderFile('views/principal.html', {
                    accounts: accounts
                });
                res.send(respuesta);
            }
        });
    });

    app.get('/account/:id', function(req, res) {
        var criterio = { "_id": gestorBD.mongo.ObjectID(req.params.id) };
    	if(req.session.user != null){
	        gestorBD.obtenerCuenta(criterio, function(cuentas) {
	            if (cuentas == null) {
	                res.send("Error al obtener la cuenta");
	            } else {
	                var criterio = { referenceAccountID: cuentas[0]._id, status: "activa" };
	                gestorBD.obtenerTarjetas(criterio, cuentas[0], function(tupla) {
	
	                    var respuesta = swig.renderFile('views/cuenta.html', {
	                        cuenta: tupla.cuenta,
	                        tarjetas: tupla.tarjeta
	                    });
	
	                    res.send(respuesta);
	                });
	            }
	        });
    	}else{
        	res.redirect("/identificarse");
    	}
    })

    app.get('/account/:id/makeAMove', function(req, res) {
        var criterio = { "_id": gestorBD.mongo.ObjectID(req.params.id) };
    	if(req.session.user != null){
        gestorBD.obtenerCuenta(criterio, function(cuentas) {
            if (cuentas == null) {
                res.send("Error al obtener la cuenta");
            } else {
                var respuesta = swig.renderFile('views/movimiento.html', {
                    cuenta: cuentas[0]
                });
                res.send(respuesta);
            }
        });
    	}else{
        	res.redirect("/identificarse");
    	}
    })


    app.get("/account", app.get('cors'), function(req, res) {
    	if(req.session.user != null){
	        var respuesta = swig.renderFile('views/crearCuenta.html', {});
	        res.send(respuesta);
    	}else{
    		
    	}
    });

    //POST
    app.post('/account', app.get('cors'), function(req, res) {
    	if(req.session.user != null){
	        console.log("Comienza proceso de creación de cuenta");
	
	        createIBAN(function(result) {
	            if (result == null) {
	                res.redirect("/newAccount?mensaje=Error en los campos")
	            } else {
	                var account = {
	                    ownerDNI: req.session.user,
	                    IBAN: result,
	                    cash: 0,
	                    accountType: req.body.accountType,
	                    limit: req.body.limit,
	                    status: "activa",
	                    moves: []
	                }
	
	                if (!asserts.assertPropertiesAreNullOrEmpty(account, "limit", "cash", "moves"))
	                    res.redirect("/newAccount?mensaje=Error en los campos")
	                else {
	                    accountIBAN = undefined;
	                    console.log("Cuenta:" + account.IBAN + " DNI del dueño:" + account.ownerDNI + "\nStatus:" + account.status);
	                    gestorBD.crearCuenta(account, function(id) {
	                        if (id == null) {
	                            res.redirect("/newAccount?mensaje=Error al registrar una cuenta");
	                        } else {
	                            res.redirect("/principal?mensaje=Nueva cuenta registrada");
	                        }
	                    });
	                }
	            }
	        });
    	}else{
        	res.redirect("/identificarse");
    	}
    });

    app.post('/account/:inputIBAN/makeAMove', app.get('cors'), function(req, res) {
    	if(req.session.user != null){
	        var movement = {
	            inputIBAN: req.params.inputIBAN,
	            outputIBAN: req.body.outputIBAN,
	            amount: req.body.amount
	        }
	
	        if (!asserts.assertPropertiesAreNullOrEmpty(movement))
	            res.redirect("/makeAMove?mensaje=Datos de transferencia erróneos")
	        else {
	            gestorBD.movimientoEnCuentaDadoIBAN(movement, function(id) {
	                if (id == null) {
	                    res.redirect("/makeAMove?mensaje=Datos de transferencia erróneos");
	                } else {
	                    res.redirect("/principal");
	                }
	            });
	        }
    	}else{
        	res.redirect("/identificarse");
    	}
    });

    app.post('/unsubscribe/:id', function(req, res) {
        var criterio = { "_id": gestorBD.mongo.ObjectID(req.params.id) };
    	if(req.session.user != null){
	        gestorBD.obtenerCuenta(criterio, function(cuentas) {
	            if (cuentas == null) {
	                res.send("Error al obtener la cuenta");
	            } else {
	                var criterio = { "_id": cuentas[0]._id };
	
	                cuentas[0].status = "baja";
	                gestorBD.modificarCuenta(criterio, cuentas[0], function(id) {
	                    if (id == null) {
	                        res.redirect("/account/" + id.ops[0]._id + "?mensaje=Imposible dar de Baja");
	                    } else {
	                        res.redirect("/principal?mensaje=Tarjeta dada de Baja");
	                    }
	                });
	            }
	        });
    	}else{
        	res.redirect("/identificarse");
    	}
    })

    //METHODS

    function createIBAN(functionCallback) {
        let country = "ES";
        let countryCode = 98;
        let bankCode = 6179;
        let codeOffice = 7777;
        let controlDigit = 99;
        let accountNumber;
        gestorBD.contarCuentas(function(result) {
            if (result == null) {
                res.redirect("/newAccount?mensaje=Error al crear tarjetas");
            } else {
                accountNumber = completeNumber(result);
                accountIBAN = country + countryCode + bankCode + codeOffice + controlDigit + accountNumber;
                functionCallback(accountIBAN);
            }
        });
    }

    function completeNumber(obj) {
        while (obj.toString().length < 10)
            obj = '0' + obj;
        return obj;
    }
}
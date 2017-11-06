module.exports = {
    mongo: null,
    app: null,
    init: function(app, mongo) {
        this.mongo = mongo;
        this.app = app;
    },
    //Usuarios
    insertarUsuario: function(usuario, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('usuarios');
                collection.insert(usuario, function(err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result.ops[0]._id);
                    }
                    db.close();
                });
            }
        });
    },
    eliminarUsuario: function(criterio, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('usuarios');
                collection.remove(criterio, function(err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result);
                    }
                    db.close();
                });
            }
        });
    },
    modificarUsuario: function(criterio, usuario, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('usuarios');
                collection.update(criterio, { $set: usuario }, function(err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result);
                    }
                    db.close();
                });
            }
        });
    },
    obtenerUsuarios: function(criterio, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {

                var collection = db.collection('usuarios');
                collection.find(criterio).toArray(function(err, usuarios) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(usuarios);
                    }
                    db.close();
                });
            }
        });
    }, //Cuentas
    obtenerCuentasDeUsuario: function(criterio, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {

                var collection = db.collection('cuentas');
                collection.find(criterio).toArray(function(err, cuentas) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(cuentas);
                    }
                    db.close();
                });
            }
        });
    },
    crearCuenta: function(account, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('cuentas');
                collection.insert(account, function(err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result);
                    }
                    db.close();
                });
            }
        });
    },
    modificarCuenta: function(criterio, cuenta, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('cuentas');
                collection.update(criterio, { $set: cuenta }, function(err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result);
                    }
                    db.close();
                });
            }
        });
    },
    contarCuentas: function(funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('cuentas');
                collection.count(function(err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result);
                    }
                    db.close();
                });
            }
        });
    },
    obtenerCuenta: function(criterio, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {

                var collection = db.collection('cuentas');
                collection.find(criterio).toArray(function(err, cuentas) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(cuentas);
                    }
                    db.close();
                });
            }
        });
    },
    movimientoEnCuentaDadoIBAN: function(movement, funcionCallback) {
        let cuenta;
        let criterio = { "IBAN": movement.inputIBAN };
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            let collection = db.collection('cuentas');
            if (err) {
                funcionCallback(null);
            } else {

                collection.find(criterio).toArray(function(err, cuentas) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        if (cuentas.length > 0) {
                            cuenta = cuentas[0];
                            let money = parseInt(cuenta.cash) +parseInt(movement.amount);
                            if(cuenta.limit == ""){
                            	cuenta.cash = money;
                            }
                            else{
                            	if(money > cuenta.limit){
                            		cuenta.cash = cuenta.limit;
                            	}
                            	else{
                            		cuenta.cash = money;
                            	}
                            }
                            cuenta.moves.push(movement);

                            let criterio = { "IBAN": movement.inputIBAN };

                            collection.update(criterio, { $set: cuenta }, function(err, result) {
                                if (err) {
                                    funcionCallback(null);
                                } else {
                                    funcionCallback(result);
                                }
                                db.close();
                            });
                        }
                    }
                });

                
            }
            
        });

    }, //CARDS
    obtenerTarjetas: function(criterio, cuenta, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {

                var collection = db.collection('tarjetas');
                collection.find(criterio).toArray(function(err, tarjetas) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        var tupla = {
                            tarjeta: tarjetas,
                            cuenta: cuenta
                        }
                        funcionCallback(tupla);
                    }
                    db.close();
                });
            }
        });
    },
    contarTarjetas: function(funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('tarjetas');
                collection.count(function(err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result);
                    }
                    db.close();
                });
            }
        });
    },
    crearTarjeta: function(card, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('tarjetas');
                collection.insert(card, function(err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result);
                    }
                    db.close();
                });
            }
        });
    }
}
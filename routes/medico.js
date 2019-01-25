var express = require('express');
var bcrypt = require('bcryptjs');   // npm install bcryptjs --save
var jwt = require('jsonwebtoken');  // npm install jsonwebtoken

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Medico = require('../models/medico');


// ===============================================
// Obtener todos los Medicoes
// ===============================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0; // si el parámetro opcional viene vacio, le asigno cero por default
    desde = Number(desde);

    Medico.find( {}, 'nombre img')
        .skip(desde)
        .limit(5)    
        .populate('usuario', 'nombre email')
        .populate('hospital', 'nombre')
        .exec(
            (err, medicos) => {

                if (err) {
                    return res.status(500).json( {
                        ok: false,
                        mensaje: 'Error cargando usuario',
                        errors: err                        
                    });
                }

                Medico.count( {}, (err, conteo) => {
                    res.status(200).json( {
                        ok: true,
                        usuarios: medicos,
                        total: conteo
                    })                
    
                })
            }
        );
});


// ===============================================
// Crear Medicoes
// ===============================================
app.post('/', mdAutenticacion.verificaToken,  (req, res) =>{

    var body = req.body;

    medico = new Medico ( {

        nombre: body.nombre,
        img: body.img,
        usuario: body.usuario,
        hospital: body.hospital
    });

    medico.save( (err, medicoGuardado) => {
        // El error HTTP 400 (Bad Request)
        if ( err ) {
            return res.status(400).json( {
                ok: false,
                mensaje: 'Error al crear medico' + body.nombre,
                errors: err
            });
        }

        // Petición HTTP 201 (Created)
        res.status(201).json( {
            ok: true,
            mensaje: "todo bien",
            medico: medicoGuardado,
            medicoToken: req.medico
        });   
    });
});


// ===============================================
// Borrar usuario por id
// ===============================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id; // este id debe llamarse igual al que definimos en '/:id'

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {

        // El error HTTP 400 (Bad Request)
        if ( err ) {
            return res.status(400).json( {
                ok: false,
                mensaje: 'Error al crear medico',
                errors: err
            });
        }       
        
        // El error HTTP 500 
        if ( !medicoBorrado ) {
            return res.status(500).json( {
                ok: false,
                mensaje: 'No existe un medico con ese ID',
                errors: {message: 'No existe un medico con ese ID'}
            });
        }           

        // Petición HTTP 200 (Ok)
        res.status(200).json( {
            ok: true,
            mensaje: "medico borrado",
            usuario: medicoBorrado
        })         
    });
});



// ===============================================
// Actualizar todos los medico
// ===============================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;


    Medico.findById( id, (err, medico) =>  {

        

        // El error HTTP 500 ( Internal Server Error)
        if ( err ) {
            return res.status(500).json( {
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: err
            });
        }        

        // El error HTTP 400 (Bad Request)
        if ( !medico ) {
            return res.status(400).json( {
                ok: false,
                mensaje: 'El medico con el id:' + id + ' no existe',
                errors: { message: 'No existe un medico con ese ID'}
            });
        }       
        
        
        medico.nombre = body.nombre;
        medico.img = body.img;
        medico.usuario = body.usuario;
        medico.hospital = body.hospital;

        medico.save( (err, medicoGuardado) => {

            // El error HTTP 400 (Bad Request)
            if ( err ) {
                return res.status(400).json( {
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }            
            
            // Petición HTTP 200 (Ok)
            res.status(200).json( {
                ok: true,
                id: id,
            })              
        });

    });

    
});


module.exports = app;
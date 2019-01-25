var express = require('express');
var bcrypt = require('bcryptjs');   // npm install bcryptjs --save
var jwt = require('jsonwebtoken');  // npm install jsonwebtoken

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Hospital = require('../models/hospital');


// ===============================================
// Obtener todos los Hospitales
// ===============================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0; // si el parámetro opcional viene vacio, le asigno cero por default
    desde = Number(desde);

    Hospital.find( {})
        .skip(desde)
        .limit(5)    
        .populate('usuario', 'nombre email')
        .exec(
            (err, hospitales) => {

                if (err) {
                    return res.status(500).json( {
                        ok: false,
                        mensaje: 'Error cargando usuario',
                        errors: err                        
                    });
                }

                Hospital.count( {}, (err, conteo) => {
                    res.status(200).json( {
                        ok: true,
                        hospitales: hospitales,
                        total: conteo
                    })                
    
                })
            }
        );
});


// ===============================================
// Crear Hospitales
// ===============================================
app.post('/', mdAutenticacion.verificaToken,  (req, res) =>{

    var body = req.body;

    hospital = new Hospital ( {

        nombre: body.nombre,
        img: body.img,
        usuario: body.usuario
    });

    hospital.save( (err, hospitalGuardado) => {
        // El error HTTP 400 (Bad Request)
        if ( err ) {
            return res.status(400).json( {
                ok: false,
                mensaje: 'Error al crear hospital' + body.nombre,
                errors: err
            });
        }

        // Petición HTTP 201 (Created)
        res.status(201).json( {
            ok: true,
            mensaje: "todo bien",
            hospital: hospitalGuardado,
            hospitalToken: req.hospital
        });   
    });
});


// ===============================================
// Borrar usuario por id
// ===============================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id; // este id debe llamarse igual al que definimos en '/:id'

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {

        // El error HTTP 400 (Bad Request)
        if ( err ) {
            return res.status(400).json( {
                ok: false,
                mensaje: 'Error al crear hospital',
                errors: err
            });
        }       
        
        // El error HTTP 500 
        if ( !hospitalBorrado ) {
            return res.status(500).json( {
                ok: false,
                mensaje: 'No existe un hospital con ese ID',
                errors: {message: 'No existe un hospital con ese ID'}
            });
        }           

        // Petición HTTP 200 (Ok)
        res.status(200).json( {
            ok: true,
            mensaje: "hospital borrado",
            usuario: hospitalBorrado
        })         
    });
});



// ===============================================
// Actualizar todos los hospital
// ===============================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;


    Hospital.findById( id, (err, hospital) =>  {

        

        // El error HTTP 500 ( Internal Server Error)
        if ( err ) {
            return res.status(500).json( {
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }        

        // El error HTTP 400 (Bad Request)
        if ( !hospital ) {
            return res.status(400).json( {
                ok: false,
                mensaje: 'El hospital con el id:' + id + ' no existe',
                errors: { message: 'No existe un hospital con ese ID'}
            });
        }       
        
        
        hospital.nombre = body.nombre;
        hospital.img = body.img;
        hospital.usuario = body.usuario;

        hospital.save( (err, hospitalGuardado) => {

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
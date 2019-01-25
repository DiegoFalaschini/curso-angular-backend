var express = require('express');
var bcrypt = require('bcryptjs');   // npm install bcryptjs --save
var jwt = require('jsonwebtoken');  // npm install jsonwebtoken

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Usuario = require('../models/usuario');


// ===============================================
// Obtener todos los usuarios
// ===============================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0; // si el parámetro opcional viene vacio, le asigno cero por default
    desde = Number(desde);

    // .skip(desde) Indica desde donde empieza
    // .limit(5)   Limita la cantidad de resultados

    Usuario.find( {}, 'nombre email img role')
        .skip(desde)
        .limit(5)
        .exec(
            (err, usuarios) => {

                // El error HTTP 500 ( Internal Server Error)
                if ( err ) {
                    return res.status(500).json( {
                        ok: false,
                        mensaje: 'Error cargando usuario',
                        errors: err
                    });
                }

                Usuario.count( {}, (err, conteo) => {

                    res.status(200).json( {
                        ok: true,
                        usuarios: usuarios,
                        total: conteo
                    })
                })


        })

    // res.status(200).json( {
    //     ok: true,
    //     mensaje: 'Get de usuarios'
    // })
});




// ===============================================
// Actualizar todos los usuarios
// ===============================================
app.put('/:id', (req, res) => {

    var id = req.params.id;
    var body = req.body;


    Usuario.findById( id, mdAutenticacion.verificaToken, (err, usuario) =>  {

        

        // El error HTTP 500 ( Internal Server Error)
        if ( err ) {
            return res.status(500).json( {
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }        

        // El error HTTP 400 (Bad Request)
        if ( !usuario ) {
            return res.status(400).json( {
                ok: false,
                mensaje: 'El usuario con el id:' + id + ' no existe',
                errors: { message: 'No existe un usuario con ese ID'}
            });
        }       
        
        
        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = usuario.role;

        usuario.save( (err, usuarioGuardado) => {

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

// ===============================================
// Crear usuarios
// ===============================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync (body.password),
        img: body.img,
        role: body.role
    });
    
    usuario.save( (err, usuarioGuardado) => {
        
        // El error HTTP 400 (Bad Request)
        if ( err ) {
            return res.status(400).json( {
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        }

        // Petición HTTP 201 (Created)
        res.status(201).json( {
            ok: true,
            mensaje: "todo bien",
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        })          

    });

  

});


// ===============================================
// Borrar usuario por id
// ===============================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id; // este id debe llamarse igual al que definimos en '/:id'

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

        // El error HTTP 400 (Bad Request)
        if ( err ) {
            return res.status(400).json( {
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        }       
        
        // El error HTTP 500 
        if ( !usuarioBorrado ) {
            return res.status(500).json( {
                ok: false,
                mensaje: 'No existe un usuario con ese ID',
                errors: {message: 'No existe un usuario con ese ID'}
            });
        }           

        // Petición HTTP 200 (Ok)
        res.status(200).json( {
            ok: true,
            mensaje: "Usuario borrado",
            usuario: usuarioBorrado
        })         
    });
});

module.exports = app;
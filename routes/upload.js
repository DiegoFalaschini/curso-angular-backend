var express = require('express');
var fileUpload = require('express-fileupload'); // npm install --save express-fileupload
var fs = require('fs');
var app = express();


var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

// default options
app.use(fileUpload());


// rutas
app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;


    // Validacion de tipos validos
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];

    if ( tiposValidos.indexOf( tipo ) < 0) {
        return res.status(400).json({
            ok:false,
            mensaje: "No seleccionó un tipo válido",
            errors: {message : 'Debe seleccionar tipo válido'}
        })        
    }

    if (!req.files) {
        return res.status(400).json({
            ok:false,
            mensaje: "No seleccionó el archivo",
            errors: {message : 'Debe seleccionar una imagen'}
        })
    }


    // Obtener nombre   de la imagen
    var archivo =  req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensiónArchivo = nombreCortado[ nombreCortado.length -1];


    // Solo se aceptan estas extensiones
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extensiónArchivo) < 0 ) {
        return res.status(400).json( {
            ok: false,
            mensaje: 'Extensión del archivo no válida',
            errors: {message: 'Extensión del archivo no válida'}
        })
    }



    // Nombre de archivo personalizado
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds()}.${ extensiónArchivo}`;

    // Mover el archivo del temporal a un path
    var path = `./uploads/${ tipo }/${ nombreArchivo }`;
    
    archivo.mv( path, err => {

        if (err) {
            return res.status(500).json( {
                ok: false,
                mensaje: 'Error al mover el archivo',
                errors: err
            })        
        }


        subirPorTipo(tipo, id, nombreArchivo, res);
    });

    


});



function subirPorTipo ( tipo, id, nombreArchivo, res) {
 
    if (tipo === 'usuarios') {

        Usuario.findById(id, (err, usuario) => {


            if (!usuario) {
                return res.status(200).json( {
                    ok: true,
                    mensaje: 'Usuario no existe',
                    errors: {message: 'Usuario no existe'}

                });                
            }

            var pathViejo = './uploads/usuarios/' + usuario.img;

            // si tiene una imagen borra la anterior
            if ( fs.existsSync(pathViejo) ) {
                fs.unlink( pathViejo );
            }

            usuario.img = nombreArchivo;

            usuario.save( (err, usuarioActualizado) => {

                return res.status(200).json( {
                    ok: true,
                    mensaje: 'Usuario actualizado',
                    usuario: usuarioActualizado
                });
            });

        });
    }

    if (tipo === 'medicos') {
        
        Medico.findById(id, (err, medico) => {

            if (!medico) {
                return res.status(200).json( {
                    ok: true,
                    mensaje: 'medico no existe',
                    errors: {message: 'medico no existe'}

                });                
            }            

            var pathViejo = './uploads/medicos/' + medico.img;

            // si tiene una imagen borra la anterior
            if ( fs.existsSync(pathViejo) ) {
                fs.unlink( pathViejo );
            }

            medico.img = nombreArchivo;

            medico.save( (err, usuarioActualizado) => {

                return res.status(200).json( {
                    ok: true,
                    mensaje: 'Medico actualizado',
                    medico: medicoActualizado
                });
            });

        });        
    }
    
    if (tipo === 'hospitales') {

        Hospital.findById(id, (err, hospital) => {

            if (!hospital) {
                return res.status(200).json( {
                    ok: true,
                    mensaje: 'hospital no existe',
                    errors: {message: 'hospital no existe'}

                });                
            }  

            var pathViejo = './uploads/hospitales/' + hospital.img;

            // si tiene una imagen borra la anterior
            if ( fs.existsSync(pathViejo) ) {
                fs.unlink( pathViejo );
            }

            hospital.img = nombreArchivo;

            hospital.save( (err, hospitalActualizado) => {

                return res.status(200).json( {
                    ok: true,
                    mensaje: 'Hospital actualizado',
                    usuario: hospitalActualizado
                });
            });

        });        
        
    }    
}



module.exports = app;
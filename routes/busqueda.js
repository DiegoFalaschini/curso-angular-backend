var express = require('express');

var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

// rutas


//----------------------------------------------
// Busqueda por colección
//----------------------------------------------
app.get('/coleccion/:tabla/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var tabla = req.params.tabla;

    var regex = new RegExp(busqueda, 'i');
    var promesa;

    switch (tabla) {

        case 'usuario':

            promesa = buscarUsuarios(regex);
            break;

        case 'medico':

            promesa = buscarMedicos(regex);
            break;

        case 'hospital':

            promesa = buscarHospitales(regex);
            break;

        default:

            return res.status(400).json( {
                ok:false,
                mensaje: 'Tipo de busqueda erronea',
                error: { message: 'Tipo de busqueda erronea'}
            })
    }


    // [tabla] = se utiliza para especificar que lo que queremos es el contenido de la variable (en esta caso tabla) y no su nombre
    promesa.then ( data => {
        res.status(200).json( {
            ok: true,
            [tabla]: data
        })
    });

});

//----------------------------------------------
// Busqueda general
//----------------------------------------------
app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');


    Promise.all ( [
        buscarHospitales(regex),
        buscarMedicos(regex),
        buscarUsuarios(regex)
    ])
    .then(respuestas => {
        res.status(200).json( {
            ok: true,
            mensaje: 'peticion realizada correctamente',
            hospitales: respuestas[0],
            medicos: respuestas[1],
            usuarios: respuestas[2]
        });
    });


    // buscarHospitales(busqueda, regex)
    //     .then(hospitales => {

    //         res.status(200).json( {
    //             ok: true,
    //             mensaje: 'peticion realizada correctamente',
    //             hospitales: hospitales
    //         })
    //     });



});



function buscarHospitales(regex) {

    return new Promise( (resolve, reject) => {

        Hospital.find( { nombre: regex})
                .populate('usuario', 'nombre email')
                .exec( (err, hospitales) => {

                    if (err) {
                        reject('Error al cargar los hospitales', err);
                    }else {
                        resolve(hospitales);
                    }

                });
    });
}


function buscarMedicos(regex) {

    return new Promise( (resolve, reject) => {

        Medico.find( { nombre: regex})
                .populate('usuario', 'nombre email')
                .populate('hospital')
                .exec( (err, medicos) => {

                    if (err) {
                        reject('Error al cargar los Medicos', err);
                    }else {
                        resolve(medicos);
                    }

                });
    });
}



function buscarUsuarios (regex) {

    return new Promise( (resolve, reject) => {

        Usuario.find( {}, 'nombre email' )
                .or( [ {'nombre': regex}, {'email': regex}])
                .exec( ( err, usuarios) => {

                    if (err) {
                        reject('Error al cargar los usuarios', err);
                    }else {
                        resolve(usuarios);
                    }

                });
    });    
}

module.exports = app;
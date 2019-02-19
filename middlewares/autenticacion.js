
var jwt = require('jsonwebtoken');  // npm install jsonwebtoken

var SEED = require('../config/config.js').SEED;


// ===============================================
// Verificar token
// ===============================================
exports.verificaToken = function(req, res, next) {
    var token = req.query.token;

    jwt.verify( token, SEED, (err, decoded) => {

        if (err) {
            return res.status(401).json( {
                ok: false,
                mensaje: 'token incorrecto',
                errors: err
            });
        }

        req.usuario = decoded.usuario;

        next();
    });
}




// ===============================================
// Verificar Admin
// ===============================================
exports.verificaADMIN_ROLE = function(req, res, next) {

    var usuario = req.usuario;

    if (usuario.role === 'ADMIN_ROLE') {

        next();
        return;
    } else {

            return res.status(401).json( {
                ok: false,
                mensaje: 'token incorrecto - No es Administrador',
                errors: { message: "no es administrador, no puede hacer eso"}
            });
    }
}



// ===============================================
// Verificar Admin o Mismo usuario
// ===============================================
exports.verificaADMIN_o_MismoUsuario = function(req, res, next) {

    var usuario = req.usuario;  // usuario de token
    var id = req.params.id;     // id desde el parámetro de la url

    if (usuario.role === 'ADMIN_ROLE'  ||  usuario._id === id ) {

        next();
        return;
    } else {

            return res.status(401).json( {
                ok: false,
                mensaje: 'token incorrecto - No es Administrador ni el mismo usuario',
                errors: { message: "no es administrador, no puede hacer eso"}
            });
    }
}

// // ===============================================
// // Verificar token
// // ===============================================
// app.use('/',  (req, res, next) => {

//     var token = req.query.token;

//     jwt.verify( token, SEED, (err, decoded) => {

//         if (err) {
//             return res.status(401).json( {
//                 ok: false,
//                 mensaje: 'token incorrecto',
//                 errors: err
//             });
//         }

//         next();
//     });
// })


var jwt = require('jsonwebtoken');  // npm install jsonwebtoken

var SEED = require('../config/config.js').SEED;



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

var express = require('express');
var bcrypt = require('bcryptjs');   // npm install bcryptjs --save
var jwt = require('jsonwebtoken');  // npm install jsonwebtoken

var SEED = require('../config/config.js').SEED;

var app = express();

var Usuario = require('../models/usuario');

// Google
var CLIENT_ID = require('../config/config.js').CLIENT_ID;
const {OAuth2Client} = require('google-auth-library');  // npm install google-auth-library --save
const client = new OAuth2Client(CLIENT_ID);


var mdAutentication = require('../middlewares/autenticacion');

// ===================================================
// 
// ===================================================
app.get('/renuevatoken', mdAutentication.verificaToken, ( req, res ) => {

    var token = jwt.sign( { usuario: req.usuario}, SEED, { expiresIn: 14400});

    res.status(200).json( {
        ok: true,
        usuario: req.usuario,
        token: token
    })
})



// ===================================================
// Autenticacion Google
// ===================================================

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });

    const payload = ticket.getPayload();
    const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];


    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }

}

// uso "async" para poder utilizar el "await" ya que la funcion verify() retorna una promesa
app.post('/google', async (req, res) => {


    var token = req.body.token;

    var googleUser = await verify(token)
        .catch( e => {
            return res.status(403).json({
                ok: false,
                mensaje: 'Token no válido'
            })
        });


    Usuario.findOne({email: googleUser.email }, (err, usuarioDB) => {
        if (err) {

            return res.status(500).json( {
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            })
        }

        if (usuarioDB ) {

            if ( usuarioDB.google === false ) {

                return res.status(400).json({
                    ok: false,
                    mensaje: 'Debe usar la autenticacion normal'
                });                

            }
            else {
                var token = jwt.sign( { usuario: usuarioDB}, SEED, { expiresIn: 14400});

                res.status(200).json( {
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    mensaje: 'Login post correcto',
                    id: usuarioDB._id,
                    menu: obtenerMenu( usuarioDB.role)
                });                
            }
        }
        else {
            // El usuario no existe... hay que crearlo

            var usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save( ( err, usuarioDB) => {

                // El error HTTP 400 (Bad Request)
                if ( err ) {
                    return res.status(400).json( {
                        ok: false,
                        mensaje: 'Error al crear usuario',
                        errors: err
                    });
                }                

                var token = jwt.sign( { usuario: usuarioDB}, SEED, { expiresIn: 14400});

                res.status(200).json( {
                    ok: true,
                    usuario: usuarioDB,
                    token: token,

                    id: usuarioDB._id,
                    menu: obtenerMenu( usuarioDB.role)
                });                  
            });
        }

    });


    // res.status(200).json( {
    //     ok: true,
    //     mensaje: 'OK',
    //     googleUser: googleUser
    // })
})


// ===================================================
// Autenticacion Normal
// ===================================================
app.post('/', (req, res) => {

    var body = req.body;

    Usuario.findOne( { email: body.email}, (err, usuarioDB) => {

        if (err) {

            return res.status(500).json( {
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            })
        }

        if ( !usuarioDB ) {
            return res.status(400).json( {
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: err
            })
        }

        if ( !body.password ) {
            return res.status(400).json( {
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: err
            })
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json( {
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: err
            })
        }


        // Crear un token!!!
        usuarioDB.password = ':)';
        var token = jwt.sign( { usuario: usuarioDB}, SEED, { expiresIn: 14400});

        res.status(200).json( {
            ok: true,
            usuario: usuarioDB,
            token: token,
            mensaje: 'Login post correcto',
            id: usuarioDB._id,
            menu: obtenerMenu( usuarioDB.role)
        });
    
    });

});



// ===================================================
// Menu Dínamico
// ===================================================
function obtenerMenu( ROLE ) {

	var menu = [
		{
			titulo: 'Principal',
			icono: 'mdi mdi-gauge',
			submenu: [
				{ titulo: 'Dashboard', url: '/dashboard'},
				{ titulo: 'ProgressBar', url: '/progress'},
				{ titulo: 'Gráficas', url: '/graficas1'},
				{ titulo: 'Promesas', url: '/promesas'},
				{ titulo: 'rxjs', url: '/rxjs'},

			]
		},

		{
			titulo: 'Mantenimientos',
			icono: 'mdi mdi-folder-lock-open',
			submenu: [
				// { titulo: 'Usuarios', url: '/usuarios'}, 
				{ titulo: 'Hospitales', url: '/hospitales'},
				{ titulo: 'Médicos', url: '/medicos'},
			]
		},


	];


    if ( ROLE === 'ADMIN_ROLE' ) {

        menu[1].submenu.unshift( { titulo: 'Usuarios', url: '/usuarios'} ); // unshift agrega el item al principio del arreglo
    }

    return menu;
}




module.exports = app;
// Requires
var express = require('express');
var mongoose = require('mongoose');

// inicializar Variables
var app = express();


// Conexion a la db
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res)=>  {
    if (err) throw err;

    console.log('base de datos \x1b[32m%s\x1b[0m', 'online');
});

// rutas
app.get('/', (req, res, next) => {

    res.status(200).json( {
        ok: true,
        mensaje: 'peticion realizada correctamente'
    })
});

app.listen (3000, () => {
    console.log('express port \x1b[32m%s\x1b[0m', '3000');
});
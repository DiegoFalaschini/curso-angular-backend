var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator'); // npm install mongoose-unique-validator --save

var Schema = mongoose.Schema;

var rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '*{VALUE}* no es un rol válido'
}

var usuarioSchema = new Schema( {
    
    nombre: { type: String, required: [ true, 'El nombre es necesario']},
    email: { type: String, unique:true, required: [ true, 'El correo es necesario']},
    password: { type: String, required: [ true, 'El password es necesario']},
    img: { type: String, required: false},
    role: { type: String, required: true, default: 'USER_ROLE', enum: rolesValidos},
    google: { type: Boolean, default: false}
});

usuarioSchema.plugin(uniqueValidator, { message: 'El *{PATH}* debe ser único'}); // PATH equivale al nombre del campo
module.exports = mongoose.model('Usuario', usuarioSchema);
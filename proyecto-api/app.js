const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const app = express();

// Conexión a la base de datos MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/BD_HT7', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Conexión a MongoDB exitosa'))
  .catch(err => console.error('Error de conexión a MongoDB:', err));

// Definir el esquema de usuario
const usuarioSchema = new mongoose.Schema({
  usuario: String,
  clave: String,
});

const Usuario = mongoose.model('Usuario', usuarioSchema);

app.use(bodyParser.json());

// Endpoint para realizar el login y generar un token
app.post('/proyecto/login/:DPI', async (req, res) => {
  const { usuario, clave } = req.body;

  try {
    const usuarioEncontrado = await Usuario.findOne({ usuario, clave });

    if (!usuarioEncontrado) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    const token = jwt.sign({ usuario }, 'tu_secreto_secreto', { expiresIn: '1h' });

    res.json({ token });
  } catch (error) {
    console.error('Error en el login:', error);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

// Middleware para verificar el token en las peticiones protegidas
function verificarToken(req, res, next) {
  const token = req.header('token');

  if (!token) {
    return res.status(401).json({ mensaje: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, 'tu_secreto_secreto');
    req.usuario = decoded.usuario;
    next();
  } catch (error) {
    return res.status(403).json({ mensaje: 'Token inválido' });
  }
}

// Endpoint protegido para obtener datos
app.get('/proyecto/data', verificarToken, (req, res) => {
  res.json({ usuario: req.usuario, clave: '*****' });
});

const puerto = process.env.PORT || 3000;
app.listen(puerto, () => {
  console.log(`Servidor escuchando en el puerto ${puerto}`);
});

require('dotenv').config();
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const imagenesRouter = require('./imagenesCRUD');
const app = express();
const port = process.env.PORT || 3001;
const mongoUri = process.env.MONGODB_URI;
const bcrypt = require('bcrypt');

app.use(cors());
app.use(express.json());

const client = new MongoClient(mongoUri);

async function connectDB() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
        return client.db("huellitasfelices");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
}

const dbPromise = connectDB();
//imagen
app.use('/api/imagenes', imagenesRouter);
//cliente
app.get('/api/cliente', async (req, res) => {
    const db = await dbPromise;
    const collection = db.collection("cliente");
    const usuarios = await collection.find({}).toArray();
    res.json(usuarios);
});

app.delete('/api/cliente/:id', async (req, res) => {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
        return res.status(400).send("Invalid ID format.");
    }

    try {
        const db = await dbPromise;
        const collection = db.collection("cliente");
        const result = await collection.deleteOne({ "_id": new ObjectId(id) });

        if (result.deletedCount === 1) {
            res.status(204).end();
        } else {
            res.status(404).send("User not found.");
        }
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).send("Internal server error.");
    }
});
//empleado
app.get('/api/empleados', async (req, res) => {
    const db = await dbPromise;
    const collection = db.collection("empleados");
    const empleados = await collection.find({}).toArray();
    res.json(empleados);
});

//preguntas
app.get('/api/tblpregunta', async (req, res) => {
    const db = await dbPromise;
    const collection = db.collection("tblpregunta");
    const tblpregunta = await collection.find({}, { projection: { tipoPregunta: 1 } }).toArray();
    res.json(tblpregunta.map(item => item.tipoPregunta));
});

//usuarios
app.get('/api/usuarios', async (req, res) => {
    const db = await dbPromise;
    const collection = db.collection("usuarios");
    const usuarios = await collection.find({}).toArray();
    res.json(usuarios);
});

app.delete('/api/usuarios/:id', async (req, res) => {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
        return res.status(400).send("Invalid ID format.");
    }

    try {
        const db = await dbPromise;
        const collection = db.collection("usuarios");
        const result = await collection.deleteOne({ "_id": new ObjectId(id) });

        if (result.deletedCount === 1) {
            res.status(204).end();
        } else {
            res.status(404).send("User not found.");
        }
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).send("Internal server error.");
    }
});

//categorias
app.get('/api/categorias', async (req, res) => {
    const db = await dbPromise;
    const collection = db.collection("categorias");
    const categorias = await collection.find({}, { projection: { descripcion: 1 } }).toArray();
    res.json(categorias.map(item => item.descripcion));
});


//login
app.post('/api/usuario', async (req, res) => {
    const { Usuario, password, IdTipo } = req.body;
    const db = await dbPromise;
    const collection = db.collection("usuarios");
    try {
        const user = await collection.findOne({ Usuario, IdTipo });

        if (!user) {
            return res.status(401).send('Usuario no encontrado.');
        }

        const passwordIsValid = await bcrypt.compare(password, user.pssword);

        if (!passwordIsValid) {
            return res.status(401).send('Contraseña incorrecta.');
        }

        res.json({
            _id: user._id,
            IdTipo: user.IdTipo,
            Nombre: user.Nombre 
        });

    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        res.status(500).send('Error interno del servidor.');
    }
});




// Obtener perfil de usuario por _id
app.get('/api/usuarios/:id', async (req, res) => {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
        return res.status(400).send("Invalid ID format.");
    }

    try {
        const db = await dbPromise;
        const collection = db.collection("usuarios");
        const usuario = await collection.findOne({ "_id": new ObjectId(id) });

        if (usuario) {
            res.json(usuario);
        } else {
            res.status(404).send("usuario no encontrado");
        }
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).send("Internal server error.");
    }
});

// Actualizar perfil de usuario por _id
app.put('/api/usuarios/:_id', async (req, res) => {
    const { _id } = req.params;
    const { CorreoE, Telefono } = req.body; // Recibes solo correo y teléfono del front-end
  
    try {
      const db = await dbPromise;
      const collection = db.collection("usuarios");
      const updateDoc = {
        $set: {
          CorreoE, // Actualizar correo electrónico
          Telefono, // Actualizar teléfono
        },
      };
  
      const result = await collection.updateOne({ "_id": new ObjectId(_id) }, updateDoc);
  
      if (result.modifiedCount === 1) {
        res.status(200).send("Perfil actualizado correctamente.");
      } else {
        res.status(404).send("Usuario no encontrado.");
      }
    } catch (error) {
      console.error("Error actualizando perfil:", error);
      res.status(500).send("Error interno del servidor.");
    }
  });
  

// Actualizar perfil de usuario por _id
app.put('/api/us/:_id', async (req, res) => {
    const { _id } = req.params;
    const { CorreoE, Telefono } = req.body; // Recibes solo correo y teléfono del front-end

    try {
        const db = await dbPromise;
        const collection = db.collection("usuarios");
        
        const updateDoc = { $set: {} };
        
        // Solo agrega al objeto de actualización los campos que realmente han sido modificados
        if (CorreoE !== undefined) {
            updateDoc.$set.CorreoE = CorreoE;
        }
        if (Telefono !== undefined) {
            updateDoc.$set.Telefono = Telefono;
        }

        const result = await collection.updateOne({ "_id": new ObjectId(_id) }, updateDoc);

        if (result.modifiedCount === 1) {
            res.status(200).send("Perfil actualizado correctamente.");
        } else {
            res.status(404).send("Usuario no encontrado.");
        }
    } catch (error) {
        console.error("Error actualizando perfil:", error);
        res.status(500).send("Error interno del servidor.");
    }
});



//insertar Empleado
app.post('/api/usuarios/nuevoEmpleado', async (req, res) => {
    const {
        Usuario,
        pssword,
        CorreoE,
        Nombre,
        APaterno,
        AMaterno,
        Telefono,
        // codigo_verificacion y idSecreta los manejas como necesites en tu aplicación
        idSecreta,
        respuesta,
    } = req.body;

    try {
        const db = await dbPromise;
        const collection = db.collection("usuarios");

        // Hashear la contraseña antes de guardarla
        const hashedPassword = await bcrypt.hash(pssword, 10);
        const newUser = {
            Usuario,
            pssword: hashedPassword,
            CorreoE,
            Nombre,
            APaterno,
            AMaterno,
            Telefono,
            expiracion: new Date(new Date().getTime() + (24 * 60 * 60 * 1000)), // por ejemplo, +1 día
            idSecreta,
            respuesta,
            IdTipo: 'Empleado'
        };

        // Insertar el nuevo usuario en la base de datos
        const result = await collection.insertOne(newUser);

        if (result.acknowledged) {
            res.status(200).send({ message: "Usuario creado exitosamente.", userId: result.insertedId });
        } else {
            res.status(400).send({ message: "No se pudo crear el usuario." });
        }
    } catch (error) {
        console.error("Error al crear el usuario:", error);
        res.status(500).send({ message: "Error interno del servidor." });
    }
});


//insertar Cliente
app.post('/api/usuarios/nuevoCliente', async (req, res) => {
    const {
        Usuario,
        pssword,
        CorreoE,
        Nombre,
        APaterno,
        AMaterno,
        Telefono,
        // codigo_verificacion y idSecreta los manejas como necesites en tu aplicación
        idSecreta,
        respuesta,
    } = req.body;

    try {
        const db = await dbPromise;
        const collection = db.collection("usuarios");

        // Hashear la contraseña antes de guardarla
        const hashedPassword = await bcrypt.hash(pssword, 10);
        const newUser = {
            Usuario,
            pssword: hashedPassword,
            CorreoE,
            Nombre,
            APaterno,
            AMaterno,
            Telefono,
            expiracion: new Date(new Date().getTime() + (24 * 60 * 60 * 1000)), // por ejemplo, +1 día
            idSecreta,
            respuesta,
            IdTipo: 'Cliente'
        };

        // Insertar el nuevo usuario en la base de datos
        const result = await collection.insertOne(newUser);

        if (result.acknowledged) {
            res.status(200).send({ message: "Usuario creado exitosamente.", userId: result.insertedId });
        } else {
            res.status(400).send({ message: "No se pudo crear el usuario." });
        }
    } catch (error) {
        console.error("Error al crear el usuario:", error);
        res.status(500).send({ message: "Error interno del servidor." });
    }
});

// mensajes
app.post('/api/mensajes', async (req, res) => {
    const { nombre, email, mensaje, motivo } = req.body;

    try {
        const db = await dbPromise;
        const collection = db.collection("mensajeria");

        const newMessage = {
            nombre,
            email,
            mensaje,
            motivo,
            fecha: new Date()
        };
        const result = await collection.insertOne(newMessage);

        if (result.acknowledged) {
            res.status(200).send({ message: "Mensaje enviado exitosamente.", messageId: result.insertedId });
        } else {
            res.status(400).send({ message: "No se pudo enviar el mensaje." });
        }
    } catch (error) {
        console.error("Error al enviar el mensaje:", error);
        res.status(500).send({ message: "Error interno del servidor." });
    }
});

//validacion de correo
app.post('/api/recuperacion', async (req, res) => {
    const { CorreoE } = req.body;
    console.log('CorreoE recibido:', CorreoE);
    if (!CorreoE) {
        return res.status(400).send({ message: 'Por favor, proporcione un correo electrónico.' });
    }
    try {
        const db = await dbPromise;
        const collection = db.collection("usuarios");
        console.log('Buscando en la base de datos'); // Agrega esto para depurar
        const usuario = await collection.findOne({ CorreoE: CorreoE.trim() });
        console.log('Usuario encontrado:', usuario); // Agrega esto para depurar
        if (!usuario) {
            return res.status(404).json({ correoEncontrado: false, message: 'Correo electrónico no registrado.' });
        }
        // Asumiendo que aquí enviarías un correo con instrucciones para la recuperación
        return res.json({ correoEncontrado: true, message: 'Se han enviado las instrucciones para recuperar la contraseña a su correo electrónico.' });
    } catch (error) {
        console.error('Error al procesar la solicitud de recuperación:', error);
        return res.status(500).send({ message: 'Error interno del servidor.' });
    }
});

//Buscar la pregunta por medio del correo
app.get('/api/recuperacion-pregunta', async (req, res) => {
    const { CorreoE } = req.query;
    if (!CorreoE) {
        return res.status(400).send({ message: 'Es necesario proporcionar un correo electrónico.' });
    }
    try {
        const db = await dbPromise;
        const collection = db.collection("usuarios");
        const usuario = await collection.findOne({ CorreoE: CorreoE.trim() }, { projection: { idSecreta: 1 } });
        if (!usuario) {
            return res.status(404).send({ message: 'No se encontró el usuario con ese correo electrónico.' });
        }
        res.json({ preguntaSecreta: usuario.idSecreta });
    } catch (error) {
        console.error('Error al buscar la pregunta secreta:', error);
        res.status(500).send({ message: 'Error interno del servidor.' });
    }
});


//insertar productos
app.post('/api/productos', async (req, res) => {
    const { nombre, descripcion, precio, categoria, imagenUrl, color, tamano } = req.body;

    try {
        const db = await dbPromise;
        const collection = db.collection("productos");

        // Añade color y tamano al objeto productoData
        const productoData = { nombre, descripcion, precio, categoria, imagenUrl, color, tamano };

        const result = await collection.insertOne(productoData);
        if (result.acknowledged) {
            res.status(201).send({ message: "Producto creado exitosamente", productoId: result.insertedId });
        } else {
            res.status(400).send("No se pudo crear el producto.");
        }
    } catch (error) {
        console.error("Error al crear el producto:", error);
        res.status(500).send("Error interno del servidor");
    }
});

// Obtener todos los productos
app.get('/api/productos', async (req, res) => {
    try {
        const db = await dbPromise;
        const collection = db.collection("productos");
        const productos = await collection.find({}).toArray();
        res.json(productos);
    } catch (error) {
        console.error("Error al obtener los productos:", error);
        res.status(500).send("Error interno del servidor");
    }
});

// Actualizar producto por _id
app.put('/api/productos/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, precio } = req.body;

    try {
        const db = await dbPromise;
        const collection = db.collection("productos");

        // Crea un objeto con los campos que quieres actualizar
        const updateFields = {};
        if (nombre !== undefined) updateFields.nombre = nombre;
        if (descripcion !== undefined) updateFields.descripcion = descripcion;
        if (precio !== undefined) updateFields.precio = precio;

        // Si no hay campos para actualizar, devuelve un error
        if (Object.keys(updateFields).length === 0) {
            return res.status(400).send({ message: "No hay campos para actualizar" });
        }

        const result = await collection.updateOne(
            { "_id": new ObjectId(id) },
            { $set: updateFields }
        );

        if (result.modifiedCount === 1) {
            res.status(200).send({ message: "Producto actualizado exitosamente." });
        } else {
            res.status(404).send({ message: "Producto no encontrado." });
        }
    } catch (error) {
        console.error("Error al actualizar el producto:", error);
        res.status(500).send({ message: "Error interno del servidor." });
    }
});


//eliminar productos
app.delete('/api/productos/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const db = await dbPromise;
        const collection = db.collection("productos");

        const result = await collection.deleteOne({ "_id": new ObjectId(id) });
        if (result.deletedCount === 1) {
            res.status(200).send({ message: "Producto eliminado exitosamente." });
        } else {
            res.status(404).send({ message: "Producto no encontrado." });
        }
    } catch (error) {
        console.error("Error al eliminar el producto:", error);
        res.status(500).send("Error interno del servidor");
    }
});

//eliminar productos
app.delete('/api/productos/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const db = await dbPromise;
        const collection = db.collection("productos");

        const result = await collection.deleteOne({ "_id": new ObjectId(id) });
        if (result.deletedCount === 1) {
            res.status(200).send({ message: "Producto eliminado exitosamente." });
        } else {
            res.status(404).send({ message: "Producto no encontrado." });
        }
    } catch (error) {
        console.error("Error al eliminar el producto:", error);
        res.status(500).send("Error interno del servidor");
    }
});

// Validar si la respuesta es correcta
app.post('/api/validar', async (req, res) => {
    const { CorreoE, respuesta } = req.body;

    try {
        const db = await dbPromise;
        const collection = db.collection("usuarios");
        const usuario = await collection.findOne({ CorreoE: CorreoE.trim() });

        if (!usuario) {
            return res.status(404).send({ message: 'Usuario no encontrado.' });
        }

        console.log(`Respuesta esperada: ${usuario.respuesta}, Respuesta recibida: ${respuesta}`);

        // Aquí se normalizan ambas respuestas antes de comparar como ejemplo
        if (usuario.respuesta.toLowerCase() == respuesta.toLowerCase()) {
            res.status(200).send({ message: 'Respuesta correcta.', esCorrecta: true });
        } else {
            res.status(401).send({ message: 'Respuesta incorrecta.', esCorrecta: false });
        }
    } catch (error) {
        console.error('Error al procesar la solicitud:', error);
        res.status(500).send({ message: 'Error interno del servidor. Por favor, intenta nuevamente.' });
    }
});

// Endpoint para cambiar la contraseña
app.post('/api/cambiarContra', async (req, res) => {
    const { CorreoE, nuevaContrasena } = req.body;
    if (!CorreoE || !nuevaContrasena) {
        return res.status(400).send({ message: 'Faltan datos necesarios para el cambio de contraseña.' });
    }

    try {
        const db = await dbPromise;
        const collection = db.collection("usuarios");
        const usuario = await collection.findOne({ CorreoE: CorreoE.trim() });

        if (!usuario) {
            return res.status(404).send({ message: 'Usuario no encontrado.' });
        }
        const hashedPassword = await bcrypt.hash(nuevaContrasena, 10);

        await collection.updateOne(
            { CorreoE: CorreoE.trim() },
            { $set: { pssword: hashedPassword } }
        );
        res.send({ message: 'La contraseña ha sido cambiada exitosamente.' });
    } catch (error) {
        console.error('Error al cambiar la contraseña:', error);
        res.status(500).send({ message: 'Error interno del servidor.' });
    }
});


//solicitar el token
app.post('/api/solicitarRecuperacion', async (req, res) => {
    const { CorreoE } = req.body;

    if (!CorreoE) {
        return res.status(400).send({ message: 'Por favor, proporcione un correo electrónico.' });
    }

    try {
        const db = await dbPromise;
        const collection = db.collection("usuarios");
        const usuario = await collection.findOne({ CorreoE: CorreoE.trim() });

        if (!usuario) {
            return res.status(404).send({ message: 'Correo electrónico no registrado.' });
        }

        const tokenRecuperacion = uuidv4();
        const expiracion = new Date(new Date().getTime() + (24 * 60 * 60 * 1000)); // Establece la expiración para 24 horas después

        await collection.updateOne(
            { CorreoE: CorreoE.trim() },
            { $set: { tokenRecuperacion: tokenRecuperacion, expiracion: expiracion } }
        );

        // Aquí deberías enviar el correo con el token de recuperación

        return res.status(200).send({ message: 'Instrucciones de recuperación enviadas al correo electrónico.' });
    } catch (error) {
        console.error('Error en la solicitud de recuperación:', error);
        res.status(500).send({ message: 'Error interno del servidor.' });
    }
});

// Actualizar usuario parcialmente por _id
app.patch('/api/usuarios/:id', async (req, res) => {
    const { id } = req.params;
    const updateData = req.body; // Esto debería contener solo los campos que deseas actualizar

    try {
        const db = await dbPromise;
        const collection = db.collection("usuarios");

        const result = await collection.updateOne(
            { "_id": new ObjectId(id) },
            { $set: updateData }
        );

        if (result.modifiedCount === 1) {
            res.status(200).send("Usuario actualizado correctamente.");
        } else {
            res.status(404).send("Usuario no encontrado.");
        }
    } catch (error) {
        console.error("Error actualizando usuario:", error);
        res.status(500).send("Error interno del servidor.");
    }
});

//Confirmacion del Token sea correcto
app.post('/api/ValidarToken', async (req, res) => {
    const { token } = req.body;

    console.log('Token recibido para validación:', token);

    if (!token) {
        return res.status(400).send({ message: 'Token no proporcionado.' });
    }

    try {
        const db = await dbPromise;
        const collection = db.collection("usuarios");
        const usuario = await collection.findOne({ Token: token });

        if (!usuario) {
            console.log('Token no encontrado.');
            return res.status(401).send({ message: 'Token inválido o no encontrado.', esValido: false });
        }

        const tokenExpiration = usuario.expira ? new Date(usuario.expira) : null;
        const now = new Date();

        if (tokenExpiration && tokenExpiration < now) {
            console.log('Token expirado.');
            return res.status(401).send({ message: 'Token expirado.', esValido: false });
        }

        console.log('Token válido.');
        res.status(200).send({
            message: 'Token válido.',
            esValido: true,
            usuarioId: usuario._id.toString() // Convertir ObjectId a string
        });

    } catch (error) {
        console.error('Error al validar el token:', error);
        res.status(500).send({ message: 'Error interno del servidor.' });
    }
});



//Cambiar contraseña por Token
app.post('/api/cambiarContraT', async (req, res) => {
    const { usuarioId, nuevaContrasena } = req.body;

    if (!usuarioId || !nuevaContrasena) {
        return res.status(400).send({ message: 'Faltan datos necesarios para el cambio de contraseña.' });
    }

    try {
        const db = await dbPromise;
        const collection = db.collection("usuarios");
        const hashedPassword = await bcrypt.hash(nuevaContrasena, 10);

        const result = await collection.updateOne(
            { _id: new ObjectId(usuarioId) }, // Busca por el ID del usuario
            {
                $set: { pssword: hashedPassword },
                $unset: { Token: "", expira: "" } // Elimina el token y la fecha de expiración
            }
        );

        if (result.modifiedCount === 0) {
            throw new Error('No se pudo actualizar la contraseña del usuario.');
        }

        res.send({ message: 'La contraseña ha sido cambiada exitosamente.' });
    } catch (error) {
        console.error('Error al cambiar la contraseña:', error);
        res.status(500).send({ message: 'Error interno del servidor.' });
    }
});

//insertar FQ
app.post('/api/preguntasfrecuentes', async (req, res) => {
    const { pregunta, respuesta } = req.body;

    try {
        const db = await dbPromise;
        const collection = db.collection("preguntasfrecuentes");
        const result = await collection.insertOne({ pregunta, respuesta });
        if (result.acknowledged) {
            res.status(201).json({ mensaje: "Pregunta frecuente insertada exitosamente", id: result.insertedId });
        } else {
            res.status(400).send("No se pudo insertar la pregunta frecuente.");
        }
    } catch (error) {
        res.status(500).json({ mensaje: "Error al insertar la pregunta frecuente", error });
    }
});

//ACTUALIZAR
app.put('/api/preguntasfrecuentes/:id', async (req, res) => {
    const { id } = req.params;
    const { pregunta, respuesta } = req.body;

    try {
        const db = await dbPromise;
        const collection = db.collection("preguntasfrecuentes");
        const result = await collection.updateOne({ "_id": new ObjectId(id) }, { $set: { pregunta, respuesta } });

        if (result.modifiedCount === 1) {
            res.json({ mensaje: "Pregunta frecuente actualizada con éxito" });
        } else {
            res.status(404).send("Pregunta frecuente no encontrada.");
        }
    } catch (error) {
        res.status(500).json({ mensaje: "Error al actualizar la pregunta frecuente", error });
    }
});

//ELIMINAR
app.delete('/api/preguntasfrecuentes/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const db = await dbPromise;
        const collection = db.collection("preguntasfrecuentes");
        const result = await collection.deleteOne({ "_id": new ObjectId(id) });

        if (result.deletedCount === 1) {
            res.json({ mensaje: "Pregunta frecuente eliminada con éxito" });
        } else {
            res.status(404).send("Pregunta frecuente no encontrada.");
        }
    } catch (error) {
        res.status(500).json({ mensaje: "Error al eliminar la pregunta frecuente", error });
    }
});
// Obtener todas las preguntas frecuentes
app.get('/api/preguntasfrecuentes', async (req, res) => {
    try {
        const db = await dbPromise;
        const collection = db.collection("preguntasfrecuentes");
        const preguntasFrecuentes = await collection.find({}).toArray();
        res.json(preguntasFrecuentes);
    } catch (error) {
        console.error("Error al obtener las preguntas frecuentes:", error);
        res.status(500).send("Error interno del servidor");
    }
});
//Cargar las categorias de Quienes
app.get('/api/categoriasQuienes', async (req, res) => {
    const db = await dbPromise;
    const collection = db.collection("categoriasQuienes");
    // Asegúrate de que el nombre del campo aquí coincida con cómo está guardado en MongoDB
    const categorias = await collection.find({}, { projection: { Categoria: 1, _id: 0 } }).toArray();
    res.json(categorias.map(item => item.Categoria));
});
//insertar lo de quienes
app.post('/api/quienes', async (req, res) => {
    const { categorias, informacion } = req.body;
    try {
        const db = await dbPromise;
        const collection = db.collection("quienes");

        const infoData = { categorias, informacion };

        const result = await collection.insertOne(infoData);
        if (result.acknowledged) {
            res.status(201).send({ message: "Informacion agregada exitosamente", quienesId: result.insertedId });
        } else {
            res.status(400).send("No se pudo insertar la info.");
        }
    } catch (error) {
        console.error("Error al crear el producto:", error);
        res.status(500).send("Error interno del servidor");
    }
});
//obtener los quienes
app.get('/api/quienes', async (req, res) => {
    try {
        const db = await dbPromise;
        const collection = db.collection("quienes");
        const Quienes = await collection.find({}).toArray();
        res.json(Quienes);
    } catch (error) {
        console.error("Error al obtener las preguntas frecuentes:", error);
        res.status(500).send("Error interno del servidor");
    }
});
// API para eliminar la información por id
app.delete('/api/quienes/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const db = await dbPromise;
        const collection = db.collection("quienes");
        const result = await collection.deleteOne({ "_id": new ObjectId(id) });

        if (result.deletedCount === 1) {
            res.json({ mensaje: "quienes eliminada con éxito" });
        } else {
            res.status(404).send("quienes frecuente no encontrada.");
        }
    } catch (error) {
        res.status(500).json({ mensaje: "Error al quienes la pregunta frecuente", error });
    }
});

// API para actualizar la información
app.put('/api/quienes/:id', async (req, res) => {
    const { id } = req.params;
    const { categorias, informacion } = req.body;

    try {
        const db = await dbPromise;
        const collection = db.collection("quienes");
        const result = await collection.updateOne({ "_id": new ObjectId(id) }, { $set: { categorias, informacion } });

        if (result.modifiedCount === 1) {
            res.json({ mensaje: "Quienes actualizada con éxito" });
        } else {
            res.status(404).send("Quienes  no encontrada.");
        }
    } catch (error) {
        res.status(500).json({ mensaje: "Error al actualizar quienes", error });
    }
});

//insertar Incubadoras
app.post('/api/incubadoras', async (req, res) => {
    const { nombre, precio, dimension, descripcion, imagenUrl } = req.body;

    try {
        const db = await dbPromise;
        const collection = db.collection("incubadoras");

        // Añade color y tamano al objeto productoData
        const incubadorasData = { nombre, precio, dimension, descripcion, imagenUrl};

        const result = await collection.insertOne(incubadorasData);
        if (result.acknowledged) {
            res.status(201).send({ message: "Incubadora creada exitosamente", incubadoraId: result.insertedId });
        } else {
            res.status(400).send("No se pudo crear la incubadora.");
        }
    } catch (error) {
        console.error("Error al crear la incubadora:", error);
        res.status(500).send("Error interno del servidor");
    }
});
app.get('/api/incubadoras', async (req, res) => {
    try {
        const db = await dbPromise;
        const collection = db.collection("incubadoras");
        const incuba = await collection.find({}).toArray();
        res.json(incuba);
    } catch (error) {
        console.error("Error al obtener las incubadoras", error);
        res.status(500).send("Error interno del servidor");
    }
});


// Endpoint para vincular un dispositivo a un usuario por nombre de usuario
app.post('/api/vincularDispositivoPorNombre', async (req, res) => {
    const { nombreUsuario, idDispositivo } = req.body; // Cambia _id por idDispositivo

    try {
        const db = await dbPromise;
        const collectionUsuarios = db.collection("usuarios");
        const collectionDispositivos = db.collection("incubadoras");
  
        // Verificar si el dispositivo existe
        const dispositivoExiste = await collectionDispositivos.findOne({ "_id": new ObjectId(idDispositivo) });
        if (!dispositivoExiste) {
            return res.status(404).send({ message: "Dispositivo no encontrado." });
        }
  
        // Buscar al usuario por nombre y obtener su ID
        const usuario = await collectionUsuarios.findOne({ "Usuario": nombreUsuario });
        if (!usuario) {
            return res.status(404).send("Usuario no encontrado.");
        }
  
        // Vincular el dispositivo al usuario
        const result = await collectionUsuarios.updateOne(
            { "Usuario": nombreUsuario },
            { $addToSet: { dispositivos: new ObjectId(idDispositivo) } } // Asegúrate de que sea idDispositivo
        );
  
        if (result.modifiedCount === 1) {
            res.status(200).send({ message: "Dispositivo vinculado exitosamente al usuario." });
        } else {
            res.status(400).send({ message: "El dispositivo ya está vinculado a este usuario o no se pudo vincular." });
        }
    } catch (error) {
        console.error("Error al vincular el dispositivo:", error);
        res.status(500).send("Error interno del servidor.");
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

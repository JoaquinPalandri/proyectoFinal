const mqtt = require("mqtt");
const mysql = require('mysql');

// Configuración del cliente MQTT
const mqttBroker = 'wss://mqtt.eclipseprojects.io/mqtt'; // Cambiar al URI de tu broker MQTT
const client = mqtt.connect(mqttBroker, {
    clientId: 'node-client-' + Math.random()
});

client.on('connect', function () {
    console.log('Conectado al broker MQTT');
    // Suscribirse al tema para recibir mensajes
    client.subscribe('BetweenRivers/EquiposDuchaCama');
});

client.on('message', function (topic, message) {
    // Crear una conexión a la base de datos MySQL
    const connection = mysql.createConnection({
        host: 'monorail.proxy.rlwy.net',
        user: 'root',
        password: 'sDwrznjbJxwXPDMHKnXpUJWmVlGKtIym',
        database: 'railway',
        port: 15481
    });

    // Conectar a la base de datos MySQL
    connection.connect((err) => {
        if (err) {
            console.error('Error al conectar a la base de datos:', err.stack);
            return;
        }
        console.log('Conexión a la base de datos MySQL establecida');

        // Mensaje recibido del broker MQTT
        console.log('Mensaje recibido en el tema', topic, ':', message.toString());

        // Decodificar el mensaje
        const mensaje = message.toString();
        const partes = mensaje.split('//');

        // Verificar si el mensaje tiene la estructura esperada
        if (partes.length === 12 && partes[0] === 'inicio' && partes[11] === 'fin') {
            // Extraer datos del mensaje
            const codEquipo = partes[1];
            const id = partes[2];
            const fecha = partes[3];
            const retrolavado = partes[4];
            const conexion = partes[5];
            const tiempoUso = partes[6];
            const tiempoAsp = partes[7];
            const tiempoBaño = partes[8];
            const ciclos = partes[9];
            const temperatura = partes[10];

            // Función para guardar los datos decodificados en la base de datos
            const tabla = 'Equipo' + codEquipo;
            const fechaMySQL = convertirFecha(fecha);
            const sql = `INSERT INTO ${tabla} (id, fecha, retrolavado, conexion, tiempoUso, tiempoAsp, tiempoBaño, ciclos, temperatura) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            const values = [id, fechaMySQL, retrolavado, conexion, tiempoUso, tiempoAsp, tiempoBaño, ciclos, temperatura];

            connection.query(sql, values, (err, result) => {
                if (err) {
                    console.error('Error al insertar datos en la base de datos:', err.stack);
                    return;
                }
                console.log('Datos insertados en la base de datos');
            });
        } else {
            console.log('Mensaje no válido');
        }

        // Cerrar la conexión a la base de datos
        connection.end();
    });
});

// Convertir la fecha al formato MySQL DATE
function convertirFecha(fecha) {
    // Dividir la cadena de fecha en día, mes y año
    const partesFecha = fecha.split('-');
    const dia = partesFecha[0];
    const mes = partesFecha[1];
    const anio = partesFecha[2];

    // Crear una nueva fecha en el formato "YYYY-MM-DD"
    const fechaMySQL = `${anio}-${mes}-${dia}`;

    return fechaMySQL;
}
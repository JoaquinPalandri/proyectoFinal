const mqtt = require("mqtt");
const mysql = require("mysql");

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
        const conexionMensaje = partes[5];  // Usar un nombre diferente
        const tiempoUso = partes[6];
        const tiempoAsp = partes[7];
        const tiempoBaño = partes[8];
        const ciclos = partes[9];
        const temperatura = partes[10];

        // Crear conexión a la base de datos MySQL
        const conexionDB = mysql.createConnection({
            host: "boczfz9qtkrjwks7pcyg-mysql.services.clever-cloud.com",
            database: "boczfz9qtkrjwks7pcyg",
            user: "uyvaseavx4jwx0ly",
            password: "1UbO1UYZfUkPx29ijloL",
        });

        // Insertar datos en la base de datos
        const query = `INSERT INTO Equipo333 (id, retrolavado, conexion, tiempoUso, tiempoAsp, tiempoBaño, ciclos, temperatura) VALUES ('${id}', '${retrolavado}', '${conexionMensaje}', '${tiempoUso}', '${tiempoAsp}', '${tiempoBaño}', '${ciclos}', '${temperatura}')`;

        conexionDB.connect(function (err) {
            if (err) {
                throw err;
            } else {
                // Ejecutar la consulta
                conexionDB.query(query, function (error, results, fields) {
                    if (error) {
                        console.log(error);
                        throw error;
                    } else {
                        console.log("Datos insertados correctamente");
                    }
                    // Cerrar la conexión después de la consulta
                    conexionDB.end();
                });
            }
        });

    } else {
        console.error('El mensaje no tiene la estructura esperada');
    }
});

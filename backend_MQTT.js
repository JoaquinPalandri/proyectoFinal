const mqtt = require("mqtt");
const mysql= require("mysql");

let conexion = mysql.createConnection({
    host: "localhost",
    database:"betriv_bd",
    user:"root",
    password:"",
    
})

conexion.connect(function(err){
    if(err){
        throw err;
    } else{
        console.log("conexion exitosa");
    }
})
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

        // Aquí puedes agregar la lógica para manejar los datos extraídos
        console.log('Código de equipo:', codEquipo);
        console.log('ID:', id);
        console.log('Fecha:', fecha);
        console.log('Retrolavado:', retrolavado);
        console.log('Conexión:', conexion);
        console.log('Tiempo de uso:', tiempoUso);
        console.log('Tiempo de aspirado:', tiempoAsp);
        console.log('Tiempo de baño:', tiempoBaño);
        console.log('Ciclos:', ciclos);
        console.log('Temperatura:', temperatura);
    } else {
        console.error('El mensaje no tiene la estructura esperada');
    }
});

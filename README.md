# `🤖AkR-Bot🤖`
Bot enfocado solamente para la administración de grupos de Whatsapp para jugadores de Tibia.

### `—◉ 👑 DUDAS SOBRE EL BOT?, CONTACTAME 👑`
<a href="http://wa.me/528251002140" target="blank"><img src="https://img.shields.io/badge/ACKOR-25D366?style=for-the-badge&logo=whatsapp&logoColor=white" /></a>

### `—◉ 🧿 COMANDOS 🧿`
![img](https://i.imgur.com/1acZqod.png)

### `—◉ ⚙️ AJUSTES ⚙️`
- CLONAR EL REPOSITORIO [Aqui](https://github.com/AckorEXE/AkR-Bot/fork)

### `—◉ 👾 ACTIVAR EN UBUNTU 20.04 👾`
ESCRIBE LOS SIGUIENTES COMANDOS UNO POR UNO:
1.- Actualizando el servidor e installando NodeJS
```bash
sudo apt-get update && sudo apt-get upgrade
sudo apt install npm
```
2.- Clonando el repositorio
```bash
git clone https://github.com/AckorEXE/AkR-Bot.git
```
3.- Dirigiendo a la carpeta e instalando las dependencias y librerías
```bash
cd AkR-Bot
npm install
npm start
```
4.- Una vez iniciado y generado nuestro código QR hacemos una conexión para tenerla lista
5.- Después cerramos el script con Ctrl + C y nos dirigimos a la raíz principal de nuestro servidor utilizando múltiples veces el comando cd

### `—◉ ✔️ CREAR SERVICIO DE EJECUCIÓN AUTOMATICA ✔️`
1.- Dentro del archivo de servicio colocamos el siguiente contenido
```bash
[Unit]
Description=AkR-Bot
After=network.target

[Service]
ExecStart=/usr/bin/node /home/ubuntu/AkR-Bot/index.js
WorkingDirectory= /home/ubuntu/AkR-Bot
Restart=always
User=ubuntu
Environment=PATH=/usr/bin:/usr/local/bin
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```
VALORES A MODIFICAR DEPENDIENDO SEA EL CASO
• ExecStart=/usr/bin/node /ruta-a-tu-archivo-del-bot.js
• WorkingDirectory=/ruta-a-la-carpeta-del-bot
• User=usuario

### `—◉ 🤔 NO CONOCES LA RUTA DEL ARCHIVO? 🤔`
1.- Si no conoces la ruta puedes navegar hasta la carpeta del bot utilizando los comandos
• ls  // Sirve para ver todas las carpetas y contenido de la ruta actual
• cd  // Sirve para posicionarte dentro de una carpeta
2.- Una vez dentro de la ruta utilizamos el siguiente comando para obtener la ruta en especifico
• pwd
3.- Teniendo el contenido del archivo modificado y pegado, guardamos y cerramos presinando Ctrl + O, seguido de Enter y luego Ctrl + X.

### `—◉ ⚙️ RECARGA SYSTEMD PARA RECONOCER EL NUEVO ARCHIVO Y HABILITAR SU INICIO AUTOMÁTICO ⚙️`
```bash
> sudo systemctl daemon-reload
> sudo systemctl start AkR-Bot
> sudo systemctl status AkR-Bot
> sudo systemctl enable AkR-Bot
```

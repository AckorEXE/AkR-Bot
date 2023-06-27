/* Requiere la libreria qrcode-terminal para generar el codigo QR */
const qrcode = require('qrcode-terminal');

// Crea una sesion de whatsapp-web y la guarda localmente para autentificarse solo una vez por QR */
const { Client, LocalAuth } = require('whatsapp-web.js');
const client = new Client({
    authStrategy: new LocalAuth()
});

/* Genera el codigo QR para conectarse */
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

/* Muestra un mensaje si la conexion fue exitosa */
client.on('ready', () => {
    console.log('🤖...Conexión exitosa!');
});

/* Crea una variable para asignar los minutos en el tiempo de espera de eliminar mensaje */
const tiempoEspera = 20;


/* MENU */
client.on('message', async (msg) => {
    if (msg.body === '!menu') {
        const chat = await msg.getChat();
        const contacto = await msg.getContact();

        // Verifica si el chat es un grupo
        if (chat.isGroup) {
            msg.react('🤖');
            const sentMessage = await msg.reply(`┌─ [ 🤖𝕏𝕜ℝ-𝔹𝕠𝕥🤖 ]\n
├ ⭐ 𝘔𝘌𝘕𝘜 𝘋𝘌𝘓 𝘉𝘖𝘛:
├ 💎 !mp <texto>
├ 💎 !kick <usuario>
├ 💎 !link
├ 💎 !item <nombre>
└───────────`);
            await sentMessage.react('💛');
            // Establece un temporizador para auto eliminar el mensaje...
            setTimeout(async () => {
                await sentMessage.delete(true); // Elimina el mensaje para todos
            }, tiempoEspera * 1000 * 60);
        }
    }
});


/* MASSPOKE */
client.on('message', async (msg) => {
    if (msg.body.startsWith('!mp')) {
        const chat = await msg.getChat();
        const contacto = await msg.getContact();

        // Verifica si el chat es un grupo
        if (chat.isGroup) {
            msg.react('🤖');
            // Verifica si el remitente es un administrador
            const { isAdmin, isSuperAdmin: isOwner } = chat.participants.find(participant => participant.id._serialized == contacto.id._serialized);
            if (isAdmin || isOwner) {
                let text = `💢𝘔𝘈𝘚𝘚 𝘗𝘖𝘒𝘌💢\n🛎 ${msg.body.slice(4).trim()}\n\n🧙🏻‍♂ 𝘗𝘓𝘈𝘠𝘌𝘙𝘚:`;
                let mentions = [];
                // Obtiene la lista de todos los contactos
                for (let participant of chat.participants) {
                    const contact = await client.getContactById(participant.id._serialized);
                    // Genera la lista de los contactos
                    mentions.push(contact);
                    text += `\n┣➥ @${participant.id.user}`;
                }
                // Envia la lista de los contactos y el mensaje, añade una reacción al msg
                const sentMessage = await chat.sendMessage(text, { mentions });
                await sentMessage.react('❤️');

                // Establece un temporizador para auto eliminar el mensaje...
                setTimeout(async () => {
                    await sentMessage.delete(true); // Elimina el mensaje para todos
                }, tiempoEspera * 1000 * 60);
            } else {
                // El remitente no es un administrador
                const sentMessage = await msg.reply('Este comando solo puede ser utilizado por admins del grupo.');
                await sentMessage.react('❎');
                setTimeout(async () => {
                    await sentMessage.delete(true); // Elimina el mensaje para todos
                }, tiempoEspera * 1000 * 60);
            }
        }
    }
});


/* LINK DEL GRUPO */
client.on('message', async (msg) => {
    if (msg.body === '!link') {
        const chat = await msg.getChat();
        const contacto = await msg.getContact();

        // Verifica si el chat es un grupo
        if (chat.isGroup) {
            msg.react('🤖');
            // Verifica si el remitente es un administrador
            const { isAdmin, isSuperAdmin: isOwner } = chat.participants.find(participant => participant.id._serialized == contacto.id._serialized);
            if (isAdmin || isOwner) {
                // Obtiene el codigo del grupo
                const codigoGrupo = await chat.getInviteCode();
                // Envia el codigo del grupo
                const sentMessage = await msg.reply(`El enlace de invitación al grupo es:\n https://chat.whatsapp.com/${codigoGrupo}`);
                await sentMessage.react('✅');

                // Establece un temporizador para auto eliminar el mensaje...
                setTimeout(async () => {
                    await sentMessage.delete(true); // Elimina el mensaje para todos
                }, tiempoEspera * 1000 * 60);

            } else {
                // El remitente no es un administrador
                const sentMessage = await msg.reply('Este comando solo puede ser utilizado por admins del grupo.');
                await sentMessage.react('❎');
                setTimeout(async () => {
                    await sentMessage.delete(true); // Elimina el mensaje para todos
                }, tiempoEspera * 1000 * 60);
            }
        }
    }
});


/* KICK A UN PARTICIPANTE (expulsa persona de un grupo) */
client.on('message', async (msg) => {
    if (msg.body.startsWith('!kick')) {
        const chat = await msg.getChat();
        const contacto = await msg.getContact();

        // Verifica si el chat es un grupo
        if (chat.isGroup) {
            msg.react('🤖');
            // Verifica si el remitente es un administrador
            const { isAdmin, isSuperAdmin: isOwner } = chat.participants.find(participant => participant.id._serialized == contacto.id._serialized);
            if (isAdmin || isOwner) {
                const mentionedParticipants = msg.mentionedIds;
                if (mentionedParticipants.length === 0) {
                    // No se mencionó a ningún participante para expulsar
                    const sentMessage = await msg.reply('Debes mencionar a un participante para expulsarlo.');
                    await sentMessage.react('🤔');
                    setTimeout(async () => {
                        await sentMessage.delete(true); // Elimina el mensaje para todos
                    }, tiempoEspera * 1000 * 60);
                } else {
                    // Expulsa a los participantes mencionados
                    for (const participantId of mentionedParticipants) {
                        await chat.removeParticipants([participantId]);
                    }
                    const sentMessage = await msg.reply('Participantes expulsados exitosamente.');
                    await sentMessage.react('😂');
                    setTimeout(async () => {
                        await sentMessage.delete(true); // Elimina el mensaje para todos
                    }, tiempoEspera * 1000 * 60);
                }
            } else {
                // El remitente no es un administrador
                const sentMessage = await msg.reply('Este comando solo puede ser utilizado por admins del grupo.');
                await sentMessage.react('❎');
                setTimeout(async () => {
                    await sentMessage.delete(true); // Elimina el mensaje para todos
                }, tiempoEspera * 1000 * 60);
            }
        }
    }
});


/* AÑADIR PARTICIPANTES (personas al grupo) 
client.on('message', async (msg) => {
    if (msg.body.startsWith('!add')) {
        const chat = await msg.getChat();
        const contacto = await msg.getContact();

        // Verifica si el chat es un grupo
        if (chat.isGroup) {
            msg.react('🤖');
            // Verifica si el remitente es un administrador
            const { isAdmin, isSuperAdmin: isOwner } = chat.participants.find(participant => participant.id._serialized == contacto.id._serialized);
            if (isAdmin || isOwner) {
                const phoneNumber = msg.body.slice(5).trim(); // Obtener el número de teléfono del mensaje

                // Verificar si el número de teléfono es válido
                if (phoneNumber.match(/^\+\d{1,14}$/)) {
                    try {
                        await chat.addParticipants([phoneNumber]);
                        const sentMessage = await msg.reply('Participante añadido exitosamente.');
                        await sentMessage.react('✅');
                        setTimeout(async () => {
                            await sentMessage.delete(true); // Elimina el mensaje para todos
                        }, tiempoEspera * 1000 * 60);
                    } catch (error) {
                        const sentMessage = await msg.reply('No se pudo añadir al participante. Asegúrate de que el número de teléfono sea válido.');
                        await sentMessage.react('❌');
                        setTimeout(async () => {
                            await sentMessage.delete(true); // Elimina el mensaje para todos
                        }, tiempoEspera * 1000 * 60);
                    }
                } else {
                    const sentMessage = await msg.reply('El formato del número de teléfono no es válido. Asegúrate de que tenga el formato adecuado, por ejemplo, "+1234567890".');
                    await sentMessage.react('❌');
                    setTimeout(async () => {
                        await sentMessage.delete(true); // Elimina el mensaje para todos
                    }, tiempoEspera * 1000 * 60);
                }
            } else {
                const sentMessage = await msg.reply('Este comando solo puede ser utilizado por admins del grupo.');
                await sentMessage.react('❎');
                setTimeout(async () => {
                    await sentMessage.delete(true); // Elimina el mensaje para todos
                }, tiempoEspera * 1000 * 60);
            }
        }
    }
});
*/

/* TIBIA ITEM */
const axios = require('axios');
const cheerio = require('cheerio');

client.on('message', async (msg) => {
    if (msg.body.startsWith('!item')) {
        const chat = await msg.getChat();

        // Verifica si el chat es un grupo
        if (chat.isGroup) {
            msg.react('🤖');
            const item = msg.body.split(' ').slice(1).join('-'); // Obtener el nombre del item después de "!item"
            const url = `https://tiblioteca.com/item/${encodeURIComponent(item)}`;

            try {
                const response = await axios.get(url);
                const $ = cheerio.load(response.data);

                // Obtener la información de los elementos con la clase "col text-start bg-texto-verde"
                const verdeInfo = $('.col.text-start.bg-texto-verde').text().trim();

                // Obtener el texto del primer elemento "li" dentro de la clase "list-group"
                const listDropped = $('.list-group li').first().clone().children('strong').remove().end().text().trim();

                let info = '';
                if (verdeInfo) {
                    info += verdeInfo + '\n\n';
                }
                if (listDropped) {
                    info += `*Dropped by:* ${listDropped}`;
                }

                if (info) {
                    const sentMessage = await msg.reply(`${info}\n🔎 ${url}`);
                    await sentMessage.react('📚');
                    setTimeout(async () => {
                        await sentMessage.delete(true); // Elimina el mensaje para todos
                    }, tiempoEspera * 1000 * 60);
                } else {
                    const sentMessage = await msg.reply('No se encontró información para ese item.');
                    await sentMessage.react('❌');
                    setTimeout(async () => {
                        await sentMessage.delete(true); // Elimina el mensaje para todos
                    }, tiempoEspera * 1000 * 60);
                }
            } catch (error) {
                // Error al obtener la información del item
                const sentMessage = await msg.reply('No se pudo obtener la información del item.');
                await sentMessage.react('❌');
                setTimeout(async () => {
                    await sentMessage.delete(true); // Elimina el mensaje para todos
                }, tiempoEspera * 1000 * 60);
            }
        }
    }
});

client.initialize();

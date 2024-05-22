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

/* COMMANDS */
client.on('message', async (msg) => {
    if (msg.body === '!commands' || msg.body === '!help' || msg.body === '!menu') {
        const chat = await msg.getChat();

        // Verifica si el chat es un grupo
        if (chat.isGroup) {
            msg.react('⏳');
            const sentMessage = await msg.reply(`┌─ [ 🤖Commands🤖 ]
├ 💎 !mp <texto>
├ 💎 !kick <usuario>
├ 💎 !sticker <video o imagen>
├ 💎 !item <nombre>
├ 💎 !monster <nombre>
└───────────`);
	    msg.react('🤖');
            await sentMessage.react('💛');
        }
    }
});

/* STICKERS CREATOR */
const { MessageMedia } = require('whatsapp-web.js');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const fs = require('fs');
const path = require('path');

ffmpeg.setFfmpegPath(ffmpegPath);

client.on('message', async (msg) => {
    if (msg.body === '!sticker' && (msg.hasMedia || msg.hasQuotedMsg)) {
        const chat = await msg.getChat();

        if (chat.isGroup) {
            await msg.react('⏳');

            try {
                let media;
                if (msg.hasMedia) {
                    media = await msg.downloadMedia();
                } else if (msg.hasQuotedMsg) {
                    const quotedMsg = await msg.getQuotedMessage();
                    if (quotedMsg.hasMedia) {
                        media = await quotedMsg.downloadMedia();
                    }
                }

                if (media) {
                    const fileName = `sticker_${Date.now()}`;
                    const tempDir = path.join(__dirname, 'temp');
                    if (!fs.existsSync(tempDir)) {
                        fs.mkdirSync(tempDir);
                    }
                    const inputPath = path.join(tempDir, `${fileName}_input.${media.mimetype.split('/')[1]}`);
                    const outputPath = path.join(tempDir, `${fileName}_output.webp`);

                    fs.writeFileSync(inputPath, Buffer.from(media.data, 'base64'));

                    const isVideo = media.mimetype.startsWith('video/');

                    ffmpeg(inputPath)
                        .outputOptions([
                            '-vcodec', 'libwebp',
                            '-vf', 'scale=512:512:force_original_aspect_ratio=decrease,fps=15',
                            '-lossless', '0',
                            '-compression_level', '6',
                            '-q:v', '80',
                            '-loop', '0',
                            '-preset', 'default',
                        ])
                        .outputOptions(isVideo ? ['-an', '-t', '4'] : [])
                        .toFormat('webp')
                        .output(outputPath)
                        .on('end', async () => {
                            const stickerMedia = MessageMedia.fromFilePath(outputPath);

                            const sentMessage = await msg.reply(stickerMedia, null, { sendMediaAsSticker: true, stickerName: 'AkR-Bot', stickerAuthor: 'Ackor' });
                            fs.unlinkSync(inputPath);
                            fs.unlinkSync(outputPath);
                            await msg.react('🤖');
                            await sentMessage.react('🖼️');
                        })
                        .on('error', async (error) => {
                            console.error('Error processing sticker:', error);
                            const errorMessage = await msg.reply('Error al procesar el sticker.');
                            await msg.react('🤖');
                            await errorMessage.react('❌');
                            fs.unlinkSync(inputPath);
                            if (fs.existsSync(outputPath)) {
                                fs.unlinkSync(outputPath);
                            }
                        })
                        .run();
                } else {
                    const errorMessage = await msg.reply('No hay ningún archivo para crear un sticker.');
                    await msg.react('🤖');
                    await errorMessage.react('❌');
                }
            } catch (error) {
                console.error('Error processing sticker:', error);
                const errorMessage = await msg.reply('Error al procesar el sticker.');
                await msg.react('🤖');
                await errorMessage.react('❌');
            }
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
            msg.react('⏳');
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
		msg.react('🤖');
                await sentMessage.react('❤️');
            } else {
                // El remitente no es un administrador
                const sentMessage = await msg.reply('Este comando solo puede ser utilizado por admins del grupo.');
		msg.react('🤖');
                await sentMessage.react('❎');
            }
        }
    }
});


/* LINK DEL GRUPO
client.on('message', async (msg) => {
    if (msg.body === '!link') {
        const chat = await msg.getChat();
        const contacto = await msg.getContact();

        // Verifica si el chat es un grupo
        if (chat.isGroup) {
            msg.react('⏳');
            // Verifica si el remitente es un administrador
            const { isAdmin, isSuperAdmin: isOwner } = chat.participants.find(participant => participant.id._serialized == contacto.id._serialized);
            if (isAdmin || isOwner) {
                // Obtiene el codigo del grupo
                const codigoGrupo = await chat.getInviteCode();
                // Envia el codigo del grupo
                const sentMessage = await msg.reply(`El enlace de invitación al grupo es:\n https://chat.whatsapp.com/${codigoGrupo}`);
		msg.react('🤖');
                await sentMessage.react('✅');
            } else {
                // El remitente no es un administrador
                const sentMessage = await msg.reply('Este comando solo puede ser utilizado por admins del grupo.');
		msg.react('🤖');
                await sentMessage.react('❎');
            }
        }
    }
});
*/


/* KICK A UN PARTICIPANTE (expulsa persona de un grupo) */
client.on('message', async (msg) => {
    if (msg.body.startsWith('!kick')) {
        const chat = await msg.getChat();
        const contacto = await msg.getContact();

        // Verifica si el chat es un grupo
        if (chat.isGroup) {
            msg.react('⏳');
            // Verifica si el remitente es un administrador
            const { isAdmin, isSuperAdmin: isOwner } = chat.participants.find(participant => participant.id._serialized == contacto.id._serialized);
            if (isAdmin || isOwner) {
                const mentionedParticipants = msg.mentionedIds;
                if (mentionedParticipants.length === 0) {
                    // No se mencionó a ningún participante para expulsar
                    const sentMessage = await msg.reply('Debes mencionar a un participante para expulsarlo.');
		    msg.react('🤖');
                    await sentMessage.react('🤔');
                } else {
                    // Expulsa a los participantes mencionados
                    for (const participantId of mentionedParticipants) {
                        await chat.removeParticipants([participantId]);
                    }
                    const sentMessage = await msg.reply('Participantes expulsados exitosamente.');
                    msg.react('🤖');
                    await sentMessage.react('😂');
                }
            } else {
                // El remitente no es un administrador
                const sentMessage = await msg.reply('Este comando solo puede ser utilizado por admins del grupo.');
                msg.react('🤖');
                await sentMessage.react('❎');
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
                    } catch (error) {
                        const sentMessage = await msg.reply('No se pudo añadir al participante. Asegúrate de que el número de teléfono sea válido.');
                        await sentMessage.react('❌');
                    }
                } else {
                    const sentMessage = await msg.reply('El formato del número de teléfono no es válido. Asegúrate de que tenga el formato adecuado, por ejemplo, "+1234567890".');
                    await sentMessage.react('❌');
                }
            } else {
                const sentMessage = await msg.reply('Este comando solo puede ser utilizado por admins del grupo.');
                await sentMessage.react('❎');
            }
        }
    }
});
*/

/* GUILD NAMES */
client.on('message', async (msg) => {
    if (msg.body.startsWith('!guild')) {
        const chat = await msg.getChat();

        // Verifica si el chat es un grupo
        if (chat.isGroup) {
            msg.react('⏳');
            const url = msg.body.split(' ')[1]; // Obtener la URL después de "!guild"

            try {
                const response = await axios.get(url);
                const $ = cheerio.load(response.data);
                const names = [];

                // Buscar en toda la página los elementos tr que contengan un td con clase "onlinestatus" y un td con un enlace que contenga "&name="
                $('tr').each((index, element) => {
                    const $tds = $(element).find('td');
                    const hasOnlineStatus = $tds.hasClass('onlinestatus');
                    const hasLink = $tds.find('a[href*="&name="]').length > 0;
                    if (hasOnlineStatus && hasLink) {
                        const href = $tds.find('a[href*="&name="]').attr('href');
                        const name = decodeURIComponent(href.split('=')[2]).replace(/\+/g, ' ');
                        if (!names.includes(name)) { // Verificar si el nombre ya ha sido agregado
                            names.push(name);
                        }
                    }
                });

                // Formatear los nombres
                const formattedNames = names.join(';\n') + ';';

                if (formattedNames) {
                    const sentMessage = await msg.reply(`${formattedNames}`);
                    await sentMessage.react('🔰');
		    msg.react('🤖');
                    // No incluir aquí la función de eliminación del mensaje
                } else {
                    const sentMessage = await msg.reply('No se encontraron nombres en la página.');
		    msg.react('🤖');
                    await sentMessage.react('❌');
                    // No incluir aquí la función de eliminación del mensaje
                }
            } catch (error) {
                // Error al obtener la información de la página
                const sentMessage = await msg.reply('No se pudo obtener la información de la página.');
		msg.react('🤖');
                await sentMessage.react('❌');
                // No incluir aquí la función de eliminación del mensaje
            }
        }
    }
});


/* TIBIA MONSTERS */
client.on('message', async msg => {
    if (msg.body.startsWith('!monster ')) {
        const chat = await msg.getChat();

        // Verifica si el chat es un grupo
        if (chat.isGroup) {
            msg.react('⏳');
            const monsterName = msg.body.split(' ').slice(1).join(' ');
            try {
                const response = await axios.get(`https://api.tibiadata.com/v4/creature/${encodeURIComponent(monsterName)}`);
                const monsterData = response.data.creature;

                if (monsterData) {
                    const {
                        name,
                        hitpoints,
                        experience_points,
                        immune,
                        strong,
                        weakness,
                        loot_list = [],
                        image_url
                    } = monsterData;

                    const elements = ['fire', 'ice', 'energy', 'earth', 'physical', 'holy', 'death', 'drown', 'life drain', 'mana drain'];

                    const damageTaken = elements
                        .reduce((acc, element) => {
                            if (weakness?.includes(element)) {
                                acc.weak.push(element);
                            } else if (immune?.includes(element)) {
                                acc.immune.push(element);
                            } else if (strong?.includes(element)) {
                                acc.strong.push(element);
                            }
                            return acc;
                        }, { weak: [], immune: [], strong: [] });

                    const formattedDamageTaken = `🚫Inmune a: ${damageTaken.immune.length ? damageTaken.immune.join(', ') : 'none'}
💪🏻Fuerte para: ${damageTaken.strong.length ? damageTaken.strong.join(', ') : 'none'}
💔Débil a: ${damageTaken.weak.length ? damageTaken.weak.join(', ') : 'none'}`;

                    const SentMessage = await msg.reply(`*${name}*
💖Health: ${hitpoints}
🌟Experience: ${experience_points}

*Daño recibido de los elementos:*
${formattedDamageTaken}

🎁*Loot:*
${loot_list.join(', ')}

More info: ${image_url}`);
                    msg.react('🤖');
                    await SentMessage.react('🏹');
                    
                } else {
                    const sentMessage = await msg.reply('No se encontró información para ese monster.');
		    msg.react('🤖');
                    await sentMessage.react('❌');
                }
            } catch (error) {
                const sentMessage = await msg.reply('No se pudo obtener la información del monster.');
		msg.react('🤖');
                await sentMessage.react('❌');
            }
        }
    }
});


/* TIBIA ITEM */
const axios = require('axios');
const cheerio = require('cheerio');

client.on('message', async (msg) => {
    if (msg.body.startsWith('!item')) {
        const chat = await msg.getChat();

        // Verifica si el chat es un grupo
        if (chat.isGroup) {
            msg.react('⏳');
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
		    msg.react('🤖');
                    await sentMessage.react('📚');
                    // No incluir aquí la función de eliminación del mensaje
                } else {
                    const sentMessage = await msg.reply('No se encontró información para ese item.');
		    msg.react('🤖');
                    await sentMessage.react('❌');
                    // No incluir aquí la función de eliminación del mensaje
                }
            } catch (error) {
                // Error al obtener la información del item
                const sentMessage = await msg.reply('No se pudo obtener la información del item.');
		msg.react('🤖');
                await sentMessage.react('❌');
                // No incluir aquí la función de eliminación del mensaje
            }
        }
    }
});

client.initialize();

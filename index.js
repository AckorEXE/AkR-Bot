const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const axios = require('axios');
const cheerio = require('cheerio');

const client = new Client({
    authStrategy: new LocalAuth()
});

const commandTimestamps = {};

// Function to check and update command delay
function checkCommandDelay(userId, command) {
    const currentTime = Date.now();
    if (!commandTimestamps[userId]) {
        commandTimestamps[userId] = {};
    }
    if (commandTimestamps[userId][command]) {
        const elapsedTime = currentTime - commandTimestamps[userId][command];
        if (elapsedTime < 10000) {
            const remainingTime = ((10000 - elapsedTime) / 1000).toFixed(1);
            return { allowed: false, remainingTime };
        }
    }
    commandTimestamps[userId][command] = currentTime;
    return { allowed: true };
}

// Generate QR code
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

/* Muestra un mensaje si la conexion fue exitosa */
client.on('ready', () => {
    console.log(` █████╗ ██╗  ██╗██████╗       ██████╗  ██████╗ ████████╗
██╔══██╗██║ ██╔╝██╔══██╗      ██╔══██╗██╔═══██╗╚══██╔══╝
███████║█████╔╝ ██████╔╝█████╗██████╔╝██║   ██║   ██║   
██╔══██║██╔═██╗ ██╔══██╗╚════╝██╔══██╗██║   ██║   ██║   
██║  ██║██║  ██╗██║  ██║      ██████╔╝╚██████╔╝   ██║   
╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝      ╚═════╝  ╚═════╝    ╚═╝   \nConexión exitosa!\n`);
});

/* COMMANDS */
client.on('message', async (msg) => {
    if (msg.body === '!commands' || msg.body === '!help' || msg.body === '!menu') {
        const chat = await msg.getChat();
        const userId = msg.author || msg.from;

        const { allowed, remainingTime } = checkCommandDelay(userId, 'commands');

        if (chat.isGroup) {
            if (!allowed) {
                const sentMessage = await msg.reply(`Por favor espera ${remainingTime} segundos antes de usar el comando de nuevo.`);
                await sentMessage.react('⏱');
                msg.react('⏱');
                return;
            }
            msg.react('⏳');
            const sentMessage = await msg.reply(`┌─ [ 🤖Commands🤖 ]
*🔸 Comandos para grupos:*
├ 💎 !mp <texto>
├ 💎 !link
├ 💎 !kick <usuario>
│
*🔸 Comandos multimedia:*
├ 💎 !sticker, !s <multimedia>
│
*🔸 Comandos para Tibia:*
├ 💎 !item <nombre>
├ 💎 !monster <nombre>
├ 💎 !elfbot
└───────────`);
            msg.react('🤖');
            await sentMessage.react('💛');
        }
    }
});

/* ELFBOT*/
client.on('message', async (msg) => {
    if (msg.body === '!elfbot') {
        const chat = await msg.getChat();
        const userId = msg.author || msg.from;

        const { allowed, remainingTime } = checkCommandDelay(userId, 'elfbot');

        if (chat.isGroup) {
            if (!allowed) {
                const sentMessage = await msg.reply(`Por favor espera ${remainingTime} segundos antes de usar el comando de nuevo.`);
                await sentMessage.react('⏱');
                msg.react('⏱');
                return;
            }
            msg.react('⏳');
            const sentMessage = await msg.reply(`🐸*Ingrese a este link para descargar el Elfbot (No necesita crackearse).*
https://www.mediafire.com/file/iahkvgwwnopmcxk/ElfBot_NG_4.5.9.rar/file`);
            msg.react('🤖');
            await sentMessage.react('💚');
        }
    }
});

/* LINK */
client.on('message', async (msg) => {
    if (msg.body === '!link') {
        const chat = await msg.getChat();
	const contacto = await msg.getContact();
        const userId = msg.author || msg.from;

        const { allowed, remainingTime } = checkCommandDelay(userId, 'link');

        if (chat.isGroup) {
            if (!allowed) {
                const sentMessage = await msg.reply(`Por favor espera ${remainingTime} segundos antes de usar el comando de nuevo.`);
                await sentMessage.react('⏱');
                msg.react('⏱');
                return;
            }
            msg.react('⏳');
            const { isAdmin, isSuperAdmin: isOwner } = chat.participants.find(participant => participant.id._serialized == contacto.id._serialized);
            if (isAdmin || isOwner) {
                const inviteCode = await chat.getInviteCode();
                const inviteLink = `Abre este enlace para unirte a mi grupo de WhatsApp: https://chat.whatsapp.com/${inviteCode}`;
                const sentMessage = await msg.reply(inviteLink);
                msg.react('🔗');
                await sentMessage.react('💙');
            } else {
                const sentMessage = await msg.reply('Este comando solo puede ser utilizado por administradores del grupo.');
                msg.react('🤖');
                await sentMessage.react('❎');
            }
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
    if ((msg.body === '!sticker' || msg.body === '!s')  && (msg.hasMedia || msg.hasQuotedMsg)) {
        const chat = await msg.getChat();
        const userId = msg.author || msg.from;

        const { allowed, remainingTime } = checkCommandDelay(userId, 'sticker');

        if (chat.isGroup) {
            if (!allowed) {
                const sentMessage = await msg.reply(`Por favor espera ${remainingTime} segundos antes de usar el comando de nuevo.`);
                await sentMessage.react('⏱');
                msg.react('⏱');
                return;
            }
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

/* MASSPOKE OLD
client.on('message', async (msg) => {
    if (msg.body.startsWith('!mp')) {
        const chat = await msg.getChat();
        const contacto = await msg.getContact();
        const userId = msg.author || msg.from;

        const { allowed, remainingTime } = checkCommandDelay(userId, 'mp');

        if (chat.isGroup) {
            if (!allowed) {
                const sentMessage = await msg.reply(`Por favor espera ${remainingTime} segundos antes de usar el comando de nuevo.`);
                await sentMessage.react('⏱');
                msg.react('⏱');
                return;
            }
            msg.react('⏳');
            const { isAdmin, isSuperAdmin: isOwner } = chat.participants.find(participant => participant.id._serialized == contacto.id._serialized);
            if (isAdmin || isOwner) {
                let text = `💢𝘔𝘈𝘚𝘚 𝘗𝘖𝘒𝘌💢\n🛎 ${msg.body.slice(4).trim()}\n\n🧙🏻‍♂ 𝘗𝘓𝘈𝘠𝘌𝘙𝘚:`;
                let mentions = [];
                for (let participant of chat.participants) {
                    const contact = await client.getContactById(participant.id._serialized);
                    mentions.push(contact);
                    text += `\n┣➥ @${participant.id.user}`;
                }
                const sentMessage = await chat.sendMessage(text, { mentions });
                msg.react('🤖');
                await sentMessage.react('❤️');
            } else {
                const sentMessage = await msg.reply('Este comando solo puede ser utilizado por admins del grupo.');
                msg.react('🤖');
                await sentMessage.react('❎');
            }
        }
    }
});
*/

/* MASSPOKE */
client.on('message', async (msg) => {
    if (msg.body.startsWith('!mp')) {
        const chat = await msg.getChat();
        const contacto = await msg.getContact();
        const userId = msg.author || msg.from;

        const { allowed, remainingTime } = checkCommandDelay(userId, 'mp');

        if (chat.isGroup) {
            if (!allowed) {
                const sentMessage = await msg.reply(`Por favor espera ${remainingTime} segundos antes de usar el comando de nuevo.`);
                await sentMessage.react('⏱');
                msg.react('⏱');
                return;
            }
            msg.react('⏳');
            const { isAdmin, isSuperAdmin: isOwner } = chat.participants.find(participant => participant.id._serialized == contacto.id._serialized);
            if (isAdmin || isOwner) {
                let text = `💢𝘔𝘈𝘚𝘚 𝘗𝘖𝘒𝘌💢\n🛎 ${msg.body.slice(4).trim()}`; // Solo el texto visible
                let mentions = [];
                
                // Agregar todos los participantes a las menciones
                for (let participant of chat.participants) {
                    const contact = await client.getContactById(participant.id._serialized);
                    mentions.push(contact); // Agregar el contacto a las menciones
                }
                
                // Enviar el mensaje con menciones pero sin mostrarlas en el texto
                const sentMessage = await chat.sendMessage(text, { mentions });
                
                // Reacciones
                msg.react('🤖');
                await sentMessage.react('❤️');
            } else {
                const sentMessage = await msg.reply('Este comando solo puede ser utilizado por admins del grupo.');
                msg.react('🤖');
                await sentMessage.react('❎');
            }
        }
    }
});



// KICK A UN INTEGRANTE DEL GRUPO //
client.on('message', async (msg) => {
    if (msg.body.startsWith('!kick')) {
        const chat = await msg.getChat();
        const contacto = await msg.getContact();
        const userId = msg.author || msg.from;

        const { allowed, remainingTime } = checkCommandDelay(userId, 'kick');

        // Verifica si el chat es un grupo
        if (chat.isGroup) {
            if (!allowed) {
                const sentMessage = await msg.reply(`Por favor espera ${remainingTime} segundos antes de usar el comando de nuevo.`);
                await sentMessage.react('⏱');
                msg.react('⏱');
                return;
            }
            msg.react('⏳');

            // Verifica si el bot es un administrador
            const botId = client.info.wid._serialized;
            const botParticipant = chat.participants.find(participant => participant.id._serialized === botId);
            if (!botParticipant || !botParticipant.isAdmin) {
                const sentMessage = await msg.reply('No tengo permisos de administrador para expulsar participantes.');
                msg.react('🤖');
                await sentMessage.react('❎');
                return;
            }

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
                        try {
                            await chat.removeParticipants([participantId]);
                        } catch (error) {
                            await msg.reply(`Error al expulsar a ${participantId}: ${error.message}`);
                        }
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

/* GET ITEM */

// Función para convertir el nombre del item al formato correcto
function formatItemName(item) {
    const lowercaseWords = ["of", "the"];
    return item.split('_').map(word => {
        if (lowercaseWords.includes(word.toLowerCase())) {
            return word.toLowerCase();
        }
        if (word.length === 2) {
            return word.toLowerCase();
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(' ');
}

client.on('message', async (msg) => {
    if (msg.body.startsWith('!item')) {
        const chat = await msg.getChat();
        const userId = msg.author || msg.from;

        const { allowed, remainingTime } = checkCommandDelay(userId, 'item');

        // Verifica si el chat es un grupo
        if (chat.isGroup) {
            if (!allowed) {
                const sentMessage = await msg.reply(`Por favor espera ${remainingTime} segundos antes de usar el comando de nuevo.`);
                await sentMessage.react('⏱');
                msg.react('⏱');
                return;
            }
            msg.react('⏳');
            const item = msg.body.split(' ').slice(1).join('_'); // Obtener el nombre del item después de "!item"
            const formattedItem = formatItemName(item).replace(/\s+/g, '_'); // Formatear el nombre del item y eliminar espacios adicionales
            const url = `https://tibia.fandom.com/wiki/${encodeURIComponent(formattedItem)}`;

            console.log(`Fetching URL: ${url}`);  // Debugging URL

            try {
                const response = await axios.get(url);
                const $ = cheerio.load(response.data);

                // Extraer la información del item
                const lookText = $('.item-look.tibiatext.tibiagreen').text().trim();
                let droppedByText = $('.item-droppedby-wrapper').text().trim();

                // Formatear droppedByText en una sola línea
                if (droppedByText) {
                    droppedByText = droppedByText.replace(/\n/g, ', ').replace(/,\s*$/, '');
                }

                // Procesar el lookText para agregar espacios después de los puntos
                const formattedLookText = lookText.replace(/\.\s+/g, '. ');

                let formattedTradesText = '';

                // Buscar el div con la clase "trades" y el id "npc-trade-sellto"
                const sellToDiv = $('#npc-trade-sellto');

                // Iterar sobre los elementos hijos para obtener la información
                sellToDiv.find('tr').each((index, element) => {
                    const tds = $(element).find('td');
                    const npc = tds.eq(0).text().trim();
                    const location = tds.eq(1).text().trim();
                    const price = tds.eq(2).text().trim().replace(/\s*\u20AC$/, ' Gold'); // Reemplazar el símbolo de moneda con "Gold"
                    if (npc && location && price) {
                        formattedTradesText += `👨🏻${npc} | 📍${location} | 💰${price}\n`;
                    }
                });

                let info = '';
                if (formattedLookText) {
                    info += `*ℹ${formattedLookText}*\n\n`;
                }
                if (formattedTradesText) {
                    info += `💹*Vender a:*\n${formattedTradesText}\n`;
                }
                if (droppedByText) {
                    info += `🎁*Looteado por*: ${droppedByText}`;
                }

                if (info) {
                    const sentMessage = await msg.reply(`${info}\n🔎 ${url}`);
                    msg.react('🤖');
                    await sentMessage.react('📚');
                } else {
                    const sentMessage = await msg.reply('No se encontró información para ese item.');
                    msg.react('🤖');
                    await sentMessage.react('❌');
                }
            } catch (error) {
                console.error('Error fetching item info:', error.message);  // Debugging Error
                if (error.response && error.response.status === 404) {
                    const sentMessage = await msg.reply('No se encontró el ítem en la wiki de Tibia.');
                    msg.react('🤖');
                    await sentMessage.react('❌');
                } else {
                    const sentMessage = await msg.reply('No se pudo obtener la información del ítem.');
                    msg.react('🤖');
                    await sentMessage.react('❌');
                }
            }
        }
    }
});



/* TIBIA MONSTERS */
client.on('message', async msg => {
    if (msg.body.startsWith('!monster ')) {
        const chat = await msg.getChat();
        const userId = msg.author || msg.from;

        // Verifica si el chat es un grupo
        if (chat.isGroup) {
            const { allowed, remainingTime } = checkCommandDelay(userId, 'monster');
            if (!allowed) {
                const sentMessage = await msg.reply(`Por favor espera ${remainingTime} segundos antes de usar el comando de nuevo.`);
                await sentMessage.react('⏱');
                msg.react('⏱');
                return;
            }
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
${loot_list.join(', ')}`);
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

// Initialize client
client.initialize();

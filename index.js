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
        if (elapsedTime < 5000) {
            const remainingTime = ((5000 - elapsedTime) / 1000).toFixed(1);
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

// Log successful connection
client.on('ready', () => {
    console.log('🤖...Conexión exitosa!');
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
├ 💎 !mp <texto>
├ 💎 !kick <usuario>
├ 💎 !sticker, !s <multimedia>
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

// Initialize client
client.initialize();
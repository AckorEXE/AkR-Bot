client.on('message', async (msg) => {
    try {
        if (msg.body.startsWith('!mp') || (msg.hasQuotedMsg && msg.body.startsWith('!mp'))) {
            const chat = await msg.getChat();
            const contacto = await msg.getContact();
            const userId = msg.author || msg.from;

            // Verificar si el chat es un grupo antes de continuar
            if (!chat.isGroup) {
                msg.reply('Este comando solo se puede usar en chats de grupo.');
                return;
            }
            
            const { allowed, remainingTime } = checkCommandDelay(userId, 'mp');

            if (!allowed) {
                const sentMessage = await msg.reply(`Por favor espera ${remainingTime} segundos antes de usar el comando de nuevo.`);
                await sentMessage.react('⏱');
                msg.react('⏱');
                return;
            }

            msg.react('⏳');

            // Verificar si el bot es administrador usando chat.participants
            const botId = client.info.wid._serialized;
            const botParticipant = chat.participants.find(participant => participant.id._serialized === botId);
            if (!botParticipant || (!botParticipant.isAdmin && !botParticipant.isSuperAdmin)) {
                const sentMessage = await msg.reply('No tengo permisos de administrador para enviar masspoke.');
                msg.react('🤖');
                await sentMessage.react('❎');
                return;
            }

            const participant = chat.participants.find(p => p.id._serialized === contacto.id._serialized);
            const isAdmin = participant?.isAdmin || false;
            const isOwner = participant?.isSuperAdmin || false;

            if (isAdmin || isOwner) {
                let text = '';

                if (msg.hasQuotedMsg) {
                    const quotedMsg = await msg.getQuotedMessage();
                    text = quotedMsg.body;
                } else {
                    text = msg.body.slice(4).trim(); // Captura todo el texto después de "!mp "
                }

                // Agregar un carácter invisible (Zero Width Space) al final
                // Esto ayuda a que WhatsApp procese las menciones correctamente
                text += '\u200B';

                let mentions = [];

                for (let participant of chat.participants) {
                    // Intenta obtener el contacto. Si falla, omite esta mención.
                    try {
                        const contact = await client.getContactById(participant.id._serialized);
                        mentions.push(contact.id._serialized);
                        // NO agregamos el @usuario al texto, solo lo incluimos en el array mentions
                    } catch (e) {
                        console.error(`Error al obtener contacto para mencionar: ${participant.id._serialized}`, e);
                    }
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
    } catch (error) {
        console.error('Ocurrió un error en el comando !mp:', error);
        if (msg.isGroup) {
            msg.reply('Ocurrió un error al ejecutar el comando. Revisa la consola for más detalles.');
        } else {
            msg.reply('Ocurrió un error al ejecutar el comando. Revisa la consola para más detalles.');
        }
    }
});

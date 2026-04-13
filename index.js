const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { QuickDB } = require("quick.db");
const db = new QuickDB();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// BURASI ÇOK ÖNEMLİ: Tokeni sistemden (Secrets) çekiyoruz
const config = {
    token: process.env.TOKEN, 
    levelRoles: {
        "5": "Sokaktaki Yolcu",
        "10": "Çay Tiryakisi",
        "20": "Mekan Müdavimi",
        "35": "Altın Müşteri",
        "50": "Onur Konuğu"
    }
};

client.on('ready', () => {
    console.log(`🏮 ${client.user.tag} IzaKaya için hazır!`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;

    const userId = message.author.id;
    const guildId = message.guild.id;

    let xp = await db.get(`xp_${guildId}_${userId}`) || 0;
    let level = await db.get(`level_${guildId}_${userId}`) || 1;

    let addedXp = Math.floor(Math.random() * 11) + 5;
    await db.add(`xp_${guildId}_${userId}`, addedXp);

    if (xp + addedXp >= level * 500) {
        await db.set(`xp_${guildId}_${userId}`, 0);
        await db.add(`level_${guildId}_${userId}`, 1);
        let newLevel = level + 1;

        const levelEmbed = new EmbedBuilder()
            .setColor("#e74c3c")
            .setTitle("🏮 IzaKaya Seviye Sistemi")
            .setDescription(`Ooo <@${userId}>, mekana iyice alıştın! \n**Level ${newLevel}** oldun.`)
            .setTimestamp();

        message.channel.send({ embeds: [levelEmbed] });

        let roleName = config.levelRoles[newLevel.toString()];
        if (roleName) {
            let role = message.guild.roles.cache.find(r => r.name === roleName);
            if (role) await message.member.roles.add(role).catch(() => {});
        }
    }
});

client.login(config.token);

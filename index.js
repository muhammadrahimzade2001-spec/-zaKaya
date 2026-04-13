const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { QuickDB } = require("quick.db");
const express = require('express'); 
const db = new QuickDB();
const app = express();

// --- UPTIME ROBOT İÇİN WEB SUNUCUSU ---
app.get('/', (req, res) => { 
    res.send('🏮 IzaKaya Botu 7/24 Aktif Tutuluyor!'); 
});
app.listen(3000, () => { 
    console.log('🌐 Web sunucusu 3000 portunda hazır.'); 
});

// --- BOT AYARLARI ---
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

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

// --- SEVİYE SİSTEMİ ---
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;

    const userId = message.author.id;
    const guildId = message.guild.id;

    let xp = await db.get(`xp_${guildId}_${userId}`) || 0;
    let level = await db.get(`level_${guildId}_${userId}`) || 1;

    let addedXp = Math.floor(Math.random() * 11) + 5;
    await db.add(`xp_${guildId}_${userId}`, addedXp);

    let nextLevelXp = level * 500;

    if (xp + addedXp >= nextLevelXp) {
        await db.set(`xp_${guildId}_${userId}`, 0);
        await db.add(`level_${guildId}_${userId}`, 1);
        let newLevel = level + 1;

        const levelEmbed = new EmbedBuilder()
            .setColor("#e74c3c")
            .setTitle("🏮 IzaKaya Seviye Sistemi")
            .setDescription(`Ooo <@${userId}>, mekanın müdavimi olmuşsun! \n**Level ${newLevel}** oldun. Bir çayımızı içersin artık!`)
            .setTimestamp();

        message.channel.send({ embeds: [levelEmbed] });

        let roleName = config.levelRoles[newLevel.toString()];
        if (roleName) {
            let role = message.guild.roles.cache.find(r => r.name === roleName);
            if (role) {
                await message.member.roles.add(role).catch(e => console.log("Rol verme hatası: Yetkim yetmiyor."));
            }
        }
    }
});

client.login(config.token);

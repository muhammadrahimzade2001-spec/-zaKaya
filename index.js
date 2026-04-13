const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField } = require('discord.js');
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

// AYARLAR
const config = {
    token: "TOKEN_BURAYA",
    prefix: ".", // Komutlar için (Opsiyonel)
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

    // XP ve Level Verilerini Al
    let xp = await db.get(`xp_${guildId}_${userId}`) || 0;
    let level = await db.get(`level_${guildId}_${userId}`) || 1;

    // Rastgele XP Ekle (5-15 arası)
    let addedXp = Math.floor(Math.random() * 11) + 5;
    await db.add(`xp_${guildId}_${userId}`, addedXp);

    // Seviye Atlama Kontrolü (Her level için: MevcutLevel * 500 XP)
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

        // Otomatik Rol Verme
        let roleName = config.levelRoles[newLevel.toString()];
        if (roleName) {
            let role = message.guild.roles.cache.find(r => r.name === roleName);
            if (role) {
                await message.member.roles.add(role).catch(e => console.log("Rol verme hatası: Yetkim yetmiyor olabilir."));
            }
        }
    }
});

client.login(config.token);

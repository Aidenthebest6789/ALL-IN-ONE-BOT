/*
 ██████╗ ██╗      █████╗  ██████╗███████╗██╗   ██╗████████╗
██╔════╝ ██║     ██╔══██╗██╔════╝██╔════╝╚██╗ ██╔╝╚══██╔══╝
██║  ███╗██║     ███████║██║     █████╗   ╚████╔╝    ██║   
██║   ██║██║     ██╔══██║██║     ██╔══╝    ╚██╔╝     ██║   
╚██████╔╝███████╗██║  ██║╚██████╗███████╗   ██║      ██║   
 ╚═════╝ ╚══════╝╚═╝  ╚═╝ ╚═════╝╚══════╝   ╚═╝      ╚═╝   
-------------------------------------
✅ Verified | 🧩 Tested | ⚙️ Stable
> © 2025 GlaceYT.com | All rights reserved.
*/

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bot')
        .setDescription('Display bot status and information'),
    async execute(interaction) {
        // Bot Information Embed
        const embed = new EmbedBuilder()
            .setTitle('ALL IN ONE BOT')
            .setDescription('Your complete Discord server management, music, utility, and fun solution!')
            .setColor(0x5865F2)
            .addFields(
                {
                    name: 'Version',
                    value: 'v1.0',
                    inline: true
                },
                {
                    name: 'Status',
                    value: 'Online & Stable',
                    inline: true
                }
            )
            .setThumbnail('https://share.creavite.co/69179254377d6e26798e08fb.gif')
            .setFooter({
                text: 'CentraBot',
                iconURL: 'https://share.creavite.co/69179254377d6e26798e08fb.gif'
            });
        
        await interaction.reply({
            embeds: [embed]
        });
    }
};

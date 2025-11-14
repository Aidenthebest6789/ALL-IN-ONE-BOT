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
const { 
    SlashCommandBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle,
    AttachmentBuilder,
    ContainerBuilder,
    SectionBuilder,
    TextDisplayBuilder,
    ThumbnailBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MediaGalleryBuilder,
    MessageFlags,
    EmbedBuilder,
} = require('discord.js');
const UserProfile = require('../../models/profile/UserProfile');
const { ProfileCardGenerator } = require('../../UI/ProfileCardGenerator');
const path = require('path');

// Limits
const MAX_BUTTONS_PER_ROW = 5;
const MAX_ROWS = 4;

// Platform categories (NO social platforms)
const platformCategories = {
    gaming: ['steam', 'epic', 'riot', 'minecraft', 'xbox', 'playstation', 'nintendo', 'battlenet', 'fortnite'],
    content: ['website', 'portfolio'],
    other: ['spotify', 'soundcloud', 'pinterest', 'telegram', 'whatsapp']
};

const platformEmojis = {
    steam: '🛠️', epic: '🎮', riot: '🔴', minecraft: '⛏️', xbox: '🎯', playstation: '🎮',
    nintendo: '🎮', battlenet: '⚔️', fortnite: '🏆',
    website: '🌐', portfolio: '💼',
    spotify: '🎵', soundcloud: '🎧', pinterest: '📌', telegram: '✈️', whatsapp: '💬'
};

// Platform URL generators (NO social platforms)
const platformUrlGenerators = {
    steam: (data) => data.profileUrl || null,
    epic: (data) => data.profileUrl || null,
    riot: (data) => data.profileUrl || null,
    minecraft: (data) => data.profileUrl || null,
    xbox: (data) => data.profileUrl || null,
    playstation: (data) => data.profileUrl || null,
    nintendo: (data) => data.profileUrl || null,
    battlenet: (data) => data.profileUrl || null,
    fortnite: (data) => data.profileUrl || null,
    website: (data) => data.url,
    portfolio: (data) => data.url,
    spotify: (data) => data.profileUrl || null,
    soundcloud: (data) => data.profileUrl || null,
    pinterest: (data) => data.profileUrl || null,
    telegram: (data) => data.profileUrl || null,
    whatsapp: (data) => data.profileUrl || null
};

function paginateButtons(buttons) {
    const rows = [];
    for (let i = 0; i < buttons.length; i += MAX_BUTTONS_PER_ROW) {
        const row = new ActionRowBuilder()
            .addComponents(...buttons.slice(i, i + MAX_BUTTONS_PER_ROW));
        rows.push(row);
        if (rows.length >= MAX_ROWS) break;
    }
    return rows;
}

function getCategoryForPlatform(platform) {
    for (const [category, platforms] of Object.entries(platformCategories)) {
        if (platforms.includes(platform)) return category;
    }
    return 'other';
}

function getConnectedPlatforms(profile) {
    const connected = [];
    for (const [category, platforms] of Object.entries(platformCategories)) {
        if (profile[category]) {
            for (const platform of platforms) {
                if (profile[category][platform]) {
                    const data = profile[category][platform];
                    let hasData = false;
                    switch (platform) {
                        case 'riot': hasData = data && data.riotId; break;
                        case 'xbox': hasData = data && data.gamertag; break;
                        case 'playstation': hasData = data && data.psnId; break;
                        case 'nintendo': hasData = data && (data.friendCode || data.username); break;
                        case 'battlenet': hasData = data && data.battleTag; break;
                        case 'fortnite': hasData = data && data.epicName; break;
                        case 'website':
                        case 'portfolio':
                            hasData = data && (data.url || data.title);
                            break;
                        case 'whatsapp':
                            hasData = data && data.number;
                            break;
                        default:
                            hasData = data && data.username;
                    }
                    if (hasData) {
                        connected.push({
                            platform,
                            category,
                            data
                        });
                    }
                }
            }
        }
    }
    return connected;
}

function getPlatformCount(profile) {
    return getConnectedPlatforms(profile).length;
}

function generatePlatformUrl(platform, data) {
    if (!data) return null;
    if (platformUrlGenerators[platform]) {
        try {
            return platformUrlGenerators[platform](data);
        } catch (error) {
            console.error(`Error generating URL for ${platform}:`, error);
            return data.profileUrl || data.url || null;
        }
    }
    return data.profileUrl || data.url || null;
}

function getPlatformSummary(profile) {
    const connectedPlatforms = getConnectedPlatforms(profile);
    if (connectedPlatforms.length === 0) {
        return 'No platforms added. Use `/profile add` to link your accounts.';
    }
    let summary = '';
    const categorizedPlatforms = {};
    for (const { platform, category, data } of connectedPlatforms) {
        if (!categorizedPlatforms[category]) {
            categorizedPlatforms[category] = [];
        }
        let displayName;
        switch (platform) {
            case 'riot': displayName = data.riotId || 'Riot Account'; break;
            case 'xbox': displayName = data.gamertag || 'Xbox Gamertag'; break;
            case 'playstation': displayName = data.psnId || 'PlayStation ID'; break;
            case 'nintendo': displayName = data.friendCode || data.username || 'Nintendo Account'; break;
            case 'battlenet': displayName = data.battleTag || 'Battle.net Account'; break;
            case 'fortnite': displayName = data.epicName || 'Fortnite Account'; break;
            case 'website':
            case 'portfolio':
                displayName = data.title || 'Website';
                break;
            case 'whatsapp':
                displayName = data.displayName || data.number || 'WhatsApp';
                break;
            default:
                displayName = data.username || 'Account';
        }
        const url = generatePlatformUrl(platform, data);
        const urlText = url ? ` - [View Profile](${url})` : '';
        categorizedPlatforms[category].push(
            `${platformEmojis[platform]} **${platform.charAt(0).toUpperCase() + platform.slice(1)}:** ${displayName}${urlText}`
        );
    }
    for (const [category, platforms] of Object.entries(categorizedPlatforms)) {
        summary += `\n**${category.charAt(0).toUpperCase() + category.slice(1)}**\n${platforms.join('\n')}\n`;
    }
    return summary;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Manage your complete Discord profile')
        .addSubcommand(sub => sub
            .setName('view')
            .setDescription('View your or someone else\'s profile'))
        .addSubcommand(sub => sub
            .setName('add')
            .setDescription('Add a platform account')
            .addStringOption(opt => opt
                .setName('platform')
                .setDescription('Platform to add')
                .setRequired(true)
                .addChoices(
                    { name: '🛠️ Steam', value: 'steam' },
                    { name: '🎮 Epic', value: 'epic' },
                    { name: '🔴 Riot', value: 'riot' },
                    { name: '⛏️ Minecraft', value: 'minecraft' },
                    { name: '🎯 Xbox', value: 'xbox' },
                    { name: '🎮 PlayStation', value: 'playstation' },
                    { name: '🎮 Nintendo', value: 'nintendo' },
                    { name: '⚔️ Battle.net', value: 'battlenet' },
                    { name: '🏆 Fortnite', value: 'fortnite' },
                    { name: '🌐 Website', value: 'website' },
                    { name: '💼 Portfolio', value: 'portfolio' },
                    { name: '🎵 Spotify', value: 'spotify' },
                    { name: '🎧 SoundCloud', value: 'soundcloud' },
                    { name: '📌 Pinterest', value: 'pinterest' },
                    { name: '✈️ Telegram', value: 'telegram' },
                    { name: '💬 WhatsApp', value: 'whatsapp' }
                ))
            .addStringOption(opt => opt
                .setName('username')
                .setDescription('Your username/ID for this platform')
                .setRequired(true))
            .addStringOption(opt => opt
                .setName('url')
                .setDescription('Profile URL (optional)')
                .setRequired(false)))
        .addSubcommand(sub => sub
            .setName('remove')
            .setDescription('Remove a platform account')
            .addStringOption(opt => opt
                .setName('platform')
                .setDescription('Platform to remove')
                .setRequired(true)))
        .addSubcommand(sub => sub
            .setName('edit')
            .setDescription('Edit a platform account')
            .addStringOption(opt => opt
                .setName('platform')
                .setDescription('Platform to edit')
                .setRequired(true))
            .addStringOption(opt => opt
                .setName('username')
                .setDescription('New username/ID')
                .setRequired(false))
            .addStringOption(opt => opt
                .setName('url')
                .setDescription('New profile URL')
                .setRequired(false))),
    async execute(interaction) {
        // Add command logic here (add/view/edit/remove)
        // When using embeds, always use:
        // .setFooter({ text: 'Your Footer', iconURL: 'https://share.creavite.co/69179254377d6e26798e08fb.gif' })
    }
};

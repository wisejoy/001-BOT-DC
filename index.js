require('dotenv').config();
const {
  Client,
  GatewayIntentBits,
  Partials,
  EmbedBuilder,
  REST,
  Routes,
  SlashCommandBuilder,
  PermissionFlagsBits,
} = require('discord.js');
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  StreamType,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  entersState,
} = require('@discordjs/voice');
const { Readable } = require('stream');
const fs = require('fs');
const path = require('path');

const rolesConfig = require('./roles-config');

// ─────────────────────────────────────────────────────────────────────────────
//  ENV VALIDATION
// ─────────────────────────────────────────────────────────────────────────────
const { DISCORD_TOKEN, GUILD_ID, VOICE_CHANNEL_ID, CLIENT_ID } = process.env;

if (!DISCORD_TOKEN || !GUILD_ID || !VOICE_CHANNEL_ID || !CLIENT_ID) {
  console.error(
    '❌ Variabel berikut belum diisi di .env:\n' +
    [
      !DISCORD_TOKEN  && '  - DISCORD_TOKEN',
      !GUILD_ID       && '  - GUILD_ID',
      !VOICE_CHANNEL_ID && '  - VOICE_CHANNEL_ID',
      !CLIENT_ID      && '  - CLIENT_ID  (Application ID dari Discord Developer Portal)',
    ]
      .filter(Boolean)
      .join('\n')
  );
  process.exit(1);
}

// ─────────────────────────────────────────────────────────────────────────────
//  REACTION MESSAGES STORAGE
//  Menyimpan { messageId → categoryIndex } agar bot tahu
//  pesan mana yang dipantau untuk reaction roles.
// ─────────────────────────────────────────────────────────────────────────────
const MESSAGES_FILE = path.join(__dirname, 'reaction-messages.json');

function loadActiveMessages() {
  try {
    if (fs.existsSync(MESSAGES_FILE)) {
      return JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf8'));
    }
  } catch (err) {
    console.warn('⚠️ Gagal load reaction-messages.json:', err.message);
  }
  return {};
}

function saveActiveMessages(data) {
  try {
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('❌ Gagal simpan reaction-messages.json:', err.message);
  }
}

// Peta aktif: { [messageId]: categoryIndex }
let activeMessages = loadActiveMessages();

// ─────────────────────────────────────────────────────────────────────────────
//  DISCORD CLIENT
// ─────────────────────────────────────────────────────────────────────────────
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessageReactions, // ← untuk reaction roles
    GatewayIntentBits.GuildMembers,          // ← untuk assign/remove role
  ],
  // Partials diperlukan agar bot bisa handle reaction di pesan yang
  // belum ada di cache (misalnya setelah bot restart)
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

// ─────────────────────────────────────────────────────────────────────────────
//  VOICE 24/7  (fitur lama, tidak diubah)
// ─────────────────────────────────────────────────────────────────────────────

// Stream "silence" Opus frame supaya koneksi voice tetap hidup tanpa suara nyata
function createSilenceStream() {
  const SILENT_FRAME = Buffer.from([0xf8, 0xff, 0xfe]);
  return new Readable({
    read() {
      this.push(SILENT_FRAME);
    },
  });
}

const player = createAudioPlayer();
const resource = createAudioResource(createSilenceStream(), {
  inputType: StreamType.Opus,
});
player.play(resource);

// Kalau player selesai/idle, mainkan lagi supaya nggak pernah berhenti
player.on(AudioPlayerStatus.Idle, () => {
  const newResource = createAudioResource(createSilenceStream(), {
    inputType: StreamType.Opus,
  });
  player.play(newResource);
});

player.on('error', (err) => {
  console.error('⚠️ Audio player error:', err.message);
});

let connection = null;
let reconnecting = false;

async function connectToVoice() {
  try {
    const guild = await client.guilds.fetch(GUILD_ID);
    const channel = await guild.channels.fetch(VOICE_CHANNEL_ID);

    if (!channel || !channel.isVoiceBased()) {
      console.error('❌ VOICE_CHANNEL_ID tidak valid atau bukan voice channel.');
      return;
    }

    connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: guild.id,
      adapterCreator: guild.voiceAdapterCreator,
      selfDeaf: true,
      selfMute: false,
    });

    connection.subscribe(player);

    connection.on(VoiceConnectionStatus.Disconnected, async () => {
      if (reconnecting) return;
      reconnecting = true;
      try {
        await Promise.race([
          entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
          entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
        ]);
      } catch {
        console.log('🔄 Koneksi voice putus, mencoba join ulang...');
        connection.destroy();
        setTimeout(connectToVoice, 5_000);
      } finally {
        reconnecting = false;
      }
    });

    connection.on(VoiceConnectionStatus.Destroyed, () => {
      console.log('🔄 Koneksi dihancurkan, join ulang dalam 5 detik...');
      setTimeout(connectToVoice, 5_000);
    });

    console.log(`✅ Bergabung ke voice channel: ${channel.name}`);
  } catch (err) {
    console.error('❌ Gagal join voice channel:', err.message);
    console.log('🔄 Mencoba lagi dalam 10 detik...');
    setTimeout(connectToVoice, 10_000);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  SLASH COMMAND REGISTRATION
// ─────────────────────────────────────────────────────────────────────────────
async function registerCommands() {
  const commands = [
    new SlashCommandBuilder()
      .setName('setup-roles')
      .setDescription('📋 Buat pesan reaction roles di channel ini (hanya Admin)')
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
      .toJSON(),
  ];

  const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);
  try {
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
      body: commands,
    });
    console.log('✅ Slash command /setup-roles berhasil didaftarkan');
  } catch (err) {
    console.error('❌ Gagal mendaftarkan slash command:', err.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  SETUP ROLES HANDLER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Kembalikan string emoji yang bisa digunakan untuk msg.react()
 * - Custom emoji server : "namaEmoji:emojiId"
 * - Unicode emoji       : karakter langsung (contoh: "🎮")
 */
function getEmojiString(roleEntry) {
  return roleEntry.emojiId
    ? `${roleEntry.emoji}:${roleEntry.emojiId}`
    : roleEntry.emoji;
}

async function handleSetupRoles(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const channel = interaction.channel;
  const newActiveMessages = {};
  let successCount = 0;

  for (let i = 0; i < rolesConfig.categories.length; i++) {
    const category = rolesConfig.categories[i];

    // Baris daftar role: "> emoji : @Label"
    const roleLines = category.roles
      .map((r) => `> ${r.emoji} : @${r.label}`)
      .join('\n');

    const divider = '─'.repeat(35);

    const embed = new EmbedBuilder()
      .setTitle(`**${category.name}**`)
      .setDescription(`${category.description}\n\n${divider}\n${roleLines}\n${divider}`)
      .setColor(category.color ?? 0x2b2d31);

    try {
      const msg = await channel.send({ embeds: [embed] });

      // Tambahkan reaction emoji satu per satu (berurutan)
      for (const role of category.roles) {
        try {
          await msg.react(getEmojiString(role));
        } catch {
          console.warn(`⚠️ Gagal react ${role.emoji} untuk "${role.label}" — pastikan emoji valid`);
        }
      }

      newActiveMessages[msg.id] = i;
      successCount++;
      console.log(`📋 Kategori "${category.name}" selesai (msgId: ${msg.id})`);
    } catch (err) {
      console.error(`❌ Gagal kirim embed kategori "${category.name}":`, err.message);
    }
  }

  // Simpan ke file supaya tetap aktif setelah bot restart
  Object.assign(activeMessages, newActiveMessages);
  saveActiveMessages(activeMessages);

  await interaction.editReply(
    `✅ Reaction roles berhasil di-setup! (${successCount}/${rolesConfig.categories.length} kategori)\n` +
    `💡 Jangan lupa isi **Role ID** di \`roles-config.js\` jika belum.`
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  REACTION ROLE HELPER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Cari konfigurasi role dari emoji yang di-react
 */
function findRoleConfig(categoryIndex, reactionEmoji) {
  const category = rolesConfig.categories[categoryIndex];
  if (!category) return null;

  return category.roles.find((r) => {
    // Custom emoji → cocokkan by ID
    if (r.emojiId) return reactionEmoji.id === r.emojiId;
    // Unicode emoji → cocokkan by nama/karakter
    return reactionEmoji.name === r.emoji;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  EVENT: INTERACTION (Slash Commands)
// ─────────────────────────────────────────────────────────────────────────────
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'setup-roles') {
    handleSetupRoles(interaction).catch((err) => {
      console.error('❌ Error di handleSetupRoles:', err.message);
      interaction
        .editReply('❌ Terjadi error. Cek console bot untuk detail.')
        .catch(() => {});
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
//  EVENT: REACTION ADD → Assign Role
// ─────────────────────────────────────────────────────────────────────────────
client.on('messageReactionAdd', async (reaction, user) => {
  if (user.bot) return;

  // Fetch data jika belum di-cache (penting setelah bot restart)
  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch {
      return;
    }
  }

  const categoryIndex = activeMessages[reaction.message.id];
  if (categoryIndex === undefined) return; // Bukan pesan reaction roles

  const roleConf = findRoleConfig(categoryIndex, reaction.emoji);
  if (!roleConf) return;

  if (roleConf.roleId === 'ROLE_ID_DISINI') {
    console.warn(`⚠️ Role ID belum diisi untuk "${roleConf.label}" di roles-config.js`);
    return;
  }

  try {
    const guild = reaction.message.guild;
    const member = await guild.members.fetch(user.id);
    const role =
      guild.roles.cache.get(roleConf.roleId) ??
      (await guild.roles.fetch(roleConf.roleId));

    if (!role) {
      console.warn(`⚠️ Role tidak ditemukan di server: ${roleConf.roleId}`);
      return;
    }

    await member.roles.add(role);
    console.log(`✅ [+ROLE] "${role.name}" → ${user.tag}`);
  } catch (err) {
    console.error(`❌ Gagal assign role ke ${user.tag}:`, err.message);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
//  EVENT: REACTION REMOVE → Remove Role
// ─────────────────────────────────────────────────────────────────────────────
client.on('messageReactionRemove', async (reaction, user) => {
  if (user.bot) return;

  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch {
      return;
    }
  }

  const categoryIndex = activeMessages[reaction.message.id];
  if (categoryIndex === undefined) return;

  const roleConf = findRoleConfig(categoryIndex, reaction.emoji);
  if (!roleConf) return;

  if (roleConf.roleId === 'ROLE_ID_DISINI') return;

  try {
    const guild = reaction.message.guild;
    const member = await guild.members.fetch(user.id);
    const role =
      guild.roles.cache.get(roleConf.roleId) ??
      (await guild.roles.fetch(roleConf.roleId));

    if (!role) return;

    await member.roles.remove(role);
    console.log(`🗑️ [-ROLE] "${role.name}" ← ${user.tag}`);
  } catch (err) {
    console.error(`❌ Gagal remove role dari ${user.tag}:`, err.message);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
//  BOT READY
// ─────────────────────────────────────────────────────────────────────────────
client.once('ready', () => {
  console.log(`🤖 Login sebagai ${client.user.tag}`);
  console.log(`📌 Reaction roles aktif: ${Object.keys(activeMessages).length} pesan terpantau`);
  registerCommands();
  connectToVoice();
});

client.login(DISCORD_TOKEN);

// Biar proses nggak mati mendadak karena error yang tidak tertangani
process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
});

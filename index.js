require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
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

const { DISCORD_TOKEN, GUILD_ID, VOICE_CHANNEL_ID } = process.env;

if (!DISCORD_TOKEN || !GUILD_ID || !VOICE_CHANNEL_ID) {
  console.error('❌ DISCORD_TOKEN, GUILD_ID, atau VOICE_CHANNEL_ID belum diisi di .env');
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

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
        // Coba reconnect otomatis (misal ganti region voice)
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

client.once('ready', () => {
  console.log(`🤖 Login sebagai ${client.user.tag}`);
  connectToVoice();
});

client.login(DISCORD_TOKEN);

// Biar proses nggak mati mendadak karena error yang tidak tertangani
process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
});

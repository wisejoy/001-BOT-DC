/**
 * ════════════════════════════════════════════════════════════════
 *  KONFIGURASI REACTION ROLES
 * ════════════════════════════════════════════════════════════════
 *
 *  CARA PAKAI CUSTOM EMOJI SERVER:
 *  1. Ketik \:namaemoji: di chat Discord (contoh: \:freefire:)
 *  2. Enter, nanti keluar: <:freefire:1234567890123456789>
 *  3. Copy NAMA emoji ('freefire') & ID emoji ('1234567890123456789')
 * ════════════════════════════════════════════════════════════════
 */

module.exports = {
  categories: [
    // ───────────────────────────────────────────────
    //  KATEGORI 1: ROLE GAME
    // ───────────────────────────────────────────────
    {
      name: 'ROLE GAME',
      description: '🎮 REACTION SESUAI GAME YANG KALIAN MAINKAN !!!!',
      color: 0x5865f2,
      roles: [
        // 👇 CONTOH CUSTOM EMOJI SERVER 👇
        {
          emoji: 'freefire',              // nama custom emoji kamu di Discord
          emojiId: '1530502307043872888', // ID custom emoji kamu
          label: 'Free Fire',             // Nama role yang akan tampil
          roleId: '1530503842418917426',     // ID Role yang di-copy dari Server Settings
        },
        {
          emoji: 'ml',
          emojiId: '1530506101483634708', // ID custom emoji kamu
          label: 'Mobile Legends',             // Nama role yang akan tampil
          roleId: '1530506474151739422',     // ID Role yang di-copy dari Server Settings
        },
        {
          emoji: 'roblox',
          emojiId: '1530506335949426798', // ID custom emoji kamu
          label: 'roblox',             // Nama role yang akan tampil
          roleId: '1530507071869550682',     // ID Role yang di-copy dari Server Settings
        },
        {
          emoji: 'valorant',
          emojiId: '1530511056177467422', // ID custom emoji kamu
          label: 'valorant',             // Nama role yang akan tampil
          roleId: '1530512318423765083',     // ID Role yang di-copy dari Server Settings
        },
      ],
    },

    // ───────────────────────────────────────────────
    //  KATEGORI 2: ROLE GENDER
    // ───────────────────────────────────────────────
    {
      name: 'ROLE GENDER',
      description: '♀️ SILAHKAN REACTION SESUAI GENDER KALIAN!!!!',
      color: 0xeb459e,
      roles: [
        {
          emoji: '👦',
          label: 'Male',
          roleId: '884623833020133417',
        },
        {
          emoji: '👧',
          label: 'Female',
          roleId: '884624113535156264',
        },
      ],
    },
  ],
};

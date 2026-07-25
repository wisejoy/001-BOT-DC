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
          emojiId: '1234567890123456789', // ID custom emoji kamu
          label: 'Free Fire',             // Nama role yang akan tampil
          roleId: 'ROLE_ID_FREEFIRE',     // ID Role yang di-copy dari Server Settings
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
          label: 'Boy',
          roleId: 'ROLE_ID_DISINI',
        },
        {
          emoji: '👧',
          label: 'Girls',
          roleId: 'ROLE_ID_DISINI',
        },
      ],
    },
  ],
};

/**
 * ════════════════════════════════════════════════════════════════
 *  KONFIGURASI REACTION ROLES
 * ════════════════════════════════════════════════════════════════
 *
 *  CARA PAKAI EMOJI:
 *  1. Emoji Bawaan (Unicode):
 *     emoji: '🎮',
 *
 *  2. Custom Emoji Server (Emoji Upload Sendiri):
 *     emoji: 'freefire',              // nama emoji
 *     emojiId: '1234567890987654321', // ID emoji (dapat dari \:namaemoji:)
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
        {
          emoji: '🎮',
          // emojiId: 'ID_EMOJI_DISINI', // isi jika pakai custom emoji
          label: 'Free Fire',
          roleId: 'ROLE_ID_DISINI',
        },
        {
          emoji: '⚔️',
          // emojiId: 'ID_EMOJI_DISINI',
          label: 'Mobile Legends',
          roleId: 'ROLE_ID_DISINI',
        },
        {
          emoji: '🎯',
          // emojiId: 'ID_EMOJI_DISINI',
          label: 'PUBG',
          roleId: 'ROLE_ID_DISINI',
        },
        {
          emoji: '🧱',
          // emojiId: 'ID_EMOJI_DISINI',
          label: 'Roblox',
          roleId: 'ROLE_ID_DISINI',
        },
        {
          emoji: '🚗',
          // emojiId: 'ID_EMOJI_DISINI',
          label: 'GTA V',
          roleId: 'ROLE_ID_DISINI',
        },
        {
          emoji: '🟥',
          // emojiId: 'ID_EMOJI_DISINI',
          label: 'Valorant',
          roleId: 'ROLE_ID_DISINI',
        },
        {
          emoji: '😺',
          // emojiId: 'ID_EMOJI_DISINI',
          label: 'OwO Players',
          roleId: 'ROLE_ID_DISINI',
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
          // emojiId: 'ID_EMOJI_DISINI',
          label: 'Boy',
          roleId: 'ROLE_ID_DISINI',
        },
        {
          emoji: '👧',
          // emojiId: 'ID_EMOJI_DISINI',
          label: 'Girls',
          roleId: 'ROLE_ID_DISINI',
        },
      ],
    },
  ],
};

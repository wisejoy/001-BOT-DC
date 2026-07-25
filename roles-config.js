/**
 * ════════════════════════════════════════════════════════════════
 *  KONFIGURASI REACTION ROLES
 * ════════════════════════════════════════════════════════════════
 *
 *  CARA MENGISI EMOJI:
 *
 *  [Opsi A] Pakai Custom Emoji Server (Emoji Upload Sendiri):
 *     emoji: 'nama_emoji',             // nama emoji (tanpa < : >)
 *     emojiId: '123456789012345678',   // ID emoji (dapat dari \:namaemoji:)
 *
 *  [Opsi B] Pakai Emoji Biasa (Bawaan HP / Discord):
 *     emoji: '🎮',                     // karakter emoji langsung
 *     // emojiId tidak perlu diisi / hapus baris emojiId
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
        // 📌 CONTOH 1: Paling pas untuk Custom Emoji Server kamu
        {
          emoji: 'freefire',              // nama emoji kamu
          emojiId: 'ID_EMOJI_FREEFIRE',   // ID emoji kamu (opsional jika emoji biasa)
          label: 'Free Fire',             // Nama role di embed
          roleId: 'ROLE_ID_FREEFIRE',     // ID Role dari Discord Server
        },

        /* 💡 TEMPLATE: Copas blok di bawah jika mau tambah game baru 
        {
          emoji: 'NAMA_ATAU_EMOJI',
          // emojiId: 'ID_EMOJI_DISINI',
          label: 'Nama Game',
          roleId: 'ROLE_ID_DISINI',
        },
        */
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

// Master admins are fixed here and mirrored in firestore.rules / storage.rules.
// Keep all three lists in sync when changing this.
export const MASTER_ADMINS = [
  'abg.592006@gmail.com',
  'tto@vit.ac.in',
  'manish.k@vit.ac.in'
];

export const isMasterAdminEmail = (email: string) => MASTER_ADMINS.includes(email.toLowerCase().trim());

// TB admins live in Firestore: tto_admins/{lowercased email}. Only master admins can write there.
export const TB_ADMINS_COLLECTION = 'tto_admins';

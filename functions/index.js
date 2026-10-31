import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions';

// Storage rules can't read the `tto-portal` database, so TB admin status is mirrored into a
// `ttoAdmin` custom claim that storage.rules checks. tto_admins/{email} stays the source of truth.
initializeApp();
const db = getFirestore('tto-portal');
const REGION = 'asia-south1';

// Auth users are shared with other innovation-vit apps: merge, never overwrite, their claims.
const setTtoAdminClaim = async (user, isAdmin) => {
  const claims = { ...(user.customClaims || {}) };
  if (!!claims.ttoAdmin === isAdmin) return false;
  if (isAdmin) claims.ttoAdmin = true;
  else delete claims.ttoAdmin;
  await getAuth().setCustomUserClaims(user.uid, claims);
  return true;
};

// Grant/revoke as soon as a master admin edits the list.
export const ttoAdminChanged = onDocumentWritten(
  { document: 'tto_admins/{email}', database: 'tto-portal', region: REGION },
  async event => {
    const email = event.params.email;
    const isAdmin = !!event.data?.after?.exists;
    try {
      const user = await getAuth().getUserByEmail(email);
      await setTtoAdminClaim(user, isAdmin);
      logger.info(`ttoAdmin=${isAdmin} for ${email}`);
    } catch (err) {
      // Never signed in yet; syncTtoAdminClaim picks it up on their first sign-in.
      if (err.code === 'auth/user-not-found') return;
      throw err;
    }
  }
);

// Called by the site after sign-in so admins added before their first sign-in get the claim.
export const syncTtoAdminClaim = onCall({ region: REGION }, async request => {
  if (!request.auth?.token.email) throw new HttpsError('unauthenticated', 'Sign in first.');
  const email = request.auth.token.email.toLowerCase();
  const snap = await db.collection('tto_admins').doc(email).get();
  const user = await getAuth().getUser(request.auth.uid);
  const changed = await setTtoAdminClaim(user, snap.exists);
  return { isAdmin: snap.exists, changed };
});

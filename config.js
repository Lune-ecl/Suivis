// ─────────────────────────────────────────────────────────────────────
//  Liaison avec ta base Supabase
//
//  1. Ouvre ton projet sur https://supabase.com/dashboard
//  2. Clique sur « Connect » en haut du projet
//     (ou Project Settings → API Keys / Data API)
//  3. Copie l'URL du projet dans supabaseUrl
//  4. Copie la clé publique « anon » ou « publishable » dans supabaseKey
//
//  ⚠️ Ne mets JAMAIS la clé « service_role » ou « secret » ici.
//  La clé publique peut être visible de tous : la confidentialité des
//  dossiers est assurée par les règles d'accès de supabase/schema.sql.
// ─────────────────────────────────────────────────────────────────────
export default {
  supabaseUrl: 'https://ftibfoytacwsksgfubjq.supabase.co',
  supabaseKey: 'sb_publishable_slLBMoQFqfh3h6NfSixOmg_GsCPgIHf',
};

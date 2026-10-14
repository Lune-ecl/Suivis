// ─────────────────────────────────────────────────────────────────────
//  Liaison avec ta base Supabase
//
//  1. Ouvre ton projet sur https://supabase.com/dashboard
//  2. Project Settings → API (ou « API Keys »)
//  3. Copie « Project URL » dans supabaseUrl
//  4. Copie la clé publique « anon » ou « publishable » dans supabaseKey
//
//  ⚠️ Ne mets JAMAIS la clé « service_role » ou « secret » ici.
//  La clé publique peut être visible de tous : la confidentialité des
//  dossiers est assurée par les règles d'accès de supabase/schema.sql.
// ─────────────────────────────────────────────────────────────────────
export default {
  supabaseUrl: '',
  supabaseKey: '',

  // Passe à true après avoir activé la connexion Discord dans Supabase (voir README).
  connexionDiscord: false,
};

/** Messages d'erreur auth Supabase en français. */
export function translateAuthError(msg: string): string {
  if (msg.includes("Invalid login credentials")) return "Email ou mot de passe incorrect.";
  if (msg.includes("already registered") || msg.includes("already been registered")) {
    return "Cet email est déjà utilisé.";
  }
  if (msg.includes("Password should be at least 6")) return "Le mot de passe doit comporter au moins 6 caractères.";
  if (msg.includes("Unable to validate email address")) return "Adresse email invalide.";
  if (msg.includes("Email not confirmed")) return "Confirmez votre email avant de vous connecter.";
  return msg;
}

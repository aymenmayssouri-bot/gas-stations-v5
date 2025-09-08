export function handleFirebaseError(error: any) {
  const code = error?.code || '';
  const map: Record<string,string> = {
    'permission-denied': "Vous n'avez pas la permission d'effectuer cette action.",
    'not-found': "Ressource non trouvée.",
    'unavailable': "Service temporairement indisponible.",
    // ajoute les cas fréquents
  };
  return map[code] || (error?.message ?? 'Une erreur est survenue');
}
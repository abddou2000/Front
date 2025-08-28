// src/app/utilisateurs/page.tsx

// On définit les "types" pour nos données pour plus de sécurité avec TypeScript
type Role = {
  id: number;
  type: string;
};

type User = {
  id: number;
  username: string;
  nom: string;
  prenom: string;
  email: string;
  etatCompte: string;
  role: Role;
};

// Fonction pour récupérer les données depuis votre API Spring Boot
async function getUsers(): Promise<User[]> {
  // IMPORTANT : L'API est protégée. Il faut un token d'administrateur.
  // Pour un test rapide, vous pouvez copier-coller un token valide ici.
  // Dans une vraie application, ce token viendrait d'un cookie ou d'une session.
  const adminToken = "VOTRE_TOKEN_JWT_ADMIN_A_COLLER_ICI";
  
  const api_url = 'http://localhost:8080/api/utilisateurs';

  try {
    const response = await fetch(api_url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
      },
      // On ajoute cette option pour s'assurer que les données sont toujours à jour
      cache: 'no-store', 
    });

    if (!response.ok) {
      // Si la réponse n'est pas un succès (ex: 403 Forbidden), on lève une erreur.
      throw new Error(`Erreur lors de la récupération des utilisateurs: ${response.statusText}`);
    }

    const data: User[] = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    // En cas d'erreur (API non démarrée, token invalide...), on retourne une liste vide.
    return []; 
  }
}

// C'est le composant React qui constitue notre page
export default async function UtilisateursPage() {
  const users = await getUsers();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Liste des Utilisateurs</h1>
      
      {/* Affichage conditionnel : message si aucun utilisateur n'est trouvé */}
      {users.length === 0 ? (
        <p>Aucun utilisateur trouvé ou une erreur est survenue.</p>
      ) : (
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b">ID</th>
              <th className="py-2 px-4 border-b">Nom d'utilisateur</th>
              <th className="py-2 px-4 border-b">Nom Complet</th>
              <th className="py-2 px-4 border-b">Email</th>
              <th className="py-2 px-4 border-b">Rôle</th>
              <th className="py-2 px-4 border-b">État</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b text-center">{user.id}</td>
                <td className="py-2 px-4 border-b">{user.username}</td>
                <td className="py-2 px-4 border-b">{user.prenom} {user.nom}</td>
                <td className="py-2 px-4 border-b">{user.email}</td>
                <td className="py-2 px-4 border-b">{user.role.type}</td>
                <td className="py-2 px-4 border-b">{user.etatCompte}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
export async function listOffers(filters = {}, page = 1) {
  // TODO API (GET /api/offers) :
  // Remplacer le `return []` par l'appel au backend Symfony.
  // Le backend se charge de lire Neon et de normaliser les offres provenant
  // de France Travail et WeLoveDevs.

  
  const apiUrl = 'http://localhost:8000'
  const queryParams = new URLSearchParams()
  queryParams.set('page', String(page))

  // Object.entries(filters).forEach(([name, value]) => {
  //   if (value !== '' && value !== null && value !== undefined) {
  //     queryParams.set(name, value)
  //   }
  // })

  const response = await fetch(`${apiUrl}/api/offers?${queryParams.toString()}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      // TODO API AUTH : ajouter le token JWT si GET /api/offers devient protégé.
      // Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  })

  if (!response.ok) {
    throw new Error('Impossible de charger les offres.')
  }

  const data = await response.json()

  void filters // À retirer lorsque les filtres seront ajoutés aux paramètres de requête.

  return {
    items: Array.isArray(data.items) ? data.items : [],
    pagination: {
      page: data.pagination?.page ?? page,
      total: data.pagination?.total ?? 0,
      totalPages: data.pagination?.totalPages ?? 0,
    },
  }
}

export const offerFilterOptions = {
  kinds: [
    { value: 'job', label: 'Emploi' },
    { value: 'internship', label: 'Stage' },
    { value: 'apprenticeship', label: 'Alternance' },
  ],
  contracts: ['CDI', 'CDD', 'stage', 'alternance', 'freelance'].map((value) => ({
    value,
    label: value.charAt(0).toLocaleUpperCase('fr') + value.slice(1),
  })),
  // TODO API : confirmer les valeurs de `isRemote.frequency` renvoyées par Symfony.
  remote: [
    { value: 'full', label: '100 % télétravail' },
    { value: 'hybrid', label: 'Hybride' },
    { value: 'office', label: 'Sur site' },
  ],
  // TODO API : remplacer cette liste par les catégories renvoyées par le backend.
  categories: ['Développement', 'Data', 'Design', 'Infrastructure', 'Produit'],
}

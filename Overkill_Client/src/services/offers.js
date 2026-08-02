export async function listOffers(filters = {}, page = 1, signal) {
  const apiUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
  const queryParams = new URLSearchParams()
  queryParams.set('page', String(page))

  Object.entries(filters).forEach(([name, value]) => {
    const normalizedValue = typeof value === 'string' ? value.trim() : value

    if (normalizedValue !== '' && normalizedValue !== null && normalizedValue !== undefined) {
      queryParams.set(name, String(normalizedValue))
    }
  })

  const response = await fetch(`${apiUrl}/api/offers?${queryParams.toString()}`, {
    method: 'GET',
    signal,
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
  remote: [
    { value: 'full', label: '100 % télétravail' },
    { value: 'hybrid', label: 'Hybride' },
    { value: 'office', label: 'Sur site' },
  ],
  categories: ['Développement', 'Data', 'Design', 'Infrastructure', 'Produit'],
}

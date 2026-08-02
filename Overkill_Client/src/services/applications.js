const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

function getAuthHeaders() {
  const token = localStorage.getItem('token')

  return {
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

async function readJson(response) {
  const contentType = response.headers.get('content-type') || ''
  return contentType.includes('application/json') ? response.json() : null
}

export async function listApplications(signal) {
  const response = await fetch(`${API_URL}/api/applications`, {
    method: 'GET',
    headers: getAuthHeaders(),
    signal,
  })
  const data = await readJson(response)

  if (!response.ok) {
    throw new Error(data?.error || 'Impossible de charger vos candidatures.')
  }

  return Array.isArray(data) ? data : []
}

export async function createApplication(offerId) {
  const response = await fetch(`${API_URL}/api/applications`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ offer_id: offerId }),
  })
  const data = await readJson(response)

  if (response.status === 409) {
    return { application: data?.application, alreadyExists: true }
  }

  if (!response.ok) {
    throw new Error(data?.error || 'La candidature n’a pas pu être enregistrée.')
  }

  return { application: data, alreadyExists: false }
}

export async function deleteApplication(applicationId) {
  const response = await fetch(`${API_URL}/api/applications/${applicationId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    const data = await readJson(response)
    throw new Error(data?.error || 'La candidature n’a pas pu être retirée.')
  }
}

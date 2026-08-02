const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export async function sendContactMessage(message) {
  const response = await fetch(`${apiUrl}/api/contact`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  })

  let data = {}

  try {
    data = await response.json()
  } catch {
    // La réponse sera traitée comme une erreur générique ci-dessous.
  }

  if (!response.ok) {
    throw new Error(data.error || "Le message n'a pas pu être envoyé.")
  }

  return data
}

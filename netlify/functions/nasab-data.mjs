import { getStore } from '@netlify/blobs'

const store = getStore('nasab-pro-store')
const KEY = 'state'

const defaultState = {
  family: [
    {
      id: 'root',
      name: 'Kepala Keluarga',
      parentId: null,
      spouse: '',
      bio: 'Luhur pertama.',
      phone: '',
      photo: '',
    },
  ],
  users: [{ username: 'boss', pass: 'boss123', role: 'administrator' }],
}

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  })

const normalizeState = (input) => {
  const state = typeof input === 'object' && input ? input : {}

  const family = Array.isArray(state.family) && state.family.length > 0 ? state.family : defaultState.family
  const users = Array.isArray(state.users) && state.users.length > 0 ? state.users : defaultState.users

  return { family, users }
}

export default async (req) => {
  if (req.method === 'GET') {
    const saved = await store.get(KEY, { type: 'json' })
    const state = normalizeState(saved)
    if (!saved) {
      await store.setJSON(KEY, state)
    }
    return json(state)
  }

  if (req.method === 'POST') {
    const payload = await req.json().catch(() => null)
    if (!payload) {
      return json({ error: 'Payload tidak valid' }, 400)
    }

    const state = normalizeState(payload)
    await store.setJSON(KEY, state)
    return json({ ok: true })
  }

  return json({ error: 'Method not allowed' }, 405)
}

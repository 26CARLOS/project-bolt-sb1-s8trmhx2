// Use ES module imports
import formidable from 'formidable'
import type { IncomingForm } from 'formidable'
import { createClient } from '@supabase/supabase-js'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const SUPABASE_URL = process.env.SUPABASE_URL
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Server not configured for uploads' })
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  const form: IncomingForm = formidable({ multiples: false, maxFileSize: 2 * 1024 * 1024 })

  const { fields, files } = await new Promise<any>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err)
      resolve({ fields, files })
    })
  })

  const file = (files.file && Array.isArray(files.file) ? files.file[0] : files.file) as any
  if (!file) return res.status(400).json({ error: 'No file provided' })

  const filename = file.originalFilename || file.newFilename || 'logo'
  const ext = (filename.split('.').pop() || 'png').toLowerCase()
  const allowed = ['png', 'jpg', 'jpeg', 'svg', 'webp']
  if (!allowed.includes(ext)) return res.status(400).json({ error: 'Unsupported file type' })

  const arrayBuffer = await fileToArrayBuffer(file.filepath)
  const pathKey = `logos/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
  const { error } = await supabase.storage.from('logos').upload(pathKey, Buffer.from(arrayBuffer), {
    contentType: file.mimetype || 'application/octet-stream',
    upsert: true,
    cacheControl: '3600',
  })
  if (error) return res.status(400).json({ error: error.message })
  const { data } = supabase.storage.from('logos').getPublicUrl(pathKey)
  return res.status(200).json({ url: data.publicUrl })
}

async function fileToArrayBuffer(filepath: string) {
  const fs = await import('fs')
  return await fs.promises.readFile(filepath)
}

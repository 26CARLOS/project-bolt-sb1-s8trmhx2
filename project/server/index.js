require('dotenv').config()
const express = require('express')
const cors = require('cors')
const puppeteer = require('puppeteer')
const path = require('path')
const multer = require('multer')
const upload = multer({ limits: { fileSize: 2 * 1024 * 1024 } }) // 2MB
const { createClient } = require('@supabase/supabase-js')

const app = express()
app.use(cors())

const APP_URL = process.env.APP_URL || 'http://localhost:5173'
const PORT = process.env.PORT || 4000
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
const supabase = SUPABASE_URL && SUPABASE_SERVICE_KEY ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY) : null

// Ensure the 'logos' bucket exists on boot (best-effort)
async function ensureLogosBucket() {
  if (!supabase) return
  try {
    const { data: bucket, error: getErr } = await supabase.storage.getBucket('logos')
    if (getErr || !bucket) {
      const { error: createErr } = await supabase.storage.createBucket('logos', { public: true })
      if (createErr) {
        console.warn("Couldn't create 'logos' bucket:", createErr.message)
      } else {
        console.log("Created 'logos' bucket")
      }
    }
  } catch (e) {
    console.warn("Bucket check failed:", e.message)
  }
}

app.get('/api/invoices/:id/pdf', async (req, res) => {
  const { id } = req.params
  if (!id) return res.status(400).send('Missing id')

  const invoiceUrl = `${APP_URL}/invoices/${id}/print?pdf=1`

  let browser
  try {
    browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] })
    const page = await browser.newPage()

    // If you need to authenticate, set headers or cookies here using SERVICE_TOKEN
    if (process.env.SERVICE_TOKEN) {
      await page.setExtraHTTPHeaders({ Authorization: `Bearer ${process.env.SERVICE_TOKEN}` })
    }

  await page.goto(invoiceUrl, { waitUntil: 'networkidle0' })
  await page.emulateMediaType('print')

    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' } })

    res.set({ 'Content-Type': 'application/pdf', 'Content-Length': pdfBuffer.length })
    res.send(pdfBuffer)
  } catch (err) {
    console.error('PDF generation failed', err)
    res.status(500).send('PDF generation failed')
  } finally {
    if (browser) await browser.close()
  }
})

// Secure logo upload (requires SUPABASE_SERVICE_KEY); stores in 'logos' bucket and returns public URL
app.post('/api/logo', upload.single('file'), async (req, res) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Server not configured for uploads' })
    const file = req.file
    if (!file) return res.status(400).json({ error: 'No file provided' })
    const ext = (file.originalname.split('.').pop() || 'png').toLowerCase()
    const allowed = ['png', 'jpg', 'jpeg', 'svg', 'webp']
    if (!allowed.includes(ext)) return res.status(400).json({ error: 'Unsupported file type' })
    const pathKey = `logos/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
    const { error: upErr } = await supabase.storage.from('logos').upload(pathKey, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
      cacheControl: '3600'
    })
    if (upErr) return res.status(400).json({ error: upErr.message })
    const { data } = supabase.storage.from('logos').getPublicUrl(pathKey)
    return res.json({ url: data.publicUrl })
  } catch (e) {
    console.error('Upload failed', e)
    return res.status(500).json({ error: 'Upload failed' })
  }
})

app.listen(PORT, () => {
  console.log(`PDF server listening on port ${PORT} and proxing ${APP_URL}`)
  // fire-and-forget bucket ensure
  ensureLogosBucket()
})

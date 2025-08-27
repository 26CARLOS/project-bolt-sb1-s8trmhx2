import chromium from '@sparticuz/chromium'
import puppeteer, { Browser } from 'puppeteer-core'

export default async function handler(req: any, res: any) {
  const { id } = req.query
  if (!id || Array.isArray(id)) {
    return res.status(400).send('Missing id')
  }

  const APP_URL = process.env.APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:5173')
  const invoiceUrl = `${APP_URL}/invoices/${id}/print?pdf=1`

  let browser: Browser | null = null
  try {
    const isRunningOnVercel = !!process.env.VERCEL
    const executablePath = isRunningOnVercel ? await chromium.executablePath() : undefined

    browser = await puppeteer.launch({
      args: isRunningOnVercel ? chromium.args : ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: chromium.defaultViewport,
      executablePath,
      headless: true,
    })

    const page = await browser.newPage()

    if (process.env.SERVICE_TOKEN) {
      await page.setExtraHTTPHeaders({ Authorization: `Bearer ${process.env.SERVICE_TOKEN}` })
    }

    await page.goto(invoiceUrl, { waitUntil: 'networkidle0' })
    await page.emulateMediaType('print')

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' },
    })

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Length', pdfBuffer.length.toString())
    return res.status(200).send(pdfBuffer)
  } catch (err) {
    console.error('PDF generation failed', err)
    return res.status(500).send('PDF generation failed')
  } finally {
    if (browser) await browser.close()
  }
}

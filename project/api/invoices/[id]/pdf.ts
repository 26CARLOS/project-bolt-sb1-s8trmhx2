import chromium from '@sparticuz/chromium'
import puppeteer, { Browser } from 'puppeteer-core'

export default async function handler(req: any, res: any) {
  try {
    console.log("PDF API: Starting PDF generation")
    const { id } = req.query
    if (!id || Array.isArray(id)) {
      return res.status(400).send('Missing id')
    }

    // Force protocol to HTTPS for Vercel deployments
    const VERCEL_URL = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null
    const APP_URL = process.env.APP_URL || VERCEL_URL || 'http://localhost:5173'
    
    const invoiceUrl = `${APP_URL}/invoices/${id}/print?pdf=1`
    console.log(`PDF API: Will render URL: ${invoiceUrl}`)

    let browser: Browser | null = null
    try {
      const isRunningOnVercel = !!process.env.VERCEL
      console.log(`PDF API: Running on Vercel: ${isRunningOnVercel}`)
      
      const executablePath = isRunningOnVercel ? await chromium.executablePath() : undefined
      console.log(`PDF API: Chrome executable path: ${executablePath || 'default'}`)

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

    console.log('PDF API: Page loaded, generating PDF')
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' },
    })
    console.log(`PDF API: PDF generated successfully, size: ${pdfBuffer.length} bytes`)

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Length', pdfBuffer.length.toString())
    return res.status(200).send(pdfBuffer)
  } catch (err) {
    console.error('PDF API: Page processing error:', err)
    return res.status(500).send('PDF page processing failed')
  } finally {
    if (browser) {
      console.log('PDF API: Closing browser')
      await browser.close()
    }
  }
  } catch (err) {
    console.error('PDF API: Fatal error:', err)
    return res.status(500).send(`PDF generation failed: ${err.message || 'Unknown error'}`)
  }
}

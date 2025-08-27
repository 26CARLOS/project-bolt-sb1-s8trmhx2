// Fallback text-based invoice renderer that doesn't require puppeteer
export default async function handler(req: any, res: any) {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).send('Missing invoice ID');
    }

    // Format the current date
    const now = new Date();
    const dateStr = now.toLocaleDateString();
    const timeStr = now.toLocaleTimeString();
    
    // Send a nicely formatted text representation of the invoice
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${id}-text.txt"`);
    res.status(200).send(
`INVOICE EXPORT (TEXT FALLBACK)
==============================
Invoice ID: ${id}
Exported on: ${dateStr} at ${timeStr}

This is a text fallback version of your invoice.
For a proper PDF version, please try again later when our PDF service is available.

To view this invoice properly:
1. Go to your Invoices list
2. Click on the Print icon for this invoice
3. Use your browser's print function (Ctrl+P or Cmd+P)
4. Select "Save as PDF" as the destination

Thank you for your patience!
==============================`);

  } catch (err: any) {
    console.error('Text fallback API error:', err);
    res.status(500).send(`Error generating text fallback: ${err.message}`);
  }
}

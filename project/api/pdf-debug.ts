// Debug endpoint to check if PDF dependencies are loading properly
import chromium from '@sparticuz/chromium'

export default async function handler(req: any, res: any) {
  try {
    // Check if we can access chromium
    const chromiumInfo = {
      args: chromium.args ? 'Available' : 'Not available',
      defaultViewport: chromium.defaultViewport ? 'Available' : 'Not available',
      executablePath: 'Will try to get',
      headless: true
    };
    
    // Try to get executable path
    try {
      chromiumInfo.executablePath = await chromium.executablePath();
    } catch (error: any) {
      chromiumInfo.executablePath = `Error: ${error.message}`;
    }
    
    return res.status(200).json({
      status: 'ok',
      message: 'PDF debug endpoint',
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV,
      vercel: !!process.env.VERCEL,
      chromium: chromiumInfo,
      node: process.version
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      message: error.message,
      stack: error.stack
    });
  }
}

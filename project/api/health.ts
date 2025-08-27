// Simple health check endpoint to test ES Module compatibility

export default async function handler(req: any, res: any) {
  return res.status(200).json({
    status: 'ok',
    message: 'API is working',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV
  });
}

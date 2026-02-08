export default function handler(req, res) {
  if (req.method === 'GET') {
    // In a real app, fetch from database based on user ID
    const spinTickets = 5; // Sample data
    
    res.status(200).json({ success: true, tickets: spinTickets });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
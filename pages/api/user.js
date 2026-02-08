export default function handler(req, res) {
  if (req.method === 'GET') {
    // In a real app, you would fetch this from a database
    const userData = {
      id: 123,
      name: "Tester",
      balance: 0,
      vip_level: 0,
      vip_status: "VIP 0",
      profile_image: "/upload/avatar/default.png"
    };
    
    res.status(200).json(userData);
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
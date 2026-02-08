export default function handler(req, res) {
  if (req.method === 'POST') {
    const { package_id, quantity } = req.body;
    
    // In a real app, you would:
    // 1. Validate the request
    // 2. Check user balance
    // 3. Process the purchase
    // 4. Update database
    
    // Simulate processing delay
    setTimeout(() => {
      res.status(200).json({
        success: true,
        message: "Purchase successful",
        link: `/purchase/success/${Math.floor(Math.random() * 1000)}`
      });
    }, 1000);
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
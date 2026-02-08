export default function handler(req, res) {
  if (req.method === 'POST') {
    // Sample prizes data
    const prizes = [
      { id: 1, name: "Cashback Rp 5.000", value: 5000, color: "#FFD700", probability: 20 },
      { id: 2, name: "Cashback Rp 10.000", value: 10000, color: "#C0C0C0", probability: 15 },
      { id: 3, name: "Cashback Rp 20.000", value: 20000, color: "#CD7F32", probability: 10 },
      { id: 4, name: "Bonus Tiket Spin", value: 0, color: "#0277BD", probability: 25 },
      { id: 5, name: "Coba Lagi", value: 0, color: "#4CAF50", probability: 20 },
      { id: 6, name: "Jackpot Rp 50.000", value: 50000, color: "#FF3E6D", probability: 5 },
      { id: 7, name: "Diskon 15%", value: 0, color: "#9C27B0", probability: 3 },
      { id: 8, name: "VIP Upgrade", value: 0, color: "#FF9800", probability: 2 }
    ];
    
    // Simulate random selection based on probability
    const totalProbability = prizes.reduce((sum, prize) => sum + prize.probability, 0);
    let random = Math.random() * totalProbability;
    
    let selectedPrize;
    for (const prize of prizes) {
      random -= prize.probability;
      if (random <= 0) {
        selectedPrize = prize;
        break;
      }
    }
    
    // In a real app, you would:
    // 1. Verify user has enough tickets
    // 2. Deduct one ticket
    // 3. Award the prize
    // 4. Save to database
    
    // Simulate processing delay
    setTimeout(() => {
      res.status(200).json({
        success: true,
        prize: selectedPrize,
        message: "Spin successful"
      });
    }, 1000);
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
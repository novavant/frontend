export default function handler(req, res) {
  if (req.method === 'GET') {
    // Sample product data - in a real app, fetch from database
    const products = {
      data1: [
        {
          id: 21,
          name: "JXC Dasar 1",
          duration: 40,
          investment: 50000,
          daily_profit: 18500,
          total_profit: 740000,
          purchase_limit: 10,
          purchased: 0,
          category: 1,
          for_vip: false,
          vip_required: 0,
          is_eligible: true,
          promo: false
        },
        // Add more products...
      ],
      data2: [
        {
          id: 31,
          name: "JXC Singkat 1",
          duration: 1,
          investment: 50000,
          daily_profit: 80000,
          total_profit: 80000,
          purchase_limit: 1,
          purchased: 0,
          category: 2,
          for_vip: true,
          vip_required: 1,
          is_eligible: false,
          promo: false
        },
        // Add more products...
      ],
      data3: [
        {
          id: 41,
          name: "JXC Promo",
          duration: 35,
          investment: 200000,
          daily_profit: 80000,
          total_profit: 2800000,
          purchase_limit: 1,
          purchased: 0,
          category: 3,
          for_vip: true,
          vip_required: 1,
          is_eligible: false,
          promo: true
        },
        // Add more products...
      ]
    };
    
    res.status(200).json(products);
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
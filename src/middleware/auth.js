const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    // 1. Get token from header
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "មិនមានសិទ្ធិ — សូម Login ជាមុនសិន" });
    }

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Check user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "អ្នកប្រើប្រាស់មិនមានទៀតហើយ" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token មិនត្រឹមត្រូវ ឬ អស់សុពលភាព" });
  }
};

module.exports = { protect };

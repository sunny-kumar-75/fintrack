

import jwt from 'jsonwebtoken';

const protect = (req, res, next) => {
  try {
        const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized — no token provided',
      });
    }

    const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    req.user._id = decoded.id;

    next();
  } catch (error) {
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired — please log in again',
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token — authorization denied',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Authentication error',
    });
  }
};

export default protect;

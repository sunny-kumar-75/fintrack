

import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 1000,
  standardHeaders: true, 
  legacyHeaders: false,   
  message: {
    success: false,
    message: 'Too many requests — please try again after 15 minutes',
  },
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Rate limit exceeded — please slow down',
  },
});

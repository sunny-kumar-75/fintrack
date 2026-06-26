

import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendPasswordResetEmail } from '../utils/emailService.js';

const generateAccessToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '15m' });

const generateRefreshToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

const setRefreshCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: true, 
    sameSite: 'none', 
    maxAge: 7 * 24 * 60 * 60 * 1000, 
  });
};

export const signup = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      confirmPassword,
      nickname,
      firstDayOfWeek,
    } = req.body;

        if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username, email, password, and confirmPassword',
      });
    }

        if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

        const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

        const user = await User.create({
      username,
      email,
      password,
      nickname,
      firstDayOfWeek,
    });

        const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    setRefreshCookie(res, refreshToken);

    return res.status(201).json({
      success: true,
      user,
      accessToken,
    });
  } catch (error) {
    console.error('Signup error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error during signup',
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

        if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const searchEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: searchEmail }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

        const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

        const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    setRefreshCookie(res, refreshToken);

    return res.status(200).json({
      success: true,
      user,
      accessToken,
    });
  } catch (error) {
    console.error('Login error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error during login',
    });
  }
};

export const googleAuth = async (req, res) => {
  try {
    const { googleId, email, username, avatar } = req.body;

    if (!googleId || !email || !username) {
      return res.status(400).json({
        success: false,
        message: 'Google authentication data is incomplete',
      });
    }

        let user = await User.findOne({ googleId });

    if (user) {
      
      if (avatar && avatar !== user.avatar) {
        user.avatar = avatar;
        await user.save();
      }
    } else {
      
      user = await User.findOne({ email });

      if (user) {
        
        user.googleId = googleId;
        if (avatar) user.avatar = avatar;
        await user.save();
      } else {
        
        user = await User.create({
          googleId,
          email,
          username,
          avatar: avatar || '',
        });
      }
    }

        const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    setRefreshCookie(res, refreshToken);

    return res.status(200).json({
      success: true,
      user,
      accessToken,
    });
  } catch (error) {
    console.error('Google auth error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error during Google authentication',
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address',
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address',
      });
    }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetPasswordOtp = crypto
      .createHash('sha256')
      .update(otp)
      .digest('hex');
    user.resetPasswordOtpExpires = Date.now() + 10 * 60 * 1000; 
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Reset OTP generated for demo',
      demoOtp: otp,
    });
  } catch (error) {
    console.error('Forgot password error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error — could not send reset email',
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, OTP, and a new password',
      });
    }

        const hashedOtp = crypto
      .createHash('sha256')
      .update(otp)
      .digest('hex');

    const user = await User.findOne({
      email,
      resetPasswordOtp: hashedOtp,
      resetPasswordOtpExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP',
      });
    }

        user.password = password; 
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpires = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password reset successful',
    });
  } catch (error) {
    console.error('Reset password error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error during password reset',
    });
  }
};

export const refreshTokenHandler = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No refresh token provided',
      });
    }

        let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token',
      });
    }

        const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== token) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token mismatch — please log in again',
      });
    }

        const accessToken = generateAccessToken(user._id);

    return res.status(200).json({
      success: true,
      accessToken,
    });
  } catch (error) {
    console.error('Refresh token error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error during token refresh',
    });
  }
};

export const getMe = async (req, res) => {
  try {
    
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Get me error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching user profile',
    });
  }
};

export const logout = async (req, res) => {
  try {
        const token = req.cookies?.refreshToken;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.id);
        if (user) {
          user.refreshToken = undefined;
          await user.save();
        }
      } catch (err) {
        
      }
    }

        res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });

    return res.status(200).json({
      success: true,
      message: 'Logged out',
    });
  } catch (error) {
    console.error('Logout error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error during logout',
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide current and new password' });
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.password) {
      return res.status(400).json({ success: false, message: 'OAuth users cannot change password this way' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect current password' });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error during password change' });
  }
};

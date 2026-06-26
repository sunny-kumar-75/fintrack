import User from '../models/User.js';

export const updateProfile = async (req, res, next) => {
  try {
    const { name, nickname, email } = req.body;
    const user = await User.findById(req.user._id);
    
    if (name) user.username = name;
    if (nickname) user.nickname = nickname;
    if (email) user.email = email;
    
    await user.save();
    res.json({ success: true, user: { username: user.username, nickname: user.nickname, email: user.email } });
  } catch (error) {
    next(error);
  }
};


export const deleteAccount = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.json({ success: true, message: 'Account deleted' });
  } catch (error) {
    next(error);
  }
};

const User = require('../models/User');
const { generateToken } = require('../middleware/authMiddleware');
const mongoose = require('mongoose');
const memoryStore = require('../config/memoryStore');
const bcrypt = require('bcryptjs');
const { sendRealEmailOtp, sendRealSmsOtp, sendContactInquiryEmail, sendPasswordResetEmail } = require('../utils/otpService');

const isDbReady = () => mongoose.connection.readyState === 1;

const pendingRegistrationOtps = new Map();
const passwordResetOtps = new Map();

// @desc Send OTP for Email and Phone Verification
// @route POST /api/auth/send-registration-otp
const sendRegistrationOtp = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    if (!email || !phone) {
      return res.status(400).json({ message: 'Please provide both email address and phone number' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanPhone = phone.trim();

    if (isDbReady()) {
      const userExists = await User.findOne({
        $or: [{ email: cleanEmail }, { phone: cleanPhone }]
      });
      if (userExists) {
        if (userExists.email === cleanEmail) {
          return res.status(400).json({ message: 'An account with this email address already exists' });
        }
        return res.status(400).json({ message: 'An account with this mobile phone number already exists' });
      }
    } else {
      const userExists = memoryStore.users.find(u => u.email.toLowerCase() === cleanEmail || u.phone === cleanPhone);
      if (userExists) {
        return res.status(400).json({ message: 'An account with this email or phone already exists' });
      }
    }

    // Generate 6-digit Email OTP only
    const emailOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    pendingRegistrationOtps.set(cleanEmail, {
      emailOtp,
      phone: cleanPhone,
      expiresAt
    });

    console.log(`\n======================================================`);
    console.log(`[NAIVADYAM OTP DISPATCH LOG]`);
    console.log(`Recipient Email: ${cleanEmail} -> Email OTP: ${emailOtp}`);
    console.log(`======================================================\n`);

    // Dispatch Real Email OTP
    const emailRes = await sendRealEmailOtp(cleanEmail, emailOtp, name || 'Valued Customer');

    if (!emailRes.success) {
      return res.status(500).json({
        message: 'Failed to send verification email. Please check your email address and try again.'
      });
    }

    return res.json({
      message: 'Verification code sent to your email address',
      email: cleanEmail,
      phone: cleanPhone
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Register User with Verified OTPs
// @route POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, emailOtp } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: 'Please enter all required fields' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanPhone = phone.trim();

    // Verify OTPs
    const record = pendingRegistrationOtps.get(cleanEmail);
    if (!record) {
      return res.status(400).json({ message: 'No verification OTP found for this email. Please request a new code.' });
    }

    if (Date.now() > record.expiresAt) {
      pendingRegistrationOtps.delete(cleanEmail);
      return res.status(400).json({ message: 'Verification OTP has expired. Please request a new code.' });
    }

    if (emailOtp !== record.emailOtp) {
      return res.status(400).json({ message: 'Invalid Email verification code' });
    }

    // Clear OTP record
    pendingRegistrationOtps.delete(cleanEmail);

    if (isDbReady()) {
      const userExists = await User.findOne({
        $or: [{ email: cleanEmail }, { phone: cleanPhone }]
      });
      if (userExists) {
        return res.status(400).json({ message: 'User with this email or phone number already exists' });
      }

      const user = await User.create({
        name,
        email: cleanEmail,
        password,
        phone: cleanPhone,
        role: 'customer',
        isEmailVerified: true,
        isPhoneVerified: false
      });

      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        loyaltyPoints: user.loyaltyPoints,
        savedAddresses: user.savedAddresses,
        wishlist: user.wishlist || [],
        token: generateToken(user._id)
      });
    } else {
      // Memory store fallback
      const userExists = memoryStore.users.find(u => u.email.toLowerCase() === cleanEmail || u.phone === cleanPhone);
      if (userExists) {
        return res.status(400).json({ message: 'User with this email or phone already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = {
        _id: 'usr_' + Date.now(),
        name,
        email: cleanEmail,
        password: hashedPassword,
        phone: cleanPhone,
        role: 'customer',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        isEmailVerified: true,
        isPhoneVerified: true,
        loyaltyPoints: 150,
        savedAddresses: [],
        wishlist: [],
        isBlocked: false,
        createdAt: new Date()
      };

      memoryStore.users.push(newUser);

      return res.status(201).json({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        avatar: newUser.avatar,
        isEmailVerified: newUser.isEmailVerified,
        isPhoneVerified: newUser.isPhoneVerified,
        loyaltyPoints: newUser.loyaltyPoints,
        savedAddresses: newUser.savedAddresses,
        wishlist: newUser.wishlist || [],
        token: generateToken(newUser._id)
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Auth User & Get Token
// @route POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (isDbReady()) {
      const user = await User.findOne({ email });
      if (user && (await user.matchPassword(password))) {
        if (user.isBlocked) {
          return res.status(403).json({ message: 'Your account has been suspended by administrator.' });
        }

        return res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          avatar: user.avatar,
          loyaltyPoints: user.loyaltyPoints,
          savedAddresses: user.savedAddresses,
          wishlist: user.wishlist || [],
          token: generateToken(user._id)
        });
      }
    } else {
      // Memory store fallback
      const user = memoryStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (user && (await bcrypt.compare(password, user.password))) {
        if (user.isBlocked) {
          return res.status(403).json({ message: 'Your account has been suspended by administrator.' });
        }

        return res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          avatar: user.avatar,
          loyaltyPoints: user.loyaltyPoints,
          savedAddresses: user.savedAddresses,
          token: generateToken(user._id)
        });
      }
    }

    return res.status(401).json({ message: 'Invalid email or password' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Authenticate with Google (Login / Auto-Register)
// @route POST /api/auth/google
const googleAuth = async (req, res) => {
  try {
    const { email, name, avatar } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Google account email is required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const displayName = name || cleanEmail.split('@')[0];

    if (isDbReady()) {
      let user = await User.findOne({ email: cleanEmail });

      if (user) {
        if (user.isBlocked) {
          return res.status(403).json({ message: 'Your account has been suspended by administrator.' });
        }
      } else {
        // Create new user via Google
        const randomPassword = Math.random().toString(36).slice(-10) + 'G!';
        user = await User.create({
          name: displayName,
          email: cleanEmail,
          password: randomPassword,
          phone: '',
          role: 'customer',
          isEmailVerified: true,
          avatar: avatar || ''
        });
      }

      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
        loyaltyPoints: user.loyaltyPoints,
        savedAddresses: user.savedAddresses,
        wishlist: user.wishlist || [],
        token: generateToken(user._id)
      });
    } else {
      // Memory store fallback
      let user = memoryStore.users.find(u => u.email.toLowerCase() === cleanEmail);

      if (user) {
        if (user.isBlocked) {
          return res.status(403).json({ message: 'Your account has been suspended by administrator.' });
        }
      } else {
        const hashedPassword = await bcrypt.hash('GooglePass123!', 10);
        user = {
          _id: 'usr_g_' + Date.now(),
          name: displayName,
          email: cleanEmail,
          password: hashedPassword,
          phone: '',
          role: 'customer',
          avatar: avatar || '',
          isEmailVerified: true,
          isPhoneVerified: false,
          loyaltyPoints: 100,
          savedAddresses: [],
          wishlist: [],
          isBlocked: false,
          createdAt: new Date()
        };
        memoryStore.users.push(user);
      }

      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
        loyaltyPoints: user.loyaltyPoints,
        savedAddresses: user.savedAddresses,
        wishlist: user.wishlist || [],
        token: generateToken(user._id)
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc Get User Profile
// @route GET /api/auth/profile
const getUserProfile = async (req, res) => {
  try {
    if (isDbReady()) {
      const user = await User.findById(req.user._id).populate('wishlist');
      if (user) {
        return res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          avatar: user.avatar,
          dob: user.dob,
          loyaltyPoints: user.loyaltyPoints,
          savedAddresses: user.savedAddresses,
          wishlist: user.wishlist
        });
      }
    } else {
      const user = memoryStore.users.find(u => u._id.toString() === req.user._id.toString());
      if (user) {
        const wishlistProds = memoryStore.products.filter(p => user.wishlist?.includes(p._id));
        return res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          avatar: user.avatar,
          dob: user.dob || '',
          loyaltyPoints: user.loyaltyPoints,
          savedAddresses: user.savedAddresses,
          wishlist: wishlistProds
        });
      }
    }
    res.status(404).json({ message: 'User not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update Profile
// @route PUT /api/auth/profile
const updateUserProfile = async (req, res) => {
  try {
    if (isDbReady()) {
      const user = await User.findById(req.user._id);
      if (user) {
        user.name = req.body.name || user.name;
        user.phone = req.body.phone || user.phone;
        user.dob = req.body.dob || user.dob;
        user.avatar = req.body.avatar || user.avatar;

        const updatedUser = await user.save();
        return res.json({
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          role: updatedUser.role,
          avatar: updatedUser.avatar,
          dob: updatedUser.dob,
          loyaltyPoints: updatedUser.loyaltyPoints,
          savedAddresses: updatedUser.savedAddresses,
          token: generateToken(updatedUser._id)
        });
      }
    } else {
      const user = memoryStore.users.find(u => u._id.toString() === req.user._id.toString());
      if (user) {
        user.name = req.body.name || user.name;
        user.phone = req.body.phone || user.phone;
        user.avatar = req.body.avatar || user.avatar;
        return res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          avatar: user.avatar,
          dob: user.dob || '',
          loyaltyPoints: user.loyaltyPoints,
          savedAddresses: user.savedAddresses,
          token: generateToken(user._id)
        });
      }
    }
    res.status(404).json({ message: 'User not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Add Saved Address
// @route POST /api/auth/address
const addAddress = async (req, res) => {
  try {
    const { name, phone, street, city, state, pincode, type, isDefault } = req.body;
    if (isDbReady()) {
      const user = await User.findById(req.user._id);
      if (user) {
        if (isDefault) user.savedAddresses.forEach(a => a.isDefault = false);
        user.savedAddresses.push({ name, phone, street, city, state, pincode, type: type || 'Home', isDefault: !!isDefault });
        await user.save();
        return res.json(user.savedAddresses);
      }
    } else {
      const user = memoryStore.users.find(u => u._id.toString() === req.user._id.toString());
      if (user) {
        user.savedAddresses.push({ _id: 'addr_' + Date.now(), name, phone, street, city, state, pincode, type: type || 'Home', isDefault: !!isDefault });
        return res.json(user.savedAddresses);
      }
    }
    res.status(404).json({ message: 'User not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Delete Address
// @route DELETE /api/auth/address/:addressId
const deleteAddress = async (req, res) => {
  try {
    if (isDbReady()) {
      const user = await User.findById(req.user._id);
      if (user) {
        user.savedAddresses = user.savedAddresses.filter(a => a._id.toString() !== req.params.addressId);
        await user.save();
        return res.json(user.savedAddresses);
      }
    } else {
      const user = memoryStore.users.find(u => u._id.toString() === req.user._id.toString());
      if (user) {
        user.savedAddresses = user.savedAddresses.filter(a => a._id.toString() !== req.params.addressId);
        return res.json(user.savedAddresses);
      }
    }
    res.status(404).json({ message: 'User not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Toggle Wishlist
// @route POST /api/auth/wishlist/toggle
const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    if (isDbReady()) {
      const user = await User.findById(req.user._id);
      if (user) {
        const pIdStr = productId.toString();
        const index = user.wishlist.findIndex(id => id.toString() === pIdStr);
        if (index > -1) {
          user.wishlist.splice(index, 1);
        } else {
          user.wishlist.push(productId);
        }
        await user.save();
        const updated = await User.findById(req.user._id).populate('wishlist');
        return res.json(updated.wishlist);
      }
    } else {
      const user = memoryStore.users.find(u => u._id.toString() === req.user._id.toString());
      if (user) {
        const pIdStr = productId.toString();
        const index = user.wishlist.findIndex(id => id.toString() === pIdStr);
        if (index > -1) {
          user.wishlist.splice(index, 1);
        } else {
          user.wishlist.push(productId);
        }
        const wishlistProds = memoryStore.products.filter(p => user.wishlist.some(id => id.toString() === p._id.toString()));
        return res.json(wishlistProds);
      }
    }
    res.status(404).json({ message: 'User not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Send Contact Form Inquiry Email
// @route POST /api/auth/contact
const sendContactInquiry = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Please provide all required fields (name, email, message)' });
    }

    const result = await sendContactInquiryEmail({ name, email, phone, subject, message });
    if (result.success) {
      return res.json({ message: 'Inquiry submitted successfully! A confirmation email has been sent.' });
    } else {
      return res.status(500).json({ message: result.error || 'Failed to send inquiry email' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Send Forgot Password Reset OTP to Email
// @route POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Please provide your registered email address' });
    }

    const cleanEmail = email.toLowerCase().trim();
    let userName = 'Valued Customer';
    let userFound = false;

    if (isDbReady()) {
      const user = await User.findOne({ email: cleanEmail });
      if (user) {
        userName = user.name;
        userFound = true;
      }
    } else {
      const user = memoryStore.users.find(u => u.email.toLowerCase() === cleanEmail);
      if (user) {
        userName = user.name;
        userFound = true;
      }
    }

    if (!userFound) {
      return res.status(404).json({ message: 'No account registered with this email address' });
    }

    const resetOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    passwordResetOtps.set(cleanEmail, {
      otp: resetOtp,
      expiresAt
    });

    console.log(`\n======================================================`);
    console.log(`[NAIVADYAM FORGOT PASSWORD RESET OTP DISPATCH LOG]`);
    console.log(`Recipient Email: ${cleanEmail} -> Reset OTP: ${resetOtp}`);
    console.log(`======================================================\n`);

    // Send Real Password Reset Email
    const emailRes = await sendPasswordResetEmail(cleanEmail, resetOtp, userName);

    if (!emailRes.success) {
      return res.status(500).json({
        message: 'Failed to send password reset email. Please check your email address and try again.'
      });
    }

    return res.json({
      message: 'Password reset code sent to your email address',
      email: cleanEmail
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Reset Password with Verified OTP
// @route POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Please provide email, verification code, and new password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const record = passwordResetOtps.get(cleanEmail);

    if (!record) {
      return res.status(400).json({ message: 'No reset request found for this email. Please request a new code.' });
    }

    if (Date.now() > record.expiresAt) {
      passwordResetOtps.delete(cleanEmail);
      return res.status(400).json({ message: 'Verification code has expired. Please request a new code.' });
    }

    if (otp.trim() !== record.otp) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    // Clear OTP record
    passwordResetOtps.delete(cleanEmail);

    if (isDbReady()) {
      const user = await User.findOne({ email: cleanEmail });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      user.password = newPassword;
      await user.save();
    } else {
      const user = memoryStore.users.find(u => u.email.toLowerCase() === cleanEmail);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      user.password = await bcrypt.hash(newPassword, 10);
    }

    return res.json({ message: 'Password reset successful! You can now sign in with your new password.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sendRegistrationOtp,
  registerUser,
  loginUser,
  googleAuth,
  getUserProfile,
  updateUserProfile,
  addAddress,
  deleteAddress,
  toggleWishlist,
  sendContactInquiry,
  forgotPassword,
  resetPassword
};


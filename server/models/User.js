const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please provide a valid email address']
    },
    password: {
      type: String,
      required: function() {
        return !this.googleId;
      },
      minlength: [8, 'Password must be at least 8 characters long']
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[a-zA-Z0-9_-]{3,30}$/, 'Username must be 3-30 characters long and contain only letters, numbers, underscores, or hyphens']
    },
    bio: {
      type: String,
      default: '',
      trim: true,
      maxlength: [300, 'Bio cannot exceed 300 characters']
    },
    googleId: {
      type: String,
      default: null
    },
    avatar: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('User', userSchema);

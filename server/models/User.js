const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },  // Store password in plaintext
  role: { type: String, enum: ['superadmin', 'admin', 'member'], required: true },
}, { timestamps: true });

userSchema.methods.matchPassword = function (enteredPassword) {
  return this.password === enteredPassword;  // Compare plaintext passwords
};

module.exports = mongoose.model('User', userSchema);

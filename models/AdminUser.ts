import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const { Schema, models, model } = mongoose;

const AdminUserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, default: 'Admin' },
  },
  { timestamps: true }
);

AdminUserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

AdminUserSchema.methods.comparePassword = async function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export const AdminUser = models.AdminUser || model('AdminUser', AdminUserSchema);

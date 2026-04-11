import mongoose from 'mongoose';

const { Schema, models, model } = mongoose;

const InquirySchema = new Schema(
  {
    name: { type: String, required: true },
    company: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, required: true },
    productInterest: { type: String, default: '' },
    message: { type: String, default: '' },
    status: { type: String, enum: ['new', 'contacted', 'closed'], default: 'new' },
  },
  { timestamps: true }
);

export const Inquiry = models.Inquiry || model('Inquiry', InquirySchema);

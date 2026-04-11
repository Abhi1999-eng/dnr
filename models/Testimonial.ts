import mongoose from 'mongoose';

const { Schema, models, model } = mongoose;

const TestimonialSchema = new Schema(
  {
    name: { type: String, required: true },
    feedback: { type: String, required: true },
    rating: { type: Number, default: 5 },
  },
  { timestamps: true }
);

export const Testimonial = models.Testimonial || model('Testimonial', TestimonialSchema);

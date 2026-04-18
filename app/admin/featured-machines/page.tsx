import { redirect } from 'next/navigation';

export default function AdminFeaturedMachinesRedirectPage() {
  redirect('/admin/products');
}

import { redirect } from 'next/navigation';

export default function AdminNewBlogPage() {
  redirect('/admin/blogs?compose=new');
}

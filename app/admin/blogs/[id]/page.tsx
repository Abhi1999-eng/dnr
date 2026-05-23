import { redirect } from 'next/navigation';

export default async function AdminEditBlogRedirectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/admin/blogs?edit=${id}`);
}

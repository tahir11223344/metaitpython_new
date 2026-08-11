import BlogForm from "@/components/admin/blogs/Blogform";

export default function CreateBlogPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-3 py-6 sm:px-4 sm:py-8">
      <BlogForm mode="create" />
    </div>
  );
}

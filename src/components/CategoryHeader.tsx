
import { Category } from "@/types";
import { Breadcrumb } from "@/components/ui/breadcrumb";

interface CategoryHeaderProps {
  category: Category;
}

export function CategoryHeader({ category }: CategoryHeaderProps) {
  // Helper: Get uppercase version of the slug (e.g., 'bca' => 'BCA')
  function getSlugAbbreviation(slug: string) {
    return slug ? slug.toUpperCase() : '';
  }

  return (
    <div className="space-y-4">
      <Breadcrumb 
        segments={[
          { name: category.name, href: `/${category.slug}` }
        ]} 
      />
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0 h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center text-primary overflow-hidden relative">
          {category.image_url && category.image_url.trim() !== "" ? (
            <img
              src={category.image_url}
              alt={category.name}
              className="absolute h-full w-full object-cover rounded-full"
            />
          ) : (
            <span className="text-2xl font-bold z-10">
              {getSlugAbbreviation(category.slug)}
            </span>
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold">{category.name}</h1>
          <p className="text-muted-foreground">{category.description}</p>
        </div>
      </div>
    </div>
  );
}

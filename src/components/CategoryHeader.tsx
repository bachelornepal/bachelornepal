
import { Category } from "@/types";
import { Breadcrumb } from "@/components/ui/breadcrumb";

interface CategoryHeaderProps {
  category: Category;
}

export function CategoryHeader({ category }: CategoryHeaderProps) {
  return (
    <div className="space-y-4">
      <Breadcrumb 
        segments={[
          { name: category.name, href: `/${category.slug}` }
        ]} 
      />
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0 h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center text-primary overflow-hidden">
          {category.image_url ? (
            <img 
              src={category.image_url} 
              alt={category.name} 
              className="w-full h-full object-cover" 
            />
          ) : (
            <span className="text-xl">Image</span>
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

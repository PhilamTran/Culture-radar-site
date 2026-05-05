import Link from "next/link";

type EventCardProps = {
  id: number;
  title: string;
  date: string;
  city: string;
  image: string;
  location?: string;
  category?: string;
  description?: string;
};

export default function EventCard({
  id,
  title,
  date,
  city,
  image,
  location,
  category,
  description,
}: EventCardProps) {
  return (
    <Link href={`/event/${id}`} className="block">
      <article className="overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
        <div className="h-48 w-full overflow-hidden">
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          />
        </div>

        <div className="p-4">
          {category && (
            <span className="mb-3 inline-block rounded-full bg-black px-3 py-1 text-xs font-medium text-white">
              {category}
            </span>
          )}

          <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>

          <p className="text-sm text-gray-600">{date}</p>
          <p className="text-sm text-gray-600">{city}</p>

          {location && (
            <p className="mt-1 text-sm text-gray-500">{location}</p>
          )}

          {description && (
            <p className="mt-3 line-clamp-2 text-sm text-gray-500">
              {description}
            </p>
          )}
        </div>
      </article>
    </Link>
  );
}
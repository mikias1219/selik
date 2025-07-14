import Image from "next/image";

interface Game {
  background_image: string;
  name: string;
  genres: { name: string }[];
  rating: number;
  released: string;
}

export default function HeroSection({ game }: { game: Game }) {
  if (!game) return null;

  return (
    <div className="relative w-[80%] h-80 md:h-96">
      <Image
        src={game.background_image}
        alt={game.name}
        layout="fill"
        className="object-cover brightness-50"
        style={{ objectFit: "cover", objectPosition: "top" }}
        priority
      />
      <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black via-transparent to-transparent">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">{game.name}</h1>
        <p className="text-sm text-gray-300">
          {game.genres.map((g) => g.name).join(", ")} | Rating: {game.rating} |
          Released: {game.released}
        </p>
      </div>
    </div>
  );
}

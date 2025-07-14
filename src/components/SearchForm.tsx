// components/SearchForm.tsx
interface SearchFormProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  handleSearch: (event: React.FormEvent) => void;
}

const SearchForm: React.FC<SearchFormProps> = ({ searchTerm, setSearchTerm, handleSearch }) => {
  return (
    <form onSubmit={handleSearch} className="flex justify-center gap-4 mb-12">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search for movies..."
        className="p-4 rounded-full w-72 text-black"
      />
      <button
        type="submit"
        className="bg-purple-600 text-white p-4 rounded-full hover:bg-purple-700 transition duration-200"
      >
        Search
      </button>
    </form>
  );
};

export default SearchForm;

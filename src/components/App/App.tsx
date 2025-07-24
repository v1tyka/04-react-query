import { useState, useEffect } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import styles from "./App.module.css";
import ReactPaginate from "react-paginate";
import fetchMovies from "../../services/movieService";
import type { Movie } from "../../types/movie";
import ErrorMessage from "../ErrorMessage/ErrorMessage";
import toast, { Toaster } from "react-hot-toast";

import SearchBar from "../SearchBar/SearchBar";
import MovieModal from "../MovieModal/MovieModal";
import MovieGrid from "../MovieGrid/MovieGrid";
import Loader from "../Loader/Loader";

export default function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const { data, isLoading, isError, isSuccess } = useQuery({
    queryKey: ["movie", searchQuery, currentPage],
    queryFn: () => fetchMovies(searchQuery, currentPage),
    enabled: searchQuery !== "",
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (!isLoading && data && data.results.length === 0) {
      toast.error("No movies found for your request.");
    }
  }, [data, isLoading]);

  const handleSearch = (newMovie: string) => {
    if (!newMovie.trim()) {
      toast.error("Please enter your search query.");
      return;
    }
    setSearchQuery(newMovie);
    setCurrentPage(1);
  };

  const totalPages = data?.total_pages || 0;

  const openModal = (movie: Movie) => {
    setSelectedMovie(movie);
  };

  const closeModal = () => setSelectedMovie(null);

  return (
    <div className={styles.app}>
      {selectedMovie && (
        <MovieModal movie={selectedMovie} onClose={closeModal} />
      )}

      <SearchBar onSubmit={handleSearch} />

      {isLoading && <Loader />}
      {isSuccess && (
        <ReactPaginate
          pageCount={totalPages}
          pageRangeDisplayed={5}
          marginPagesDisplayed={1}
          onPageChange={({ selected }) => setCurrentPage(selected + 1)}
          forcePage={currentPage - 1}
          containerClassName={styles.pagination}
          activeClassName={styles.active}
          nextLabel="→"
          previousLabel="←"
        />
      )}

      {isSuccess && <MovieGrid movies={data.results} onSelect={openModal} />}

      {isError && <ErrorMessage />}
      <Toaster />
    </div>
  );
}

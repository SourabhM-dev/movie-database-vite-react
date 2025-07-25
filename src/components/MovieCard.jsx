import React from 'react';
import noMoviePoster from '../assets/no-movie.png';

const MovieCard = ({ movie: { Title, Year, Poster, Type } }) => {
  return (
    <div className="movie-card">
      <img
        src={Poster !== 'N/A' ? Poster : noMoviePoster}
        alt={Title}
      />
      <div className="mt-4">
        <h3>{Title}</h3>

        <div className="content">
          <p className="lang">{Type}</p>
          <span>•</span>
          <p className="year">{Year}</p>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
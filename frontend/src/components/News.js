import React, { useEffect, useState } from "react";
import NewsItem from "./NewsItem";
import Spinner from "./Spinner";
import PropTypes from "prop-types";
import InfiniteScroll from "react-infinite-scroll-component";

const News = ({
  country = "in",
  pageSize = 6,
  category = "general",
  setProgress,
}) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  // Capitalize first letter of category
  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  // Fetch initial news data
  const updateNews = async () => {
    setProgress(10);
    // const url = `https://newsapi.org/v2/top-headlines?country=${country}&category=${category}&apiKey=c74590ae11774ecba474511f60dc259a&page=1&pageSize=${pageSize}`;

    // const url = `https://newsapi.org/v2/top-headlines?country=${country}&category=${category}&apiKey=fcae3bcc558143be8bf97d8c219d6049&page=1&pageSize=${pageSize}`;

    // const url = `https://newsapi.org/v2/top-headlines?country=${country}&category=${category}&apiKey=c74590ae11774ecba474511f60dc259a&page=1&pageSize=${pageSize}`;

    const url = `https://cors-anywhere.herokuapp.com/https://newsapi.org/v2/top-headlines?country=${country}&category=${category}&apiKey=YOUR_API_KEY&page=1&pageSize=${pageSize}`;

    setLoading(true);

    let data = await fetch(url);
    setProgress(30);
    let parsedData = await data.json();
    setProgress(70);

    setArticles(parsedData.articles);
    setTotalResults(parsedData.totalResults);
    setLoading(false);

    setProgress(100);
  };

  useEffect(() => {
    updateNews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch more news for infinite scrolling
  const fetchMoreData = async () => {
    const nextPage = page + 1;
    setPage(nextPage);

    // const url = `https://newsapi.org/v2/top-headlines?country=${country}&category=${category}&apiKey=c74590ae11774ecba474511f60dc259a&page=${nextPage}&pageSize=${pageSize}`;

    // const url = `https://newsapi.org/v2/top-headlines?country=${country}&category=${category}&apiKey=fcae3bcc558143be8bf97d8c219d6049&page=${nextPage}&pageSize=${pageSize}`;

    // const url = `https://newsapi.org/v2/top-headlines?country=${country}&category=${category}&apiKey=c74590ae11774ecba474511f60dc259a&page=${nextPage}&pageSize=${pageSize}`;

    const url = `https://cors-anywhere.herokuapp.com/https://newsapi.org/v2/top-headlines?country=${country}&category=${category}&apiKey=YOUR_API_KEY&page=${nextPage}&pageSize=${pageSize}`;

    let data = await fetch(url);
    let parsedData = await data.json();

    setArticles((prevArticles) => [...prevArticles, ...parsedData.articles]);
  };

  return (
    <>
      <h2 className="text-center" style={{ margin: "35px", marginTop: "90px" }}>
        NewsJunction - Top {capitalizeFirstLetter(category)} Headlines
      </h2>
      {loading && <Spinner />}
      <InfiniteScroll
        dataLength={articles.length}
        next={fetchMoreData}
        hasMore={articles.length < totalResults}
        loader={<Spinner />}
      >
        <div className="container">
          <div className="row">
            {articles.map((element) => (
              <div className="col-md-4" key={element.url}>
                <NewsItem
                  title={element.title}
                  description={element.description}
                  newsUrl={element.url}
                  author={element.author}
                  date={element.publishedAt}
                  source={element.source.name}
                />
              </div>
            ))}
          </div>
        </div>
      </InfiniteScroll>
    </>
  );
};

// PropTypes validation
News.propTypes = {
  country: PropTypes.string,
  pageSize: PropTypes.number,
  category: PropTypes.string,
  setProgress: PropTypes.func.isRequired,
};

export default News;

import React, { useCallback, useEffect, useState } from "react";
import NewsItem from "./NewsItem";
import Spinner from "./Spinner";
import PropTypes from "prop-types";
import InfiniteScroll from "react-infinite-scroll-component";

const News = ({
  country = "us",
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

  // Proxy to avoid CORS issues in deployed sites
  const proxyUrl = "https://api.allorigins.win/raw?url=";

  const updateNews = useCallback(async () => {
    setProgress(10);

    const apiUrl = `https://newsapi.org/v2/top-headlines?country=${country}&category=${category}&apiKey=c74590ae11774ecba474511f60dc259a&page=1&pageSize=${pageSize}`;
    const url = proxyUrl + encodeURIComponent(apiUrl);

    setLoading(true);

    try {
      let response = await fetch(url);
      setProgress(30);
      let data = await response.json();
      setProgress(70);

      console.log("API Response:", data); // Debugging Log

      if (data.articles && data.articles.length > 0) {
        setArticles(data.articles);
        setTotalResults(data.totalResults);
      } else {
        console.error("No articles found!");
      }

      setLoading(false);
      setProgress(100);
    } catch (error) {
      console.error("Error fetching news:", error);
    }
  }, [country, category, pageSize, setProgress]);

  useEffect(() => {
    updateNews();
  }, [updateNews]);

  // Fetch more news for infinite scrolling
  const fetchMoreData = async () => {
    const nextPage = page + 1;
    setPage(nextPage);

    const apiUrl = `https://newsapi.org/v2/top-headlines?country=${country}&category=${category}&apiKey=c74590ae11774ecba474511f60dc259a&page=${nextPage}&pageSize=${pageSize}`;
    const url = proxyUrl + encodeURIComponent(apiUrl);

    try {
      let response = await fetch(url);
      let data = await response.json();

      console.log("Fetched More Articles:", data);

      setArticles((prevArticles) => [...prevArticles, ...data.articles]);
    } catch (error) {
      console.error("Error loading more news:", error);
    }
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
            {articles && articles.length > 0 ? (
              articles.map((element) => (
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
              ))
            ) : (
              <p className="text-center">No news articles found.</p>
            )}
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

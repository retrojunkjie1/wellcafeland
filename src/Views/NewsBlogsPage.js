import React from "react";
import PageBanner from "../components/PageBanner";
import NewsFeed from "../features/news/NewsFeed";
import RadioPlayer from "../components/RadioPlayer";

const NewsBlogsPage = () => {
  const banner = `${process.env.PUBLIC_URL}/images/rituals.jpg`;
  return (
    <div>
      <PageBanner imageSrc={banner} altText="Wellness news background" />
      <NewsFeed />
      <RadioPlayer />
    </div>
  );
};

export default NewsBlogsPage;

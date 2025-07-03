// client/src/pages/Blogs.jsx
import React from 'react';

const Blogs = () => {
  return (
    <div className="blogs-page">
      <section className="hero">
        <h1>Blogs</h1>
        <p>Catch up on the latest news, insights and updates from our team</p>
      </section>

      <section className="blog-posts">
        <article className="post">
          <h2>Why Upskilling Matters</h2>
          <p>
            In today’s fast-changing tech world, keeping your skills sharp is no longer optional...
          </p>
        </article>

        <article className="post">
          <h2>ALX’s Impact in Africa</h2>
          <p>
            The ALX program is transforming the African tech space by equipping the next generation...
          </p>
        </article>

        {/* Add more articles as needed */}
      </section>
    </div>
  );
};

export default Blogs;


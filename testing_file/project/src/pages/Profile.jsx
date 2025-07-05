import React from 'react';
import '../styles/shared.css';
import '../styles/profile.css';

const Profile = () => {
  return (
    <section className="profile-wrapper">
      {/* Header */}
      <div className="profile-header">
        <div className="initials">JD</div>
        <div>
          <h1 className="name">Jane Doe</h1>
          <p className="title">Frontend Developer</p>
          <p className="location">Cape Town, South Africa</p>
        </div>
      </div>

      {/* About */}
      <section className="profile-section">
        <h2>About</h2>
        <p>
          Jane is a passionate frontend developer with a background in graphic design and UI/UX strategy.
          Focused on building accessible and scalable web interfaces using React and Tailwind CSS.
        </p>
      </section>

      {/* Skills */}
      <section className="profile-section">
        <h2>Skills</h2>
        <div className="skill-tags">
          {['React', 'Tailwind CSS', 'Figma', 'Accessibility'].map((skill, i) => (
            <span key={i} className="pill">{skill}</span>
          ))}
        </div>
      </section>

      {/* Experience */}
      <section className="profile-section">
        <h2>Experience</h2>
        <div className="experience-entry">
          <h3>UI Designer <span>@ CodePixel</span></h3>
          <p className="duration">2022 – Present</p>
          <p>Designed and built responsive landing pages and internal dashboards.</p>
        </div>
        <div className="experience-entry">
          <h3>Frontend Intern <span>@ DevLaunch</span></h3>
          <p className="duration">2021</p>
          <p>Collaborated on a React-based job board platform.</p>
        </div>
      </section>

      {/* Projects */}
      <section className="profile-section">
        <h2>Projects</h2>
        <ul className="projects">
          <li><strong>JobPrep:</strong> A portfolio platform for recent graduates.</li>
          <li><strong>Insight:</strong> A skills tracking dashboard for internal HR teams.</li>
        </ul>
      </section>

      {/* Endorsements */}
      <section className="profile-section">
        <h2>Endorsements</h2>
        <div className="endorsement">
          <p>"Jane's attention to accessibility is unmatched."</p>
          <span>– Lebo M., UI/UX Designer</span>
        </div>
        <div className="endorsement">
          <p>"Her Tailwind knowledge saved us hours in development."</p>
          <span>– Thoko K., Lead Engineer</span>
        </div>
      </section>
    </section>
  );
};

export default Profile;


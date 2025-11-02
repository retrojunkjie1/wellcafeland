import React from "react";
import PropTypes from "prop-types";
import "./EventCard.css";
import Thumbnail from "./Thumbnail";

const EventCard = ({ event }) => (
  <div className="wc-glass-card wc-event">
    <Thumbnail src={event.image} alt={event.title} className="wc-event-img" />
    <div className="wc-event-body">
      <h3>{event.title}</h3>
      <p className="wc-event-date">{event.date}</p>
      <p className="wc-event-loc">{event.location}</p>
      <p className="wc-event-desc">{event.desc}</p>
      <button className="wc-event-btn">Learn More</button>
    </div>
  </div>
);

EventCard.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    desc: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
  }).isRequired,
};

export default EventCard;

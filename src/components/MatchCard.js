import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useDrag, useDrop } from 'react-dnd';

const ItemTypes = {
  CARD: 'card',
};

const MatchCard = ({ match, index, moveCard }) => {
  const [stats, setStats] = useState({});
  const [score, setScore] = useState(`${match.homeTeam.shortName} [${match.homeScore.current}] - [${match.awayScore.current}] ${match.awayTeam.shortName}`);

  const ref = useRef(null);

  const [{ handlerId }, drop] = useDrop({
    accept: ItemTypes.CARD,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) {
        return;
      }
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      moveCard(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.CARD,
    item: () => {
      return { id: match.id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0 : 1;
  drag(drop(ref));

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`https://www.sofascore.com/api/v1/event/${match.id}/statistics`);
        setStats(response.data.statistics[0].groups[0].statisticsItems.reduce((acc, stat) => {
          acc[stat.key] = { home: stat.home, away: stat.away };
          return acc;
        }, {}));
      } catch (error) {
        console.error(`Error fetching stats for match ${match.id}:`, error);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [match.id]);

  useEffect(() => {
    const updateScore = async () => {
      try {
        const response = await axios.get(`https://www.sofascore.com/api/v1/event/${match.id}`);
        const updatedMatch = response.data.event;
        setScore(`${updatedMatch.homeTeam.shortName} [${updatedMatch.homeScore.current}] - [${updatedMatch.awayScore.current}] ${updatedMatch.awayTeam.shortName}`);
      } catch (error) {
        console.error(`Error updating score for match ${match.id}:`, error);
      }
    };

    const interval = setInterval(updateScore, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [match.id]);

  return (
    <div ref={ref} style={{ opacity }} data-handler-id={handlerId} className="match-card">
      <div className="match-header">
        <h2>{score}</h2>
      </div>

      <iframe
        src={`https://widgets.sofascore.com/embed/attackMomentum?id=${match.id}&widgetBackground=Gray&v=2`}
        title={`Attack Momentum for ${match.homeTeam.shortName} vs ${match.awayTeam.shortName}`}
        className="attack-momentum-iframe"
      />

      <div className="stats-container">
        <div className="home-stats">
          {Object.entries(stats).map(([key, value]) => (
            <div key={key} className="stat-item">
              <p>{key}</p>
              <span>{value.home}</span>
            </div>
          ))}
        </div>

        <div className="away-stats">
          {Object.entries(stats).map(([key, value]) => (
            <div key={key} className="stat-item">
              <span>{value.away}</span>
              <p>{key}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MatchCard;
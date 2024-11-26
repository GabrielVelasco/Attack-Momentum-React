import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useDrag, useDrop } from 'react-dnd';

const ItemTypes = {
  CARD: 'card',
};

const MatchCard = ({ match, index, moveCard }) => {
  const [selectedPeriod, setSelectedPeriod] = useState(0); // 0 == All, 1 == 1ST, 2 == 2ND
  const [stats, setStats] = useState(null);
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

        setStats(response.data.statistics);

      } catch (error) {
        console.error(`Error fetching stats for match ${match.id}:`, error);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [match.id, selectedPeriod]); // must add variables that are going to be used by this effect to it's dependency array...

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

  if (!stats) {
    return (
      <div ref={ref} style={{ opacity }} data-handler-id={handlerId} className="match-card">
        <div className="match-header">
          <h2>{score}</h2>
        </div>
        <div className="stats-container">
          <p>Loading stats...</p>
        </div>
      </div>
    );
  }

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

      <div className="period-selector">
        <button
          onClick={() => {if(stats[0]) setSelectedPeriod(0)}}
          className={`period-btn${selectedPeriod === 0 ? " selected" : ""}`}
        >
          All
        </button>
        <button
          onClick={() => {if (stats[1]) setSelectedPeriod(1)}}
          className={`period-btn${selectedPeriod === 1 ? " selected" : ""}`}
        >
          1ST
        </button>
        <button
          onClick={() => {if(stats[2]) setSelectedPeriod(2)}}
          className={`period-btn${selectedPeriod === 2 ? " selected" : ""}`}
        >
          2ND
        </button>
      </div>

      <div className="stats-container">
        <div className="home-stats">
          {stats[selectedPeriod]?.groups?.map(groupStat => (
            groupStat.statisticsItems.map(stat => (
              <div key={stat.name} className="stat-item">
                <p>{stat.name}</p>
                <span>{stat.home}</span>
              </div>
            ))
          ))}
        </div>

        <div className="away-stats">
          {stats[selectedPeriod]?.groups?.map(groupStat => (
            groupStat.statisticsItems.map(stat => (
              <div key={stat.name} className="stat-item">
                <span>{stat.away}</span>
                <p>{stat.name}</p>
              </div>
            ))
          ))}
        </div>
      </div>
    </div>
  );
};

export default MatchCard;
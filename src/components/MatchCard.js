import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Draggable } from 'react-beautiful-dnd';

const MatchCard = ({ match, index }) => {
  const [stats, setStats] = useState({});
  const [score, setScore] = useState(`${match.homeTeam.shortName} [${match.homeScore.current}] - [${match.awayScore.current}] ${match.awayTeam.shortName}`);

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
    <Draggable draggableId={match.id.toString()} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="match-card"
        >
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
      )}
    </Draggable>
  );
};

export default MatchCard;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MatchCard from './components/MatchCard';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const App = () => {
  const [liveMatches, setLiveMatches] = useState([]);

  useEffect(() => {
    const fetchLiveMatches = async () => {
      try {
        const response = await axios.get("https://www.sofascore.com/api/v1/sport/football/events/live");
        setLiveMatches(response.data.events.filter(match => match.hasEventPlayerHeatMap || match.hasEventPlayerStatistics));
      } catch (error) {
        console.error("Error fetching live matches:", error);
      }
    };

    fetchLiveMatches();
    const interval = setInterval(fetchLiveMatches, 10 * 60000); // Update every 10 minutes

    return () => clearInterval(interval);
  }, []);

  const moveCard = (dragIndex, hoverIndex) => {
    const dragCard = liveMatches[dragIndex];
    liveMatches[dragIndex] = liveMatches[hoverIndex];
    liveMatches[hoverIndex] = dragCard;

    setLiveMatches([...liveMatches]);
  };

  return (
    <div className="app">
      <header>
        <h1>Attack Momentum R</h1>
        <ul>
          <li><b>This version is still in development (anybody wanting to help is welcome).</b></li>
          <li>SofaScore doesn't provide graphs for all matches.</li>
          <li><b>Scoreboards/Stats</b> are <b>updated automatically.</b></li>
          <li>Use zoom for better viewing (<b>CTRL</b> + <b>ScrollDown</b>/<b>ScrollUp</b>).</li>
          <li><b>Drag a card to reorder it within the list.</b></li>
        </ul>
      </header>

      <main>
        <DndProvider backend={HTML5Backend}>
          <div className="match-list">
            {liveMatches.map((match, index) => (
              <MatchCard 
                key={match.id} 
                match={match} 
                index={index}
                moveCard={moveCard}
              />
            ))}
          </div>
        </DndProvider>
      </main>

      <footer>
        <p>More details: <a href="https://github.com/GabrielVelasco/Attack-Momentum-React" target="_blank" rel="noopener noreferrer">GitHub Repo</a></p>
        <p>Any suggestions, email me at <a href="mailto:themrgabriel100@gmail.com">themrgabriel100@gmail.com</a></p>
      </footer>
    </div>
  );
};

export default App;
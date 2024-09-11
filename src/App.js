import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MatchCard from './components/MatchCard';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';

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

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex !== destinationIndex) {
      // Swap the cards instead of reordering
      const newMatches = Array.from(liveMatches);
      const temp = newMatches[sourceIndex];
      newMatches[sourceIndex] = newMatches[destinationIndex];
      newMatches[destinationIndex] = temp;

      setLiveMatches(newMatches);
    }
  };

  return (
    <div className="app">
      <header>
        <h1>Attack Momentum, ReactJS version</h1>
        <ul>
          <li><b>This version is still on development (anybody wanting to help, welcome..).</b></li>
          <li>SofaScore doesn't provide graphs for all matches.</li>
          <li><b>Scoreboards/Stats</b> are <b>updated automatically.</b></li>
          <li>Use zoom for better viewing (<b>CTRL</b> + <b>ScrollDown</b>/<b>ScrollUp</b>).</li>
          <li><b>Drag a card and drop it over another to swap their positions.</b></li>
        </ul>
      </header>

      <main>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="matches">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="match-list">
                {liveMatches.map((match, index) => (
                  <MatchCard key={match.id} match={match} index={index} />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </main>

      <footer>
        <p>More details: <a href="https://github.com/GabrielVelasco/BET-Attack-Momentum" target="_blank" rel="noopener noreferrer">GitHub Repo</a></p>
        <p>Any suggestions, email me at <a href="mailto:themrgabriel100@gmail.com">themrgabriel100@gmail.com</a></p>
      </footer>
    </div>
  );
};

export default App;
import React from 'react';
import RadarTimer from './components/Radar/RadarTimer';

function App() {
    const setup = {
        rings: ['adopt', 'trial', 'assess', 'hold'],
        quadrants: ['tools', 'techniques', 'platforms', 'languages'],
    };

    return (
        <div className="App">
            <RadarTimer {...setup} />
        </div>
    );
}

export default App;

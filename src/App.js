import React from 'react';
//import Radar from "./components/Radar/Radar";
import RadarTimer from './components/Radar/RadarTimer';

function App() {

    const setup = {
        rings: ['adopt', 'trial', 'assess', 'hold'],
        quadrants: ['tools', 'techniques', 'platforms', 'languages'],
        data: [
            {
                name: 'D3',
                quadrant: 'tools',
                ring: "assess"
            },
            {
                name: 'TypeScript',
                quadrant: 'languages',
                ring: "trial"
            },
            {
                name: 'Storybook',
                quadrant: 'tools',
                ring: "adopt"
            },
            {
                name: 'JavaScript',
                quadrant: 'languages',
                ring: "hold"
            }
        ]
    };

    return (
        // <div className="App">
        //     <Radar {...setup} />
        // </div>
        <div className="App">
            <RadarTimer {...setup} />
        </div>
    );
}

export default App;

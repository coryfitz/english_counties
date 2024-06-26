'use client';
import Header from "../header";
import React, { useState, useEffect } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { center_left, center_right, unitType, geoUrl } from '@/app/Config';
import { useQuiz, QuizProvider } from './QuizContext';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface UnitProps {
  geography: any;
}

const TextBox: React.FC = () => {
  const { quiz, quizIndex, message, restartQuiz } = useQuiz();
  let nameToGuess: string | null = null;
  if (quiz && quizIndex < quiz.length) {
    nameToGuess = quiz[quizIndex].unitName;
  }
  return (
    <div className="flex md:flex-col justify-between md:items-start font-medium text-sm md:text-base w-full">
      <div className="flex items-center px-2 py-2 bg-white border border-gray-300 rounded-xl md:w-56">
        {message}
      </div>
      {quizIndex < quiz.length && (
        <div className="flex-1 flex items-center px-2 py-2 bg-white border border-gray-300 rounded-xl md:w-56 md:my-2">
          <span className="w-full md:text-left text-center">{nameToGuess}</span>
        </div>
      )}
      <Button className="flex-shrink-0" onClick={restartQuiz}>
        Restart
      </Button>
    </div>
  );
};

const Unit: React.FC<UnitProps> = ({ geography }) => {
  const { done, handleUnitClick, quiz, quizIndex } = useQuiz();
  const unitName: any = geography?.properties?.[unitType];
  const unitDone = done.includes(unitName);
  const isCurrentQuizUnit = quizIndex < quiz.length && unitName === quiz[quizIndex].unitName;

  return (
    <Geography
      geography={geography}
      stroke = "#dfdfdf"
      strokeWidth={0.2}
      style={{
        default: {
          fill: unitDone ? 'green' : 'grey',
          outline: 'none',
        },
        hover: {
          fill: '#3C3B6E',
          outline: 'none',
        },
        pressed: {
          outline: 'none',
          fill: isCurrentQuizUnit ? 'green' : 'red',
        },
      }}
      onClick={() => handleUnitClick(geography)}
    />
  );
};

const useMobileView = () => {
  // Initialize state without assuming window width
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    // Define a function to update our state based on the current window width
    const checkIfMobile = () => setIsMobileView(window.innerWidth < 768);

    // Call it on mount to set the initial value based on the client's window
    checkIfMobile();

    // Set up event listener for future resize events
    window.addEventListener('resize', checkIfMobile);

    // Cleanup the event listener on component unmount
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  return isMobileView;
};


const Map: React.FC = () => {
  const isMobileView = useMobileView();
  const mapWidth = 600;
  const mapHeight = isMobileView ? 650 : 350;
  const mapScale = isMobileView ? 6000 : 3800;
  return (
    <Card className="overflow-hidden">

        <ComposableMap
          projectionConfig={{
            scale: mapScale,
            center: [center_left, center_right]
          }}
          height={mapHeight}
          width={mapWidth}
        >
          <ZoomableGroup
          translateExtent={[
            [-mapWidth*2/4, -mapHeight*2/4],
            [(mapWidth*2)*3/4, (mapHeight*2)*3/4]
          ]}
          zoom={1}>
            <Geographies geography={geoUrl}>
              {({ geographies }) => 
                geographies.map(geo => (
                  <Unit 
                    key={geo.rsmKey} 
                    geography={geo}
                  />
                ))
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
    </Card>
  );
};

const Quiz: React.FC = () => {
  return (
    <QuizProvider>
      <Header />
      <div className="flex flex-col md:flex-row w-full mt-2 md:mt-4">
        <div className="md:w-1/4 md:mr-2 mb-2 md:mb-0 mx-4 md:mx-6">
          <TextBox />
        </div>
        <div className="flex-1 mx-4 md:ml-6 md:mx-6 ">
          <Map />
        </div>
      </div>
    </QuizProvider>
  );
};

export default Quiz;

'use client';
import Header from "../header";
import React from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { scale, center_left, center_right, unitType, geoUrl } from '../Config';
import { useQuiz, QuizProvider } from './QuizContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
    <div className="flex md:flex-col justify-between md:items-start text-xs md:text-base w-full">
      <div className="flex items-center px-2 py-2 bg-white border border-gray-300 rounded-xl md:w-52">
        {message}
      </div>
      {quizIndex < quiz.length && (
        <div className="flex-1 flex items-center px-2 py-2 bg-white border border-gray-300 rounded-xl md:w-52">
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

const Map: React.FC = () => {
  return (
    <Card style={{ maxHeight: '88vh' }} className="max-h-screen overflow-hidden">
      <CardContent>
        <ComposableMap
          projectionConfig={{
            scale: scale,
            center: [center_left, center_right]
          }}
        >
          <ZoomableGroup zoom={1}>
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
      </CardContent>
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
        <div className="flex-1 md:ml-2 mx-4 md:mx-6 max-h-screen overflow-auto">
          <Map />
        </div>
      </div>
    </QuizProvider>
  );
};

export default Quiz;

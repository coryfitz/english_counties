'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import unitNamesJson from '../data/englandCountyNames.json';
import _ from 'lodash';
import { unitType } from '../Config';

interface QuizUnit {
  unitName: string;
}

interface QuizContextType {
  quiz: QuizUnit[];
  quizIndex: number;
  quizEnded: boolean;
  done: string[];
  message: string;
  handleUnitClick: (unitGeo: any) => void;
  restartQuiz: () => void;
}

const defaultContextValue: QuizContextType = {
  quiz: [],
  quizIndex: 0,
  quizEnded: false,
  done: [],
  message: 'Please select:',
  handleUnitClick: () => {},
  restartQuiz: () => {},
};

const QuizContext = createContext<QuizContextType>(defaultContextValue);

export const useQuiz = () => useContext(QuizContext);

function getNewShuffledQuiz(): QuizUnit[] {
  return _.map(
    _.shuffle(Object.keys(unitNamesJson)), 
    (unitName): QuizUnit => ({
      unitName,
    })
  );
}

export const QuizProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [quiz, setQuiz] = useState<QuizUnit[]>([]);
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [quizEnded, setQuizEnded] = useState<boolean>(false);
  const [done, setDone] = useState<string[]>([]);
  const [message, setMessage] = useState<string>('Please select:');

  useEffect(() => {
    // Initializes quiz data on the client side.
    setQuiz(getNewShuffledQuiz());
  }, []);

  useEffect(() => {
    if (done.length === Object.keys(unitNamesJson).length) {
      setMessage('Congratulations on completing the quiz');
    }
  }, [done]);

  const handleUnitClick = (unitGeo: any) => {
    if (quizEnded) return;
    const unitName = unitGeo?.properties?.[unitType] as string;
    if (!unitName) return;
    if (unitName === quiz[quizIndex].unitName) {
      setDone(done => [...done, unitName]);
      moveToNextUnit(unitName);
    }
  };

  const moveToNextUnit = (unitName: string) => {
    setQuiz([...quiz.slice(0, quizIndex), { unitName }, ...quiz.slice(quizIndex + 1)]);
    const newIndex = quizIndex + 1;
    setQuizIndex(newIndex);
    if (newIndex === quiz.length) {
      setQuizEnded(true);
    }
  };

  const restartQuiz = () => {
    setQuiz(getNewShuffledQuiz());
    setQuizIndex(0);
    //setQuizIndex(1000);
    setQuizEnded(false);
    setDone([]);
    setMessage('Please select:');
    //setMessage('Congratulations on completing the quiz');
  };

  return (
    <QuizContext.Provider value={{ quiz, quizIndex, quizEnded, done, message, handleUnitClick, restartQuiz }}>
      {children}
    </QuizContext.Provider>
  );
};

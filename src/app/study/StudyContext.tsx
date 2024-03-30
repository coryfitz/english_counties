import React, { createContext, useContext, useState, ReactNode } from 'react';
import { unitType } from './Config';

interface StudyContextType {
    selectedUnit: string | null;
    message: string;
    handleUnitClick: (unitGeo: any) => void;
    handleMouseLeave: () => void;
}

const defaultValue: StudyContextType = {
    selectedUnit: null,
    message: `Please select any ${unitType} to reveal its name`,
    handleUnitClick: () => {},
    handleMouseLeave: () => {},
};

const StudyContext = createContext<StudyContextType>(defaultValue);

export const useStudy = () => useContext(StudyContext);

interface StudyProviderProps {
    children: ReactNode;
}

export const StudyProvider: React.FC<StudyProviderProps> = ({ children }) => {
    const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
    const message = `Please select any ${unitType} to reveal its name`;

    const handleUnitClick = (unitGeo: any) => {
        const unitName = unitGeo?.properties?.[unitType];
        setSelectedUnit(unitName);
    };

    const handleMouseLeave = () => {
        setSelectedUnit(null);
    };

    return (
        <StudyContext.Provider value={{ selectedUnit, message, handleUnitClick, handleMouseLeave }}>
            {children}
        </StudyContext.Provider>
    );
};

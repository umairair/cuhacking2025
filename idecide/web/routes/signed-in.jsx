import { useUser, useSignOut } from "@gadgetinc/react";
import { api } from "../api";
import userIcon from "../assets/default-user-icon.svg";
import { Link } from "react-router-dom";
import { ReactLogo } from "../components";
import { useEffect, useState, useRef } from 'react';
import MainMenu from "../components/MainMenu";
import Game from '../components/Game';

export default function () {
  const user = useUser(api);
  const signOut = useSignOut();
  const [showGame, setShowGame] = useState(false);
  const [gameMode, setGameMode] = useState(null);

  const handleGameModeSelect = (selectedMode) => {
    setGameMode(selectedMode);
    setShowGame(true);
  };

  const goBackToMenu = () => {
    setShowGame(false);
    setGameMode(null);
  };

  return user ? (
    <>
      {!showGame ? 
        <MainMenu 
          onSelectGameMode={handleGameModeSelect} 
        /> : 
        <Game 
          gameMode={gameMode}
          onGoBack={goBackToMenu}
        />
      }
    </>
  ) : null;
}
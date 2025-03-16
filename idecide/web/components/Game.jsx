import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useUser, useSignOut, useAction } from "@gadgetinc/react";
import { api } from "../api";
import { useNavigate } from "react-router-dom";
import spotifyData from '../assets/data/spotify.json';
import populationData from '../assets/data/countriesbypopulation.json';
import sizeData from '../assets/data/countriesbyarea.json';
import Question from './Question';

const MemoizedQuestion = React.memo(Question);

export default function ({gameMode, onGoBack}) {
  const user = useUser(api);
  const signOut = useSignOut();
  const navigate = useNavigate();
  
  const [detector, setDetector] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isCalibrated, setIsCalibrated] = useState(false);
  const [currentIris, setCurrentIris] = useState(0);
  const [calibratedIris, setCalibratedIris] = useState(0);
  const [focusedSide, setFocusedSide] = useState("");
  const [leftProgress, setLeftProgress] = useState(0);
  const [rightProgress, setRightProgress] = useState(0);

  const [leftIntensity, setLeftIntensity] = useState(0);
  const [rightIntensity, setRightIntensity] = useState(0);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const canvasCtxRef = useRef(null);
  const animationFrameIdRef = useRef(null);
  const lastProcessTimestampRef = useRef(0);
  const scoreUpdatedRef = useRef(false);
  
  const [isSystemReady, setIsSystemReady] = useState(false);
  const [centerText, setCenterText] = useState("welcome");

  const [isGameStarted, setIsGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    if (gameMode === 'population') {
      return user?.populationHighScore || 0;
    } else if (gameMode === 'size') {
      return user?.sizeHighScore || 0;
    } else if (gameMode === 'spotify') {
      return user?.spotifyHighScore || 0;
    }
    return 0;
  });
  
  const [{data: updateData, fetching: updateFetching, error: updateError}, updateUserHighScore] = useAction(api.user.update);
  
  const [leftQ, setLeftQ] = useState({});
  const [rightQ, setRightQ] = useState({});
  const [gameModeText, setGameModeText] = useState("");
  const [revealInfo, setRevealInfo] = useState(false);
  const [isResultShown, setIsResultShown] = useState(false);
  const [isLeftCorrect, setIsLeftCorrect] = useState(null);
  const [isRightCorrect, setIsRightCorrect] = useState(null);
  const [countdown, setCountdown] = useState(5);
  
  const gameDataMap = useMemo(() => ({
    'spotify': spotifyData,
    'population': populationData,
    'size': sizeData
  }), []);

  const saveHighScore = useCallback((newScore) => {
    if (newScore > highScore) {
      console.log(`Saving new high score to database: ${newScore}`);
      
      const updatePayload = { id: user.id };
      if (gameMode === 'population') {
        updatePayload.populationHighScore = newScore;
      } else if (gameMode === 'size') {
        updatePayload.sizeHighScore = newScore;
      } else if (gameMode === 'spotify') {
        updatePayload.spotifyHighScore = newScore;
      }
      
      updateUserHighScore(updatePayload);
      setHighScore(newScore);
    }
  }, [gameMode, highScore, updateUserHighScore, user?.id]);

  const processFrames = useCallback(async () => {
    if (!isInitialized || !detector || !videoRef.current) return;
    
    const now = performance.now();
    const timeSinceLastProcess = now - lastProcessTimestampRef.current;
    
    if (timeSinceLastProcess < 33) {
      animationFrameIdRef.current = requestAnimationFrame(processFrames);
      return;
    }
    
    lastProcessTimestampRef.current = now;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    
    if (!canvasCtxRef.current) {
      canvasCtxRef.current = canvas.getContext('2d', { willReadFrequently: true });
    }
    
    const ctx = canvasCtxRef.current;
    
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }
  
    try {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const faces = await detector.estimateFaces(imageData);
      
      if (faces.length > 0) {
        const leftIris = faces[0].keypoints[468].x;
        const rightIris = faces[0].keypoints[473].x;
        const noseTip = faces[0].keypoints[4].x;  
        const leftEyeCorner = faces[0].keypoints[263].x; 
        const rightEyeCorner = faces[0].keypoints[33].x;
        const leftCheek = faces[0].keypoints[323].x;
        const rightCheek = faces[0].keypoints[93].x;  
        
        const averageX = (leftIris + rightIris + noseTip + leftEyeCorner + rightEyeCorner + leftCheek + rightCheek)/7;
        setCurrentIris(averageX);
      }
    } catch (error) {
      console.error("Error processing frame:", error);
    }
    
    animationFrameIdRef.current = requestAnimationFrame(processFrames);
  }, [detector, isInitialized]);

  const cleanupResources = useCallback(() => {
    console.log("Cleaning up resources");
    
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
    
    const video = videoRef.current;
    if (video && video.srcObject) {
      const tracks = video.srcObject.getTracks();
      tracks.forEach(track => {
        console.log("Stopping track:", track.kind);
        track.stop();
      });
      video.srcObject = null;
    }
    
    setDetector(null);
    canvasCtxRef.current = null;
    
    setIsInitialized(false);
    setIsCalibrated(false);
    setCurrentIris(0);
    setCalibratedIris(0);
    setFocusedSide("");
    setLeftProgress(0);
    setRightProgress(0);
    setLeftIntensity(0);
    setRightIntensity(0);
    setIsSystemReady(false);
    setCenterText("welcome");
    setIsGameStarted(false);
    setScore(0);
    setLeftQ({});
    setRightQ({});
    setGameModeText("");
    setRevealInfo(false);
    setIsResultShown(false);
    setIsLeftCorrect(null);
    setIsRightCorrect(null);
    setCountdown(5);
    scoreUpdatedRef.current = false;
  }, []);

  const handleGoBack = useCallback(() => {
    cleanupResources();
    if (onGoBack) {
      onGoBack();
    } else {
      navigate('/');
    }
  }, [cleanupResources, navigate, onGoBack]);

  const calibrate = useCallback(() => { 
    if (!isSystemReady) {
      console.log("System not fully ready yet");
      return;
    }
    
    if (currentIris !== 0) {
      setCalibratedIris(currentIris);
      setIsCalibrated(true);
      console.log("Calibrated with Iris value:", currentIris);
    } else {
      console.error("Cannot calibrate: currentIris is 0");
    }
  }, [isSystemReady, currentIris]);

  const getGameData = useCallback((mode) => {
    return gameDataMap[mode] || gameDataMap['spotify'];
  }, [gameDataMap]);

  const getRandomQuestion = useCallback((excludeQuestion = null) => {
    const gameData = getGameData(gameMode);
    
    let filteredData = gameData;
    
    if (excludeQuestion) {
      filteredData = gameData.filter(q => 
        q.subject !== excludeQuestion.subject
      );
    }
    
    if (filteredData.length === 0) {
      console.error("No questions available after filtering");
      return gameData[Math.floor(Math.random() * gameData.length)];
    }
    
    const randomIndex = Math.floor(Math.random() * filteredData.length);
    console.log("Selected new random question:", filteredData[randomIndex].subject);
    return filteredData[randomIndex];
  }, [gameMode, getGameData]);

  const startGame = useCallback(() => {
    if(!isCalibrated) {
      alert("Please calibrate first!");
      return;
    }
    const firstQuestion = getRandomQuestion();
    const secondQuestion = getRandomQuestion(firstQuestion);
    
    console.log("Game started with initial questions:", firstQuestion.subject, "vs", secondQuestion.subject);
    
    setLeftQ(firstQuestion);
    setRightQ(secondQuestion);
    setCenterText("VS.");

    if(gameMode === "spotify") {
      setGameModeText("Who has more monthly listeners?");
    }
    else if(gameMode === "population") {
      setGameModeText("Which country has a larger population?");
    }
    else if(gameMode === "size") {
      setGameModeText("Which country is larger in size?");
    }

    setIsGameStarted(true);
  }, [isCalibrated, getRandomQuestion, gameMode]);

  const parseMetric = useCallback((metricStr) => {
    if (!metricStr) {
      console.error("Invalid metric value:", metricStr);
      return 0;
    }
    
    const cleanedStr = metricStr.toString().replace(/,/g, '');
    const parsedValue = parseInt(cleanedStr, 10);
    
    if (isNaN(parsedValue)) {
      console.error("Failed to parse metric:", metricStr);
      return 0;
    }
    
    return parsedValue;
  }, []);

  const advanceToNextQuestion = useCallback(() => {
    console.log("Advancing to next question");
    
    setIsLeftCorrect(null);
    setIsRightCorrect(null);
    setRevealInfo(false);
    setIsResultShown(false);
    setLeftProgress(0);
    setRightProgress(0);
    setCenterText("VS.");
    scoreUpdatedRef.current = false;
    
    const playerSelectedLeft = leftProgress >= 100;
    const playerWasCorrect = 
      (isLeftCorrect === true && playerSelectedLeft) || 
      (isRightCorrect === true && !playerSelectedLeft) ||
      (isLeftCorrect === true && isRightCorrect === true); 
    
    if (!playerWasCorrect) {
      console.log("Player answered incorrectly - replacing both questions");
      const newLeftQ = getRandomQuestion();
      const newRightQ = getRandomQuestion(newLeftQ);
      setLeftQ(newLeftQ);
      setRightQ(newRightQ);
    } else {
      if (isLeftCorrect === true && isRightCorrect === true) {
        const replaceLeft = Math.random() > 0.5;
        console.log(`Tie case - randomly replacing ${replaceLeft ? 'left' : 'right'} question`);
        
        if (replaceLeft) {
          setLeftQ(getRandomQuestion(rightQ));
        } else {
          setRightQ(getRandomQuestion(leftQ));
        }
      } else if (isLeftCorrect) {
        console.log("Left was correct, replacing right question");
        setRightQ(getRandomQuestion(leftQ));
      } else {
        console.log("Right was correct, replacing left question");
        setLeftQ(getRandomQuestion(rightQ));
      }
    }
  }, [getRandomQuestion, isLeftCorrect, isRightCorrect, leftProgress, rightQ, leftQ]);

  useEffect(() => {
    let isMounted = true;

    async function initDetector() {
      try {
        await window.tf.setBackend('webgl');

        const model = window.faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
        const detectorConfig = {
          runtime: "tfjs",
          solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh",
          refineLandmarks: true,
        };

        const tfdetector = await window.faceLandmarksDetection.createDetector(model, detectorConfig);

        if (isMounted) {
          setDetector(tfdetector);
          console.log("Detector initialized successfully!");

          const startWebcam = async () => {
            try {
              const stream = await navigator.mediaDevices.getUserMedia({ video: true });
              if (isMounted && videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = async () => {
                  console.log("Webcam initialized successfully!");
                  if (isMounted && videoRef.current) {
                    await videoRef.current.play();
                    console.log("Video is playing!");
                    if (isMounted) {
                      setIsInitialized(true); 
                      setIsSystemReady(true);
                      console.log("System is fully ready!");
                    }
                  }
                };
              }
            } catch (err) {
              console.error("Error accessing webcam:", err);
            }
          };

          await startWebcam();
        }
      } catch (error) {
        console.error("Error initializing detector:", error);
      }
    }

    initDetector();

    return () => {
      isMounted = false;
      cleanupResources();
    };
  }, [cleanupResources]);

  useEffect(() => {
    if (isInitialized && detector) {
      animationFrameIdRef.current = requestAnimationFrame(processFrames);
    }
    
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
    };
  }, [isInitialized, detector, processFrames]);

  useEffect(() => {
    if (isCalibrated && isGameStarted && !isResultShown) {
      const threshold = 0; 
      const difference = currentIris - calibratedIris;
      const absDistance = Math.abs(difference);
      
      if (absDistance < threshold) {
        setFocusedSide("");
      } else if (difference < 0) {
        setRightProgress((progress) => Math.min(progress + 4.1, 100));
        setFocusedSide("right");
      } else {
        setLeftProgress((progress) => Math.min(progress + 4.1, 100));
        setFocusedSide("left");
      }
    }
  }, [currentIris, calibratedIris, isCalibrated, isGameStarted, isResultShown]);

  useEffect(() => {
    if((leftProgress >= 100 || rightProgress >= 100) && !isResultShown) {
      console.log("Selection complete - showing results");
      
      setRevealInfo(true); 
      setIsResultShown(true);
      setLeftIntensity(255);
      setRightIntensity(255);
      scoreUpdatedRef.current = false;
      
      const leftMetric = parseMetric(leftQ.metric);
      const rightMetric = parseMetric(rightQ.metric);
      
      console.log(`Comparing: ${leftQ.subject} (${leftMetric}) vs ${rightQ.subject} (${rightMetric})`);
      
      const playerSelectedLeft = leftProgress >= 100;
      console.log(`Player selected: ${playerSelectedLeft ? 'LEFT' : 'RIGHT'}`);
      
      if (leftMetric > rightMetric) {
        console.log(`${leftQ.subject} has more listeners - correct answer is LEFT`);
        setIsLeftCorrect(true);
        setIsRightCorrect(false);
      } else if (rightMetric > leftMetric) {
        console.log(`${rightQ.subject} has more listeners - correct answer is RIGHT`);
        setIsLeftCorrect(false);
        setIsRightCorrect(true);
      } else {
        console.log("Both artists have equal metrics - keeping current score");
        setIsLeftCorrect(true);
        setIsRightCorrect(true);
      }
      
      setCountdown(5);
      return;
    }

    if (isResultShown) {
      setLeftIntensity(255);
      setRightIntensity(255);
      return;
    }

    const calculateIntensity = (progress) => {
      if (progress === 0) return 0;
      const normalizedProgress = progress / 100;
      return Math.pow(normalizedProgress, 2) * 255;
    };

    setLeftIntensity(calculateIntensity(leftProgress));
    setRightIntensity(calculateIntensity(rightProgress));
  }, [leftProgress, rightProgress, isResultShown, leftQ, rightQ, parseMetric]);

  useEffect(() => {
    if (isResultShown && !scoreUpdatedRef.current && isLeftCorrect !== null && isRightCorrect !== null) {
      scoreUpdatedRef.current = true;
      
      console.log("Updating score based on results");
      
      const playerSelectedLeft = leftProgress >= 100;
      const playerWasCorrect = 
        (isLeftCorrect === true && playerSelectedLeft) || 
        (isRightCorrect === true && !playerSelectedLeft) ||
        (isLeftCorrect === true && isRightCorrect === true); 
      
      if (playerWasCorrect) {
        const newScore = score + 1;
        console.log(`Player chose correctly! Setting score to: ${newScore}`);
        setScore(newScore);
        
        if (newScore > highScore) {
          console.log(`New high score: ${newScore}`);
          saveHighScore(newScore);
        }
      } else {
        console.log("Player chose incorrectly. Resetting score to 0");
        setScore(0);
      }
    }
  }, [isResultShown, isLeftCorrect, isRightCorrect, leftProgress, score, highScore, saveHighScore]);

  useEffect(() => {
    let timer = null;
    
    if (isResultShown) {
      timer = setInterval(() => {
        setCountdown(prevCount => {
          if (prevCount <= 1) {
            clearInterval(timer);
            advanceToNextQuestion();
            return 5; 
          }
          return prevCount - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isResultShown, advanceToNextQuestion]);

  ///////////////////////////////////////////////////////
  return user ? (
    <>
      <div className="flex flex-col h-screen w-screen relative bg-white overflow-hidden">
       
        <div className="absolute top-[2vh] left-1/2 transform -translate-x-1/2 z-20 bg-black text-white px-[2vw] py-[1vh] rounded-full shadow-xl flex gap-[1vw] border-2 border-gray-800">
          <div className="flex flex-col items-center w-[10vw] text-center">
            <span className="text-[1.5vh] font-semibold text-gray-400">SCORE</span>
            <span className="text-[2.5vh] font-bold">{score}</span>
          </div>
          <div className="w-px h-full bg-gray-700 mx-[1vw]"></div>
          <div className="flex flex-col items-center w-[10vw] text-center">
            <span className="text-[1.5vh] font-semibold text-gray-400">HIGH SCORE</span>
            <span className="text-[2.5vh] font-bold">{highScore}</span>
          </div>
        </div>
        
        {isGameStarted && (
          <div className="absolute mt-7 top-[10vh] left-1/2 transform -translate-x-1/2 z-20 bg-black text-white px-[2vw] py-[1vh] rounded-full shadow-lg border-2 border-gray-800">
            <span className="text-[2vh] font-bold">{gameModeText}</span>
          </div>
        )}
        
        <div className="flex h-full relative">
          <div 
            className="w-1/2 border-8 flex items-center justify-center text-[8vh] relative transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
            style={{ 
              borderColor: focusedSide === "left" ? "white" : "black",
              borderWidth: focusedSide === "left" ? "12px" : "8px",
              background: isResultShown 
                ? isLeftCorrect === true
                  ? 'linear-gradient(135deg, rgba(50, 200, 100, 1) 0%, rgba(40, 180, 90, 1) 60%, rgba(30, 160, 80, 1) 100%)'
                  : isLeftCorrect === false
                    ? 'linear-gradient(135deg, rgba(230, 60, 60, 1) 0%, rgba(200, 50, 50, 1) 60%, rgba(180, 40, 40, 1) 100%)'
                    : 'rgb(0, 0, 0)'
                : leftProgress > 0
                  ? `linear-gradient(135deg, 
                      rgba(${Math.min(255, 100 + leftIntensity * 0.6)}, ${Math.max(50, 130 - leftIntensity * 0.4)}, ${Math.max(50, 255 - leftIntensity)}, 1) 0%, 
                      rgba(${Math.min(255, 130 + leftIntensity * 0.5)}, ${Math.max(30, 100 - leftIntensity * 0.3)}, ${Math.max(30, 230 - leftIntensity * 0.9)}, 1) 60%, 
                      rgba(${Math.min(255, 150 + leftIntensity * 0.4)}, ${Math.max(20, 70 - leftIntensity * 0.2)}, ${Math.max(20, 200 - leftIntensity * 0.8)}, 1) 100%)`
                  : 'rgb(0, 0, 0)',
              boxShadow: isResultShown
                ? isLeftCorrect === true
                  ? 'inset 0 0 70px rgba(50, 220, 100, 0.8), 0 0 50px rgba(40, 200, 80, 0.7)'
                  : isLeftCorrect === false
                    ? 'inset 0 0 70px rgba(220, 50, 50, 0.8), 0 0 50px rgba(200, 40, 40, 0.7)'
                    : 'inset 0 0 70px rgba(130, 80, 255, 0.8), 0 0 50px rgba(100, 60, 220, 0.7)'
                : leftProgress > 30 
                  ? `inset 0 0 ${leftProgress * 0.7}px rgba(130, 80, 255, 0.6), 0 0 ${leftProgress/2}px rgba(100, 60, 220, 0.5)` 
                  : 'none',
              textShadow: isResultShown
                ? '0 0 20px rgba(255, 255, 255, 0.95), 0 0 30px rgba(255, 255, 255, 0.7)'
                : leftProgress > 60 
                  ? '0 0 15px rgba(255, 255, 255, 0.9)' 
                  : 'none',
              color: isResultShown 
                ? 'white' 
                : leftProgress > 0 
                  ? (leftProgress > 70 ? 'white' : '#aaa') 
                  : '#555',
            }}
          >
            <Question question={leftQ} revealInfo={revealInfo} isCorrect={isLeftCorrect} />
            {!isResultShown ? `${Math.round(leftProgress)}%` : null}
          </div>
          
          <div 
            className="w-1/2 border-8 flex items-center justify-center text-[8vh] relative transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
            style={{ 
              borderColor: focusedSide === "right" ? "white" : "black",
              borderWidth: focusedSide === "right" ? "12px" : "8px",
              background: isResultShown
                ? isRightCorrect === true
                  ? 'linear-gradient(135deg, rgba(50, 200, 100, 1) 0%, rgba(40, 180, 90, 1) 60%, rgba(30, 160, 80, 1) 100%)'
                  : isRightCorrect === false
                    ? 'linear-gradient(135deg, rgba(230, 60, 60, 1) 0%, rgba(200, 50, 50, 1) 60%, rgba(180, 40, 40, 1) 100%)'
                    : 'rgb(0, 0, 0)'
                : rightProgress > 0
                  ? `linear-gradient(135deg, 
                      rgba(${Math.min(255, 100 + rightIntensity * 0.6)}, ${Math.max(50, 130 - rightIntensity * 0.4)}, ${Math.max(50, 255 - rightIntensity)}, 1) 0%, 
                      rgba(${Math.min(255, 130 + rightIntensity * 0.5)}, ${Math.max(30, 100 - rightIntensity * 0.3)}, ${Math.max(30, 230 - rightIntensity * 0.9)}, 1) 60%, 
                      rgba(${Math.min(255, 150 + rightIntensity * 0.4)}, ${Math.max(20, 70 - rightIntensity * 0.2)}, ${Math.max(20, 200 - rightIntensity * 0.8)}, 1) 100%)`
                  : 'rgb(0, 0, 0)',
              boxShadow: isResultShown
                ? isRightCorrect === true
                  ? 'inset 0 0 70px rgba(50, 220, 100, 0.8), 0 0 50px rgba(40, 200, 80, 0.7)'
                  : isRightCorrect === false
                    ? 'inset 0 0 70px rgba(220, 50, 50, 0.8), 0 0 50px rgba(200, 40, 40, 0.7)'
                    : 'inset 0 0 70px rgba(130, 80, 255, 0.8), 0 0 50px rgba(100, 60, 220, 0.7)'
                : rightProgress > 30 
                  ? `inset 0 0 ${rightProgress * 0.7}px rgba(130, 80, 255, 0.6), 0 0 ${rightProgress/2}px rgba(100, 60, 220, 0.5)` 
                  : 'none',
              textShadow: isResultShown
                ? '0 0 20px rgba(255, 255, 255, 0.95), 0 0 30px rgba(255, 255, 255, 0.7)'
                : rightProgress > 60 
                  ? '0 0 15px rgba(255, 255, 255, 0.9)' 
                  : 'none',
              color: isResultShown 
                ? 'white' 
                : rightProgress > 0 
                  ? (rightProgress > 70 ? 'white' : '#aaa') 
                  : '#555',
            }}
          >
           {!isResultShown ? `${Math.round(rightProgress)}%` : null}
            <Question question={rightQ} revealInfo={revealInfo} isCorrect={isRightCorrect}/>
          </div>
          
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="flex flex-col items-center">
              <div className="w-0.5 h-[40vh] bg-gray-700"></div>
              
              <div className="bg-black text-[2.5vh] font-bold text-gray-100 px-[2vw] py-[1vh] rounded-full shadow-lg border-2 border-gray-800 my-[1vh] flex items-center justify-center flex-col">
                {isGameStarted && isResultShown && (
                  <div className={`text-[2vh] font-bold mb-[1vh] py-[0.5vh] px-[2vw] rounded-full ${
                    (isLeftCorrect && leftProgress >= 100) || 
                    (isRightCorrect && rightProgress >= 100) || 
                    (isLeftCorrect && isRightCorrect) ? 
                      'bg-green-500' : 'bg-red-500'
                  }`}>  
                    {(isLeftCorrect && leftProgress >= 100) || 
                     (isRightCorrect && rightProgress >= 100) || 
                     (isLeftCorrect && isRightCorrect) ? 
                      'CORRECT' : 'INCORRECT'}
                  </div>
                )}    
                {!isSystemReady ? (
                  <button 
                    disabled
                    className="bg-gray-700 text-white font-semibold py-[1vh] px-[3vw] rounded-full shadow-lg transition-all duration-300 border border-gray-700 opacity-70 cursor-not-allowed text-[2vh]"
                  >
                    Loading...
                  </button>
                ) : isSystemReady && !isCalibrated ? (
                  <button 
                    onClick={() => calibrate()}
                    className="bg-black hover:bg-purple-700 text-white font-semibold py-[1vh] px-[3vw] rounded-full shadow-lg transition-all duration-300 border border-gray-700 text-[2vh]"
                  >
                    Calibrate
                  </button>
                ) : isCalibrated && !isGameStarted ? (
                  <button 
                    onClick={() => startGame()}
                    className="bg-black hover:bg-purple-700 text-white font-semibold py-[1vh] px-[3vw] rounded-full shadow-lg transition-all duration-300 border border-gray-700 text-[2vh]"
                  >
                    Start Game
                  </button>
                ) : isGameStarted && isResultShown ? (
                  <div className="bg-black py-[1vh] px-[2vw] rounded-full text-white font-semibold shadow-lg relative overflow-hidden flex items-center justify-center">
                    <div className="text-[6vh] font-bold">{countdown}</div>
                  </div>
                ) : isGameStarted ? (
                  <div className="text-[4vh] font-bold">{centerText}</div>
                ) : null}
              </div>
              <p className="text-white text-[1.5vh]">Iris Position: {parseFloat(currentIris).toFixed(2)}</p>
              <div className="w-0.5 h-[40vh] bg-gray-700"></div>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-[2vh] left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex flex-col justify-center">
            {isGameStarted && (
              <button 
                onClick={() => calibrate()}
                className="bg-black hover:bg-red-600 text-white font-semibold py-[1vh] px-[3vw] rounded-full shadow-lg transition-all duration-300 flex items-center gap-[1vw] border border-gray-700 mb-[2vh] text-[1.8vh]"
              >
                Recalibrate
              </button>
            )}
            <button 
              onClick={() => {
                cleanupResources();
                
                const startWebcam = async () => {
                  try {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                    if (videoRef.current) {
                      videoRef.current.srcObject = stream;
                      videoRef.current.onloadedmetadata = async () => {
                        if (videoRef.current) {
                          await videoRef.current.play();
                          setIsSystemReady(true);
                        }
                      };
                    }
                  } catch (err) {
                    console.error("Error accessing webcam:", err);
                  }
                };
                
                startWebcam();
              }}
              className="bg-black hover:bg-red-600 text-white font-semibold py-[1vh] px-[3vw] rounded-full shadow-lg transition-all duration-300 flex items-center justify-center gap-[1vw] border border-gray-700 mb-[2vh] text-[1.8vh]"
            >
              Restart
            </button>
            <button 
              onClick={handleGoBack}
              className="bg-black hover:bg-red-600 text-white font-semibold py-[1vh] px-[3vw] rounded-full shadow-lg transition-all duration-300 flex items-center gap-[1vw] border border-gray-700 text-[1.8vh]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-[2vh] w-[2vh]" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Go Back
            </button>
          </div>
        </div>
        
        <video ref={videoRef} className="hidden" autoPlay playsInline></video>
        <canvas ref={canvasRef} className="hidden"></canvas>
      </div>
    </>
  ) : null;
}
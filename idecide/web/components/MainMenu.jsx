import { useState } from "react";
import { useUser, useAction } from "@gadgetinc/react";
import { api } from "../api";
import { Link } from "react-router-dom";


export default function MainMenu({ onSelectGameMode }) {
    const user = useUser();
    const [{ fetching }, signOut] = useAction(api.user.signOut);
    const [selectedCard, setSelectedCard] = useState(null);
    
    const gameModes = [
        { id: "spotify", title: "Spotify Listeners", description: "Guess which artist has more monthly listeners", icon: "🎵", enabled: true },
        { id: "population", title: "Country Population", description: "Compare populations of different countries", icon: "👥", enabled: true },
        { id: "size", title: "Country Size", description: "Which country has the larger area?", icon: "🗺️", enabled: true },
        { id: "nba", title: "NBA Players", description: "Compare scores of NBA players", icon: "🏀", enabled: false },
        { id: "networth", title: "Net Worth", description: "Guess who has more money", icon: "💰", enabled: false },
        { id: "steam", title: "Steam Players", description: "Guess which game has more active players on Steam", icon: "🎮", enabled: false }
    ];
    
    const handleSignOut = async () => {
        await signOut({
            id: user?.id
        });
    };
    
    const handleGameSelect = (gameMode) => {
        if (gameMode.enabled) {
            setSelectedCard(gameMode.id);
            setTimeout(() => {
                onSelectGameMode(gameMode.id);
            }, 400);
        }
    };
    return (
        <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-black to-purple-950 text-white flex flex-col">
            <header className="flex justify-between items-center p-[2vh] px-[3vw]">
                <div className="flex items-center">
                    <h1 className="text-[3vh] font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-red-500">
                        eyedecide
                    </h1>
                </div>
                <div className="flex items-center gap-[1vw]">
                    <div className="text-right">
                        <p className="font-semibold text-[1.8vh]">{user?.firstName || user?.email}</p>
                        <p className="text-[1.2vh] text-gray-300">Welcome back!</p>
                    </div>
                    <button
                        onClick={handleSignOut}
                        disabled={fetching}
                        className="bg-red-600 hover:bg-red-700 px-[1vw] py-[1vh] rounded-lg transition-all duration-200 flex items-center gap-2 disabled:opacity-50 shadow-md shadow-red-900/40 text-[1.6vh]"
                    >
                        {fetching ? "Signing out..." : (
                            <>
                                <span>Sign Out</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[1.6vh] h-[1.6vh]">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                    <polyline points="16 17 21 12 16 7"></polyline>
                                    <line x1="21" y1="12" x2="9" y2="12"></line>
                                </svg>
                            </>
                        )}
                    </button>
                </div>
            </header>
            
            <main className="flex-1 flex flex-col px-[3vw] overflow-hidden">
                <h2 className="text-[2.5vh] font-bold mb-[2vh] text-center">Choose a Game Mode</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[2vh] flex-1 max-h-[68vh]">
                    {gameModes.map((gameMode) => (
                        <div
                            key={gameMode.id}
                            onClick={() => handleGameSelect(gameMode)}
                            className={`
                                bg-gradient-to-br from-gray-900 to-purple-950 rounded-xl p-[2vh]
                                border-2 border-transparent 
                                transform transition-all duration-300 shadow-md shadow-black/50
                                flex flex-col
                                h-full
                                ${!gameMode.enabled ? 'opacity-60 relative' : 'cursor-pointer hover:border-red-600'}
                                ${selectedCard === gameMode.id ? 'scale-95 opacity-75' : (gameMode.enabled ? 'hover:scale-105 hover:shadow-xl hover:shadow-purple-900/40' : '')}
                            `}
                        >
                            <div className="text-[5vh] mb-[1vh]">{gameMode.icon}</div>
                            <h3 className="text-[2.2vh] font-bold mb-[1vh]">{gameMode.title}</h3>
                            <p className="text-gray-300 text-[1.5vh]">{gameMode.description}</p>
                            {!gameMode.enabled && (
                                <div className="text-center mt-auto mb-[1vh]">
                                    <span className="bg-gray-800 text-gray-300 px-[1vw] py-[0.5vh] rounded-md text-[1.2vh]">Coming Soon</span>
                                </div>
                            )}
                            <div className="flex justify-end mt-auto">
                                <div className={`${gameMode.enabled ? 'bg-red-600' : 'bg-gray-600'} rounded-full p-[1vh] transform transition-transform ${gameMode.enabled ? 'hover:rotate-90' : ''} shadow-md shadow-black/30`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[1.6vh] h-[1.6vh]">
                                        <polyline points="9 18 15 12 9 6"></polyline>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
            
            <footer className="text-center text-gray-500 text-[1.5vh] py-[2vh]">
                <p>Choose a card to start playing!</p>
            </footer>
        </div>
    );
}

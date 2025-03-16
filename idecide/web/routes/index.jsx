import { Link } from "react-router-dom";

export default function () {
  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-b from-black via-gray-900 to-purple-900 flex flex-col items-center justify-between">
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <div className="font-[system-ui] font-bold text-[larger] gap-[2vh] flex flex-col w-full max-h-[30vh]">
          <div className="relative mx-auto">
          </div>
          <span className="text-center text-purple-300 text-[5vh] font-bold drop-shadow-[0_2px_4px_rgba(139,92,246,0.5)]">
            eyedecide
          </span>
          <span className="text-center text-purple-200 text-[2.5vh] font-bold drop-shadow-[0_2px_4px_rgba(139,92,246,0.5)]">
            using machine learning models<br />to make game-controls more accessible
          </span>
        </div>
        <div className="mt-[2vh] flex flex-col items-center gap-[2vh] w-full max-w-[90vw] md:max-w-[60vw] lg:max-w-[40vw] mx-auto">
          <div className="w-full p-[2vh] bg-gray-900 rounded-lg shadow-[0_0_15px_rgba(139,92,246,0.3)] border border-purple-700 relative overflow-hidden text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-red-900/20"></div>
            <div className="relative z-10">
              <h2 className="text-[2.5vh] font-bold mb-[1.5vh] text-purple-200 drop-shadow-[0_2px_4px_rgba(139,92,246,0.5)]">Welcome</h2>
              
              <Link 
                to="/sign-in" 
                className="inline-block bg-gradient-to-r from-purple-800 to-red-800 hover:from-purple-700 hover:to-red-700 text-white font-medium py-[1vh] px-[2vw] rounded-md transition-colors shadow-[0_0_10px_rgba(220,38,38,0.4)] hover:shadow-[0_0_15px_rgba(220,38,38,0.6)]"
              >
                Sign In
              </Link>
            </div>
           
          </div>
          <div className="w-full p-[2vh] bg-gray-900 rounded-lg shadow-[0_0_15px_rgba(139,92,246,0.3)] border border-purple-700 relative overflow-hidden text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-red-900/20"></div>
            <div className="relative z-10">
              <h2 className="text-[2.5vh] font-bold mb-[1.5vh] text-purple-200 drop-shadow-[0_2px_4px_rgba(139,92,246,0.5)]">Goals</h2>
              <div className="text-left text-purple-200 text-[1.8vh]">
                <p className="mb-[1vh]">- Real-time accurate face recognition and eye tracking ✅</p>
                <p className="mb-[1vh]">- A higher or lower inspired game that can be played with your eyes ✅</p>
                <p className="mb-[1vh]">- Multiple gamemodes for the higher or lower game✅</p>
                <p className="mb-[1vh]">- User accounts to save high scores for each gamemode ✅</p>
                <p className="mb-[1vh]">- Allow users to navigate the entire webapp handsfree ❌</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="text-purple-300 text-xl pb-[2vh] pt-[1vh]">created by umair</p>
    </div>
  );
}

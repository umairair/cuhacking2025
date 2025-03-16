export default function Question({ question, revealInfo, isCorrect }) {
    
    const formatNumber = (numStr) => {
        if (!numStr) return "";
        
        const num = parseFloat(numStr.replace(/,/g, ""));
        
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + "M";
        }
        return numStr;
    };

    return (
        <div className={`relative flex flex-col items-center justify-center w-full max-w-xs h-64 min-h-[16rem] text-center p-6 ${
            isCorrect !== null ? 'rounded-lg shadow-lg' : ''
        } ${
            isCorrect === true ? 'bg-green-500' : 
            isCorrect === false ? 'bg-red-500' : 
            ''
        }`}>
            {/* Subject section */}
            <div className="flex items-center justify-center w-full mb-4">
                <h2 className="text-4xl font-bold overflow-hidden text-ellipsis max-w-full">{question.subject}</h2>
            </div>
            
            {/* Metrics section */}
            <div className="flex items-center justify-center w-full">
                <div className={`w-full transition-opacity duration-300 ${revealInfo ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="flex items-center justify-center mb-2">
                        <span className="text-2xl mr-1">{question.verb || ""}</span>
                        <span className="text-3xl font-semibold">
                            {formatNumber(question.metric)}
                        </span>
                    </div>
                    
                    <div className="flex items-center justify-center text-xl opacity-80">
                        {question.metricDisplay}
                    </div>
                </div>
            </div>
            
            {/* Description section */}
            <div className="flex items-center justify-center w-full mt-4">
                {question.description && revealInfo && (
                    <p className="text-lg opacity-70 overflow-hidden">{question.description}</p>
                )}
            </div>
        </div>
    );
}

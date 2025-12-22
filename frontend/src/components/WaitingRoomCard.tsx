import { useEffect, useState, useRef } from "react";
import { LoadingSpinner } from "./utils/LoadingSpinner";
import { useNavigate } from "react-router-dom";

interface WaitingRoomProps {
    gameId: string | undefined;
    contract: any;
}

const WaitingRoomCard = ({ gameId, contract }: WaitingRoomProps) => {
    const [isWaiting, setIsWaiting] = useState(true);
    const [opponent, setOpponent] = useState<string | null>(null);
    const navigate = useNavigate();
    
    // 1. Use a ref to prevent duplicate listeners during parent re-renders
    const isSubscribed = useRef(false);

    useEffect(() => {
        // Prevent running if parameters aren't ready OR if already subscribed
        if (!contract || !gameId || isSubscribed.current) return;

        console.log(`📡 Setting up listener for Game ID: ${gameId}`);

        const handleGameJoined = (id: any, player2: string) => {
            console.log("Found GameJoined Event for ID:", id.toString());
            
            if (id.toString() === gameId.toString()) {
                setOpponent(player2);
                setIsWaiting(false);
                
                // Cleanup listener immediately once the event is caught
                contract.off("GameJoined", handleGameJoined);
                isSubscribed.current = false;

                setTimeout(() => {
                    navigate(`/game/${gameId}`);
                }, 2000);
            }
        };

        // 2. Mark as subscribed and attach
        isSubscribed.current = true;
        contract.on("GameJoined", handleGameJoined);

        // 3. Cleanup logic
        return () => {
            console.log("🧹 Component unmounting or dependency changed: Cleaning up");
            contract.off("GameJoined", handleGameJoined);
            isSubscribed.current = false;
        };
    }, [contract, gameId, navigate]);

    return (
        <div className="max-w-md mx-auto mt-10 p-8 border-2 border-dashed border-blue-200 rounded-2xl bg-slate-50 shadow-inner">
            <div className="flex flex-col items-center text-center space-y-6">
                <h2 className="text-2xl font-bold text-slate-800">Game Room #{gameId}</h2>

                {isWaiting ? (
                    <>
                        <div className="relative flex justify-center items-center">
                            <LoadingSpinner />
                            <span className="absolute animate-pulse text-xl">⏳</span>
                        </div>
                        <div className="space-y-2">
                            <p className="text-lg font-medium text-blue-600">Waiting for an opponent...</p>
                            <p className="text-sm text-slate-500 italic">The game will start automatically</p>
                        </div>
                    </>
                ) : (
                    <div className="animate-in fade-in zoom-in duration-500">
                        <div className="bg-green-100 p-4 rounded-full mb-4 inline-block">
                            <span className="text-3xl">⚔️</span>
                        </div>
                        <h3 className="text-xl font-bold text-green-700">Opponent Joined!</h3>
                        <p className="text-xs text-slate-500 mt-2 truncate w-48 mx-auto">{opponent}</p>
                        <p className="mt-4 text-slate-400 text-sm">Redirecting to board...</p>
                    </div>
                )}

                <button 
                    onClick={() => navigator.clipboard.writeText(gameId.toString())}
                    className="mt-4 px-4 py-2 text-xs font-semibold text-blue-500 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                >
                    Copy Game ID
                </button>
            </div>
        </div>
    );
};

export default WaitingRoomCard;
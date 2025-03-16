import { applyParams, save, ActionOptions } from "gadget-server";

/** @type { ActionRun } */
export const run = async ({ params, record, logger, api, connections }) => {
  // Store the original params to apply non-highscore fields
  const originalParams = { ...params };
  
  // Handle high score updates - only update if new score is higher than current
  if (params.user) {
    // Check if populationHighScore is being updated
    if (params.user.populationHighScore !== undefined) {
      const newScore = params.user.populationHighScore;
      const currentScore = record.populationHighScore || 0;
      
      // Only keep the high score param if it's higher than the current score
      if (newScore <= currentScore) {
        delete params.user.populationHighScore;
      }
      // Otherwise let it update with the new high score
    }
    
    // Check if sizeHighScore is being updated
    if (params.user.sizeHighScore !== undefined) {
      const newScore = params.user.sizeHighScore;
      const currentScore = record.sizeHighScore || 0;
      
      if (newScore <= currentScore) {
        delete params.user.sizeHighScore;
      }
    }
    
    // Check if spotifyHighScore is being updated
    if (params.user.spotifyHighScore !== undefined) {
      const newScore = params.user.spotifyHighScore;
      const currentScore = record.spotifyHighScore || 0;
      
      if (newScore <= currentScore) {
        delete params.user.spotifyHighScore;
      }
    }
  }
  
  // Apply the filtered parameters to the record
  applyParams(params, record);
  await save(record);
};

/** @type { ActionOptions } */
export const options = {
  actionType: "update",
  triggers: { api: true },
};

'use strict';

function responseToString(response) {
    return '{known: ' + response.known + ', error: ' + response.error + ', score: ' + response.score + '}';
}

module.exports = (dataService, metacriticService) => {
    return {
        lastUpdate: undefined,
        checkAndUpdateScores: async () => {
            let games = dataService.getUnratedGames();
            let failedGames = [];
            await Promise.all(games.map( async game => {
                var metacriticTitle;
                if(game.metacriticTitle)
                {
                    metacriticTitle = game.metacriticTitle;
                } else {
                    try {
                        metacriticTitle = await metacriticService.searchSwitchGame(game.title);
                    } catch(e) {
                        failedGames.push(game);
                        return;
                    }
                    dataService.setMetacriticTitle(game._id, metacriticTitle);
                }
                let scoreResponse = await metacriticService.fetchSoreForSwitchGame(metacriticTitle);
                if (!scoreResponse.error && scoreResponse.known) {
                    let url = metacriticService.guessGameUrl('switch', game.title);
                    dataService.setMetacritInfo(game._id, scoreResponse.score, url);
                }
                else {
                    console.log('metascore for ' + game.title + ' failed with result: ' + responseToString(scoreResponse));
                    failedGames.push(game);
                }
            }));
            console.log("Finished score update. Total failures: " + failedGames.length + " out of " + games.length);
            return {checked: games.length, updated: (games.length - failedGames.length), failures: failedGames.length};
        },
        getLastUpdateDate: () => {
            if (this.lastUpdate != null)
                return Date(this.lastUpdate).toString();
            else
                return 'not updated yet'
        }
    }
};
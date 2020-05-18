'use strict';
const db = require('diskdb');

module.exports = () => {
    return {
        db: db.connect('./data', ['games']),

        getAllGames: () => {
            return db.games.find();
        },

        getGameByTitle: (title) => {
            return db.games.findOne({ title: title });
        },

        deleteAllGames: () => {
            db.games.remove();
            db.connect('./data', ['games']);
        },

        deleteGameByNsId: (nsId) => {
            db.games.remove({ nsId: nsId });
        },

        getRatedGames: () => {
            return db.games.find().filter(g => (g.score != undefined));
        },

        getUnratedGames: () => {
            return db.games.find().filter(g => (g.score == undefined));
        },

        saveGame: (game) => {
            db.games.save(game);
        },

        setMetacritInfo: (id, rating, url) => {
            const score = (rating === 'tbd') ? 0 : rating;

            let query = {
                _id: id
            };
            let update = {
                score: score,
                metacriticUrl: url
            }
            db.games.update(query, update);
        }
    }
};
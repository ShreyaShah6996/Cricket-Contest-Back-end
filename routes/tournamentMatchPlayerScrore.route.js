const { Router } = require('express');
const router = Router();

const { TournamentMatchPlayerScore, Tournament, Team, Player, TournamentMatch, TournamentPoint } = require('../sequelize.js');

router.get('/:offset/:limit/:sortByColumn/:sortDirection', (req, res) => {
    let offset = parseInt(req.params.offset);
    let limit = parseInt(req.params.limit);
    let sortByColumn = req.params.sortByColumn;
    let sortDirection = req.params.sortDirection;

    TournamentMatchPlayerScore.findAll({
        limit: limit,
        offset: offset,
        order: [
            [sortByColumn, sortDirection]
        ],
        include: [
            {
                model: Player,
                as: 'Player',
                attributes: ['id', 'firstName', 'lastName']
            },
            {
                model: Tournament,
                where: { isDelete: 0 },
                include: [
                    {
                        model: TournamentMatch,
                        include: [{
                            model: Team,
                            as: 'Team1',
                        },
                        {
                            model: Team,
                            as: 'Team2',
                        }
                        ]
                    },
                    {
                        model: TournamentPoint,
                        as: 'points'
                    },
                    {
                        model: Player,
                        required: false,
                        through: { attributes: [] },
                        attributes: ['id']
                    }
                ]
            },
        ]

    }).then((resp) => {
        res.json(resp).status(200);
    }).catch((err) => {
        res.json({ "error": JSON.stringify(err) }).status(400);
    });
});

router.get('/:id', (req, res) => {
    TournamentMatchPlayerScore.findAll(
        {
            where: {
                tournamentId: req.params.id
            },
            include: [
                {
                    model: Player,
                    as: 'Player',
                    attributes: ['id', 'firstName', 'lastName']
                },
                {
                    model: Tournament,
                    where: { isDelete: 0 },
                    include: [
                        {
                            model: TournamentMatch,
                            include: [{
                                model: Team,
                                as: 'Team1',
                            },
                            {
                                model: Team,
                                as: 'Team2',
                            }
                            ]
                        },
                        {
                            model: TournamentPoint,
                            as: 'points'
                        },
                        {
                            model: Player,
                            required: false,
                            through: { attributes: [] },
                            attributes: ['id']
                        }
                    ]
                },
            ]

        }).then((resp) => {
            res.json(resp).status(200);
        }).catch((err) => {
            res.json({ "error": JSON.stringify(err) }).status(400);
        });
});


// router.get('/:id', (req, res) => {
//     Tournament.findById(req.params.id).then((resp) => {
//         res.json(resp).status(200);
//     }).catch((err) => {
//         res.json({ "error": JSON.stringify(err) }).status(400);
//     });
// });


router.post('/', (req, res) => {
    const tntMatchPlrScrPnt = new TournamentMatchPlayerScore();
    tntMatchPlrScrPnt.tournamentId = req.body.tournamentId;
    tntMatchPlrScrPnt.tournamentMatchId = req.body.tournamentMatchId;
    tntMatchPlrScrPnt.playerId = req.body.playerId;
    tntMatchPlrScrPnt.wicket = req.body.wicket;
    tntMatchPlrScrPnt.run = req.body.run;
    tntMatchPlrScrPnt.catch = req.body.catch;
    tntMatchPlrScrPnt.six = req.body.six;
    tntMatchPlrScrPnt.four = req.body.four;
    tntMatchPlrScrPnt.stumping = req.body.stumping;
    tntMatchPlrScrPnt.score = req.body.score;

    return tntMatchPlrScrPnt.save().then((tournamentMatchPlayerScore) => {
        res.json(tournamentMatchPlayerScore).status(200);
    }).catch((err) => {
        res.json({ "error": JSON.stringify(err) }).status(400);
    });

});

router.put('/:id', (req, res) => {
    return TournamentMatchPlayerScore.update({
        tournamentId: req.body.tournamentId,
        tournamentMatchId: req.body.tournamentMatchId,
        playerId: req.body.playerId,
        wicket: req.body.wicket,
        run: req.body.run,
        catch: req.body.catch,
        six: req.body.six,
        four: req.body.four,
        stumping: req.body.stumping,
        score: req.body.score,
    },
        { where: { id: req.params.id } }).then((tournamentMatchPlayerScore) => {
            res.json(tournamentMatchPlayerScore).status(200);
        }).catch((err) => {
            res.json({ "error": JSON.stringify(err) }).status(400);
        });
});

router.delete('/:id', (req, res) => {
    return TournamentMatchPlayerScore.update({
        isDelete: 1
    },
        { where: { id: req.params.id } }).then((tournamentMatchPlayerScore) => {
            res.json(tournamentMatchPlayerScore).status(200);
        }).catch((err) => {
            res.json({ "error": JSON.stringify(err) }).status(400);
        });
});

module.exports = router;
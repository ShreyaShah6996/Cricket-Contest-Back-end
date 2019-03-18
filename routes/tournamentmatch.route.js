const { Router } = require('express');
const router = Router();

const { TournamentMatch, Team, Player, Tournament } = require('../sequelize.js');


router.get('/:offset/:limit/:sortByColumn/:sortDirection', (req, res) => {
    let offset = parseInt(req.params.offset);
    let limit = parseInt(req.params.limit);
    let sortByColumn = req.params.sortByColumn;
    let sortDirection = req.params.sortDirection;

    TournamentMatch.findAll({
        where: {
            isDelete: 0
        },
        include: [
            {
                model: Tournament,
                as: "Tournament",
                attributes: ['id', 'tournamentName']
            },
            {
                model: Team,
                as: 'Team1',
                include: [{
                    model: Player,
                    required: false,
                    as: 'player',
                    through: { attributes: [] }
                }]
            },
            {
                model: Team,
                as: 'Team2',
                include: [{
                    model: Player,
                    required: false,
                    as: 'player',
                    through: { attributes: [] }
                }]
            }
        ],
        limit: limit,
        offset: offset,
        order: [
            [sortByColumn, sortDirection]
        ]
    }).then((resp) => {
        console.log(resp);
        res.json(resp).status(200);
    }).catch((err) => {
        res.json({ "error": JSON.stringify(err) }).status(400);
    });
});


router.get('/:tournamentId', (req, res) => {
    TournamentMatch.findAll({
        where: {
            isDelete: 0,
            tournamentId: req.params.tournamentId
        },
        include: [
            {
                model: Tournament,
                as: "Tournament",
                attributes: ['id', 'tournamentName']
            },
            {
                model: Team,
                as: 'Team1',
                include: [{
                    model: Player,
                    required: false,
                    as: 'player',
                    through: { attributes: [] }
                }]
            },
            {
                model: Team,
                as: 'Team2',
                include: [{
                    model: Player,
                    required: false,
                    as: 'player',
                    through: { attributes: [] }
                }]
            }
        ],
    }).then((resp) => {
        console.log(resp);
        res.json(resp).status(200);
    }).catch((err) => {
        res.json({ "error": JSON.stringify(err) }).status(400);
    });
});

router.get('/', (req, res) => {
    TournamentMatch.findAll({
        include: [{
            model: Team,
            as: 'Team1',
            include: [{
                model: Player,
                required: false,
                as: 'player',
                through: { attributes: [] }
            }
            ]
        },
        {
            model: Team,
            as: 'Team2',
            include: [{
                model: Player,
                required: false,
                as: 'player',
                through: { attributes: [] }
            }
            ]
        }
        ]
    }).then((resp) => {
        res.json(resp).status(200);
    }).catch((err) => {
        res.json({ "error": JSON.stringify(err) }).status(400);
    });
});

router.get('/:id', (req, res) => {
    TournamentMatch.findById(req.params.id, {
        include: [{
            model: Team,
            as: 'Team1',
            include: [{
                model: Player,
                required: false,
                as: 'player',
                through: { attributes: [] }
            }
            ]
        },
        {
            model: Team,
            as: 'Team2',
            include: [{
                model: Player,
                required: false,
                as: 'player',
                through: { attributes: [] }
            }
            ]
        }
        ]
    }).then((resp) => {
        res.json(resp).status(200);
    }).catch((err) => {
        res.json({ "error": JSON.stringify(err) }).status(400);
    });
});


router.post('/', (req, res) => {
    const tournamentMatchObject = new TournamentMatch();
    tournamentMatchObject.tournamentId = req.body.tournamentId;
    tournamentMatchObject.teamId1 = req.body.teamId1;
    tournamentMatchObject.teamId2 = req.body.teamId2;
    tournamentMatchObject.matchDate = req.body.matchDate;
    tournamentMatchObject.winningTeamId = req.body.winningTeamId;

    return tournamentMatchObject.save().then((tournamentMatch) => {
        res.json(tournamentMatch).status(200);
    }).catch((err) => {
        res.json({ "error": JSON.stringify(err) }).status(400);
    });

});

router.put('/:id', (req, res) => {
    return TournamentMatch.update({
        tournamentId: req.body.tournamentId,
        teamId1: req.body.teamId1,
        teamId2: req.body.teamId2,
        matchDate: req.body.matchDate,
        winningTeamId: req.body.winningTeamId,
    },
        { where: { id: req.params.id } }).then((tournamentMatch) => {
            res.json(tournamentMatch).status(200);
        }).catch((err) => {
            res.json({ "error": JSON.stringify(err) }).status(400);
        });
});

router.put('/:id/:winningTeamId', (req, res) => {
    return TournamentMatch.update({

        winningTeamId: req.params.winningTeamId,
    },
        { where: { id: req.params.id } }).then((tournamentMatch) => {
            res.json(tournamentMatch).status(200);
        }).catch((err) => {
            res.json({ "error": JSON.stringify(err) }).status(400);
        });
});

router.delete('/:id', (req, res) => {
    return TournamentMatch.update({
        isDelete: 1
    },
        { where: { id: req.params.id } }).then((tournamentMatch) => {
            res.json(tournamentMatch).status(200);
        }).catch((err) => {
            res.json({ "error": JSON.stringify(err) }).status(400);
        });
});


module.exports = router;
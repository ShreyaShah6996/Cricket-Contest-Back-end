const { Router } = require('express');
const router = Router();
let multer = require('multer');
const { Tournament, Team, TournamentMatch, Player, TournamentPoint, TeamPlayer } = require('../sequelize.js');
const Sequelize = require('sequelize');
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './assets/images')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname)
    }
});

const upload = multer({
    storage
});

router.get('/:offset/:limit/:sortByColumn/:sortDirection', (req, res) => {
    let offset = parseInt(req.params.offset);
    let limit = parseInt(req.params.limit);
    let sortByColumn = req.params.sortByColumn;
    let sortDirection = req.params.sortDirection;

    Tournament.findAll({
        where: {
            isDelete: 0
        },
        include: [{
            model: Team,
            required: false,
            through: { attributes: ['id', 'isDelete'] },
            // include: [{
            //     model: Player,
            //     required: false,
            //     as: 'player',
            //     through: { attributes: ['id'] }
            // }]
        },
            // {
            //     model: TournamentMatch,
            //     include: [{
            //         model: Team,
            //         as: 'Team1',
            //     },
            //     {
            //         model: Team,
            //         as: 'Team2',
            //     }
            //     ]
            // },
            // {
            //     model: TournamentPoint,
            //     as: 'points'
            // },
            // {
            //     model: Player,
            //     required: false,
            //     through: { attributes: ['id', 'isDelete'] },
            //     attributes: ['id']
            // }
        ],
        limit: limit,
        offset: offset,
        order: [
            [sortByColumn, sortDirection]
        ],

    }).then((resp) => {
        res.json(resp).status(200);
    }).catch((err) => {
        res.json({ "error": JSON.stringify(err) }).status(400);
    });
});

router.get('/', (req, res) => {
    Tournament.findAll({
        where: {
            isDelete: 0
        },
        logging: console.log,
        include: [{
            model: Team,
            required: false,
            through: { attributes: ['id', 'isDelete'] },
            include: [{
                model: TeamPlayer,
                required: false,
                where: {
                    tournamentId: {$col : 'Tournament.id'},
                    teamId: {$col : 'Teams.id'}
                },
                attributes: {
                    exclude : ['createdBy','updatedBy','updatedDate','createdDate']
                },
                include:[{
                    model: Player,
                    required: false,
                    attributes: {
                        exclude : ['createdBy','updatedBy','updatedDate','createdDate']
                    },
                    where: {
                        id: {$col: 'Teams.TeamPlayers.playerId'}
                    }
                }]
            }]
        },
            {
                model: TournamentMatch,
                attributes: {
                    exclude : ['createdBy','updatedBy','updatedDate','createdDate']
                },
                include: [{
                    model: Team,
                    as: 't1',
                    attributes: {
                        exclude : ['createdBy','updatedBy','updatedDate','createdDate']
                    },
                    include: [{
                        model: TeamPlayer,
                        required: false,
                        where: {
                            tournamentId: {$col : 'Tournament.id'},
                            teamId: {$col: 'TournamentMatches.t1.id'}

                        },
                        attributes: {
                            exclude : ['id','playerId','createdBy','updatedBy','updatedDate','createdDate']
                        },
                        include:[{
                            model: Player,
                            required: false,
                            attributes: {
                                exclude : ['createdBy','updatedBy','updatedDate','createdDate']
                            },
                        }]
                    }]
                },
                {
                    model: Team,
                    as: 't2',
                    attributes: {
                        exclude : ['createdBy','updatedBy','updatedDate','createdDate']
                    },
                    include: [{
                        model: TeamPlayer,
                        required: false,
                        where: {
                            tournamentId: {$col : 'Tournament.id'},
                            teamId: {$col: 'TournamentMatches.t2.id'}

                        },
                        attributes: {
                            exclude : ['id','playerId','createdBy','updatedBy','updatedDate','createdDate']
                        },
                        include:[{
                            model: Player,
                            required: false,
                            attributes: {
                                exclude : ['createdBy','updatedBy','updatedDate','createdDate']
                            },
                        }]
                    }]
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
    }).then((resp) => {
        res.json(resp).status(200);
    }).catch((err) => {
        res.json({ "error": JSON.stringify(err) }).status(400);
    });
});

router.get('/:id', (req, res) => {
    Tournament.findById(req.params.id, {
        where: {
            isDelete: 0
        },
        include: [{
            model: Team,
            required: false,
            through: { attributes: ['id', 'isDelete'] },
            include: [{
                model: Player,
                required: false,
                as: 'player',
                through: { attributes: ['id'] }
            }]
        },
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
        }, { model: TournamentPoint, as: 'points' }
        ]
    }).then((resp) => {
        res.json(resp).status(200);
    }).catch((err) => {
        res.json({ "error": JSON.stringify(err) }).status(400);
    });
});


router.post('/', upload.single('tournamentBanner'), (req, res) => {
    const obj = new Tournament();
    obj.tournamentName = req.body.tournamentName;
    obj.tournamentDescription = req.body.tournamentDescription;
    obj.createdBy = req.body.createdBy;
    obj.tournamentBanner = req.file.filename;
    return obj.save().then((tournament) => {
        res.json(tournament).status(200);
    }).catch((err) => {
        res.json({ "error": JSON.stringify(err) }).status(400);
    });

});

router.put('/:id', upload.single('tournamentBanner'), (req, res) => {
    if (req.file) {
        req.body.tournamentBanner = req.file.filename
    }
    let updatedTnt = {
        id: 0,
        tournamentName: "",
        tournamentDescription: ""
    };
    return Tournament.update(req.body,
        { where: { id: req.params.id } })
        .then((tournament) => {
            Tournament.findById(req.params.id)
                .then(tnt => {
                    res.send({
                        status: tournament,
                        tournament: tnt,
                        tournamentBanner: req.body.tournamentBanner
                    }).status(200);
                })

        }).catch((err) => {
            res.json({ "error": JSON.stringify(err) }).status(400);
        });
});

router.delete('/:id', (req, res) => {
    return Tournament.update({ isDelete: 1 }, { where: { id: req.params.id } })
        .then((tournament) => {
            res.json(tournament).status(200);
        }).catch((err) => {
            res.json({ "error": JSON.stringify(err) }).status(400);
        });
});

module.exports = router;
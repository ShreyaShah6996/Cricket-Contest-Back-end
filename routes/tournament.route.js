const { Router } = require('express');
const router = Router();
let multer = require('multer');
const path = require('path');
const Jimp = require('jimp');

const { Tournament, Team, TournamentMatch, Player, TournamentPoint } = require('../sequelize.js');

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
        },
        {
            model: TournamentPoint,
            as: 'points'
        },
        {
            model: Player,
            required: false,
            through: { attributes: ['id', 'isDelete'] },
            attributes: ['id']
        }
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

    if (req.file) {
        let imagePath = path.join(__dirname, '../assets/images/' + req.file.filename);
        let thumbnailImagePath = path.join(__dirname, '../assets/images/thumbnail/' + req.file.filename);
        Jimp.read(imagePath)
            .then(result => {
                return result
                    .resize(100, 70) // resize
                    .quality(100) // set JPEG quality
                    .write(thumbnailImagePath); // save
            })
            .catch(err => {
                console.error(err);
            });
        obj.tournamentBanner = req.file.filename;
    }
    else {
        obj.tournamentBanner = 'defaultTournament.png';
    }

    return obj.save().then((tournament) => {
        res.json(tournament).status(200);
    }).catch((err) => {
        res.json({ "error": JSON.stringify(err) }).status(400);
    });

});

router.put('/:id', upload.single('tournamentBanner'), (req, res) => {
    if (req.file) {
        let imagePath = path.join(__dirname, '../assets/images/' + req.file.filename);
        let thumbnailImagePath = path.join(__dirname, '../assets/images/thumbnail/' + req.file.filename);
        Jimp.read(imagePath)
            .then(result => {
                return result
                    .resize(100, 70) // resize
                    .quality(100) // set JPEG quality
                    .write(thumbnailImagePath); // save
            })
            .catch(err => {
                console.error(err);
            });
        req.body.tournamentBanner = req.file.filename
    }
    else if (req.body.tournamentBanner == "defaultTournament.png") {
        req.body.tournamentBanner = "defaultTournament.png"
    }
   
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
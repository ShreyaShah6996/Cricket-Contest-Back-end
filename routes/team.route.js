const { Router } = require('express');
const router = Router();
let multer = require('multer');
const path = require('path');
const Jimp = require('jimp');

const { Team, Player } = require('../sequelize.js');

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

    Team.findAll({
        include: [{
            model: Player,
            required: false,
            as: 'player',
            through: { attributes: ['id'] }
        }],
        limit: limit,
        offset: offset,
        order: [
            [sortByColumn, sortDirection]
        ],
        where: {
            isDelete: 0
        }
    }).then((resp) => {
        res.json(resp).status(200);
    }).catch((err) => {
        res.json({ "error": JSON.stringify(err) }).status(400);
    });
});

router.get('/', (req, res) => {
    Team.findAll({
        include: [{
            model: Player,
            required: false,
            as: 'player',
            through: { attributes: ['id'] }
        }],
        where: {
            isDelete: 0
        }
    }).then((resp) => {
        res.json(resp).status(200);
    }).catch((err) => {
        res.json({ "error": JSON.stringify(err) }).status(400);
    });
});

router.get('/:id', (req, res) => {
    Team.findById(req.params.id, {
        include: [{
            model: Player,
            required: false,
            as: 'player',
            through: { attributes: ['id'] }
        }],
        where: {
            isDelete: 0
        }
    }).then((resp) => {
        res.json(resp).status(200);
    }).catch((err) => {
        res.json({ "error": JSON.stringify(err) }).status(400);
    });
});


router.post('/', upload.single('teamLogo'), (req, res) => {
    const obj = new Team();
    obj.teamName = req.body.teamName;
    obj.createdBy = req.body.createdBy;

    if (req.file) {
        let imagePath = path.join(__dirname, '../assets/images/' + req.file.filename);
        let thumbnailImagePath = path.join(__dirname, '../assets/images/thumbnail/' + req.file.filename);
        Jimp.read(imagePath)
            .then(result => {
                return result
                    .resize(60, 60)
                    .quality(100)
                    .write(thumbnailImagePath);
            })
            .catch(err => {
                console.error(err);
            });
        obj.teamLogo = req.file.filename;
    }
    else {
        obj.teamLogo = 'defaultTeamLogo.png';
    }

    return obj.save().then((team) => {
        res.json(team).status(200);
    }).catch((err) => {
        res.json({ "error": JSON.stringify(err) }).status(400);
    });

});

router.put('/:id', upload.single('teamLogo'), (req, res) => {
    if (req.file) {

        let imagePath = path.join(__dirname, '../assets/images/' + req.file.filename);
        let thumbnailImagePath = path.join(__dirname, '../assets/images/thumbnail/' + req.file.filename);
        Jimp.read(imagePath)
            .then(result => {
                return result
                    .resize(60, 60)
                    .quality(100)
                    .write(thumbnailImagePath);
            })
            .catch(err => {
                console.error(err);
            });
        req.body.teamLogo = req.file.filename
    }
    else if (req.body.teamLogo == 'defaultTeamLogo.png') {
        req.body.tournamentBanner = "defaultTeamLogo.png"
    }

    return Team.update(req.body,
        { where: { id: req.params.id } })
        .then((team) => {
            res.json({
                ...team,
                teamLogo: req.body.teamLogo
            }).status(200);
        }).catch((err) => {
            res.json({ "error": JSON.stringify(err) }).status(400);
        });
});

router.delete('/:id', (req, res) => {
    return Team.update({ isDelete: 1 }, { where: { id: req.params.id } }).then((team) => {
        res.json(team).status(200);
    }).catch((err) => {
        res.json({ "error": JSON.stringify(err) }).status(400);
    });
});



module.exports = router;
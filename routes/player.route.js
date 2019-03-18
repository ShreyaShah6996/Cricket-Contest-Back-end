const { Router } = require('express');
const router = Router();
let multer = require('multer');
const { Player } = require('../sequelize.js');
const path = require('path');
const Jimp = require('jimp');

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

    Player.findAll({
        where: { isActive: true },
        limit: limit,
        offset: offset,
        order: [
            [sortByColumn, sortDirection]
        ]
    }).then((resp) => {
        res.json(resp).status(200);
    }).catch((err) => {
        res.json({ "error": JSON.stringify(err) }).status(400);
    });
});

router.get('/', (req, res) => {
    Player.findAll({
        where: { isActive: true }
    }).then((resp) => {
        res.json(resp).status(200);
    }).catch((err) => {
        res.json({ "error": JSON.stringify(err) }).status(400);
    });
});

router.get('/:id', (req, res) => {
    Player.findById(req.params.id).then((resp) => {
        res.json(resp).status(200);
    }).catch((err) => {
        res.json({ "error": JSON.stringify(err) }).status(400);
    });
});


router.post('/', upload.single('playerImage'), (req, res) => {
    const obj = new Player();
    obj.firstName = req.body.firstName;
    obj.lastName = req.body.lastName;
    obj.dob = req.body.dob;
    obj.gender = req.body.gender;
    obj.description = req.body.description;
    if (req.file) {
        let imagePath = path.join(__dirname, '../assets/images/' + req.file.filename);
        let thumbnailImagePath = path.join(__dirname, '../assets/images/thumbnail/' + req.file.filename);
        Jimp.read(imagePath)
            .then(result => {
                return result
                    .resize(60, 60) // resize
                    .quality(100) // set JPEG quality
                    .write(thumbnailImagePath); // save
            })
            .catch(err => {
                console.error(err);
            });
        obj.playerImage = req.file.filename;
    }
    else {
        obj.playerImage = 'defaultPlayerImage.png';
    }
    return obj.save().then((player) => {
        res.json(player).status(200);
    }).catch((err) => {
        res.json({ "error": JSON.stringify(err) }).status(400);
    });

});

router.put('/:id', upload.single('playerImage'), (req, res) => {
    if (req.file) {
        let imagePath = path.join(__dirname, '../assets/images/' + req.file.filename);
        let thumbnailImagePath = path.join(__dirname, '../assets/images/thumbnail/' + req.file.filename);
        Jimp.read(imagePath)
            .then(result => {
                return result
                    .resize(60, 60) // resize
                    .quality(100) // set JPEG quality
                    .write(thumbnailImagePath); // save
            })
            .catch(err => {
                console.error(err);
            });
        req.body.playerImage = req.file.filename
    }
    else if (req.body.playerImage == "defaultPlayerImage.png") {
        req.body.playerImage == "defaultPlayerImage.png"
    }

    return Player.update(req.body,
        { where: { id: req.params.id } }).then((player) => {
            res.json({
                ...player,
                playerImage: req.body.playerImage
            }).status(200);
        }).catch((err) => {
            res.json({ "error": JSON.stringify(err) }).status(400);
        });
});

router.delete('/:id', (req, res) => {
    return Player.update({
        isActive: false
    },
        { where: { id: req.params.id } }).then((player) => {
            res.json(player).status(200);
        }).catch((err) => {
            res.json({ "error": JSON.stringify(err) }).status(400);
        });
});


module.exports = router;
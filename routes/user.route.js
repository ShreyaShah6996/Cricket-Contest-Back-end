const { Router } = require('express');
const router = require('express').Router();

const { User, Player, Tournament } = require('../sequelize.js');
const { generateHash, matchHash } = require('../shared/common');

router.get('/:offset/:limit/:sortByColumn/:sortDirection', (req, res) => {
    let offset = parseInt(req.params.offset);
    let limit = parseInt(req.params.limit);
    let sortByColumn = req.params.sortByColumn;
    let sortDirection = req.params.sortDirection;

    User.findAll({
        attributes: {
            exclude: ['password']
        },
        include: [{
            model: Tournament,
            required: false,
            through: { attributes: [] },
            include: [{
                model: Player,
                through: { attributes: [] }
            }]
        }],
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
    User.findAll({
        attributes: {
            exclude: ['password']
        }
    }).then((resp) => {
        res.json(resp).status(200);
    }).catch((err) => {
        res.json({ "error": JSON.stringify(err) }).status(400);
    });
});

router.get('/:id', (req, res) => {
    User.findById(req.params.id, {
        include: [{
            model: Tournament,
            required: false,
            through: { attributes: [] },
            include: [{
                model: Player,
                through: { attributes: [] }
            }]
        }],
    }).then((resp) => {
        res.json(resp).status(200);
    }).catch((err) => {
        res.json({ "error": JSON.stringify(err) }).status(400);
    });
});

router.put('/:id', (req, res) => {
    return User.update({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        gender: req.body.gender,
        email: req.body.email,
        password: generateHash(req.body.password)
    },
        { where: { id: req.params.id } }).then((user) => {
            res.json(user).status(200);
        }).catch((err) => {
            res.json({ "error": JSON.stringify(err) }).status(400);
        });
});


module.exports = router;
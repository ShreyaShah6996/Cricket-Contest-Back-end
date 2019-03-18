const { Router } = require('express');
const router = Router();

const { TournamentPoint, Tournament } = require('../sequelize.js');

router.post('/', (req, res) => {
    const obj = new TournamentPoint();
    obj.tournamentId = req.body.tournamentId;
    obj.pointJson = req.body.pointJson;

    return obj.save().then((tournamentpoint) => {
        res.json(tournamentpoint).status(200);
    }).catch((err) => {
        res.json({ "error": JSON.stringify(err) }).status(400);
    });

});

router.get('/:offset/:limit/:sortByColumn/:sortDirection', (req, res) => {
    let offset = parseInt(req.params.offset);
    let limit = parseInt(req.params.limit);
    let sortByColumn = req.params.sortByColumn;
    let sortDirection = req.params.sortDirection;

    TournamentPoint.findAll({
        
        include: [{

            model: Tournament,
            as: "Tournament",
            attributes: ['id', 'tournamentName'],
            where:{
                isDelete:0
            }
        }],
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

router.put('/:id', (req, res) => {
    return TournamentPoint.update({
        tournamentId: req.body.tournamentId,
        pointJson: req.body.pointJson
    }, { where: { id: req.params.id } }).then((tournamentpoint) => {
        res.json(tournamentpoint).status(200);
    }).catch((err) => {
        res.json({ "error": JSON.stringify(err) }).status(400);
    });
});


module.exports = router;
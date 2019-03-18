const { Router } = require('express');
const router = Router();

const { TournamentTeam } = require('../sequelize.js');

router.post('/', (req, res) => {
    const tournamentTeamObject = new TournamentTeam();
    tournamentTeamObject.tournamentId = req.body.tournamentId;
    tournamentTeamObject.teamId = req.body.teamId;
    tournamentTeamObject.createdBy = req.body.createdBy;
    return tournamentTeamObject.save().then((tournamentTeam) => {
        res.json(tournamentTeam).status(200);
    }).catch((err) => {
        res.json({ "error": JSON.stringify(err) }).status(400);
    });

});

router.put('/:id', (req, res) => {
    return TournamentTeam.update({
        tournamentId: req.body.tournamentId,
        teamId: req.body.teamId
    },
        { where: { id: req.params.id } }).then((tournamentTeam) => {
            res.json(tournamentTeam).status(200);
        }).catch((err) => {
            res.json({ "error": JSON.stringify(err) }).status(400);
        });
});

router.delete('/:tournamentId/:teamId/:updatedBy', (req, res) => {    
    return TournamentTeam.update({
        isDelete : 1,
        updatedBy:req.params.updatedBy
    },
        { where: { tournamentId:req.params.tournamentId, teamId: req.params.teamId } }).then((tournamentTeam) => {
            res.json(tournamentTeam).status(200);
        }).catch((err) => {
            res.json({ "error": JSON.stringify(err) }).status(400);
        });
});
    

module.exports = router;
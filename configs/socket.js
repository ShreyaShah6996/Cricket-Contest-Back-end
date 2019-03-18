var _ = require("lodash"),
   // usersManager = require('../app/managers/user.server.manager'),
  //  policy = require('./policy'),
  //  permissions = policy.permissions(),
 //   roles = policy.roles(),
    io,
    status;
var adminGroup = "admins";

module.exports = {
    init: init,
    get: getIo,
    status: getStatusSocket,
    file: getFileSocket
};

function init(http){
    io = require('socket.io')(http);
    status = io.of('/status');
    status.on('connection', function(socket){
        socket.emit("connected");
        socket.on('subscribe', function(user , currentProject){
            if(!user) return false;
            socket.join(currentProject ? currentProject.toString() : user.currentProject);
            socket.join(user._id);
            if(usersManager.isUserInRole(user, roles.admin)){
                socket.join(adminGroup);
            }
            console.log("user " + user.displayName + " subscribed!");
        });
        socket.on("unsubscribe", function(user){
            _.forEach(user.projects, function(project){
                socket.leave(project._id || project);
            });
            socket.leave(user._id);
            if(usersManager.isUserInRole(user, roles.admin)){
                socket.leave(adminGroup);
            }
            console.log("user " + user.displayName + " unsubscribe!");
        });
        socket.on("resubscribe", function(obj){
            var oldUser = obj.oldUser;
            var newUser = obj.newUser;
            var currentProject= obj.currentProject;
            socket.leave(oldUser.currentProject).join(currentProject ? currentProject : newUser.currentProject);
            if(usersManager.isUserInRole(oldUser, roles.admin)){
                socket.leave(adminGroup);
            }
            if(usersManager.isUserInRole(newUser, roles.admin)){
                socket.join(adminGroup);
            }
            console.log("user " + newUser.displayName + " resubscribed!");
        });
    });
}

function getIo(){
    return io;
}

function getStatusSocket(){
    var service = {
        notificationadded: addNotification,
        changed: statusChanged,
        available: unitAvailable,
        issues: changeChildrenIssues
    };
    return service;
}

function statusChanged(activityFlow, project){
    console.log("statusChanged");
    status.to(project.toString()).emit("changed", activityFlow);
}


function addNotification(notification, solicitation){
    console.log("statusChanged");
    status.to(solicitation.toString()).emit("notificationadded", notification);
}

function unitAvailable(activityFlow, user){
    var isAdmin = usersManager.isUserInRole(user, roles.admin);
    var isContractor = usersManager.isUserInRole(user, roles.contractor);
    var isUserInActivity = _.some(activityFlow.activity.contractors, function(contractor){
        return contractor.equals(user._id);
    });
    var isReportingManager = usersManager.isReportingManager(user);
    _.forEach(activityFlow.activity.contractors, function(contractor){
        status.to(contractor.toString()).emit("available", activityFlow);
    });

    if(!isAdmin) {
        status.to(adminGroup).emit("available", activityFlow);
    }

    if(!isContractor || !isUserInActivity && isReportingManager) {
        status.to(user._id.toString()).emit("available", activityFlow);
    }
}

function changeChildrenIssues(children, project){
  status.to(project.toString()).emit("issues", children);
}

function getFileSocket(){
    var service = {
        changed: fileListChanged
    };
    return service;
}

function fileListChanged(files, project){
    console.log("fileListChanged");
    status.to(project.toString()).emit("modified", files);
}

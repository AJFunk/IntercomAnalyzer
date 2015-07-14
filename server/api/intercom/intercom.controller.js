/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /things              ->  index
 * POST    /things              ->  create
 * GET     /things/:id          ->  show
 * PUT     /things/:id          ->  update
 * DELETE  /things/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
//var Thing = require('./thing.model');
var Intercom = require('intercom.io');

var options = {
  apiKey: process.env.INTERCOM_KEY,
  appId: process.env.INTERCOM_ID
};

var intercom = new Intercom(options);

exports.index = function(req, res) {
  // Thing.find(function (err, things) {
  //   if(err) { return handleError(res, err); }
  //   return res.json(200, things);
  // });
  intercom.getUsers({
    // page: 1,
    // per_page: 500,
    // tag_id: 7002,
    // tag_name: "me"
  }, function (err, users) {
    intercom.getTag({}, function (err, tags) {
      //console.log(tags);
      intercom.listSegments({}, function (err, segments) {
        var data = {
          tags: tags,
          users: users,
          segments: segments
        };
        return res.send(200, data);
      });
    });

    // console.log(res);
    // return res.send(200, response);
  });
};

exports.tagNum = function(req, res) {
  console.log(req.params.index);
  intercom.getUser({ "tag_id": req.params.id }).then(function(data) {
    data.index = req.params.index;
    return res.send(200, data);
  }, function(err) {
    return res.send(500);
  });
};

exports.tagPage = function(req, res) {
  intercom.getUser({ "tag_id": req.params.id, "page": req.params.page }).then(function(data) {
    return res.send(200, data);
  }, function(err) {
    return res.send(500);
  });
};

// Get a single thing
// exports.show = function(req, res) {
//   Thing.findById(req.params.id, function (err, thing) {
//     if(err) { return handleError(res, err); }
//     if(!thing) { return res.send(404); }
//     return res.json(thing);
//   });
// };

// // Creates a new thing in the DB.
// exports.create = function(req, res) {
//   Thing.create(req.body, function(err, thing) {
//     if(err) { return handleError(res, err); }
//     return res.json(201, thing);
//   });
// };

// // Updates an existing thing in the DB.
// exports.update = function(req, res) {
//   if(req.body._id) { delete req.body._id; }
//   Thing.findById(req.params.id, function (err, thing) {
//     if (err) { return handleError(res, err); }
//     if(!thing) { return res.send(404); }
//     var updated = _.merge(thing, req.body);
//     updated.save(function (err) {
//       if (err) { return handleError(res, err); }
//       return res.json(200, thing);
//     });
//   });
// };

// // Deletes a thing from the DB.
// exports.destroy = function(req, res) {
//   Thing.findById(req.params.id, function (err, thing) {
//     if(err) { return handleError(res, err); }
//     if(!thing) { return res.send(404); }
//     thing.remove(function(err) {
//       if(err) { return handleError(res, err); }
//       return res.send(204);
//     });
//   });
// };

function handleError(res, err) {
  return res.send(500, err);
}

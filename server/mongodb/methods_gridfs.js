/**
 * Created by RSercan on 9.2.2016.
 */
var mongodbApi = require('mongodb');

Meteor.methods({
    'deleteFile': function (bucketName, fileId) {
        LOGGER.info('[deleteFile]', bucketName, fileId);

        var result = Async.runSync(function (done) {
            try {
                var bucket = new mongodbApi.GridFSBucket(database, {bucketName: bucketName});
                bucket.delete(new mongodbApi.ObjectId(fileId), function (err) {
                    done(err, null);
                });
            }
            catch (ex) {
                LOGGER.error('[deleteFile]', ex);
                done(new Meteor.Error(ex.message), null);
            }
        });

        convertBSONtoJSON(result);
        return result;
    },

    'getFileInfos': function (bucketName, selector, limit) {
        limit = parseInt(limit) || 100;
        selector = selector || {};
        LOGGER.info('[getFileInfos]', bucketName, selector, limit);

        var result = Async.runSync(function (done) {
            try {
                var bucket = new mongodbApi.GridFSBucket(database, {bucketName: bucketName});
                bucket.find(selector, {limit: limit}).toArray(function (err, files) {
                    done(err, files);
                });

            }
            catch (ex) {
                LOGGER.error('[getFileInfos]', ex);
                done(new Meteor.Error(ex.message), null);
            }
        });

        convertBSONtoJSON(result);
        return result;
    },

    'uploadFile': function (bucketName, blob, fileName, contentType, metaData, aliases) {
        if (metaData) {
            convertJSONtoBSON(metaData);
        }

        blob = new Buffer(blob);

        LOGGER.info('[uploadFile]', bucketName, fileName, contentType, metaData, aliases);

        return Async.runSync(function (done) {
            try {
                var bucket = new mongodbApi.GridFSBucket(database, {bucketName: bucketName});
                var uploadStream = bucket.openUploadStream(fileName, {
                    metadata: metaData,
                    contentType: contentType,
                    aliases: aliases
                });
                uploadStream.end(blob);
                uploadStream.once('finish', function () {
                    done(null, null);
                });
            }
            catch (ex) {
                LOGGER.error('[uploadFile]', ex);
                done(new Meteor.Error(ex.message), null);
            }
        });
    },

    'getFile': function (bucketName, fileId) {
        LOGGER.info('[getFile]', bucketName, fileId);

        var result = Async.runSync(function (done) {
            try {
                var filesCollection = database.collection(bucketName + '.files');
                filesCollection.find({_id: new mongodbApi.ObjectId(fileId)}).limit(1).next(function (err, doc) {
                    if (doc) {
                        done(null, doc);
                    } else {
                        done(new Meteor.Error('No file found for given ID'), null);
                    }
                });
            }
            catch (ex) {
                LOGGER.error('[getFile]', ex);
                done(new Meteor.Error(ex.message), null);
            }
        });

        convertBSONtoJSON(result);
        return result;
    }
});
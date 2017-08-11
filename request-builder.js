var request = require('request');
var async = require('async');

class RequestBuilder {
    constructor(token){
        this.baseUrl = 'https://www.pivotaltracker.com/services/v5/'
        this.token = token;
    }

    buildHeaders(){
        return {
            'Content-Type': 'application/json',
            'X-TrackerToken': this.token
        }
    }

    getActiveStoryEndpoints(projectId){
        const activeStatuses = ['unscheduled', 'unstarted', 'started', 'planned']
        return activeStatuses.map(status => 
            `${this.baseUrl}projects/${projectId}/stories?with_state=${status}`);
    }

    getActiveStoriesForProject(projectId, cb){
        var requests = this.getActiveStoryEndpoints(projectId).map(endpoint => {
            return {
                uri: endpoint,
                headers: this.buildHeaders(),
                method: 'GET'
            }
        })

        async.map(requests, function(obj, callback) {
            // iterator function
            request(obj, function(error, response, body) {
                if (!error && response.statusCode == 200) {
                // transform data here or pass it on
                var body = JSON.parse(body);
                callback(null, body);
                } else {
                callback(error || response.statusCode);
                }
            });
            }, function(error, data){
                const activeTickets = data.reduce(function(list, item){
                    return list.concat(item);;
                }, [])
                cb(activeTickets);

                return activeTickets;
            });
    }

    addBlockersToStories(stories, cb){
        const headers = this.buildHeaders();
        const baseUrl = this.baseUrl;
        const tasks = stories.map(story => {
            return function(callback){
                request({
                    uri: `${baseUrl}projects/${story.projectId}/stories/${story.id}/blockers`,
                    headers,
                    method: 'GET'
                }, function (err, resp, body){
                    var blockers = []
                    var body = JSON.parse(body);
                    body.forEach(blocker => {
                        const match = blocker.description.match(/[#]([\d]*)/m);
                        if (match) {
                            blockers.push(parseInt(match[1]), 10);
                        }
                    })
                    story.blockers = blockers;
                    callback(null, story)
                })
            }
            
        });

        async.series(tasks, cb);
    }
}

module.exports = RequestBuilder;
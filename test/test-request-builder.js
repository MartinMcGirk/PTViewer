var expect = require('chai').expect;
var reqBuilder = require('../request-builder');

const testToken = 'thisisatesttoken'

describe('request-builder', function(){
    it('should build a request with the correct headers', function(){
        const expectedResult = {
            'Content-Type': 'application/json',
            'X-TrackerToken': testToken
        }
        const requester = new reqBuilder(testToken);
        expect(requester.buildHeaders()).to.eql(expectedResult)
    });

    it('should call the right endpoints to get all active stories', function(){
        const requester = new reqBuilder(testToken);
        const projectId = 100;
        const activeStories = requester.getActiveStoryEndpoints(projectId)
        expect(activeStories.length).to.equal(3)
        expect(activeStories[0]).to.contain('unscheduled')
        expect(activeStories[1]).to.contain('unstarted')
        expect(activeStories[2]).to.contain('started')
    });
});


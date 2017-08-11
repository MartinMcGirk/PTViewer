const reqBuilder = require('./request-builder')
const fs = require('fs');
const config = require('./config.json');

var requester = new reqBuilder(config.pivotalToken);

const userStoryProjectBoard = config.productBoard;
const engineeringProjectBoard = config.engineeringBoard;

function getProductUserStories(){
    requester.getActiveStoriesForProject(userStoryProjectBoard, getEngineeringUserStories)
}

function getEngineeringUserStories(userStories){
    requester.getActiveStoriesForProject(engineeringProjectBoard, engStories => {
        getGraphableUserStories(userStories, engStories);
    })
}

function getGraphableUserStories(userStories, engStories){
    const graphableStories = 
            userStories.map(story => mapIntoGraphableObject(story, 'product'))
            .concat(
            engStories.map(story => mapIntoGraphableObject(story, 'engineering')));
    
    requester.addBlockersToStories(graphableStories, writeDataToFile);
}

function writeDataToFile(err, data){
    fs.writeFile("tickets.json", JSON.stringify(data, null, 2), function(err) {
        if(err) {
            return console.log(err);
        }

        console.log("The file was saved!");
    }); 
}

//getProductUserStories()


function mapIntoGraphableObject(story, board){
    return {
        id: story.id,
        storyType: story.story_type,
        currentState: story.current_state,
        name: story.name,
        estimate: story.estimate,
        board,
        projectId: story.project_id
    }
}
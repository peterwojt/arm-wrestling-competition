const express = require('express');
const app = express();
const path = require('path');
require('dotenv').config();
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { PutCommand, QueryCommand, DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");


const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);


const port = process.env.PORT;
const SERVER_API_KEY = process.env.ADD_USER_API_KEY;

// Display home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'main.html'));
});

// Returns top ten candidates
app.get('/topten', async (req, res) => {
    const command = new QueryCommand({
        TableName: "ArmWrestleLeaderboard",
        KeyConditionExpression: "PartitionKey = :pk",
        ExpressionAttributeValues: {
            ":pk": "leaderboard",
        },
        Limit: 10,
        ScanIndexForward: false,
    });

    const response = await docClient.send(command);
    
    const items = response.Items;
    res.json(items);
});

// Return all candidates (max 500)
app.get('/all', async (req, res) => {
    const command = new QueryCommand({
        TableName: "ArmWrestleLeaderboard",
        KeyConditionExpression: "PartitionKey = :pk",
        ExpressionAttributeValues: {
            ":pk": "leaderboard",
        },
        Limit: 500,
        ScanIndexForward: false,
    });

    const response = await docClient.send(command);

    const items = response.Items;
    res.json(items);
});

// Add someone to the leaderboard
app.get('/add/:API_KEY/:userID/:avgForce/:maxForce/:score', async (req, res) => {
    const CLIENT_API_KEY = req.params.API_KEY;

    if (SERVER_API_KEY != CLIENT_API_KEY) {
        return res.status(401).json({ error: 'Invalid API key' });
    }

    const userName = req.params.userID;
    const avgForce = req.params.avgForce;
    const maxForce = req.params.maxForce;
    const userScore = req.params.score;


    const command = new PutCommand({
        TableName: "ArmWrestleLeaderboard",
        Item: {
            PartitionKey: "leaderboard",
            user: userName,
            avg: Number(avgForce),
            max: Number(maxForce),
            score: Number(userScore),
        },
    });

    const response = await docClient.send(command);
    res.json(response);
});



// Start the server
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
}); 
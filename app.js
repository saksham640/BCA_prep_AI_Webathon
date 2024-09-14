const express = require("express");
const axios = require("axios");
const path = require("path");
const ejsMate = require("ejs-mate");

const app = express();
const port = 8080;

const externalUserId = "webathon";
const apiKey = "KoTKlxOZrZhPOqCeYvUnmsWEOn2ifJUO";

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: true }));
app.engine("ejs", ejsMate);

// Function to create a chat session
async function createChatSession() {
    try {
        const response = await axios.post(
            "https://api.on-demand.io/chat/v1/sessions",
            {
                pluginIds: ["plugin-1726226094"],
                externalUserId: externalUserId,
            },
            {
                headers: {
                    apikey: apiKey,
                }
            }
        );
        return response.data.data.id; // Extract session ID
    } catch (error) {
        console.error("Error creating chat session:", error);
        throw error;
    }
}

// Function to submit a query
async function submitQuery(sessionId, userQuery) {
    try {
        const response = await axios.post(
            `https://api.on-demand.io/chat/v1/sessions/${sessionId}/query`,
            {
                endpointId: "predefined-openai-gpt4o",
                query: userQuery, // Use the user's query
                pluginIds: ["plugin-1726226094", 'plugin-1712327325', 'plugin-1713962163'],
                responseMode: "sync",
            },
            {
                headers: {
                    apikey: apiKey,
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error submitting query:", error);
        throw error;
    }
}

// Route to render the main form
app.get("/", (req, res) => {
    res.render("index", { userResponse: null }); 
});

// Route to handle form submissions
app.post("/submit", async (req, res) => {
    const userQuery = req.body.userQuery; // Get the user input from the form

    if (!userQuery) {
        return res.render("index.ejs", { userResponse: "Query cannot be empty!" });
    }

    try {
        const sessionId = await createChatSession();
        const queryResponse = await submitQuery(sessionId, userQuery);
        
        const userResponse = queryResponse.data.answer;
        
        res.render("index", { userResponse }); // Render the form with the response from the API
    } catch (error) {
        console.error("Error in querying:", error);
        res.render("index", { userResponse: "Error querying the API." });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

app.get("/questions",(req,res)=>{
    res.render("questions.ejs",{userResponse:null});
});
app.post("/questions",async (req,res)=>{
    const userQuery = `Please return 10 MCQ questions related to ${req.body.userQuery} in a list format`; // Get the user input from the form

    if (!userQuery) {
        return res.render("questions.ejs", { userResponse: "Query cannot be empty!" });
    }

    try {
        const sessionId = await createChatSession();
        const queryResponse = await submitQuery(sessionId, userQuery);
        
        const userResponse = queryResponse.data.answer;
        
        res.render("questions", { userResponse }); // Render the form with the response from the API
    } catch (error) {
        console.error("Error in querying:", error);
        res.render("questions", { userResponse: "Error querying the API." });
    }

});

app.get("/shortNotes",(req,res)=>{
    res.render("shortNotes.ejs",{userResponse:null});
})

app.post("/shortNotes",async (req,res)=>{
    const userQuery = `Please return a summary related to ${req.body.userQuery} in about 150 words`; // Get the user input from the form

    if (!userQuery) {
        return res.render("shortNotes.ejs", { userResponse: "Query cannot be empty!" });
    }

    try {
        const sessionId = await createChatSession();
        const queryResponse = await submitQuery(sessionId, userQuery);
        
        const userResponse = queryResponse.data.answer;
        
        res.render("shortNotes", { userResponse }); // Render the form with the response from the API
    } catch (error) {
        console.error("Error in querying:", error);
        res.render("shortNotes", { userResponse: "Error querying the API." });
    }
})

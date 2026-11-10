const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ObjectId } = require("mongodb");
const client = new MongoClient(process.env.MONGO_URI);

const app = express();

app.use(express.json());
app.use(cors());

app.post("/api/projects/:projectId/stories", async (req, res) => {
    const { title, description, priority, assigned_user_id } = req.body;
    const projectId = req.params.projectId;

    if (!title || !description || !priority) {
        return res.status(400).json({
            message: "Title, description, and priority are required"
        });
    }

    if (!["High", "Medium", "Low"].includes(priority)) {
        return res.status(400).json({
            message: "Priority must be be selected"
        });
    }

    if (!ObjectId.isValid(projectId)) {
        return res.status(400).json({
            message: "Invalid project id"
        });
    }

    try {
        const db = client.db("pa2");
        const projects = db.collection("projects");
        const memberships = db.collection("projectmemberships");
        const stories = db.collection("userstories");

        const project = await projects.findOne({ _id: new ObjectId(projectId) });
        if (!project) {
            return res.status(404).json({
                message: "Project does not exist"
            });
        }

        let assignedId = null;
        if (assigned_user_id) {
            if (!ObjectId.isValid(assigned_user_id)) {
                return res.status(400).json({
                    message: "Invalid user id"
                });
            }
            const membership = await memberships.findOne({
                project_id: new ObjectId(projectId),
                user_id: new ObjectId(assigned_user_id)
            });
            if (!membership) {
                return res.status(400).json({
                    message: "User is not a member of this project or project does not exist"
                });
            }
            assignedId = new ObjectId(assigned_user_id);
        }

        await stories.insertOne({
            project_id: new ObjectId(projectId),
            title: title,
            description: description,
            priority: priority,
            status: "To Do",
            assigned_user_id: assignedId
        });

        return res.status(201).json({
            message: "Story created successfully"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Server error"
        });
    }
});

app.get("/api/projects/:projectId/stories", async (req, res) => {
    const projectId = req.params.projectId;

    if (!ObjectId.isValid(projectId)) {
        return res.status(400).json({
            message: "Invalid project id"
        });
    }

    try {
        const db = client.db("pa2");
        const stories = db.collection("userstories");
        const storyList = await stories.find({
            project_id: new ObjectId(projectId)
        }).toArray();

        return res.status(200).json(storyList);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Server error"
        });
    }
});

app.put("/api/stories/:storyId", async (req, res) => {
    const storyId = req.params.storyId;
    const { title, description, priority, status, assigned_user_id } = req.body;

    if (!ObjectId.isValid(storyId)) {
        return res.status(400).json({ message: "Invalid story id" });
    }

    try {
        const db = client.db("pa2");
        const stories = db.collection("userstories");
        const memberships = db.collection("projectmemberships");

        const story = await stories.findOne({ _id: new ObjectId(storyId) });
        if (!story) {
            return res.status(404).json({ message: "Story not found" });
        }

        const updates = {};

        if (title) updates.title = title;
        if (description) updates.description = description;
        if (priority) {
            if (!["High", "Medium", "Low"].includes(priority)) {
                return res.status(400).json({ message: "Invalid priority" });
            }
            updates.priority = priority;
        }
        if (status) {
            if (!["To Do", "In Progress", "Done"].includes(status)) {
                return res.status(400).json({ message: "Invalid status" });
            }
            updates.status = status;
        }

        if (assigned_user_id !== undefined) {
            if (assigned_user_id === "" || assigned_user_id === null) {
                updates.assigned_user_id = null;
            } else {
                if (!ObjectId.isValid(assigned_user_id)) {
                    return res.status(400).json({ message: "Invalid user id" });
                }
                const membership = await memberships.findOne({
                    project_id: story.project_id,
                    user_id: new ObjectId(assigned_user_id)
                });
                if (!membership) {
                    return res.status(400).json({ message: "User is not a member of this project" });
                }
                updates.assigned_user_id = new ObjectId(assigned_user_id);
            }
        }

        if (Object.keys(updates).length === 0) {
            return res.status(200).json({ message: "No changes made" });
        }

        await stories.updateOne(
            { _id: new ObjectId(storyId) },
            { $set: updates }
        );

        return res.status(200).json({ message: "Story updated successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
});

app.delete("/api/stories/:storyId", async (req, res) => {
    const storyId = req.params.storyId;

    if (!ObjectId.isValid(storyId)) {
        return res.status(400).json({ message: "Invalid story id" });
    }

    try {
        const db = client.db("pa2");
        const stories = db.collection("userstories");

        const result = await stories.deleteOne({ _id: new ObjectId(storyId) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Story not found" });
        }

        return res.status(200).json({ message: "Story deleted successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
});

app.post("/signup", async (req, res) => {
    const { first, last, username, password } = req.body;

    if (!username) {
        return res.status(400).json({
            message: "Username is required"
        });
    }
    if (!password) {
        return res.status(400).json({
            message: "Password is required"
        });
    }
    if (!first) {
        return res.status(400).json({
            message: "First name is required"
        });
    }
    if (!last) {
        return res.status(400).json({
            message: "Last name is required"
        });
    }

    try{
        const db = client.db("pa2");
        const users = db.collection("users");

        const checkUsername = await users.findOne({username:username});

        if(checkUsername) {
            return res.status(409).json({
                message: "Username already exists"
            })
        }

        await users.insertOne({
            f_name: first,
            l_name: last,
            username: username,
            password: password
        });

        return res.status(201).json({
            message: "User created successfully"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Server error"
        })
    }
});

app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    if (!username) {
        return res.status(400).json({
            message: "Please enter username"
        });
    }
    if (!password) {
        return res.status(400).json({
            message: "Please enter password"
        });
    }

    try {
        const db = client.db("pa2");
        const users = db.collection("users");

        const user = await users.findOne({ username: username });

        if (!user) {
            return res.status(401).json({
                message: "Username does not exist"
            });
        }

        if (user.password !== password) {
            return res.status(401).json({
                message: "Incorrect password"
            });
        }

        return res.status(200).json({
            message: "Login successful. Logged in as " + user.l_name + ", " + user.f_name
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Server error"
        });
    }
});

app.get("/api/users", async (req, res) => {
    try {
        const db = client.db("pa2");
        const users = db.collection("users");
        const allUsers = await users.find({}).toArray();
        return res.status(200).json(allUsers);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Server error"
        });
    }
});

app.post("/api/projects", async (req, res) => {
    const { name, description, status, project_lead_id } = req.body;

    if (!name) {
        return res.status(400).json({
            message: "Please input a project name"
        });
    }
    if (!description) {
        return res.status(400).json({
            message: "Please input a project description"
        });
    }
    if (!status) {
        return res.status(400).json({
            message: "Please input a status"
        });
    }
    if (!project_lead_id) {
        return res.status(400).json({
            message: "Please provide a project leader"
        });
    }

    try {
        const db = client.db("pa2");
        const users = db.collection("users");
        const projects = db.collection("projects");
        const memberships = db.collection("projectmemberships");

        if (!ObjectId.isValid(project_lead_id)) {
            return res.status(400).json({
                message: "Inputted project lead is not valid"
            });
        }

        const lead = await users.findOne({ _id: new ObjectId(project_lead_id) });
        if (!lead) {
            return res.status(404).json({
                message: "Project lead selected does not exist"
            });
        }

        const result = await projects.insertOne({
            name: name,
            description: description,
            status: status,
            project_lead_id: new ObjectId(project_lead_id)
        });

        await memberships.insertOne({
            project_id: result.insertedId,
            user_id: new ObjectId(project_lead_id)
        });

        return res.status(201).json({
            message: "Project created successfully"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Server error"
        });
    }
});

app.get("/api/projects", async (req, res) => {
    try {
        const db = client.db("pa2");
        const projects = db.collection("projects");
        const allProjects = await projects.find({}).toArray();
        return res.status(200).json(allProjects);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Server error"
        });
    }
});

app.post("/api/projects/:projectId/members", async (req, res) => {
    const { user_id } = req.body;
    const projectId = req.params.projectId;

    if (!user_id) {
        return res.status(400).json({
            message: "Please select a user"
        });
    }

    if (!ObjectId.isValid(user_id)) {
        return res.status(400).json({
            message: "Invalid User Id"
        });
    }
    if (!ObjectId.isValid(projectId)) {
        return res.status(400).json({
            message: "Invalid Project Id"
        });
    }

    try {
        const db = client.db("pa2");
        const projects = db.collection("projects");
        const users = db.collection("users");
        const memberships = db.collection("projectmemberships");

        const project = await projects.findOne({ _id: new ObjectId(projectId) });
        if (!project) {
            return res.status(404).json({
                message: "Project does not exist"
            });
        }

        const user = await users.findOne({ _id: new ObjectId(user_id) });
        if (!user) {
            return res.status(404).json({
                message: "User does not exist"
            });
        }

        const existing = await memberships.findOne({
            project_id: new ObjectId(projectId),
            user_id: new ObjectId(user_id)
        });

        if (existing) {
            return res.status(409).json({
                message: "User is already a member of this project"
            });
        }

        await memberships.insertOne({
            project_id: new ObjectId(projectId),
            user_id: new ObjectId(user_id)
        });

        return res.status(201).json({
            message: "Member added successfully"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Server error"
        });
    }
});

app.get("/api/projects/:projectId/members", async (req, res) => {
    try {
        const db = client.db("pa2");
        const memberships = db.collection("projectmemberships");
        const users = db.collection("users");

        const projectId = req.params.projectId;

        if (!ObjectId.isValid(projectId)) {
            return res.status(400).json({
                message: "Invalid project id"
            });
        }

        const membershipList = await memberships.find({
            project_id: new ObjectId(projectId)
        }).toArray();

        const memberIds = membershipList.map(m => m.user_id);
        const members = await users.find({
            _id: { $in: memberIds }
        }).toArray();

        return res.status(200).json(members);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Server error"
        });
    }
});

app.delete("/api/projects/:projectId/members/:userId", async (req, res) => {
    const projectId = req.params.projectId;
    const userId = req.params.userId;

    if (!ObjectId.isValid(projectId)) {
        return res.status(400).json({
            message: "Invalid Project Id"
        });
    }
    if (!ObjectId.isValid(userId)) {
        return res.status(400).json({
            message: "Invalid User Id"
        });
    }

    try {
        const db = client.db("pa2");
        const projects = db.collection("projects");
        const memberships = db.collection("projectmemberships");

        const project = await projects.findOne({ _id: new ObjectId(projectId) });
        if (!project) {
            return res.status(404).json({
                message: "Project does not exist"
            });
        }

        if (String(project.project_lead_id) === String(userId)) {
            return res.status(400).json({
                message: "Cannot remove the project lead"
            });
        }

        const stories = db.collection("userstories");
        const assignedStories = await stories.findOne({
            project_id: new ObjectId(projectId),
            assigned_user_id: new ObjectId(userId)
        });

        if (assignedStories) {
            return res.status(400).json({
                message: "Cannot remove member.  Reassign, unassign, or delete their stories first"
            });
        }

        const result = await memberships.deleteOne({
            project_id: new ObjectId(projectId),
            user_id: new ObjectId(userId)
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                message: "Membership not found"
            });
        }

        return res.status(200).json({
            message: "Member removed successfully"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Server error"
        });
    }
});

app.get("/", (req, res) => {
    res.json({
        message: "Server is running"
    });
});

app.listen(9000, () => {
    console.log("Server running on port 9000");
    console.log("<http://localhost:9000>");
});

async function connectDatabase() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Could not connect to MongoDB");
        console.error(error);
    }
}

connectDatabase();
import { useState, useEffect } from "react";
import CreateStory from "./CreateStory";

function ProjectList() {
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [message, setMessage] = useState("");
    const [selectedProject, setSelectedProject] = useState(null);
    const [members, setMembers] = useState([]);
    const [selectedUser, setSelectedUser] = useState("");
    const [stories, setStories] = useState([]);
    const [editingStory, setEditingStory] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editPriority, setEditPriority] = useState("");
    const [editStatus, setEditStatus] = useState("");
    const [editAssigned, setEditAssigned] = useState("");

    useEffect(() => {
        fetch("http://localhost:9000/api/projects")
            .then(response => response.json())
            .then(data => setProjects(data))
            .catch(() => setMessage("Could not load projects"));

        fetch("http://localhost:9000/api/users")
            .then(response => response.json())
            .then(data => setUsers(data))
            .catch(() => setMessage("Could not load users"));
    }, []);

    function getLeadName(projectLeadId) {
        const lead = users.find(user => String(user._id) === String(projectLeadId));
        if (lead) {
            return lead.f_name + " " + lead.l_name + " (" + lead.username + ")";
        }
        return "Lead not found";
    }

    async function loadMembers(projectId) {
        try {
            const response = await fetch("http://localhost:9000/api/projects/" + projectId + "/members");
            const data = await response.json();
            setSelectedProject(projectId);
            setMembers(data);
        } catch (error) {
            setMessage("Could not load members");
        }
    }

    function getMemberName(assignedUserId) {
        if (!assignedUserId) return "Unassigned";
        const member = members.find(m => String(m._id) === String(assignedUserId));
        if (member) {
            return member.f_name + " " + member.l_name + " (" + member.username + ")";
        }
        return "Unknown";
    }

    async function loadStories(projectId) {
        try {
            const response = await fetch("http://localhost:9000/api/projects/" + projectId + "/stories");
            const data = await response.json();
            setStories(data);
        } catch (error) {
            setMessage("Could not load stories");
        }
    }

    function editSetup(story) {
        setEditingStory(story._id);
        setEditTitle(story.title);
        setEditDescription(story.description);
        setEditPriority(story.priority);
        setEditStatus(story.status);
        setEditAssigned(story.assigned_user_id || "");
    }

    async function saveEdit(projectId) {
        try {
            const response = await fetch("http://localhost:9000/api/stories/" + editingStory, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: editTitle,
                    description: editDescription,
                    priority: editPriority,
                    status: editStatus,
                    assigned_user_id: editAssigned || null
                })
            });
            const data = await response.json();
            setMessage(data.message);
            if (response.ok) {
                setEditingStory(null);
                loadStories(projectId);
            }
        } catch (error) {
            setMessage("Could not connect to the server");
        }
    }

    async function deleteStory(storyId, projectId) {
        if (!window.confirm("Delete this story?")) return;

        try {
            const response = await fetch("http://localhost:9000/api/stories/" + storyId, {
                method: "DELETE"
            });
            const data = await response.json();
            setMessage(data.message);
            if (response.ok) {
                loadStories(projectId);
            }
        } catch (error) {
            setMessage("Could not connect to the server");
        }
    }

    function refreshProjects() {
        fetch("http://localhost:9000/api/projects")
            .then(response => response.json())
            .then(data => setProjects(data))
            .catch(() => setMessage("Could not load projects"));
    }

    async function addMember(projectId) {
        if (!selectedUser) {
            setMessage("Please select a user");
            return;
        }

        try {
            const response = await fetch("http://localhost:9000/api/projects/" + projectId + "/members", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    user_id: selectedUser
                })
            });

            const data = await response.json();
            setMessage(data.message);

            if (response.ok) {
                loadMembers(projectId);
            }
        } catch (error) {
            setMessage("Could not connect to the server");
        }
    }

    async function removeMember(projectId, userId) {
        try {
            const response = await fetch(
                "http://localhost:9000/api/projects/" + projectId + "/members/" + userId,
                { method: "DELETE" }
            );

            const data = await response.json();
            setMessage(data.message);

            if (response.ok) {
                loadMembers(projectId);
            }
        } catch (error) {
            setMessage("Could not connect to the server");
        }
    }

    return (
        <div>
            <h2>Projects</h2>
            <button onClick={refreshProjects}>Refresh Projects</button>
            {message && <p>{message}</p>}
            {projects.map(project => (
                <div key={project._id}>
                    <h3>{project.name}</h3>
                    <p>{project.description}</p>
                    <p>Status: {project.status}</p>
                    <p>Project Lead: {getLeadName(project.project_lead_id)}</p>
                    <button onClick={() => {
                        loadMembers(project._id);
                        loadStories(project._id);
                    }}>View Members</button>

                    <div>
                        <select value={selectedUser} onChange={(event) => setSelectedUser(event.target.value)}>
                            <option value="">Select user to add</option>
                            {users.map(user => (
                                <option key={user._id} value={user._id}>
                                    {user.f_name} {user.l_name} ({user.username})
                                </option>
                            ))}
                        </select>
                        <button onClick={() => addMember(project._id)}>Add Member</button>
                    </div>

                    {selectedProject === project._id && (
                        <div>
                            <h4>Members:</h4>
                            {members.map(member => (
                                <p key={member._id}>
                                    {member.f_name} {member.l_name} ({member.username})
                                    <button onClick={() => removeMember(project._id, member._id)}>Remove</button>
                                </p>
                            ))}
                        </div>
                    )}
                    {selectedProject === project._id && (
                        <CreateStory
                            projectId={project._id}
                            members={members}
                        />
                    )}
                    
                    {selectedProject === project._id && (
                        <div>
                            <h4>Stories:</h4>
                            {stories.length === 0 && <p>No stories</p>}
                            {stories.map(story => (
                                <div key={story._id}>
                                    {editingStory === story._id ? (
                                        <div>
                                            <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                                            <input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
                                            <select value={editPriority} onChange={(e) => setEditPriority(e.target.value)}>
                                                <option value="High">High</option>
                                                <option value="Medium">Medium</option>
                                                <option value="Low">Low</option>
                                            </select>
                                            <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
                                                <option value="To Do">To Do</option>
                                                <option value="In Progress">In Progress</option>
                                                <option value="Done">Done</option>
                                            </select>
                                            <select value={editAssigned} onChange={(e) => setEditAssigned(e.target.value)}>
                                                <option value="">Unassigned</option>
                                                {members.map(member => (
                                                    <option key={member._id} value={member._id}>
                                                        {member.f_name} {member.l_name}
                                                    </option>
                                                ))}
                                            </select>
                                            <button onClick={() => saveEdit(project._id)}>Save</button>
                                            <button onClick={() => setEditingStory(null)}>Cancel</button>
                                        </div>
                                    ) : (
                                        <div>
                                            <p><strong>{story.title}</strong> — {story.priority} — {story.status}</p>
                                            <p>{story.description}</p>
                                            <p>Assigned: {getMemberName(story.assigned_user_id)}</p>
                                            <button onClick={() => editSetup(story)}>Edit</button>
                                            <button onClick={() => deleteStory(story._id, project._id)}>Delete</button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                    <hr />
                </div>
            ))}
        </div>
    );
}

export default ProjectList;
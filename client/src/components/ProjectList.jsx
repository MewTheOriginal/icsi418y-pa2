import { useState, useEffect } from "react";

function ProjectList() {
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [message, setMessage] = useState("");
    const [selectedProject, setSelectedProject] = useState(null);
    const [members, setMembers] = useState([]);
    const [selectedUser, setSelectedUser] = useState("");

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
                    <button onClick={() => loadMembers(project._id)}>View Members</button>

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
                    <hr />
                </div>
            ))}
        </div>
    );
}

export default ProjectList;
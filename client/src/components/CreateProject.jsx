import { useState, useEffect } from "react";

function CreateProject() {
    const [users, setUsers] = useState([]);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("");
    const [projectLead, setProjectLead] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetch("http://localhost:9000/api/users")
            .then(response => response.json())
            .then(data => setUsers(data))
            .catch(() => setMessage("Could not load users"));
    }, []);

    async function handleSubmit(event) {
        event.preventDefault();

        try {
            const response = await fetch("http://localhost:9000/api/projects", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: name,
                    description: description,
                    status: status,
                    project_lead_id: projectLead
                })
            });

            const data = await response.json();
            setMessage(data.message);
        } catch (error) {
            setMessage("Could not connect to the server");
        }
    }

    return (
        <div>
            <h2>Create Project</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Name:</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                    />
                </div>
                <div>
                    <label>Description:</label>
                    <input
                        type="text"
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                    />
                </div>
                <div>
                    <label>Status:</label>
                    <select value={status} onChange={(event) => setStatus(event.target.value)}>
                        <option value="">Select status</option>
                        <option value="Planning">Planning</option>
                        <option value="Active">Active</option>
                        <option value="Completed">Completed</option>
                    </select>
                </div>
                <div>
                    <label>Project Lead:</label>
                    <select value={projectLead} onChange={(event) => setProjectLead(event.target.value)}>
                        <option value="">Select project lead</option>
                        {users.map(user => (
                            <option key={user._id} value={user._id}>
                                {user.f_name} {user.l_name} ({user.username})
                            </option>
                        ))}
                    </select>
                </div>
                <button type="submit">Create Project</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
}

export default CreateProject;
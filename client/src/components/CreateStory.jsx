import { useState } from "react";

function CreateStory({ projectId, members }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("");
    const [assignedUser, setAssignedUser] = useState("");
    const [message, setMessage] = useState("");

    async function handleSubmit(event) {
        event.preventDefault();

        try {
            const response = await fetch("http://localhost:9000/api/projects/" + projectId + "/stories", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title: title,
                    description: description,
                    priority: priority,
                    assigned_user_id: assignedUser || null
                })
            });

            const data = await response.json();
            setMessage(data.message);

            if (response.ok) {
                setTitle("");
                setDescription("");
                setPriority("");
                setAssignedUser("");
            }
        } catch (error) {
            setMessage("Could not connect to the server");
        }
    }

    return (
        <div>
            <h3>Create Story</h3>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Title:</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
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
                    <label>Priority:</label>
                    <select value={priority} onChange={(event) => setPriority(event.target.value)}>
                        <option value="">Select priority</option>
                        <option value="High">High</option>
                        <option value="M As a student, I want to view details of a campus event, so that I can decide whether to attend.um">Medium</option>
                        <option value="Low">Low</option>
                    </select>
                </div>
                <div>
                    <label>Assigned Member:</label>
                    <select value={assignedUser} onChange={(event) => setAssignedUser(event.target.value)}>
                        <option value="">Unassigned</option>
                        {members.map(member => (
                            <option key={member._id} value={member._id}>
                                {member.f_name} {member.l_name} ({member.username})
                            </option>
                        ))}
                    </select>
                </div>
                <button type="submit">Create Story</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
}

export default CreateStory;
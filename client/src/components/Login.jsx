import { useState } from "react";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPass] = useState("");
    const [message, setMessage] = useState("");

    async function handleSubmit(event) {
        event.preventDefault();

        try {
            const response = await fetch("http://localhost:9000/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message);
            } else {
                setMessage(data.message);
            }
        } catch (error) {
            setMessage("Could not connect to the server");
        }
    }

    return (
        <div>
            <h2>Log In</h2>

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Username:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="text"
                        value={password}
                        onChange={(event) => setPass(event.target.value)}
                    />
                </div>
                <button type="submit">Log In</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
}

export default Login;
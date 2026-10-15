import Signup from "./components/Signup";
import Login from "./components/Login";
import CreateProject from "./components/CreateProject";
import ProjectList from "./components/ProjectList";

function App() {
    return (
        <div>
            <Signup />
            <Login />
            <CreateProject />
            <ProjectList />
        </div>
    );
}

export default App;
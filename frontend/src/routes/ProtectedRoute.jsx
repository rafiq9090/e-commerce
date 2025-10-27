import {useAuth} from "../context/AuthContext";
import {Navigate, Outlet, useLocation} from "react-router-dom";


const ProtectedRoute = () => {
    const {isAuthenticated,loading} = useAuth();
    const location = useLocation();

    if (loading) {
    return <div className="container mx-auto p-4 text-center">Loading...</div>;
  }
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{from: location}} replace/>;
    }

    return <Outlet/>;
};

export default ProtectedRoute;
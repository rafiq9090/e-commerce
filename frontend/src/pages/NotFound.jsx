import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded shadow-md text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="mb-4">Page not found. The URL you requested does not exist.</p>
        <Link to="/" className="text-blue-600 hover:underline">Go back home</Link>
      </div>
    </div>
  );
};

export default NotFound;

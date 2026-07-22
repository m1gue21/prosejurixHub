import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/admin/usuarios', { replace: true });
  }, [navigate]);

  return null;
};

export default Dashboard;

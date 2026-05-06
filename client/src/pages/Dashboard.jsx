import { useEffect, useState } from 'react';
import API from '../api/axios';
import useAuthStore from '../store/authStore';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const fetchTasks = async () => {
    const { data } = await API.get('/tasks');
    setTasks(data);
  };

  const createTask = async () => {
    if (!title) return;
    await API.post('/tasks', { title, status: 'todo' });
    setTitle('');
    fetchTasks();
  };

  const deleteTask = async (id) => {
    await API.delete(`/tasks/${id}`);
    fetchTasks();
  };

  const updateStatus = async (id, status) => {
    await API.put(`/tasks/${id}`, { status });
    fetchTasks();
  };

  useEffect(() => { fetchTasks(); }, []);

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h2>Welcome, {user?.name}</h2>
        <div>
          <button onClick={() => navigate('/chat')} style={{ marginRight: 8 }}>💬 Chat</button>
          <button onClick={() => { logout(); navigate('/'); }}>Logout</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <input placeholder="New task title..." value={title}
          onChange={e => setTitle(e.target.value)}
          style={{ flex: 1, padding: 8 }} />
        <button onClick={createTask} style={{ padding: '8px 16px' }}>Add Task</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        {['todo', 'in-progress', 'done'].map(status => (
          <div key={status} style={{ background: '#f5f5f5', padding: 16, borderRadius: 8 }}>
            <h3 style={{ textTransform: 'uppercase', fontSize: 12, marginBottom: 12 }}>{status}</h3>
            {tasks.filter(t => t.status === status).map(task => (
              <div key={task._id} style={{ background: '#fff', padding: 12, borderRadius: 6, marginBottom: 8 }}>
                <p style={{ margin: '0 0 8px' }}>{task.title}</p>
                <select value={task.status} onChange={e => updateStatus(task._id, e.target.value)}
                  style={{ fontSize: 11, marginRight: 8 }}>
                  <option value="todo">Todo</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
                <button onClick={() => deleteTask(task._id)} style={{ fontSize: 11, color: 'red' }}>Delete</button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
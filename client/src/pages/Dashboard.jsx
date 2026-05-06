import { useEffect, useState } from 'react';
import { Plus, Trash2, Loader2, ListTodo, Clock, CheckCircle2, LayoutGrid, MessageCircle, LogOut, Sparkles } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import API from '../api/axios';
import useAuthStore from '../store/authStore';

const Orbs = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
    <div className="orb bg-primary/40 w-[500px] h-[500px] -top-32 -left-32 animate-float-slow" />
    <div className="orb bg-accent/40 w-[600px] h-[600px] top-1/3 -right-40 animate-float-slower" />
    <div className="orb bg-primary/30 w-[400px] h-[400px] bottom-0 left-1/3 animate-float-slow" style={{ animationDelay: '4s' }} />
  </div>
);

const COLUMNS = [
  { key: 'todo', label: 'Todo', iconBg: 'bg-status-todo/15', iconText: 'text-status-todo', badge: 'bg-status-todo/10 text-status-todo', Icon: ListTodo },
  { key: 'in-progress', label: 'In Progress', iconBg: 'bg-status-progress/15', iconText: 'text-status-progress', badge: 'bg-status-progress/10 text-status-progress', Icon: Clock },
  { key: 'done', label: 'Done', iconBg: 'bg-status-done/15', iconText: 'text-status-done', badge: 'bg-status-done/10 text-status-done', Icon: CheckCircle2 },
];

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const fetchTasks = async () => {
    const { data } = await API.get('/tasks');
    setTasks(data);
    setLoading(false);
  };

  useEffect(() => { fetchTasks(); }, []);

  const addTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setAdding(true);
    await API.post('/tasks', { title, status: 'todo' });
    setTitle('');
    setAdding(false);
    fetchTasks();
  };

  const updateStatus = async (id, status) => {
    setTasks(t => t.map(x => x._id === id ? { ...x, status } : x));
    await API.put(`/tasks/${id}`, { status });
  };

  const deleteTask = async (id) => {
    setTasks(t => t.filter(x => x._id !== id));
    await API.delete(`/tasks/${id}`);
  };

  const navItem = (to, label, Icon) => {
    const active = location.pathname === to;
    return (
      <Link to={to} className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${active ? 'bg-white/10 text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'}`}>
        <Icon className="h-4 w-4" />
        <span className="hidden sm:inline">{label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen relative">
      <Orbs />

      {/* Topbar */}
      <header className="sticky top-0 z-40 glass-strong border-b border-white/5">
        <div className="container flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="absolute inset-0 btn-gradient rounded-lg blur-md opacity-60 group-hover:opacity-100 transition-opacity" />
              <div className="relative btn-gradient h-9 w-9 rounded-lg flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
            </div>
            <span className="text-xl font-bold tracking-tight">Task<span className="gradient-text">Flow</span></span>
          </Link>
          <nav className="flex items-center gap-1">
            {navItem('/dashboard', 'Board', LayoutGrid)}
            {navItem('/chat', 'Chat', MessageCircle)}
          </nav>
          <button onClick={() => { logout(); navigate('/'); }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <main className="container py-8 sm:py-10">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Your Board</h1>
          <p className="text-muted-foreground mt-1">Hey {user?.name} 👋 Plan, organize, and ship your work.</p>
        </div>

        <form onSubmit={addTask} className="glass rounded-2xl p-3 flex gap-3 mb-8 animate-fade-in">
          <div className="relative flex-1">
            <Plus className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Add a new task..."
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all" />
          </div>
          <button type="submit" disabled={adding || !title.trim()}
            className="h-11 px-6 rounded-xl btn-gradient text-white font-medium flex items-center gap-2 disabled:opacity-50">
            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Task'}
          </button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {COLUMNS.map(({ key, label, iconBg, iconText, badge, Icon }) => {
            const items = tasks.filter(t => t.status === key);
            return (
              <section key={key} className="glass rounded-2xl p-5 animate-fade-in min-h-[400px]">
                <header className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${iconBg}`}>
                      <Icon className={`h-4 w-4 ${iconText}`} />
                    </div>
                    <h2 className="font-semibold">{label}</h2>
                  </div>
                  <span className={`text-xs font-mono px-2 py-1 rounded-md ${badge}`}>{items.length}</span>
                </header>
                <div className="space-y-3">
                  {loading ? (
                    <div className="text-sm text-muted-foreground text-center py-8">Loading...</div>
                  ) : items.length === 0 ? (
                    <div className="text-sm text-muted-foreground text-center py-8 border border-dashed border-white/5 rounded-xl">No tasks</div>
                  ) : (
                    items.map(task => (
                      <article key={task._id} className="group glass-strong rounded-xl p-4 animate-scale-in hover:border-white/20 transition-all">
                        <p className="text-sm font-medium leading-snug mb-3">{task.title}</p>
                        <div className="flex items-center justify-between gap-2">
                          <select value={task.status} onChange={e => updateStatus(task._id, e.target.value)}
                            className="h-8 text-xs rounded-lg bg-white/5 border border-white/10 text-foreground flex-1 px-2 focus:outline-none">
                            <option value="todo">Todo</option>
                            <option value="in-progress">In Progress</option>
                            <option value="done">Done</option>
                          </select>
                          <button onClick={() => deleteTask(task._id)}
                            className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </main>
    </div>
  );
}
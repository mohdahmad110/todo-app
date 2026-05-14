import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useSelector, useDispatch } from 'react-redux'
import {
  Container,
  Box,
  Button,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Paper,
  CircularProgress,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import LogoutIcon from '@mui/icons-material/Logout'
import { RootState } from '../store/store'
import { apiClient } from '../lib/apiClient'
import { clearAuth } from '../store/authSlice'
import { withAuth } from '../lib/withAuth'

interface Todo {
  _id: string
  title: string
  description?: string
  completed: boolean
}

function TodosPage() {
  const router = useRouter()
  const dispatch = useDispatch()
  const auth = useSelector((state: RootState) => state.auth)
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [openDialog, setOpenDialog] = useState(false)

  useEffect(() => {
    fetchTodos()
  }, [])

  const fetchTodos = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getTodos()
      setTodos(response)
      setError('')
    } catch (err: any) {
      setError(err.message || 'Failed to load todos')
    } finally {
      setLoading(false)
    }
  }

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    try {
      const newTodo = await apiClient.createTodo(title, description)
      setTodos([newTodo, ...todos])
      setTitle('')
      setDescription('')
      setError('')
    } catch (err: any) {
      setError(err.message || 'Failed to create todo')
    }
  }

  const handleToggle = async (todo: Todo) => {
    try {
      const updated = await apiClient.updateTodo(todo._id, undefined, undefined, !todo.completed)
      setTodos(todos.map((t) => (t._id === todo._id ? updated : t)))
    } catch (err: any) {
      setError(err.message || 'Failed to update todo')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await apiClient.deleteTodo(id)
      setTodos(todos.filter((t) => t._id !== id))
    } catch (err: any) {
      setError(err.message || 'Failed to delete todo')
    }
  }

  const handleEdit = (todo: Todo) => {
    setEditingId(todo._id)
    setTitle(todo.title)
    setDescription(todo.description || '')
    setOpenDialog(true)
  }

  const handleSaveEdit = async () => {
    if (!editingId || !title.trim()) return

    try {
      const updated = await apiClient.updateTodo(editingId, title, description)
      setTodos(todos.map((t) => (t._id === editingId ? updated : t)))
      setOpenDialog(false)
      setEditingId(null)
      setTitle('')
      setDescription('')
    } catch (err: any) {
      setError(err.message || 'Failed to update todo')
    }
  }

  const handleLogout = () => {
    dispatch(clearAuth())
    router.push('/auth/login')
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
            My Todos
          </Typography>
          <Box>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Welcome, {auth.user?.name || auth.user?.email}
            </Typography>
            <Button
              variant="outlined"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              size="small"
            >
              Logout
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <form onSubmit={handleAddTodo}>
            <TextField
              fullWidth
              label="Todo Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What do you want to do?"
              margin="normal"
            />
            <TextField
              fullWidth
              label="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={2}
              margin="normal"
            />
            <Button variant="contained" type="submit" sx={{ mt: 2 }}>
              Add Todo
            </Button>
          </form>
        </Paper>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : todos.length === 0 ? (
          <Typography variant="body1" color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
            No todos yet. Add one to get started!
          </Typography>
        ) : (
          <Paper elevation={2}>
            <List>
              {todos.map((todo, index) => (
                <ListItem
                  key={todo._id}
                  sx={{
                    borderBottom: index < todos.length - 1 ? '1px solid #eee' : 'none',
                  }}
                >
                  <ListItemIcon>
                    <Checkbox
                      checked={todo.completed}
                      onChange={() => handleToggle(todo)}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography
                        sx={{
                          textDecoration: todo.completed ? 'line-through' : 'none',
                          color: todo.completed ? 'textSecondary' : 'textPrimary',
                        }}
                      >
                        {todo.title}
                      </Typography>
                    }
                    secondary={todo.description}
                  />
                  <IconButton
                    edge="end"
                    onClick={() => handleEdit(todo)}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    onClick={() => handleDelete(todo._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItem>
              ))}
            </List>
          </Paper>
        )}

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Todo</DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={2}
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit} variant="contained">
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  )
}

export default withAuth(TodosPage, true)

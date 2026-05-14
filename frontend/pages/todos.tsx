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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Paper,
  CircularProgress,
  Card,
  Chip,
  Grid,
  Checkbox,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import LogoutIcon from '@mui/icons-material/Logout'
import CloseIcon from '@mui/icons-material/Close'
import AddIcon from '@mui/icons-material/Add'
import { RootState } from '../store/store'
import { apiClient } from '../lib/apiClient'
import { clearAuth } from '../store/authSlice'
import { withAuth } from '../lib/withAuth'
import { DecorationPattern } from '../components/DecorationPattern'

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
  const [success, setSuccess] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [openDialog, setOpenDialog] = useState(false)

  useEffect(() => {
    fetchTodos()
  }, [])

  const fetchTodos = async () => {
    try {
      setLoading(false)
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
      setSuccess('Todo added successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to create todo')
    }
  }

  const handleToggleTodo = async (todo: Todo) => {
    try {
      const updated = await apiClient.updateTodo(todo._id, undefined, undefined, !todo.completed)
      setTodos(todos.map((t) => (t._id === todo._id ? updated : t)))
      setError('')
    } catch (err: any) {
      setError(err.message || 'Failed to update todo')
    }
  }

  const handleEditTodo = (todo: Todo) => {
    setEditingId(todo._id)
    setTitle(todo.title)
    setDescription(todo.description || '')
    setOpenDialog(true)
  }

  const handleSaveEdit = async () => {
    if (!title.trim()) return

    try {
      const updated = await apiClient.updateTodo(editingId!, title, description)
      setTodos(todos.map((t) => (t._id === editingId ? updated : t)))
      setOpenDialog(false)
      setTitle('')
      setDescription('')
      setEditingId(null)
      setError('')
      setSuccess('Todo updated successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to update todo')
    }
  }

  const handleDeleteTodo = async (id: string) => {
    try {
      await apiClient.deleteTodo(id)
      setTodos(todos.filter((t) => t._id !== id))
      setError('')
      setSuccess('Todo deleted successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to delete todo')
    }
  }

  const handleLogout = () => {
    dispatch(clearAuth())
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    router.push('/auth/login')
  }

  const completedCount = todos.filter((t) => t.completed).length
  const totalCount = todos.length

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0F1419 0%, #1a242f 100%)',
        py: 4,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <DecorationPattern />

      <Container maxWidth="lg">
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
              My Tasks
            </Typography>
            <Typography variant="body2" sx={{ color: '#B0B8C0' }}>
              {auth.user?.name} • {completedCount} of {totalCount} completed
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{
              borderColor: '#FFA726',
              color: '#FFA726',
              '&:hover': {
                borderColor: '#FFB84D',
                backgroundColor: 'rgba(255, 167, 38, 0.08)',
              },
            }}
          >
            Logout
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Main Content Card */}
          <Grid item xs={12} md={6} sx={{ position: 'relative', zIndex: 1 }}>
            <Card
              sx={{
                p: 3,
                minHeight: '600px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Add Todo Form */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
                  Add New Task
                </Typography>
                <form onSubmit={handleAddTodo}>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <TextField
                      fullWidth
                      placeholder="Title..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      sx={{ flex: 1 }}
                      size="small"
                    />
                    <Button
                      variant="outlined"
                      type="submit"
                      startIcon={<AddIcon />}
                      sx={{ minWidth: '110px' }}
                    >
                      Add
                    </Button>
                  </Box>
                  <TextField
                    fullWidth
                    placeholder="Description (optional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    multiline
                    rows={2}
                    size="small"
                  />
                </form>
              </Box>

              {/* Todo List */}
              <Box sx={{ flex: 1, overflow: 'auto' }}>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress sx={{ color: '#FFD700' }} />
                  </Box>
                ) : todos.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" sx={{ color: '#B0B8C0' }}>
                      No tasks yet. Add one to get started! 🚀
                    </Typography>
                  </Box>
                ) : (
                  <List sx={{ p: 0 }}>
                    {todos.map((todo, index) => (
                      <ListItem
                        key={todo._id}
                        sx={{
                          display: 'flex',
                          gap: 2,
                          py: 2,
                          px: 0,
                          borderBottom: '1px solid #2C3E50',
                          alignItems: 'flex-start',
                          '&:last-child': { borderBottom: 'none' },
                          '&:hover': {
                            backgroundColor: 'rgba(255, 215, 0, 0.05)',
                          },
                        }}
                      >
                        {/* Checkbox */}
                        <Checkbox
                          checked={todo.completed}
                          onChange={() => handleToggleTodo(todo)}
                          sx={{
                            color: '#17A2B8',
                            '&.Mui-checked': {
                              color: '#FFD700',
                            },
                            mt: 0.5,
                          }}
                        />

                        {/* Index Badge */}
                        <Chip
                          label={String(index + 1).padStart(2, '0')}
                          sx={{
                            backgroundColor: '#FFD700',
                            color: '#0F1419',
                            fontWeight: 700,
                            fontSize: '0.875rem',
                            height: '32px',
                            width: '32px',
                            minWidth: '32px',
                            '& .MuiChip-label': {
                              padding: 0,
                            },
                          }}
                        />

                        {/* Todo Content */}
                        <ListItemText
                          primary={
                            <Typography
                              sx={{
                                textDecoration: todo.completed ? 'line-through' : 'none',
                                color: todo.completed ? '#6B7280' : '#FFFFFF',
                                fontWeight: todo.completed ? 400 : 500,
                              }}
                            >
                              {todo.title}
                            </Typography>
                          }
                          secondary={
                            todo.description ? (
                              <Typography
                                variant="body2"
                                sx={{
                                  color: todo.completed ? '#4B5563' : '#B0B8C0',
                                  mt: 0.5,
                                }}
                              >
                                {todo.description}
                              </Typography>
                            ) : null
                          }
                          sx={{ flex: 1, m: 0 }}
                        />

                        {/* Actions */}
                        <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
                          <IconButton
                            size="small"
                            onClick={() => handleEditTodo(todo)}
                            sx={{
                              color: '#17A2B8',
                              '&:hover': {
                                backgroundColor: 'rgba(23, 162, 184, 0.1)',
                              },
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteTodo(todo._id)}
                            sx={{
                              color: '#FF6B6B',
                              '&:hover': {
                                backgroundColor: 'rgba(255, 107, 107, 0.1)',
                              },
                            }}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
            </Card>
          </Grid>

          {/* Stats Card */}
          <Grid item xs={12} md={6} sx={{ position: 'relative', zIndex: 1 }}>
            <Card sx={{ p: 3, height: '100%' }}>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
                Progress
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Completed</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#FFD700' }}>
                    {completedCount} / {totalCount}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    height: '8px',
                    backgroundColor: '#2C3E50',
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      height: '100%',
                      backgroundColor: '#FFD700',
                      width: totalCount > 0 ? `${(completedCount / totalCount) * 100}%` : '0%',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </Box>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Paper
                  sx={{
                    p: 2,
                    backgroundColor: '#2C3E50',
                    textAlign: 'center',
                    borderRadius: '12px',
                  }}
                >
                  <Typography variant="h3" sx={{ color: '#17A2B8', fontWeight: 700 }}>
                    {todos.length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#B0B8C0', mt: 0.5 }}>
                    Total Tasks
                  </Typography>
                </Paper>

                <Paper
                  sx={{
                    p: 2,
                    backgroundColor: '#2C3E50',
                    textAlign: 'center',
                    borderRadius: '12px',
                  }}
                >
                  <Typography variant="h3" sx={{ color: '#FFA726', fontWeight: 700 }}>
                    {todos.length - completedCount}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#B0B8C0', mt: 0.5 }}>
                    Pending
                  </Typography>
                </Paper>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#1a1f2e',
            backgroundImage: 'linear-gradient(180deg, #1a1f2e 0%, #2a2d3a 100%)',
          },
        }}
      >
        <DialogTitle>Edit Task</DialogTitle>
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
            rows={3}
            margin="normal"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleSaveEdit} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default withAuth(TodosPage)

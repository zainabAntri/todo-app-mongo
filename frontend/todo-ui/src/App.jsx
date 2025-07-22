import { useState, useEffect } from 'react'
import axios from 'axios'
import { MantineProvider, Container, Title, Paper, TextInput, Button, Stack, Group, Text, ActionIcon, Checkbox } from '@mantine/core'
import { Notifications, notifications } from '@mantine/notifications'
import { IconTrash, IconPlus } from '@tabler/icons-react'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'

const API_URL = 'http://localhost:3001'

function App() {
  const [todos, setTodos] = useState([])
  const [newTodo, setNewTodo] = useState('')
  const [loading, setLoading] = useState(false)

  // Fetch todos on component mount
  useEffect(() => {
    // First test the basic endpoint
    axios.get(`${API_URL}/test`)
      .then(response => {
        console.log('Test endpoint working:', response.data)
        // If test works, try the todos endpoint
        fetchTodos()
      })
      .catch(error => {
        console.error('Test endpoint error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          headers: error.response?.headers,
          config: error.config
        })
      })
  }, [])

  const fetchTodos = async () => {
    try {
      console.log('Fetching todos from:', `${API_URL}/api/todos`)
      const response = await axios.get(`${API_URL}/api/todos`)
      console.log('Todos response:', response.data)
      setTodos(response.data)
    } catch (error) {
      console.error('Todos endpoint error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
        config: error.config
      })
      notifications.show({
        title: 'Error',
        message: `Failed to fetch todos: ${error.response?.status} ${error.response?.statusText}`,
        color: 'red'
      })
    }
  }

  const addTodo = async (e) => {
    e.preventDefault()
    if (!newTodo.trim()) return

    setLoading(true)
    try {
      const response = await axios.post(`${API_URL}/api/todos`, { text: newTodo })
      setTodos([response.data, ...todos])
      setNewTodo('')
      notifications.show({
        title: 'Success',
        message: 'Todo added successfully',
        color: 'green'
      })
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to add todo',
        color: 'red'
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleTodo = async (id, completed) => {
    try {
      const response = await axios.put(`${API_URL}/api/todos/${id}`, { completed: !completed })
      setTodos(todos.map(todo => todo._id === id ? response.data : todo))
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update todo',
        color: 'red'
      })
    }
  }

  const deleteTodo = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/todos/${id}`)
      setTodos(todos.filter(todo => todo._id !== id))
      notifications.show({
        title: 'Success',
        message: 'Todo deleted successfully',
        color: 'green'
      })
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete todo',
        color: 'red'
      })
    }
  }

  return (
    <MantineProvider>
      <Notifications />
      <Container size="sm" py="xl">
        <Paper shadow="md" p="md" withBorder>
          <Title order={1} mb="lg" ta="center" c="blue">
            Todo List
          </Title>

          <form onSubmit={addTodo}>
            <Group gap="sm">
              <TextInput
                placeholder="Add a new todo..."
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                style={{ flex: 1 }}
                data-autofocus
              />
              <Button
                type="submit"
                loading={loading}
                leftSection={<IconPlus size={16} />}
              >
                Add
              </Button>
            </Group>
          </form>

          <Stack mt="xl" gap="md">
            {todos.length === 0 ? (
              <Text c="dimmed" ta="center" fz="sm">
                No todos yet. Add one above!
              </Text>
            ) : (
              todos.map((todo) => (
                <Paper
                  key={todo._id}
                  shadow="sm"
                  p="md"
                  withBorder
                  style={{
                    opacity: todo.completed ? 0.7 : 1,
                  }}
                >
                  <Group justify="space-between" wrap="nowrap">
                    <Group gap="sm" wrap="nowrap" style={{ flex: 1 }}>
                      <Checkbox
                        checked={todo.completed}
                        onChange={() => toggleTodo(todo._id, todo.completed)}
                      />
                      <Text
                        style={{
                          textDecoration: todo.completed ? 'line-through' : 'none',
                          color: todo.completed ? 'gray' : 'inherit',
                        }}
                      >
                        {todo.text}
                      </Text>
                    </Group>
                    <ActionIcon
                      color="red"
                      variant="subtle"
                      onClick={() => deleteTodo(todo._id)}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Paper>
              ))
            )}
          </Stack>
        </Paper>
      </Container>
    </MantineProvider>
  )
}

export default App

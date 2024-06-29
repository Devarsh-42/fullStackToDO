import io from 'socket.io-client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Form, Button, ListGroup, Badge, Modal } from 'react-bootstrap'; // Import Modal for edit task
import './App.css';

const socket = io('http://localhost:5000');

function App() {
    const [tasks, setTasks] = useState([]);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [newTask, setNewTask] = useState('');
    const [editTask, setEditTask] = useState(null); // State to hold task being edited
    const [token, setToken] = useState('');
    const [presence, setPresence] = useState({});
    const [filters, setFilters] = useState({ status: '', priority: '', assignee: '' });

    useEffect(() => {
        socket.on('task_update', () => {
            fetchTasks();
        });

        socket.on('presence_update', (data) => {
            setPresence(prev => ({ ...prev, [data.username]: data.online }));
        });

        // Fetch tasks on component mount
        fetchTasks();
    }, []);


    const fetchTasks = async () => {
        try {
            const response = await axios.get('http://localhost:5000/tasks', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setTasks(response.data);
        } catch (error) {
            console.error('Error fetching tasks:', error.response);
        }
    };

    const handleLogin = async () => {
    try {
        const response = await axios.post('http://localhost:5000/login', { username, password });
        setToken(response.data.access_token);
        setIsAuthenticated(true);
        localStorage.setItem('authToken', response.data.access_token); // Store token in local storage
    } catch (error) {
        if (error.response) {
            // Server responded with a status code outside of 2xx range
            console.error('Error logging in:', error.response.data);
        } else if (error.request) {
            // Request was made but no response was received
            console.error('No response received:', error.request);
        } else {
            // Something happened in setting up the request that triggered an error
            console.error('Error setting up the request:', error.message);
        }
    }
};


    const handleRegister = async () => {
    try {
        const response = await axios.post('http://localhost:5000/register', { username, password });
        console.log('Response:', response.data);
        // Handle response as needed
    } catch (error) {
        if (error.response) {
            // The request was made and the server responded with a status code
            // outside of the 2xx range
            console.error('Error data:', error.response.data);
            console.error('Error status:', error.response.status);
            console.error('Error headers:', error.response.headers);
        } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received:', error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error message:', error.message);
        }
        console.error('Error config:', error.config);
    }
};



    const handleLogout = async () => {
        try {
            const authToken = localStorage.getItem('authToken'); // Retrieve the token from local storage
            if (!authToken) {
                console.error('No token found.');
                return;
            }

            const response = await axios.post('http://localhost:5000/logout', { token: authToken }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('Logged out successfully:', response.data);
            localStorage.removeItem('authToken'); // Remove the token from local storage
            setIsAuthenticated(false); // Update authentication state
            setToken(''); // Clear token state
            setTasks([]); // Clear tasks state
            // Redirect or perform any post-logout actions here
        } catch (error) {
            console.error('Error logging out:', error.response.data);
        }
    };


    const handleCreateTask = async () => {
        try {
            const newTaskData = {
                title: newTask,
                priority: 'low',
                completed: false
            };
            console.log('Sending task:', newTaskData);
            const response = await axios.post('http://localhost:5000/tasks', newTaskData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log('Response:', response.data);
            setNewTask('');
            fetchTasks();
        } catch (error) {
            console.error('Error creating task:', error.response.data);
        }
    };

    const handleEditTask = async () => {
        try {
            await axios.put(`http://localhost:5000/tasks/${editTask.id}`, editTask, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setEditTask(null);
            fetchTasks();
        } catch (error) {
            console.error('Error editing task:', error.response.data);
        }
    };

    const handleDeleteTask = async (taskId) => {
        try {
            await axios.delete(`http://localhost:5000/tasks/${taskId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            fetchTasks();
        } catch (error) {
            console.error('Error deleting task:', error.response.data);
        }
    };

    const openEditModal = (task) => {
        setEditTask(task);
    };

    const closeEditModal = () => {
        setEditTask(null);
    };

    const handleEditInputChange = (e) => {
        setEditTask({ ...editTask, [e.target.name]: e.target.value });
    };

    const filteredTasks = tasks.filter(task => {
        return (!filters.status || task.completed === (filters.status === 'completed')) &&
            (!filters.priority || task.priority === filters.priority) &&
            (!filters.assignee || task.assignee_id === filters.assignee);
    });

    return (
        <Container>
            <Row className="justify-content-md-center">
                <Col md="6">
                    <h2 className="text-center">Todo List App</h2>
                    {!isAuthenticated ? (
                        <Form>
                            <Form.Group controlId="formBasicUsername">
                                <Form.Label>Username</Form.Label>
                                <Form.Control type="text" placeholder="Enter username" value={username} onChange={(e) => setUsername(e.target.value)} />
                            </Form.Group>

                            <Form.Group controlId="formBasicPassword" className='py-2'>
                                <Form.Label>Password</Form.Label>
                                <Form.Control type="password" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} />
                            </Form.Group>
                            <Button variant="primary" onClick={handleLogin}>Login</Button>
                            <Button variant="secondary" onClick={handleRegister} className="ml-2">Register</Button>
                        </Form>
                    ) : (
                        <div>
                            <Button variant="danger" onClick={handleLogout} className="mb-3">Logout</Button>
                            <Form inline>
                                <Form.Control type="text" placeholder="New Task" value={newTask} onChange={(e) => setNewTask(e.target.value)} className="mr-2" />
                                <Button variant="success" onClick={handleCreateTask}>Add Task</Button>
                            </Form>
                            <h3 className="mt-4">Tasks</h3>
                            <Form.Group controlId="formBasicFilter" className="mb-3">
                                <Form.Label>Filters</Form.Label>
                                <Form.Control as="select" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                                    <option value="">All</option>
                                    <option value="completed">Completed</option>
                                    <option value="incomplete">Incomplete</option>
                                </Form.Control>
                                <Form.Control as="select" value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })} className="mt-2">
                                    <option value="">All Priorities</option>
                                    <option value="high">High</option>
                                    <option value="medium">Medium</option>
                                    <option value="low">Low</option>
                                </Form.Control>
                                <Form.Control as="select" value={filters.assignee} onChange={(e) => setFilters({ ...filters, assignee: e.target.value })} className="mt-2">
                                    <option value="">All Assignees</option>
                                    {tasks.map(task => (
                                        <option key={task.assignee_id} value={task.assignee_id}>{task.assignee_id}</option>
                                    ))}
                                </Form.Control>
                            </Form.Group>
                            <ListGroup>
                                {filteredTasks.map(task => (
                                    <ListGroup.Item key={task.id}>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <span className="title">{task.title}</span>{' '}
                                                <Badge variant={task.completed ? 'success' : 'warning'}>
                                                    {task.completed ? 'Completed' : 'Incomplete'}
                                                </Badge>
                                            </div>
                                            <div>
                                                <Button variant="info" onClick={() => openEditModal(task)}>Edit</Button>{' '}
                                                <Button variant="danger" onClick={() => handleDeleteTask(task.id)}>Delete</Button>
                                            </div>
                                        </div>
                                        <Modal show={editTask !== null} onHide={closeEditModal}>
                                            <Modal.Header closeButton>
                                                <Modal.Title>Edit Task</Modal.Title>
                                            </Modal.Header>
                                            <Modal.Body>
                                                <Form.Control type="text" name="title" value={editTask?.title} onChange={handleEditInputChange} />
                                            </Modal.Body>
                                            <Modal.Footer>
                                                <Button variant="secondary" onClick={closeEditModal}>
                                                    Close
                                                </Button>
                                                <Button variant="primary" onClick={handleEditTask}>
                                                    Save Changes
                                                </Button>
                                            </Modal.Footer>
                                        </Modal>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </div>
                    )}
                </Col>
            </Row>
        </Container>
    );
}

export default App;

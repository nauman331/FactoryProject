import React, { useEffect, useState } from 'react';
import { Button, Form, Table, Alert, Spinner } from 'react-bootstrap';
import { backendURL } from '../utils/exports';

const CategoryManager = () => {
    const [categoryname, setCategoryName] = useState('');
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${backendURL}/category`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json();
            setCategories(data.categories || []);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch categories');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!categoryname.trim()) return;

        try {
            const res = await fetch(`${backendURL}/category`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ categoryname })
            });
            const data = await res.json();

            if (res.ok) {
                setMessage(data.message);
                setError('');
                setCategoryName('');
                fetchCategories();
            } else {
                setError(data.message || 'Failed to add category');
            }
        } catch (err) {
            setError('Something went wrong');
        }
    };

    const handleDelete = async (id) => {
        try {
            const res = await fetch(`${backendURL}/category/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            const data = await res.json();

            if (res.ok) {
                setMessage(data.message);
                setError('');
                fetchCategories();
            } else {
                setError(data.message || 'Failed to delete category');
            }
        } catch (err) {
            setError('Error deleting category');
        }
    };

    return (
        <div className="container py-4">
            <h2 className="mb-4 text-success">Category Management</h2>

            {message && <Alert variant="success">{message}</Alert>}
            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleSubmit} className="mb-4 shadow-sm p-4 rounded bg-light">
                <Form.Group controlId="categoryname">
                    <Form.Label>Category Name</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter category name"
                        value={categoryname}
                        onChange={(e) => setCategoryName(e.target.value)}
                    />
                </Form.Group>
                <Button variant="success" type="submit" className="mt-3">
                    Add Category
                </Button>
            </Form>

            {loading ? (
                <div className="text-center">
                    <Spinner animation="border" />
                </div>
            ) : (
                <Table striped bordered hover responsive>
                    <thead className="table-dark">
                        <tr>
                            <th>#</th>
                            <th>Category Name</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.length === 0 ? (
                            <tr>
                                <td colSpan="3" className="text-center">No categories found</td>
                            </tr>
                        ) : (
                            categories.map((cat, index) => (
                                <tr key={cat._id}>
                                    <td>{index + 1}</td>
                                    <td>{cat.categoryname}</td>
                                    <td>
                                        <Button variant="danger" size="sm" onClick={() => handleDelete(cat._id)}>
                                            Delete
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            )}
        </div>
    );
};

export default CategoryManager;

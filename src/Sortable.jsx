import React, { useState, useRef, useEffect } from 'react';
import Sortable from 'sortablejs';

export default function BookTrackerApp() {
    const [books, setBooks] = useState([]);
    const [formData, setFormData] = useState({
        title: "",
        author: "",
        status: "To Read",
    });

    const toReadRef = useRef(null);
    const readingRef = useRef(null);
    const completedRef = useRef(null);

    const getBooksByStatus = (status) =>
        books.filter((book) => book.status === status);

    const getBookGlobalIndex = (status, columnIndex) => {
        let count = 0;
        for (let i = 0; i < books.length; i++) {
            if (books[i].status === status) {
                if (count === columnIndex) return i;
                count++;
            }
        }
        return -1;
    };

    const booksRef = useRef(books);
    useEffect(() => {
        booksRef.current = books;
    }, [books]);

    useEffect(() => {
        const columns = [
            { ref: toReadRef, status: 'To Read' },
            { ref: readingRef, status: 'Reading' },
            { ref: completedRef, status: 'Completed' }
        ];

        columns.forEach(({ ref, status }) => {
            if (!ref.current) return;
            const sortable = Sortable.create(ref.current, {
                group: 'books',
                animation: 150,
                fallbackOnBody: true,
                removeOnSpill: false,
                ghostClass: 'sortable-ghost',
                onAdd: function (evt) {
                    const fromStatus = evt.from.dataset.status;
                    const toStatus = evt.to.dataset.status;
                    const oldIndex = evt.oldIndex;
                    const newIndex = evt.newIndex;

                    const books = booksRef.current;
                    const globalOldIndex = getBookGlobalIndex(fromStatus, oldIndex);
                    const movedBook = books[globalOldIndex];

                    let newBooks = books.filter((_, i) => i !== globalOldIndex);

                    let insertAt = 0;
                    let count = 0;
                    for (let i = 0; i < newBooks.length; i++) {
                        if (newBooks[i].status === toStatus) {
                            if (count === newIndex) {
                                insertAt = i;
                                break;
                            }
                            count++;
                        }
                        if (i === newBooks.length - 1) insertAt = newBooks.length;
                    }
                    if (getBooksByStatus(toStatus).length === 0) insertAt = newBooks.length;

                    const updatedBook = { ...movedBook, status: toStatus };
                    newBooks.splice(insertAt, 0, updatedBook);

                    setBooks(newBooks);
                },
                onEnd: function (evt) {
                    if (evt.from === evt.to) {
                        const status = evt.from.dataset.status;
                        const oldIndex = evt.oldIndex;
                        const newIndex = evt.newIndex;

                        const books = booksRef.current;
                        const globalOldIndex = getBookGlobalIndex(status, oldIndex);
                        const globalNewIndex = getBookGlobalIndex(status, newIndex);

                        let newBooks = [...books];
                        const [movedBook] = newBooks.splice(globalOldIndex, 1);
                        newBooks.splice(globalNewIndex, 0, movedBook);

                        setBooks(newBooks);
                    }
                }
            });

            // Store reference to sortable for cleanup
            ref.current._sortable = sortable;
        });

        return () => {
            columns.forEach(({ ref }) => {
                if (ref.current && ref.current._sortable) {
                    ref.current._sortable.destroy();
                }
            });
        };
    }, []);

    const HandleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.title || !formData.author) return;

        const newBook = {
            ...formData,
        };
        setBooks((prevBooks) => [...prevBooks, newBook]);
        setFormData({ title: '', author: '', status: 'To Read' });
    };

    const handleDelete = (globalIndex) => {
        setBooks(books.filter((_, i) => i !== globalIndex));
    };

    return (
        <div className='px-[10%]'>
            <h1 className='text-[2em] font-bold mb-4'>📚 Book Reading Tracker</h1>

            <form onSubmit={handleSubmit} className='mb-8 p-4 bg-gray-100 rounded-lg'>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
                    <input
                        type='text'
                        name='title'
                        placeholder='Book Title'
                        onChange={HandleChange}
                        value={formData.title}
                        className='p-2 border rounded'
                        required
                    />
                    <input
                        type='text'
                        name='author'
                        placeholder='Author'
                        onChange={HandleChange}
                        value={formData.author}
                        className='p-2 border rounded'
                        required
                    />
                    <select
                        className='p-2 border rounded'
                        onChange={HandleChange}
                        name='status'
                        value={formData.status}
                    >
                        <option value='To Read'>To Read</option>
                        <option value='Reading'>Reading</option>
                        <option value='Completed'>Completed</option>
                    </select>
                </div>
                <button type='submit' className='text-white bg-green-600 py-2 px-4 rounded-lg'>
                    Add Book
                </button>
            </form>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-5'>
                {/* To Read */}
                <div className='bg-yellow-500 text-white p-4 rounded-lg' ref={toReadRef} data-status='To Read'>
                    <h2 className='text-[1.5em] font-bold mb-6'>To Read</h2>
                    {getBooksByStatus('To Read').map((book, index) => {
                        const globalIndex = getBookGlobalIndex('To Read', index);
                        if (!book || !book.title) return null;
                        return (
                            <div key={globalIndex} className='p-4 mb-4 bg-gray-200 text-black rounded-lg cursor-move'>
                                <h3 className='text-xl font-semibold'>{book.title}</h3>
                                <p className='text-gray-700'>Author: {book.author}</p>
                                <button onClick={() => handleDelete(globalIndex)} className='text-red-600 hover:underline'>Delete</button>
                            </div>
                        );
                    })}
                </div>

                {/* Reading */}
                <div className='bg-blue-500 text-white p-4 rounded-lg' ref={readingRef} data-status='Reading'>
                    <h2 className='text-[1.5em] font-bold mb-6'>Reading</h2>
                    {getBooksByStatus('Reading').map((book, index) => {
                        const globalIndex = getBookGlobalIndex('Reading', index);
                        if (!book || !book.title) return null;
                        return (
                            <div key={globalIndex} className='p-4 mb-4 bg-gray-200 text-black rounded-lg cursor-move'>
                                <h3 className='text-xl font-semibold'>{book.title}</h3>
                                <p className='text-gray-700'>Author: {book.author}</p>
                                <button onClick={() => handleDelete(globalIndex)} className='text-red-600 hover:underline'>Delete</button>
                            </div>
                        );
                    })}
                </div>

                {/* Completed */}
                <div className='bg-green-500 text-white p-4 rounded-lg' ref={completedRef} data-status='Completed'>
                    <h2 className='text-[1.5em] font-bold mb-6'>Completed</h2>
                    {getBooksByStatus('Completed').map((book, index) => {
                        const globalIndex = getBookGlobalIndex('Completed', index);
                        if (!book || !book.title) return null;
                        return (
                            <div key={globalIndex} className='p-4 mb-4 bg-gray-200 text-black rounded-lg cursor-move'>
                                <h3 className='text-xl font-semibold'>{book.title}</h3>
                                <p className='text-gray-700'>Author: {book.author}</p>
                                <button onClick={() => handleDelete(globalIndex)} className='text-red-600 hover:underline'>Delete</button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

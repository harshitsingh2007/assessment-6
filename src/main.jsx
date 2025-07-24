import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

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
        Sortable.create(ref.current, {
            group: 'books',
            animation: 150,
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
    });

    return () => {
        columns.forEach(({ ref }) => {
            if (ref.current && ref.current._sortable) {
                ref.current._sortable.destroy();
            }
        });
    };
    // eslint-disable-next-line
}, []);
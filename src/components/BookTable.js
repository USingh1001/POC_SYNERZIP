import React, { useState } from 'react';
import {useQuery, useMutation } from 'react-apollo-hooks';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import {TableBody, TableCell, TablePagination, TableRow, Paper, Checkbox, IconButton, Tooltip, FormControlLabel, Switch}  from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import BookTableHead from './BookTableHead';
import BookTableToolbar from './BookTableToolbar';
import BookDialog from './BookDialog';
import gql from 'graphql-tag';
import {observer } from 'mobx-react-lite';
import BookStore from './BookStore'

const Book_Information_Fragment = gql`
  fragment BookInformation on Book{
    id
    isbn
    title
    subtitle
    author
    published
    publisher
    pages
    description
    website
  }`  

// GraphQl Tag - Query
const BOOKS_FEED = gql`
  {
    books {
      ...BookInformation
    }
  }
  ${Book_Information_Fragment}
`
// GraphQl Tag - Mutation - Create
const BOOK_ADD = gql`
  mutation createBook($isbn: String! $title: String! $subtitle: String! $author: String! $published: String! $publisher: String $pages: Int $description: String $website: String){
    createBook(data:{isbn: $isbn , title: $title, subtitle: $subtitle, author: $author, published: $published, publisher: $publisher, pages: $pages, description: $description, website: $website}) {
      ...BookInformation
    }
  }
  ${Book_Information_Fragment}
`

// GraphQl Tag - Mutation - Create
const BOOK_EDIT = gql`
  mutation updateBook($isbn: String!, $title: String! $subtitle: String! $author: String! $published: String! $publisher: String $pages: Int $description: String $website: String) {
    updateBook(where: {isbn: $isbn}, data: {isbn: $isbn , title: $title, subtitle: $subtitle, author: $author, published: $published, publisher: $publisher, pages: $pages, description: $description, website: $website}) {
      ...BookInformation
    }
  }
  ${Book_Information_Fragment}
`

// GraphQl Tag - Mutation - Delete
const BOOK_DELETE = gql`
    mutation deleteBook($isbn: String!){
      deleteBook( where: {
      isbn: $isbn
      }){
        isbn
        title
      }
    }`

// GraphQl Tag - Mutation - Batch Delete
const BATCH_BOOK_DELETE = gql`
    mutation deleteManyBooks($isbn_in: [String!]) {
      deleteManyBooks(where: {
        isbn_in: $isbn_in
      }){
        count
      }
    }`


//Styling Content Table
const useStyles = makeStyles(theme => ({
    root: {
      width: '100%',
    },
    paper: {
      width: '100%',
      marginBottom: theme.spacing(2),
    },
    table: {
      minWidth: 750,
    },
    tableWrapper: {
      overflowX: 'auto',
    },
    visuallyHidden: {
      border: 0,
      clip: 'rect(0 0 0 0)',
      height: 1,
      margin: -1,
      overflow: 'hidden',
      padding: 0,
      position: 'absolute',
      top: 20,
      width: 1,
    },
  }));

// Sorting  
function desc(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function stableSort(array, cmp) { 
  const stabilizedThis = array !== [] ? array.map((el, index) => [el, index]) :"";
  stabilizedThis.sort((a, b) => {
    const order = cmp(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map(el => el[0]);
}

function getSorting(order, orderBy) {
  return order === 'desc' ? (a, b) => desc(a, b, orderBy) : (a, b) => -desc(a, b, orderBy);
}

const BookTable = observer(() => {
  const classes = useStyles();
  const store = BookStore;  
  
  //const [order, setOrder] = useState('asc');
  //const [orderBy, setOrderBy] = useState('published');

  //const [selected, setSelected] = useState([]);
  
  //const [page, setPage] = useState(0);
  //const [rowsPerPage, setRowsPerPage] = useState(5);

  //const [dense, setDense] = useState(false);
  //const [modal, setModal] = useState({"openModal": false, "modalTitle":"", "updateBook":{}});
  
  // Mutation for Add Book
  const [addBookMutation, {loading: mutationAddLoading, error: mutationAddError}] = useMutation(BOOK_ADD);

  // Mutation for Update Book
  const [updateBookMutation, {loading: mutationUpdateLoading, error: mutationUpdateError}] = useMutation(BOOK_EDIT);

  // Mutation for Delete Book
  const [removeBookMutation, { loading: mutationDeleteLoading, error: mutationDeleteLoadingError }] = useMutation(BOOK_DELETE);
  
  // Mutation for Delete Selected Books
  const [removeSelectedBooksMutation, { loading: mutationBatchDeleteLoading, error: mutationBatchDeleteError }] = useMutation(BATCH_BOOK_DELETE);
  
  // Query for Fetching Books using useQuery hook
  const {loading, data, error} = useQuery(BOOKS_FEED);
  if (loading) return <div>Loading…</div>
  if (error) return <div>Error</div>;
  const rows = data.books;
  store.setBooks(data.books);
  
  // Sorting
  const handleRequestSort = (event, property) => {
    const isDesc = store.orderBy === property && store.order === 'desc';
    store.setOrder(isDesc ? 'asc' : 'desc');
    store.setOrderBy(property);
  };

  // Selection all and as per single/multiple selection
  const handleSelectAllClick = event => {
    if (event.target.checked) {
      const newSelecteds = rows.map(n => n.isbn);
      store.setSelected(newSelecteds);
      return;
    }
    store.setSelected([]);
  };

  const handleClick = (isbn) => {
    const selectedIndex = store.selected.indexOf(isbn);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(store.selected, isbn);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(store.selected.slice(1));
    } else if (selectedIndex === store.selected.length - 1) {
      newSelected = newSelected.concat(store.selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        store.selected.slice(0, selectedIndex),
        store.selected.slice(selectedIndex + 1),
      );
    }
    store.setSelected(newSelected);
  };

  //Pagination
  const handleChangePage = (event, newPage) => {
    store.setPage(newPage);
  };

  const handleChangeRowsPerPage = event => {
    store.setRowsPerPage(parseInt(event.target.value, 10));
    store.setPage(0);
  };
  
  // Dense Table 
  const handleChangeDense = event => {
    store.setDense(event.target.checked);
  };

  //const isSelected = isbn => store.selected.indexOf(isbn) !== -1;
  
  const emptyRows = store.rowsPerPage - Math.min(store.rowsPerPage, rows.length - store.page * store.rowsPerPage);

  // ADD BOOK 
  const handleAddBook = (book = {}) => {
    addBookMutation({
      variables: {isbn: book.isbn, title: book.title, subtitle: book.subtitle, author: book.author, published: book.published, publisher: book.publisher, pages: book.pages, description: book.description, website: book.website},
      update: (cache, {data}) => {
        const existingBooks = cache.readQuery({ query: BOOKS_FEED }); 
        const newBook = data.createBook; 
        cache.writeQuery({
          query: BOOKS_FEED,
          data: {books: [newBook, ...existingBooks.books]}
        });
        modalOpen(false);
      }
    });
  };

  // EDIT BOOK
  const handleEditBook = (book = {}) => {
    var updatePromise  = updateBookMutation({
      variables: {isbn: book.isbn, title: book.title, subtitle: book.subtitle, author: book.author, published: book.published, publisher: book.publisher, pages: book.pages, description: book.description, website: book.website}
    });
    updatePromise.then(() =>  modalOpen(false));
  };

  // DELETE BOOK
  const handleDeleteBook = (event, row) => {
    event.preventDefault();
    event.stopPropagation();
    removeBookMutation({
      variables: {isbn: row.isbn},
      update: (cache) => {
        const existingBooks = cache.readQuery({ query: BOOKS_FEED });
        const updatedBooks = existingBooks.books.filter(book => (book.isbn !== row.isbn));
        cache.writeQuery({
          query: BOOKS_FEED,
          data: {books: updatedBooks}
        });
        store.setSelected([]);
      }
    });
  };

  // DELETE SELECTED BOOKS
  const handleDeleteSelectedBooks = () => {
    removeSelectedBooksMutation({
      variables: {isbn_in: store.selected},
      update: (cache) => {
        const existingBooks = cache.readQuery({ query: BOOKS_FEED });
        const updatedBooks = existingBooks.books.filter(book => (!store.selected.includes(book.isbn)));
        cache.writeQuery({
          query: BOOKS_FEED,
          data: {books: updatedBooks}
        });
        store.setSelected([]);
      }
    });  
  }

  // ADD/EDIT MODAL OPEN
  const modalOpen = (bool, title="", book = {}) => { 
    /* let currentModal = {...modal}; */
    let currentModal = {};
    currentModal.openModal = bool;
    currentModal.modalTitle = title;
    currentModal.updateBook = book; 
    /* setModal(currentModal); */
    store.modalUpdate(currentModal);
  };

  return (
    <div className={classes.root}>
      {/* To Do Add Spinners when user is waiting upon data from GraphQL API */}
      {mutationBatchDeleteLoading && <p>Loading...</p>}
        {mutationBatchDeleteError && <p>Error :( Please try again</p>}
      <Paper className={classes.paper}>
        {/* To Do Conditional Rendering of Modal as not required at all times on webpage */}
        <BookDialog open={store.modal.openModal} title={store.modal.modalTitle} handleClickOpen={modalOpen} addBook={handleAddBook} editBook={handleEditBook} refBook={store.modal.updateBook}/>
        <BookTableToolbar numSelected={store.selected.length} deleteBooks={handleDeleteSelectedBooks} handleClickOpen={modalOpen}/>
        <div className={classes.tableWrapper}>
          <Table
            className={classes.table}
            aria-labelledby="tableTitle"
            size={store.dense ? 'small' : 'medium'}
            aria-label="content table"
          >
            <BookTableHead
              classes={classes}
              numSelected={store.selected.length}
              order={store.order}
              orderBy={store.orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
            />
            <TableBody>
              {stableSort(rows, getSorting(store.order, store.orderBy))
                .slice(store.page * store.rowsPerPage, store.page * store.rowsPerPage + store.rowsPerPage)
                .map((row, index) => {
                  const isItemSelected = store.getSelected(row.isbn);
                  const labelId = `book-table-checkbox-${index}`;

                  return (
                    <TableRow
                      hover
                      tabIndex={-1}
                      key={row.isbn}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isItemSelected}
                          onClick={() => handleClick(row.isbn)}
                          inputProps={{ 'aria-labelledby': labelId }}
                        />
                      </TableCell>
                      <TableCell component="th" id={labelId} scope="row" padding="none" align="left">{row.isbn}</TableCell>
                      <TableCell align="left">{row.title}</TableCell>
                      <TableCell align="left">{row.subtitle}</TableCell>
                      <TableCell align="left">{row.author}</TableCell>
                      <TableCell align="left">{row.published}</TableCell>
                      <TableCell padding="checkbox">                
                        <Tooltip title="Edit Book">
                            <IconButton aria-label="edit book" onClick= {() => modalOpen(true, "edit", row)}>
                                <EditIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Book">
                            <IconButton aria-label="delete book" onClick= {event => handleDeleteBook(event, row)}>
                                <DeleteIcon />
                            </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              {emptyRows > 0 && (
                <TableRow style={{ height: (store.dense ? 33 : 53) * emptyRows }}>
                  <TableCell colSpan={7} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={rows.length}
          rowsPerPage={store.rowsPerPage}
          page={store.page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </Paper>
      <FormControlLabel
        control={<Switch checked={store.dense} onChange={handleChangeDense} />}
        label="Dense padding"
      />
    </div>
  );
})


export default BookTable;
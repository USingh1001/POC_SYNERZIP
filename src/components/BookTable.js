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
import gql from 'graphql-tag'

// GraphQl Tag - Query
const BOOKS_FEED = gql`
  {
    books {
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
    }
  }
`
// GraphQl Tag - Mutation - Create
const BOOK_ADD = gql`
mutation createBook($isbn: String! $title: String! $subtitle: String! $author: String! $published: String! $publisher: String $pages: Int $description: String $website: String){
  createBook(data:{isbn: $isbn , title: $title, subtitle: $subtitle, author: $author, published: $published, publisher: $publisher, pages: $pages, description: $description, website: $website}) {
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
  }
}`

// GraphQl Tag - Mutation - Create
const BOOK_EDIT = gql`
mutation updateBook($isbn: String!, $title: String! $subtitle: String! $author: String! $published: String! $publisher: String $pages: Int $description: String $website: String) {
  updateBook(where: {isbn: $isbn}, data: {isbn: $isbn , title: $title, subtitle: $subtitle, author: $author, published: $published, publisher: $publisher, pages: $pages, description: $description, website: $website}) {
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
  }
}`

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

export default function BookTable() {
  const classes = useStyles();
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('published');
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [dense, setDense] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [modal, setModal] = useState({"openModal": false, "modalTitle":"", "updateBook":{}});
  
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

  // Sorting
  const handleRequestSort = (event, property) => {
    const isDesc = orderBy === property && order === 'desc';
    setOrder(isDesc ? 'asc' : 'desc');
    setOrderBy(property);
  };

  // Selection all and as per single/multiple selection
  const handleSelectAllClick = event => {
    if (event.target.checked) {
      const newSelecteds = rows.map(n => n.isbn);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, isbn) => {
    const selectedIndex = selected.indexOf(isbn);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, isbn);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }
    setSelected(newSelected);
  };

  //Pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Dense Table 
  const handleChangeDense = event => {
    setDense(event.target.checked);
  };

  // ADD BOOK 
  const handleAddBook = (book = {}) => {
    addBookMutation({
      variables: {isbn: book.isbn, title: book.title, subtitle: book.subtitle, author: book.author, published: book.published, publisher: book.publisher, pages: book.pages, description: book.description, website: book.website},
      optimisticResponse: null,
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
    updateBookMutation({
      variables: {isbn: book.isbn, title: book.title, subtitle: book.subtitle, author: book.author, published: book.published, publisher: book.publisher, pages: book.pages, description: book.description, website: book.website},
      optimisticResponse: null,
      update: () => modalOpen(false)
    });
  };

  // DELETE BOOK
  const handleDeleteBook = (event, row) => {
    event.preventDefault();
    event.stopPropagation();
    removeBookMutation({
      variables: {isbn: row.isbn},
      optimisticResponse: null,
      update: (cache) => {
        const existingBooks = cache.readQuery({ query: BOOKS_FEED });
        const updatedBooks = existingBooks.books.filter(book => (book.isbn !== row.isbn));
        cache.writeQuery({
          query: BOOKS_FEED,
          data: {books: updatedBooks}
        });
        setSelected([]);
      }
    });
  };

  // DELETE SELECTED BOOKS
  const handleDeleteSelectedBooks = () => {
    removeSelectedBooksMutation({
      variables: {isbn_in: selected},
      optimisticResponse: null,
      update: (cache) => {
        const existingBooks = cache.readQuery({ query: BOOKS_FEED });
        const updatedBooks = existingBooks.books.filter(book => (!selected.includes(book.isbn)));
        cache.writeQuery({
          query: BOOKS_FEED,
          data: {books: updatedBooks}
        });
        setSelected([]);
      }
    });  
  }

  // ADD/EDIT MODAL OPEN
  const modalOpen = (bool, title="", book = {}) => { 
    let currentModal = {...modal}; 
    currentModal.openModal = bool;
    currentModal.modalTitle = title;
    currentModal.updateBook = book; 
    setModal(currentModal);
  };

  const isSelected = isbn => selected.indexOf(isbn) !== -1;
  
  const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

  return (
    <div className={classes.root}>
      {/* To Do Add Spinners when user is waiting upon data from GraphQL API*/}
      {mutationBatchDeleteLoading && <p>Loading...</p>}
        {mutationBatchDeleteError && <p>Error :( Please try again</p>}
      <Paper className={classes.paper}>
        {/* To Do Conditional Rendering of Modal as not required at all times on webpage */}
        <BookDialog open={modal.openModal} title={modal.modalTitle} handleClickOpen={modalOpen} addBook={handleAddBook} editBook={handleEditBook} refBook={modal.updateBook}/>
        <BookTableToolbar numSelected={selected.length} deleteBooks={handleDeleteSelectedBooks} handleClickOpen={modalOpen}/>
        <div className={classes.tableWrapper}>
          <Table
            className={classes.table}
            aria-labelledby="tableTitle"
            size={dense ? 'small' : 'medium'}
            aria-label="content table"
          >
            <BookTableHead
              classes={classes}
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
            />
            <TableBody>
              {stableSort(rows, getSorting(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  const isItemSelected = isSelected(row.isbn);
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
                          onClick={event => handleClick(event, row.isbn)}
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
                <TableRow style={{ height: (dense ? 33 : 53) * emptyRows }}>
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
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </Paper>
      <FormControlLabel
        control={<Switch checked={dense} onChange={handleChangeDense} />}
        label="Dense padding"
      />
    </div>
  );
}

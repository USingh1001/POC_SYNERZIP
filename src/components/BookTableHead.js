import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import {TableRow, TableHead, TableSortLabel, TableCell, Checkbox} from '@material-ui/core';

// Styles for Book Table Head 
const useTableHeadStyles = makeStyles(() => ({
  root:{
    backgroundColor: "rgb(24, 3, 252, 0.6)",
  },
  cell: {
    fontFamily: "Trebuchet MS, Arial, Verdana",
    fontWeight: "bolder",
    fontSize: "24px",
    fontStyle: "italic"
  }
}));

// Table Head Columns
const headCells = [
    { id: 'isbn', label: 'ISBN' },
    { id: 'title', label: 'Title' },
    { id: 'subtitle', label: 'Subtitle' },
    { id: 'author', label: 'Author' },
    { id: 'published', label: 'Published' },
    { id: 'actions'}
  ];
  
  export default function BookTableHead(props) {
    const internalClasses = useTableHeadStyles();
    const { classes, onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } = props;
    const createSortHandler = property => event => {
      onRequestSort(event, property);
    };
    
    return (
      <TableHead>
        <TableRow className={internalClasses.root}>
          <TableCell padding="checkbox">
            <Checkbox
              indeterminate={numSelected > 0 && numSelected < rowCount}
              checked={numSelected === rowCount && rowCount !== 0}
              onChange={onSelectAllClick}
              inputProps={{ 'aria-label': 'select all books' }}
            />
          </TableCell>
          {headCells.map(headCell => (
            <TableCell
              key={headCell.id}
              align="center"
              className={internalClasses.cell}
              sortDirection={orderBy === headCell.id ? order : false}
            >
              {headCell.id !== "actions" ? <TableSortLabel
                active={orderBy === headCell.id}
                direction={order}
                onClick={createSortHandler(headCell.id)}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <span className={classes.visuallyHidden}>
                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                  </span>
                ) : null}
              </TableSortLabel> : ""}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
    );
  }
  
  BookTableHead.propTypes = {
    classes: PropTypes.object.isRequired,
    numSelected: PropTypes.number.isRequired,
    onRequestSort: PropTypes.func.isRequired,
    onSelectAllClick: PropTypes.func.isRequired,
    order: PropTypes.oneOf(['asc', 'desc']).isRequired,
    orderBy: PropTypes.string.isRequired,
    rowCount: PropTypes.number.isRequired,
  };
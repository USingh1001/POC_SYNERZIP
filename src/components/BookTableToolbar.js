import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { lighten, makeStyles } from '@material-ui/core/styles';
import {IconButton, Tooltip, Toolbar, Typography} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';

// Styles for Book Toolbar
const useToolbarStyles = makeStyles(theme => ({
    root: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(1),
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(2)
    },
    highlight:
      theme.palette.type === 'light'
        ? {
            color: theme.palette.secondary.main,
            backgroundColor: lighten(theme.palette.secondary.light, 0.85),
          }
        : {
            color: theme.palette.text.primary,
            backgroundColor: theme.palette.secondary.dark,
          },
    title: {
      flex: '1 1 100%',
      fontFamily: "Trebuchet MS, Arial, Verdana"
    },
  }));
  
  const BookTableToolbar = props => {
    const classes = useToolbarStyles();
    const { numSelected } = props;
    return (
      <Toolbar
        className={clsx(classes.root, {
          [classes.highlight]: numSelected > 0,
        })}
      >
        {numSelected > 0 ? (
          <Typography className={classes.title} color="inherit" variant="subtitle1">
            {numSelected} selected
          </Typography>
        ) : (
          <Typography className={classes.title} variant="h2" id="tableTitle" align="center">
            JavaScript Library
          </Typography>
        )}
  
        {numSelected > 0 ? (
          <Tooltip title="Delete Selections">
            <IconButton aria-label="delete" onClick= {props.deleteBooks}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="Add Book">
            <IconButton aria-label="add book" onClick= {() => props.handleClickOpen(true, "add")}>
              <AddIcon />
            </IconButton>
          </Tooltip>
        )}
      </Toolbar>
    );
  };
  
  BookTableToolbar.propTypes = {
    numSelected: PropTypes.number.isRequired,
  };

  export default BookTableToolbar;
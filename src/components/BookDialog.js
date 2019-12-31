import React, {useState, useContext} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core';
import {observer } from 'mobx-react-lite';
import BookDialogStore from './BookDialogStore'

// Styles for Book Dialog
const useDialogStyles = makeStyles(theme => ({
    root:{
      backgroundColor: "rgb(24, 3, 252, 0.6)",
      fontFamily: "Trebuchet MS, Arial, Verdana",
      fontStyle: "italic"
    }
}));

const BookDialog = observer((props) => {
  const classes = useDialogStyles();  
  //const [required, setRequired] = useState({}); 
  //const [book, setBook]  = useState({});
  //const [disableBool, setDisableBool] = useState(true);
  const store = BookDialogStore;
  
  const handleSubmit = () => {  
    var flag = 0;  
    var requiredCheck = {...store.required}
    requiredCheck = {"isbn": true, "title" : true, "subtitle" : true, "author": true, "published": true};
    for(let key in store.book){
        switch(key){
            case "isbn" :
                if (store.book[key]){ 
                    flag++;
                    requiredCheck.isbn = false;
                }
                break;
            case "title" :
                if (store.book[key]) {
                    flag++; 
                    requiredCheck.title = false;
                }
                break;
            case "subtitle" :
                if (store.book[key]) { 
                    flag++;
                    requiredCheck.subtitle = false;
                }
                break;
            case "author" :   
                if (store.book[key]){ 
                    flag++;
                    requiredCheck.author = false;
                }
                break;
            case "published" :
                if (store.book[key]) { 
                    flag++;
                    requiredCheck.published = false;
                }
                break;          
        }
    } 
    store.setDisableBool(true);
    if(flag === 5){
        if(props.title === "add"){
            props.addBook(store.book);    
        }else if(props.title === "edit"){
            props.editBook(store.book);
        }
        store.setBook({});
    } else {
        store.setRequired(requiredCheck);
    }
  }

  const handleChangeInput = (e) => {  
    var bookInput = {...store.book};
    if(Object.keys(props.refBook).length !== 0 && Object.keys(store.book).length === 0){
       bookInput = {...props.refBook};
       store.setBook(bookInput);     
    } 
    bookInput[e.target.id] = e.target.value;
    if (e.target.id === "pages")
        bookInput[e.target.id] = parseInt(bookInput[e.target.id]);
    store.setBook(bookInput);
    store.setDisableBool(false);
    const currentRequired = {...store.required};
    if(Object.keys(store.required).length !== 0 && store.required[e.target.id] !== false){ 
        currentRequired[e.target.id] = false;
        store.setRequired(currentRequired);
    }
  }
  
  const handleClose = () =>{
    store.setBook({});
    store.setRequired({});  
    props.handleClickOpen(false);
  }
  
  return (
    <div>
      <Dialog open={props.open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title" className={classes.root}>{typeof(props.title) !== "undefined" && props.title ? props.title.toUpperCase() + " BOOK" : ""}</DialogTitle>
        <DialogContent>
          <TextField error = {store.required.isbn || false} required margin="dense" id="isbn" label="ISBN" type="number" defaultValue={props.refBook.isbn || ""} fullWidth onChange={handleChangeInput}/>
          <TextField error = {store.required.title || false} required margin="dense" id="title" label="Title" defaultValue={props.refBook.title || ""} fullWidth onChange={handleChangeInput}/>
          <TextField error = {store.required.subtitle || false} required margin="dense" id="subtitle" label="Subtitle" defaultValue={props.refBook.subtitle || ""} fullWidth onChange={handleChangeInput}/>
          <TextField error = {store.required.author || false} required margin="dense" id="author" label="Author" defaultValue={props.refBook.author || ""} fullWidth onChange={handleChangeInput}/>
          <TextField error = {store.required.published || false} required margin="dense" id="published" label="Published" defaultValue={props.refBook.published || ""} fullWidth onChange={handleChangeInput}/>
          <TextField margin="dense" id="publisher" label="Publisher" defaultValue={props.refBook.publisher || ""} fullWidth onChange={handleChangeInput}/>
          <TextField margin="dense" id="pages" label="Pages" type="number" defaultValue={props.refBook.pages || ""} fullWidth onChange={handleChangeInput}/>
          <TextField margin="dense" id="description" label="Description" defaultValue={props.refBook.description || ""} fullWidth onChange={handleChangeInput}/>
          <TextField margin="dense" id="website" label="Website" defaultValue={props.refBook.website || ""} fullWidth onChange={handleChangeInput}/>
        </DialogContent>
        <DialogActions>
          <Button color="primary" onClick={handleClose}>
            Cancel
          </Button>
          <Button color="primary" disabled={store.disableBool} onClick={handleSubmit}>
            { typeof(props.title) !== "undefined" && props.title ? props.title.toUpperCase() + " BOOK" : ""}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
})

export default BookDialog

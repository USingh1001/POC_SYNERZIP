import { decorate, observable} from 'mobx'

class BookDialogStore{
    required = {};
    book = {};
    disableBool= true;

    setRequired(required){
        return this.required = {...required}
    }
    setBook(book){
        return this.book = {...book}
    }
    setDisableBool(bool){
        return this.disableBool = bool
    }
  };

  decorate(BookDialogStore, {
    required: observable,
    book: observable,
    disableBool: observable
  })

  export default new BookDialogStore
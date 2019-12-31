import { decorate, observable, computed} from 'mobx'

class BookStore{
    books = [] 
    setBooks(books){
      return this.books = books;
    }

    order = "asc"
    setOrder(order){
      return this.order = order;
    }

    orderBy = "published"
    setOrderBy(orderBy){
      return this.orderBy = orderBy;
    }

    page = 0
    setPage(page){
      return this.page = page;
    }

    rowsPerPage = 5
    setRowsPerPage(rowsPerPage){
      return this.rowsPerPage = rowsPerPage;
    }

    dense = false
    setDense(dense){
       return this.dense = dense; 
    }

    selected = []
    setSelected(selected){
      return this.selected = selected
    }

    getSelected(id){
      return this.selected.indexOf(id) !== -1;
    }
    /* selectedCount(){
      return this.selected.reduce((t, acc) => {
        if(this.getSelected(acc)){
        t = t + 1
        }
      }, 0)
    } */
    
    modal = {"openModal": false, "modalTitle":"", "updateBook":{}}
    modalUpdate(modal){
      return this.modal = {...modal}
    }
    // To Implement Computed with MOBX - running into errors
    /* desc(a, b, orderBy) {
      if (b[orderBy] < a[orderBy]) {
        return -1;
      }
      if (b[orderBy] > a[orderBy]) {
        return 1;
      }
      return 0;
    }

    get stableSort() { 
      const stabilizedThis = this.books !== [] ? this.books.map((el, index) => [el, index]) :"";
      stabilizedThis.sort((a, b) => {
        const order = this.getSorting(a[0], b[0]);
        if (order !== 0) return order;
        return a[1] - b[1];
      });
      return this.books = stabilizedThis.map(el => el[0]) || [];
    }

    get getSorting() {
      return this.order === 'desc' ? (a, b) => this.desc(a, b, this.orderBy) : (a, b) => -this.desc(a, b, this.orderBy);
    }

    get slicingBooks(){
      return this.books = this.books.slice(this.page * this.rowsPerPage, this.page * this.rowsPerPage + this.rowsPerPage) || [];
    } */
  };

  decorate(BookStore, {
    books: observable,
    order: observable,
    orderBy: observable,
    page: observable,
    rowsPerPage: observable,
    dense: observable,
    selected: observable,
    modal: observable,
    /* stableSort: computed,
    getSorting: computed,
    slicingBooks: computed, */
  })

  export default new BookStore
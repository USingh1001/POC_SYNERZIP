import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import BookTable from './components/BookTable';
import { observer, useObservable } from 'mobx-react-lite';

const App = observer(() => {
  /* const store = useObservable({
    modal: {"openModal": false, "modalTitle":"", "updateBook":{}},
    modalUpdate(modal = {}) {
      store.modal = {...modal}
    }
  }); */
  return (
    <React.Fragment>
      <CssBaseline />
        <BookTable/>
    </React.Fragment>
  );
})

export default App;


import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import BookTable from './components/BookTable'

function App() {
  return (
    <React.Fragment>
      <CssBaseline />
        <BookTable/>
    </React.Fragment>
  );
}

export default App;
